![Logo](admin/homepilot.png)
# ioBroker.homepilot
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.homepilot.svg)](https://www.npmjs.com/package/iobroker.homepilot)
[![Downloads](https://img.shields.io/npm/dm/iobroker.homepilot.svg)](https://www.npmjs.com/package/iobroker.homepilot)
[![Tests](https://travis-ci.org/ioBroker/ioBroker.homepilot.svg?branch=master)](https://travis-ci.org/ioBroker/ioBroker.homepilot)

[![NPM](https://nodei.co/npm/iobroker.homepilot.png?downloads=true)](https://nodei.co/npm/iobroker.homepilot/)

## Beschreibung / Description
:de: Dieser Adapter verbindet die Rademacher Homepilot Basistation mit ioBroker, um die Rademacher DuoFern Rollladenaktoren / Gurtwickler / Rollladenmotoren / Universal-Aktoren zu steuern.

:uk: This adapter connects Rademachers Homepilot Station to ioBroker to control Rademacher DuoFern automatic shutter belt winders / roller-blinds motors / universal actors .

## Einstellungen / Configuration
### IP / Port
Die IP Adresse der Homepilot Basisstation im lokalen Netzwerk. Ohne EIngabe verwendet der Adapter __homepilot.local__. Die Portnummer ist optional und wird nur bei Eingabe einer IP-Adresse berücksichtigt.

IP adress of Homepilot station within local network. If nothings is entered, the adapter will use __homepilot.local__. The port number is optional and only will be considered if an ip adress was set before.


##  Datenpunkte / Datapoints
Es gibt zwei Hauptkanäle, einen für die Basisstation und einen für die gefundenen Gerätetypen:

There are to main channels, one for the station and one for all found devices (shutter belt winders, etc.):

homepilot.0.__station__ (data on Homepilot station)
homepilot.0.__devices.product__ (devices sort by product type)

Innerhalb des Kanals *devices.product* gibt es für jedes Gerät einen weiteren Kanal *deviceID*. Z.B. __E.g. homepilot.0.devices.rollotron.10001.balkon__

Within *devices.product* each found device creates a new channel *devicedID*. __E.g. homepilot.0.devices.rollotron.10001.balcony__

homepilot.0.devices.product.*deviceID*.__name__ (string)

homepilot.0.devices.product.*deviceID*.__description__ (string)

homepilot.0.devices.product.*deviceID*.__hasErrors__ (number)

homepilot.0.devices.product.*deviceID*.__status_changed__ (number, timecode)

homepilot.0.devices.product.*deviceID*.__cid__ (string, writeable)

homepilot.0.devices.product.*deviceID*.__level__ (number)

homepilot.0.devices.product.*deviceID*.____ (number)

homepilot.0.devices.__json__  (*JSON* file *json* Datenpunkt mit JSON Rückgabe / Datapoint filled with returned JSON )

homepilot.0.station.__ip__ (string)



Die Datenpunkte *cid* und *level* können beschrieben werden. Sie werden auf Änderung aus anderen Adaptern (VIS, Javascript, Scenes) überwacht.

Datapoints *cid* and *level* are writeable and subscribed for changes stated from other adapters (e.g. VIS, Javascript, Scenes).

### Steuerung / Control
Um die Rollläden aus Javascript, VIS oder z.B. Scenes zu steuern, gibt es zwei Möglichkeiten. 
Z.B. kann man den Rolladen mit der DeviceID 10002 (zB "Wohnzimmer rechts") steuern, indem der Datenpunkt 
homepilot.0.devices.product.*10002*.__level__ auf "50" gesetzt wird. __level__ ist eine ganze Zahl von 0 bis 100, andere Zahlen/Zeichen werden nicht angenommen.
Alternativ können auch die Command ID von Homepilot verwendet werden. Dazu wird einfach der passende Befehl in den Datenpunkt homepilot.0.devices.product.*deviceID*.__cid__  geschrieben.

The shutters can be control from Javascript. VIS Widgets or Scenes in two ways.
For instance you can control the shutter with the DeviceID 10002 ('Living room right') by setting homepilot.0.devices.product.*10002*.__level__ to "50".
This datapoint only accepts integer numbers between 0 and 100. In addition to that you can use Homepilots command ID. Simply state one of the strings mentioned in the following table to homepilot.0.devices.product.*deviceID*.__cid__


Diese Befehle sind bisher möglich zur Steuerung über cid in homepilot.0.devices.product.*deviceID*.__cid__

You can use these commands to control Homepilot with cid in homepilot.0.devices.product.*deviceID*.__cid__

| CID   | Befehle / Commands               |
| ------|:--------------------------------:|
| 1     | UP, up, HOCH, hoch, RAUF, rauf   |
| 2     | STOP, stop, Stop                 |
| 3     | DOWN, down, RUNTER, runter       |
| 4     | POSITION_0, position_0, 0%       |
| 5     | POSITION_25, position_25, 25%    |
| 6     | POSITION_50, position_50, 50%    |
| 7     | POSITION_75, position_75, 75%    |
| 8     | POSITION_100, position_100, 100% |
| 9     | POSITION_N                       |
| 10    | EIN, ein, AN, an, ON, on         |
| 11    | AUS, aus, OFF, off               |
| 23    | INCREMENT, increment, +          |
| 24    | DECREMENT, decrement, -          |
| ------|----------------------------------|

## VIS Widgets
### Beispiel Rollläden / Shutters
```
[{"tpl":"tplValueFloat","data":{"oid":"homepilot.0.devices.RolloTronStandard.10002.level","visibility-cond":"==","visibility-val":1,"is_comma":true,"is_tdp":"false","factor":"1","gestures-offsetX":0,"gestures-offsetY":0,"signals-cond-0":"==","signals-val-0":true,"signals-icon-0":"/vis/signals/lowbattery.png","signals-icon-size-0":0,"signals-blink-0":false,"signals-horz-0":0,"signals-vert-0":0,"signals-hide-edit-0":false,"signals-cond-1":"==","signals-val-1":true,"signals-icon-1":"/vis/signals/lowbattery.png","signals-icon-size-1":0,"signals-blink-1":false,"signals-horz-1":0,"signals-vert-1":0,"signals-hide-edit-1":false,"signals-cond-2":"==","signals-val-2":true,"signals-icon-2":"/vis/signals/lowbattery.png","signals-icon-size-2":0,"signals-blink-2":false,"signals-horz-2":0,"signals-vert-2":0,"signals-hide-edit-2":false,"digits":"0","html_append_singular":" %","html_append_plural":" %","name":"RolloTron Percent","label":"{homepilot.0.devices.RolloTronStandard.10002.name}"},"style":{"left":"519px","top":"555px","color":"lightblue","text-align":"right","z-index":"20"},"widgetSet":"basic"},{"tpl":"tplValueLastchange","data":{"oid":"homepilot.0.devices.RolloTronStandard.10002.status_changed","visibility-cond":"==","visibility-val":1,"gestures-offsetX":0,"gestures-offsetY":0,"signals-cond-0":"==","signals-val-0":true,"signals-icon-0":"/vis/signals/lowbattery.png","signals-icon-size-0":0,"signals-blink-0":false,"signals-horz-0":0,"signals-vert-0":0,"signals-hide-edit-0":false,"signals-cond-1":"==","signals-val-1":true,"signals-icon-1":"/vis/signals/lowbattery.png","signals-icon-size-1":0,"signals-blink-1":false,"signals-horz-1":0,"signals-vert-1":0,"signals-hide-edit-1":false,"signals-cond-2":"==","signals-val-2":true,"signals-icon-2":"/vis/signals/lowbattery.png","signals-icon-size-2":0,"signals-blink-2":false,"signals-horz-2":0,"signals-vert-2":0,"signals-hide-edit-2":false,"format_date":"DD.MM.YYYY hh:mm:ss"},"style":{"left":"432px","top":"582px","z-index":"20","color":"lightblue","width":"148px","height":"15px","font-size":"80%","text-align":"right"},"widgetSet":"basic"},{"tpl":"tplMetroTileShutter","data":{"oid":"homepilot.0.devices.RolloTronStandard.10002.level","visibility-cond":"==","visibility-val":1,"step":"-1","bg_class":"bg-darkCobalt","brand_bg_class":"bg-mauve","gestures-offsetX":0,"gestures-offsetY":0,"signals-cond-0":"==","signals-val-0":true,"signals-icon-0":"/vis/signals/lowbattery.png","signals-icon-size-0":0,"signals-blink-0":false,"signals-horz-0":0,"signals-vert-0":0,"signals-hide-edit-0":false,"signals-cond-1":"==","signals-val-1":true,"signals-icon-1":"/vis/signals/lowbattery.png","signals-icon-size-1":0,"signals-blink-1":false,"signals-horz-1":0,"signals-vert-1":0,"signals-hide-edit-1":false,"signals-cond-2":"==","signals-val-2":true,"signals-icon-2":"/vis/signals/lowbattery.png","signals-icon-size-2":0,"signals-blink-2":false,"signals-horz-2":0,"signals-vert-2":0,"signals-hide-edit-2":false,"min":"100","max":"1","oid-working":"homepilot.0.devices.RolloTronStandard.10002.level","name":"Rollotron Metro","label":"{homepilot.0.devices.RolloTronStandard.10002.name}","sliderColor":"","sliderMarkerColor":"","sliderCompleteColor":"#c19fb9"},"style":{"left":"301px","top":"439px","z-index":"15"},"widgetSet":"metro"}]
```

![alt text](img/homepilot_vis_widgets.jpg "Screenshot VIS widgets")

In "Object ID" diesen Datenpunkt eintragen: homepilot.0.devices.product.*deviceID*.control.__level__ (number, writeable)
In "in Arbeit Zustand" diesen Datenpunkt eintragen: homepilot.0.devices.product.*deviceID*.__level__ (number)
"Min" 100
"Max" 0
"Schritt" -1
"Beschriftung" "{homepilot.0.devices.RolloTronStandard.10002.name}" als Binding (ohne Anführungszeichen)

english tbd

## Changelog
### 0.0.1 (2016-06-15)
* (pix) Adapter created

## Roadmap
* Include more duofern products


## License

The MIT License (MIT)

Copyright (c) 2016 pix

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