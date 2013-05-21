#!/bin/bash -x

cd "$(dirname "$0")"

mount /media/pimusic

./rescan.sh

xmms2 play

