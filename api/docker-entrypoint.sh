#!/bin/bash

# Start D-Bus system bus
mkdir -p /var/run/dbus
dbus-daemon --system --fork --nopidfile

# Start Bluetooth daemon
/etc/init.d/bluetooth start

# Wait for D-Bus and Bluetooth to be ready
sleep 5

# Initialize Bluetooth
hciconfig hci0 up || true
sdptool add SP || true

# Start your application
exec npm run watch