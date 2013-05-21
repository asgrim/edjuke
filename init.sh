#!/bin/bash

mount /media/pimusic
xmms2 playlist clear
xmms2 add /media/pimusic
xmms2 playlist shuffle
xmms2 play

