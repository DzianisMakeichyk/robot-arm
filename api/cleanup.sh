#!/bin/bash

# cleanup.sh
echo "Checking for processes using port 4000..."
lsof -i :4000 | awk 'NR!=1 {print $2}' | xargs -r kill -9
echo "Checking for processes using serial port..."
lsof | grep cu.EVA | awk '{print $2}' | xargs -r kill -9
echo "Cleanup completed"