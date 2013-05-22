#!/bin/bash -x

xmms2 stop
xmms2 playlist clear
xmms2 add /media/usb
xmms2 playlist shuffle
xmms2 play

