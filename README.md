# Robotic Arm

## Intro

### Copy file from MacOS
scp ev3.py robot@ev3dev.local:/home/robot/

### Run on EV3
chmod +x ev3.py
./ev3.py

### Check connection
nc -v 192.168.3.1 4000 

### USB
Widzę problem - routing idzie przez en0 zamiast en13.
netstat -nr | grep 192.168.2 

Usuń obecną trasę 
sudo route delete 192.168.2.0/24 

Dodaj poprawną trasę przez en13 sudo route add -net 
192.168.2.0/24 -interface en13

### Reset USB
sudo ifconfig en13 down
sudo route flush 

sudo ifconfig en13 192.168.2.1 netmask 255.255.255.0 up 
sudo route -n add -net 192.168.2.0/24 -interface en13

ping -c 3 192.168.3.1

### wscat
wscat -c ws://192.168.2.3:4000 

### EV3
ip -4 addr show usb0
netstat -nr

ssh robot@ev3dev.local


