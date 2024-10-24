#!/bin/bash

# Start D-Bus system bus
mkdir -p /var/run/dbus
dbus-daemon --system --fork

# Start Bluetooth service
service bluetooth start || true

# Start your application
npm run watch