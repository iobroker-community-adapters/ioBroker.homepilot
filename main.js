/* jshint -W097 */ // jshint strict:false
/*jslint node: true */

"use strict";
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');
var lang = 'de';
var callReadHomepilot;
var ip = '';
var link = '';
var synctime = 12;

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
    adapter.log.info('State: ' + controller + '  device: ' + deviceid + '  command: ' + input);
    if (controller == 'cid') { // control via cid
        var newcid;
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
    } else if (controller == 'level') { // control via level e.g. RolloTronStandar.level
        //hier checken, ob der Wert eine Zahl zwischen 0 und 100 ist
        if (input.search(/(?:\b|-)([1-9]{1,2}[0]?|100)\b/gmi) != -1) { // 0 to 100 https://regex101.com/r/mN1iT5/6#javascript
            valid = true;
            url = 'http://' + ip + '/deviceajax.do?cid=9&did=' + deviceid + '&goto=' + input + '&command=1';
        } else valid = false;
    }
    if (valid) {
        request(url); // Send command to Homepilot
        adapter.log.info('Command sent to Homepilot because "' + input + '" written to State ' + id + '.');
    } else adapter.log.warn('Wrong type of data input. Please try again');
}

function readSettings() {
    //check if IP entered in settings
    if (adapter.config.homepilotip === undefined || adapter.config.homepilotip.length === 0) {
        ip = 'homepilot.local';
        adapter.log.debug('No IP adress of Homepilot station set up - "' + ip + '" used');
    } else {
        if (adapter.config.homepilotport.length > 0) {
            ip = adapter.config.homepilotip + ':' + adapter.config.homepilotport;
        } else {
            ip = adapter.config.homepilotip;
        }
    }
    adapter.log.debug('Homepilot station IP: ' + ip);
    link = 'http://' + ip + '/deviceajax.do?devices=1';
    // probably let user choose synctime in settings (7,15,30,60,120) 
}

function createStates(result, i) {
    var product    = result.devices[i].productName.replace(/\s+/g, ''); // clear whitespaces in product name
    var deviceid   = result.devices[i].did;
    var devicename = result.devices[i].name;
    var path = 'devices.' + product + '.' + deviceid;

    // create Channel DeviceID
    adapter.setObjectNotExists(path, {
        type: 'channel',
        role: '',
        common: {
            name: devicename + ' (Device ID ' + deviceid + ')'
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
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.description', {
        type: 'state',
        common: {
            name: 'description ' + devicename,
            desc: 'description stored in homepilot for device' + deviceid,
            type: 'string',
            read: true,
            write: false
        },
        native: {}
    });
    adapter.setObjectNotExists(path + '.productName', {
        type: 'state',
        common: {
            name: 'product name ' + devicename,
            desc: 'product name stored in homepilot for device' + deviceid,
            type: 'string',
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
            type: 'string',
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
    adapter.setObjectNotExists(path + '.level', {
        type: 'state',
        common: {
            name: 'level ' + devicename,
            desc: 'level of device ' + deviceid,
            type: 'number',
            min: 0,
            max: 100,
            unit: '%',
            read: true,
            write: false
        },
        native: {}
    }, function(err, obj) {
        if (!err && obj) adapter.log.info('Objects for ' + product + '(' + deviceid + ') created');
    });
}

function writeStates(result, i) {
    var product = result.devices[i].productName.replace(/\s+/g, ''); // clear whitespaces in product name
    var deviceid = result.devices[i].did;
    var path = 'devices.' + product + '.' + deviceid + '.';

    adapter.setState(path + 'name', {
        val: result.devices[i].name,
        ack: true
    });
    adapter.setState(path + 'description', {
        val: result.devices[i].description,
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
    adapter.setState(path + 'level', {
        val: result.devices[i].position,
        ack: true
    });
    adapter.setState(path + 'productName', {
        val: result.devices[i].productName,
        ack: true
    });

    adapter.log.debug('States for ' + product + ' (' + deviceid + ') written');
}

function readHomepilot() {
    request(link, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result;
            try {
                result = JSON.parse(body);
                var data = JSON.stringify(result, null, 2);
                //adapter.log.debug('Homepilot data: ' + data);
                adapter.setState('devices.json', {
                    val: data,
                    ack: true
                });
            } catch (e) {
                adapter.log.warn('Parse Error: ' + e);
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
        } else adapter.log.warn('Fehler: ' + error);
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
    }, synctime * 1000);
}