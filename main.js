/* jshint -W097 */ // jshint strict:false
/*jslint node: true */

"use strict";
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');
var lang = 'de';
var callReadHomepilot;
var ip = '';
var link = '';
var sync = 12;

var adapter = utils.adapter({
    name: 'homepilot',
    systemConfig: true,
    useFormatDate: true,
    stateChange: function(id, state) {
        if (!id || !state || state.ack) return;
        //if ((!id.match(/\.level\w*$/) || (!id.match(/\.cid\w*$/)) return; // if datapoint is not "level" or not "cid"
        adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
        adapter.log.debug('input value: ' + state.val.toString());
        controlHomepilot(id, state.val.toString());
    },
    unload: function(callback) {
        try {
            adapter.log.info('terminating homepilot adapter');
            stopReadHomepilot();
            callback();
        } catch (e) {
            callback();
        }
    },
    ready: function() {
        adapter.log.debug('initializing objects');
        main();
    }
});


function controlHomepilot(id, input) {
    // example for subscribed id: "homepilot.0.devices.RolloTronStandard.10000.cid"
    // example for subscribed id: "homepilot.0.devices.RolloTronStandard.10000.level"
    var controller_array = id.split('.');
    var controller       = controller_array[5];
    var deviceid         = parseInt(controller_array[4],10);
    var url;
    var valid = false;
    var newcid;
    adapter.log.debug('State: ' + controller + '  device: ' + deviceid + '  command: ' + input);
    if (controller == 'cid') { // control via cid
        // hier CID auf Plausibiliät checken
        switch (input) {
            case "1":
            case "UP":
            case "up":
            case "HOCH":
            case "hoch":
            case "RAUF":
            case "rauf":
                newcid = 1;
                valid = true;
                break;
            case "2":
            case "STOP":
            case "stop":
            case "Stop":
                newcid = 2;
                valid = true;
                break;
            case "3":
            case "DOWN":
            case "down":
            case "RUNTER":
            case "runter":
                newcid = 3;
                valid = true;
                break;
            case "4":
            case "0%":
            case "POSITION_0":
            case "position_0":
                newcid = 4;
                valid = true;
                break;
            case "5":
            case "25%":
            case "POSITION_25":
            case "position_25":
                newcid = 5;
                valid = true;
                break;
            case "6":
            case "50%":
            case "POSITION_50":
            case "position_50":
                newcid = 6;
                valid = true;
                break;
            case "7":
            case "75%":
            case "POSITION_75":
            case "position_75":
                newcid = 7;
                valid = true;
                break;
            case "8":
            case "100%":
            case "POSITION_100":
            case "position_100":
                newcid = 8;
                valid = true;
                break;
            case "9":
            case "POSITION_N":
                newcid = 9;
                valid = false; // weiterer Wert nötig; tbc
                break;
            case "10":
            case "EIN":
            case "ein":
            case "AN":
            case "an":
            case "ON":
            case "on":
                newcid = 10;
                valid = true;
                break;
            case "11":
            case "AUS":
            case "aus":
            case "OFF":
            case "off":
                newcid = 11;
                valid = true;
                break;
            case "23":
            case "+":
            case "increment":
            case "INCREMENT":
                newcid = 23;
                valid = true;
                break;
            case "24":
            case "-":
            case "decrement":
            case "DECREMENT":
                newcid = 24;
                valid = true;
                break;
            default:
                adapter.log.warn('Wrong CID entered');
                valid = false;
        }

        if (valid) url = 'http://' + ip + '/deviceajax.do?did=' + deviceid + '&cid=' + newcid + '&command=1';
    } 
    else if (controller == 'state') { // control via state e.g. Universal-Aktor switch
        if (input.search(/(true)|(EIN)|(AN)|(ON)|([10-11])|(false)|(AUS)|(OFF)\b\b/gmi) != -1) { // check if "true" or "false"
            valid = true;
            if (input.search(/(true)|(EIN)|(AN)|(ON)|(10)\b\b/gmi) != -1 ) newcid = '10'; 
            if (input.search(/(false)|(AUS)|(OFF)|(11)\b\b/gmi) != -1 ) newcid = '11'; 
            url = 'http://' + ip + '/deviceajax.do?did=' + deviceid + '&cid=' + newcid + '&command=1'; // switch ON / OFF
            adapter.log.debug('Switch ' + deviceid + ' new status detected: ' + input + ' URL: '  + url);
        } else {
            valid = false;
            adapter.log.warn('Only use "ON/OFF", "true/false", "ein/aus" (all caseinsensitive) or "10/11" to control you switch');
        }
    } 
    else if (controller == 'level') { // control via level e.g. RolloTronStandar.level
        // check if input number is between 0 an 100
        if (input.search(/(?:\b|-)([0-9]{1,2}[0]?|100)\b/gmi) != -1) { // 0 to 100 https://regex101.com/r/mN1iT5/6#javascript
            valid = true;
            url = 'http://' + ip + '/deviceajax.do?cid=9&did=' + deviceid + '&goto=' + input + '&command=1';
        } else valid = false;
    } 
    else if (controller == 'level_inverted') { // control via inverted  level e.g. RolloTronStandar.level (like Homematic 100% up, 0% down)
        // check if input number is between 0 an 100
        if (input.search(/(?:\b|-)([0-9]{1,2}[0]?|100)\b/gmi) != -1) { // 0 to 100 https://regex101.com/r/mN1iT5/6#javascript
            valid = true;
            url = 'http://' + ip + '/deviceajax.do?cid=9&did=' + deviceid + '&goto=' + (100 - parseInt(input,10)) + '&command=1';
        } else valid = false;
    } 
    if (valid) {
        request(url); // Send command to Homepilot
        adapter.log.debug('Command sent to Homepilot because "' + input + '" written to State "' + id + '"'); // should be debug not info
    } else adapter.log.warn('Wrong type of data input. Please try again');
}

