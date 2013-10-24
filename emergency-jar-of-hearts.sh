#!/bin/bash

JAR_ID=`sqlite3 /home/pi/.config/xmms2/medialib.db "SELECT (c.position + 1) FROM Media AS m LEFT JOIN CollectionIdlists AS c ON c.mid = m.id WHERE m.value = 'Jar of Hearts';"`
xmms2 move -n $JAR_ID
xmms2 next
