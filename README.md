![Logo](admin/homepilot.png)
# ioBroker.homepilot

[![NPM version](http://img.shields.io/npm/v/iobroker.homepilot.svg)](https://www.npmjs.com/package/iobroker.homepilot)
[![Downloads](https://img.shields.io/npm/dm/iobroker.homepilot.svg)](https://www.npmjs.com/package/iobroker.homepilot)
[![Open Issues](http://githubbadges.herokuapp.com/Pix---/ioBroker.homepilot/issues.svg)](http://github.com/Pix---/ioBroker.homepilot/issues)

[![NPM](https://nodei.co/npm/iobroker.homepilot.png?downloads=true)](https://nodei.co/npm/iobroker.homepilot/)

**Tests:** Linux/Mac: [![Travis-CI](http://img.shields.io/travis/Pix---/ioBroker.homepilot/master.svg)](https://travis-ci.org/Pix---/ioBroker.homepilot)
Windows: [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/Pix---/ioBroker.homepilot?branch=master&svg=true)](https://ci.appveyor.com/project/Pix---/ioBroker-homepilot/)


## Beschreibung / Description
:de: Dieser Adapter verbindet ioBroker mit der Rademacher Homepilot Basistation 9496 (1/2) über TCP/IP, um Rademacher DuoFern Geräte zu steuern. DuoFern sendet übrigens auf 434,5 MHz. Die als Standard eingestellte Dauer bis zur Synchronisierung der Homepilot Daten nach ioBroker beträgt 12s. In die andere Richtung werden Befehle zeitnah ausgeführt. Daher eignet sich der Adapter nicht zur Auswertung von Homepilot Sensoren, sondern eher zur Ansteuerung der Homepilot Aktoren aus ioBroker heraus (z.B. Homematic Wandtaster steuert Homepilot Rollladen-Aktor).

:uk: This adapter connects ioBroker and Rademacher's Homepilot Station 9496 (1/2) via TCP/IP to control Rademacher DuoFern radio controlled devices. Besides DuoFern broadcasts at 434,5 MHz. Homepilot syncs every 12s to ioBroker by default. On the other hand iobroker broadcasts its commands just in time. Therefore this adapter should be used to control homepilot actuators from ioBroker rather than read homepilot sensors to ioBroker.

### Unterstütze Geräte / Supported devices

| Code | Produktname / product Name  | Notiz / Note                           |  Datapoint   | Produkt Nr / Product # |
|:----:|:---------------------------:|:--------------------------------------:|:------------:|:----------------------:|
| 40   | RolloTron Standard          | Gurtwickler / shutter belt winder      |  level       |                        |
| 41   | RolloTron Comfort           | Gurtwickler / shutter belt winder      |  level       |                        |
| 42   | Rohrmotor-Aktor             |                                        |  level       | [9471-1](https://www.rademacher.de/fileadmin/rad-daten/pdf/2_VBD_621-1-_09.14_-D_DuoFern_Rohrmotor-Aktor_Druckfreigabe.pdf)                 |
| 43   | Schaltaktor 2-Kanal         |  Universalaktor                        |  state       | 9470-2                 |
| 46   | Schaltaktor 1-Kanal         |  Steckdosenaktor                       |  state       | 9470-1                 |
| 47   | Rohrmotor-Steuerung         |  Rohrmotor Steuerung                   |  level       |                        |
| 48   | Dimmer                      |  Dimmaktor                             |  level       |                        |
| 49   | Rohrmotor                   |                                        |  level       |                        |
|  4   | Z-WAVE                      | Heizkörperstellantrieb                 |  temperature |                        |

:de: Der Schaltaktor mit dem Duofern Code 43 bietet sowohl einen Licht- als auch einen Gerätemodus an. Je nach Einstellung liefert der Datenpunkt "AUF" ein "EIN" (Gerätemodus) oder ein "AUS" (Lichtmodus). Der Datenpunkt "AB" verhält sich umgekehrt.

#### Noch nicht unterstützt / Not yet supported (Thx to [mhop](https://github.com/mhop/fhem-mirror/blob/master/fhem/FHEM/30_DUOFERN.pm))
| Code | Produktname / product Name  | Notiz / Note                           |  Datapoint   | Produkt Nr / Product # |
|:----:|:---------------------------:|:--------------------------------------:|:------------:|:----------------------:|
| 4B   | Connect-Aktor               |                                        |              |                        |
| 4C   | Troll Basis                 |                                        |              |                        |
| 4E   | SX5                         |                                        |              |                        |
| 61   | RolloTron Comfort Master    |                                        |              |                        |
| 62   | SupeFake Device             |                                        |              |                        |
| 65   | Bewegungsmelder             |                                        |              |                        |
| 69   | Umweltsensor                |                                        |              |                        |
| 70   | Troll Comfort DuoFern       |                                        |              |                        |
| 71   | Troll Comfort DuoFern<br/>(Lichtmodus)|                                        |              |                        |      | (Lichtmodus)                |                                        |              |                        |
| 73   | Raumthermostat              |                                        |              |                        |
| 74   | Wandtaster 6fach 230V       |                                        |              |                        |
| A0   | Handsender<br/>(6 Gruppen-48 Geraete)|                                        |              |                        |      | (6 Gruppen-48 Geraete)      |                                        |              |                        |
| A1   | Handsender<br/>(1 Gruppe-48 Geraete) |                                        |              |                        |      | (1 Gruppe-48 Geraete)       |                                        |              |                        |
| A2   | Handsender<br/>(6 Gruppen-1 Geraet) |                                        |              |                        |      | (6 Gruppen-1 Geraet)        |                                        |              |                        |
| A3   | Handsender<br/>(1 Gruppe-1 Geraet) |                                        |              |                        |      | (1 Gruppe-1 Geraet)         |                                        |              |                        |
| A4   | Wandtaster                  |                                        |              |                        |
| A5   | Sonnensensor                |                                        |              |                        |
| A7   | Funksender UP               |                                        |              |                        |
| A8   | HomeTimer                   |                                        |              |                        |
| AA   | Markisenwaechter            |                                        |              |                        |
| AB   | Rauchmelder                 |                                        |              |                        |
| AD   | Wandtaster 6fach Bat        |                                        |              |                        |


## Einstellungen / Configuration
### IP / Port
:de: Die IP Adresse der Homepilot Basisstation im lokalen Netzwerk. Ohne Eingabe verwendet der Adapter __homepilot.local__. Die Portnummer ist optional und wird nur bei Eingabe einer IP-Adresse berücksichtigt.

:uk: IP adress of Homepilot station within local network. If nothings is entered, the adapter will use __homepilot.local__. The port number is optional and only will be considered if an ip adress was set before.

### Synchronisation
:de: Dauer zwischen den Abfragen der Homepilot Basistation durch ioBroker. Die Eingabe ist optional. Standard ist 12s.

:uk: In snyctime you can choose the frequency of connections to Homepilots base station in seconds. Default is 12s, input is optional.

##  Datenpunkte / Datapoints
:de: Es gibt zwei Hauptkanäle, einen für die Basisstation und einen für die gefundenen Gerätetypen:

:uk: There are to main channels, one for the station and one for all found devices (shutter belt winders, etc.):


homepilot.0.__station__ (data on Homepilot station)

homepilot.0.__devices.product__ (devices sort by product type)

:de: Innerhalb des Kanals *devices.product* gibt es für jedes Gerät einen weiteren Kanal *deviceID*, beispielsweise. homepilot.0.devices.rollotron.__10001__.balkon

:uk: Within *devices.product* each found device creates a new channel *devicedID*, e.g. homepilot.0.devices.rollotron.__10001__.balcony

homepilot.0.devices.product.*deviceID*.__name__ (string)

homepilot.0.devices.product.*deviceID*.__description__ (string)

homepilot.0.devices.product.*deviceID*.__productName__ (string)

homepilot.0.devices.product.*deviceID*.__duofernCode__ (string)

homepilot.0.devices.product.*deviceID*.__hasErrors__ (number)

homepilot.0.devices.product.*deviceID*.__status_changed__ (number, timecode)

homepilot.0.devices.product.*deviceID*.__cid__ (string, writeable) !!! WRITE STRING ONLY

homepilot.0.devices.product.*deviceID*.__level__ (number)

homepilot.0.devices.product.*deviceID*.__level_inverted__ (number)

homepilot.0.devices.product.*deviceID*.__temperature__ (number, alternatively)

homepilot.0.devices.product.*deviceID*.__state__ (boolean, only if product is switch)

homepilot.0.devices.__json__  (*JSON* file *json* Datenpunkt mit JSON Rückgabe / Datapoint filled with returned JSON )

homepilot.0.station.__ip__ (string)

homepilot.0.station.__UNREACH__ (boolean) (true if Homepilot station is not reachable)


:de: Die Datenpunkte *cid*, *level* und ggf. *state*  können beschrieben werden. Sie werden auf Änderung aus anderen Adaptern (VIS, Javascript, Scenes) überwacht.

:uk: Datapoints *cid*, *level* and in some cases *state* are writeable and subscribed for changes stated from other adapters (e.g. VIS, Javascript, Scenes).

### Steuerung / Control
#### level / level_inverted
:de: Um die Rollläden aus Javascript, VIS oder z.B. Scenes zu steuern, gibt es zwei Möglichkeiten. 
Z.B. kann man den Rolladen mit der DeviceID 10002 (zB "Wohnzimmer rechts") steuern, indem der Datenpunkt 
homepilot.0.devices.product.*10002*.__level__ auf "30" gesetzt wird. __level__ ist eine ganze Zahl von 0 bis 100, andere Zahlen/Zeichen werden nicht angenommen.
Für ein Darstellung wie beim "Homematic"-System (0% = dunkel/unten, 100% = hell/oben), verwendet man den Datenpunkt __level_inverted__.

:uk: The shutters can be control from Javascript. VIS Widgets or Scenes in two ways.
For instance you can control the shutter with the DeviceID 10002 ('Living room right') by setting homepilot.0.devices.product.*10002*.__level__ to "30".
This datapoint only accepts integer numbers between 0 and 100. In addition to that you can use Homepilots command ID. Simply state one of the strings mentioned in the following table to homepilot.0.devices.product.*deviceID*.__cid__
If you prefer an "Homematic" like appearance (0% is dark/down, 100% is light/up) choose the datapoint __level_inverted__.

#### Command ID
:de: Alternativ können auch die Command ID von Homepilot verwendet werden. Dazu wird einfach der passende Befehl in den Datenpunkt homepilot.0.devices.product.*deviceID*.__cid__  geschrieben.
Weiterhin gibt es den Datenpunkt *state* zur Steuerung / Anzeige von Schaltaktoren (wird nur angelegt, wenn Seriennummern 43 oder 46, Produktname "Universal-Aktor" bzw. "Steckdosenaktor"). Er wird am besten von einem VIS ctrl state Widget mit *true*/*false* beschrieben. Bei der Steuerung wird *true* in einen level-Wert von 100 übersetzt, *false* wird zu 0.
Diese Befehle sind bisher möglich zur Steuerung über cid in homepilot.0.devices.product.*deviceID*.__cid__

:uk: Furthermore the datapoint *state* can be use to control switches. It is only created if the products name is "Universal-Aktor"/"Steckdosenaktor" or its serial number is 43 or 46. Simply use a VIS ctrl state widget to write *true*/*false*. This boolean value will be translated to a level 100 if *true* ord level 0 if *false*.
You can use these commands to control Homepilot with cid in homepilot.0.devices.product.*deviceID*.__cid__

| CID | Befehle / Commands               |
| :--:|:---------------------------------|
| 1   | UP, up, HOCH, hoch, RAUF, rauf   |
| 2   | STOP, stop, Stop                 |
| 3   | DOWN, down, RUNTER, runter       |
| 4   | POSITION_0, position_0, 0%       |
| 5   | POSITION_25, position_25, 25%    |
| 6   | POSITION_50, position_50, 50%    |
| 7   | POSITION_75, position_75, 75%    |
| 8   | POSITION_100, position_100, 100% |
| 9   | *POSITION_N (not yet)*           |
| 10  | EIN, ein, AN, an, ON, on         |
| 11  | AUS, aus, OFF, off               |
| 23  | INCREMENT, increment, +          |
| 24  | DECREMENT, decrement, -          |

## VIS Widgets
### Beispiel Rollläden / Shutters
```
[{"tpl":"tplValueFloat","data":{"oid":"homepilot.0.devices.RolloTronStandard.10002.level","visibility-cond":"==","visibility-val":1,"is_comma":true,"is_tdp":"false","factor":"1","gestures-offsetX":0,"gestures-offsetY":0,"signals-cond-0":"==","signals-val-0":true,"signals-icon-0":"/vis/signals/lowbattery.png","signals-icon-size-0":0,"signals-blink-0":false,"signals-horz-0":0,"signals-vert-0":0,"signals-hide-edit-0":false,"signals-cond-1":"==","signals-val-1":true,"signals-icon-1":"/vis/signals/lowbattery.png","signals-icon-size-1":0,"signals-blink-1":false,"signals-horz-1":0,"signals-vert-1":0,"signals-hide-edit-1":false,"signals-cond-2":"==","signals-val-2":true,"signals-icon-2":"/vis/signals/lowbattery.png","signals-icon-size-2":0,"signals-blink-2":false,"signals-horz-2":0,"signals-vert-2":0,"signals-hide-edit-2":false,"digits":"0","html_append_singular":" %","html_append_plural":" %","name":"RolloTron Percent","label":"{homepilot.0.devices.RolloTronStandard.10002.name}"},"style":{"left":"519px","top":"555px","color":"lightblue","text-align":"right","z-index":"20"},"widgetSet":"basic"},{"tpl":"tplValueLastchange","data":{"oid":"homepilot.0.devices.RolloTronStandard.10002.status_changed","visibility-cond":"==","visibility-val":1,"gestures-offsetX":0,"gestures-offsetY":0,"signals-cond-0":"==","signals-val-0":true,"signals-icon-0":"/vis/signals/lowbattery.png","signals-icon-size-0":0,"signals-blink-0":false,"signals-horz-0":0,"signals-vert-0":0,"signals-hide-edit-0":false,"signals-cond-1":"==","signals-val-1":true,"signals-icon-1":"/vis/signals/lowbattery.png","signals-icon-size-1":0,"signals-blink-1":false,"signals-horz-1":0,"signals-vert-1":0,"signals-hide-edit-1":false,"signals-cond-2":"==","signals-val-2":true,"signals-icon-2":"/vis/signals/lowbattery.png","signals-icon-size-2":0,"signals-blink-2":false,"signals-horz-2":0,"signals-vert-2":0,"signals-hide-edit-2":false,"format_date":"DD.MM.YYYY hh:mm:ss"},"style":{"left":"432px","top":"582px","z-index":"20","color":"lightblue","width":"148px","height":"15px","font-size":"80%","text-align":"right"},"widgetSet":"basic"},{"tpl":"tplMetroTileShutter","data":{"oid":"homepilot.0.devices.RolloTronStandard.10002.level","visibility-cond":"==","visibility-val":1,"step":"-1","bg_class":"bg-darkCobalt","brand_bg_class":"bg-mauve","gestures-offsetX":0,"gestures-offsetY":0,"signals-cond-0":"==","signals-val-0":true,"signals-icon-0":"/vis/signals/lowbattery.png","signals-icon-size-0":0,"signals-blink-0":false,"signals-horz-0":0,"signals-vert-0":0,"signals-hide-edit-0":false,"signals-cond-1":"==","signals-val-1":true,"signals-icon-1":"/vis/signals/lowbattery.png","signals-icon-size-1":0,"signals-blink-1":false,"signals-horz-1":0,"signals-vert-1":0,"signals-hide-edit-1":false,"signals-cond-2":"==","signals-val-2":true,"signals-icon-2":"/vis/signals/lowbattery.png","signals-icon-size-2":0,"signals-blink-2":false,"signals-horz-2":0,"signals-vert-2":0,"signals-hide-edit-2":false,"min":"100","max":"1","oid-working":"homepilot.0.devices.RolloTronStandard.10002.level","name":"Rollotron Metro","label":"{homepilot.0.devices.RolloTronStandard.10002.name}","sliderColor":"","sliderMarkerColor":"","sliderCompleteColor":"#c19fb9"},"style":{"left":"301px","top":"439px","z-index":"15"},"widgetSet":"metro"}]
```

Rechts unten ist ein val-number Widget zur Anzeige des Level als Zahl drübergelegt, unter dem Metro Widget ist ein lastchange-Widget, das die letzte Bewegung des Rollladens anzeigt.

![alt text](img/homepilot_vis_widgets.jpg "Screenshot VIS widgets")

![alt text](img/homepilot_vis_widgets_settings.jpg "Screenshot VIS widgets settings")

## Changelog
### 0.3.0 (2017-10-16)
+ (mikepa1) Support for more z-wave actuators
+ (pix) iobroker.discovery integration

### 0.2.9 (2017-10-15)
+ (pix) Minimum nodejs 4 is required

### 0.2.8 (2017-10-15)
+ (mikepa1) Fixed issues with Heizkörperstellantrieb Z-Wave

### 0.2.7 (2017-08-26)
+ (pix) Added support for Heizkörperstellantrieb Z-Wave

### 0.2.6 (2017-02-03)
+ (pix) Product "Dimmer" integrated (duofern id 48)

### 0.2.5 (2017-02-03)
+ (pix) CID datapoint now accepts input of 'true' or 'false' and translates it to command 10 or 11.

### 0.2.4 (2017-01-27)
* (pix) converted serial to duofern code

### 0.2.3 (2017-01-25)
* (pix) fixed regexp issue within level datapoints for input of value 0
* (pix) new datapoint serial number of duofern product

### 0.2.2 (2017-01-24)
* (pix) fixed state datapoint updates

### 0.2.1 (2017-01-23)
* (pix) Device recognition by serial number optimized

### 0.2.0 (2017-01-15)
* (pix) removed parent from setObjects

### 0.1.1 (2017-01-15)
* (pix) Roles added

### 0.1.0 (2017-01-05)
* (pix) Travis CI supported

### 0.0.7 (2016-06-21)
* (pix) fixed RegEx and log

### 0.0.6 (2016-06-20)
* (pix) fixed switch control "false" by command id (cid)
* (pix) names of datapoints

### 0.0.5 (2016-06-19)
* (pix) user can choose sync time in settings
* (pix) switch control by command id (cid)

### 0.0.4 (2016-06-18)
* (pix) datapoint "level_interted" added for Homematic like appearance
* (pix) productNumber 46 added to switches

### 0.0.3 (2016-06-18)
* (pix) datapoint "state" added for switches (incl. productNumber #43)

### 0.0.2 (2016-06-16)
* (pix) error fixed

### 0.0.1 (2016-06-15)
* (pix) adapter created

## Roadmap
* 0.3.1 new documentation structure
* 0.4.0 get a list of all installed duofern products in your network within the settings window
* 0.5.0 rearrange object tree to "homepilot.0.device.channel.state"
* 1.0.0 get live data from Homepilot station

## License

The MIT License (MIT)

Copyright (c) 2017 pix

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