function readSettings() {
    //check if IP is entered in settings
    if (adapter.config.homepilotip === undefined || adapter.config.homepilotip.length === 0) {
        ip = 'homepilot.local';
        adapter.log.debug('No IP adress of Homepilot station set up - "' + ip + '" used');
    } 
    else ip = (adapter.config.homepilotport.length > 0) ? adapter.config.homepilotip + ':' + adapter.config.homepilotport : adapter.config.homepilotip;
    link = 'http://' + ip + '/deviceajax.do?devices=1';
    //check if sync time is entered in settings
    sync = (adapter.config.synctime === undefined || adapter.config.synctime.length === 0) ? 12 : parseInt(adapter.config.synctime,10);
    adapter.log.debug('Homepilot station and ioBroker synchronize every ' + sync + 's');
}

function createStates(result, i) {
    var product    = result.devices[i].productName.replace(/\s+/g, ''); // clear whitespaces in product name
    var deviceid   = result.devices[i].did;
    var devicename = result.devices[i].name;
    var path = 'devices.' + product + '.' + deviceid;
    var serialnumber = result.devices[i].serial;
    //var devicerole = (product.indexOf('RolloTron') != -1) ? 'blind' : 'switch' ; // tbd insert more products
    var devicerole;
    switch (serialnumber.substring(0,2)) {
            case "40": // Rollotron Standard
            case "41": // Rollotron Comfort
            case "42": // Rohrmotor
            case "47": // Rohrmotor
            case "49": // Rohrmotor
                devicerole = 'blind';
                break;
            case "43": // Universalactor
            case "46": // Wall-Plugin-Actor
                devicerole = (devicename.indexOf('Licht') != -1) ? 'light.switch' : 'switch' ;
                break;
            default:
                devicerole = 'switch'
    }
    // create Channel DeviceID
    adapter.setObjectNotExists(path, {
        type: 'channel',
        common: {
            name: devicename + ' (Device ID ' + deviceid + ')',
            role: devicerole,
        },
        native: {}
    });
    // create States
    adapter.setObjectNotExists(path + '.name', {
        type: 'state',
        common: {
            name: 'name ' + devicename,
            desc: 'name stored in homepilot for device ' + deviceid,
            type: 'string',
            role: 'text',
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.description', {
        type: 'state',
        common: {
            name: 'description ' + devicename,
            desc: 'description stored in homepilot for device ' + deviceid,
            type: 'string',
            role: 'text',
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.serial', {
        type: 'state',
        common: {
            name: 'serial number of ' + devicename,
            desc: 'serial number stored in homepilot for device ' + deviceid,
            type: 'string',
            role: 'text',
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.productName', {
        type: 'state',
        common: {
            name: 'product name ' + devicename,
            desc: 'product name stored in homepilot for device ' + deviceid,
            type: 'string',
            role: 'text',
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.status_changed', {
        type: 'state',
        common: {
            name: 'status changed ' + devicename,
            desc: 'time of last status changed for device ' + deviceid,
            type: 'number',
            role: 'value.datetime',
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.hasErrors', {
        type: 'state',
        common: {
            name: 'number of errors ' + devicename,
            desc: 'number of errors of device ' + deviceid,
            type: 'number',
            role: 'value',
            min: 0,
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.cid', {
        type: 'state',
        common: {
            name: 'Command ID input ' + devicename,
            desc: 'type in command id for ' + deviceid,
            type: 'string',
            read: true,
            write: true
        },
        native: {}
    });
    if (serialnumber.substring(0,2) == "43" || serialnumber.substring(0,2) == "46"/* || result.devices[i].productName === "Schaltaktor 2-Kanal" || result.devices[i].productName === "Schaltaktor 1-Kanal"*/) { // Universal-Aktor SWITCH
        adapter.setObjectNotExists(path + '.state', {
            type: 'state',
            common: {
               name: 'STATE of ' + devicename,
                desc: 'Boolean datapoint for switches for ' + deviceid,
                type: 'boolean',
                role: 'switch',
                def: false,
                read: true,
                write: true
            },
            native: {}
        }, function(err, obj) {
            if (!err && obj) {
                var statevalue = (result.devices[i].position == 100 || result.devices[i].position === '100') ? true : false;
                adapter.setState(path + 'state', {
                    val: statevalue,
                    ack: true
                });
            }
        });
    }
    adapter.setObjectNotExists(path + '.level_inverted', {
        type: 'state',
        common: {
            name: 'level inverted ' + devicename,
            desc: 'level inverted (like Homematic) of device ' + deviceid,
            type: 'number',
            role: 'level.blind',
            min: 0,
            max: 100,
            unit: '%',
            read: true,
            write: true
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.level', {
        type: 'state',
        common: {
            name: 'level ' + devicename,
            desc: 'level of device ' + deviceid,
            type: 'number',
            role: 'level.blind',
            min: 0,
            max: 100,
            unit: '%',
            read: true,
            write: true
        },
        native: {}
    }, function(err, obj) {
        if (!err && obj) adapter.log.info('Objects for ' + product + '(' + deviceid + ') created');
    });
}

function writeStates(result, i) {
    var product = result.devices[i].productName.replace(/\s+/g, ''); // clear whitespaces in product name
    var deviceid = result.devices[i].did;
    var serialnumber = result.devices[i].serial;
    var path = 'devices.' + product + '.' + deviceid + '.';

    adapter.setState(path + 'name', {
        val: result.devices[i].name,
        ack: true
    });
    adapter.setState(path + 'description', {
        val: result.devices[i].description,
        ack: true
    });
    adapter.setState(path + 'serial', {
        val: serialnumber,
        ack: true
    });
    adapter.setState(path + 'status_changed', {
        val: result.devices[i].status_changed,
        ack: true
    });
    adapter.setState(path + 'hasErrors', {
        val: result.devices[i].hasErrors,
        ack: true
    });
    if (result.devices[i].hasErrors > 0) adapter.log.warn('Homepilot Device ' + deviceid + ' reports an error'); // find logic to reduce to one message only
    
    adapter.setState(path + 'productName', {
        val: result.devices[i].productName,
        ack: true
    });
    // STATE
    if (serialnumber.substring(0,2) == "43" || serialnumber.substring(0,2) == "46"/* || result.devices[i].productName === "Universal-Aktor" || result.devices[i].productName === "Steckdosenaktor"*/) { // translate output level/position to boolean state for switches
        var statevalue = (result.devices[i].position == 100 || result.devices[i].position === '100') ? true : false;
        adapter.setState(path + 'state', {
            val: statevalue,
            ack: true
        });
    } else { // LEVEL Datapoints
        adapter.setState(path + 'level', {
            val: result.devices[i].position,
            ack: true
        });
        adapter.setState(path + 'level_inverted', {
            val: 100 - parseInt(result.devices[i].position,10),
            ack: true
        });
    }
    adapter.log.debug('States for ' + product + ' (' + deviceid + ') written');
}

function readHomepilot() {
    var unreach = true;
    request(link, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result;
            try {
                result = JSON.parse(body);
                var data = JSON.stringify(result, null, 2);
                unreach = false;
                //adapter.log.debug('Homepilot data: ' + data);
                adapter.setState('devices.json', {
                    val: data,
                    ack: true
                });
            } catch (e) {
                adapter.log.warn('Parse Error: ' + e);
                unreach = true;
            }
            if (result) {
                // save val here, go through ALL devices
                for (var i = 0; i < result.devices.length; i++) {
                    //adapter.log.debug('Device ' + result.devices[i].productName + ' found. Name: ' + result.devices[i].name);
                    createStates(result, i); // create Objects if not Exist
                    writeStates(result, i); // write Objects 
                }
                adapter.setState('station.ip', {
                    val: ip,
                    ack: true
                });
            }
        } else {
            adapter.log.warn('Cannot connect to Homepilot: ' + error);
            unreach = true;
        }
        // Write connection status
        adapter.setState('station.UNREACH', {
            val: unreach,
            ack: true
        });
    }); // End request 
    adapter.log.debug('finished reading Homepilot Data');
}

function stopReadHomepilot() {
    clearInterval(callReadHomepilot);
    adapter.log.info('Homepilot adapter stopped');
}

function main() {
    adapter.subscribeStates('*'); 
    //adapter.subscribeStates('*.cid*'); // subscribe command id
    //adapter.subscribeStates('*.level*'); // subscribe all dp with name level
    readSettings();
    adapter.log.debug('Homepilot adapter started...');
    callReadHomepilot = setInterval(function() {
        adapter.log.debug('reading homepilot JSON ...');
        readHomepilot();
    }, sync * 1000);
}
