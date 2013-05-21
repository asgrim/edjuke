#!/bin/bash -x

cd "$(dirname "$0")"

xmms2 playlist clear
xmms2 add /media/pimusic
xmms2 playlist shuffle

