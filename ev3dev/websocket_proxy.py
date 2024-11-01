#!/usr/bin/env python3
import socket
import base64
import hashlib

BROWSER_PORT = 4001
EV3_HOST = '192.168.2.3'
EV3_PORT = 4000

def debug_bytes(data, prefix=""):
    print(prefix + " Length: " + str(len(data)))
    print(prefix + " Hex: " + ' '.join(hex(b) for b in data))
    try:
        print(prefix + " UTF-8: " + data.decode('utf-8', errors='ignore'))
    except:
        print(prefix + " Can't decode as UTF-8")

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('0.0.0.0', BROWSER_PORT))
server.listen(1)
print("Proxy listening on port " + str(BROWSER_PORT))

while True:
    browser_socket, addr = server.accept()
    print("\nBrowser connected from " + str(addr))
    
    try:
        # Connect to EV3
        ev3_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        print("Connecting to EV3 at " + EV3_HOST + ":" + str(EV3_PORT))
        ev3_socket.connect((EV3_HOST, EV3_PORT))
        print("Connected to EV3")
        
        # Forward initial WebSocket handshake
        data = browser_socket.recv(1024)
        debug_bytes(data, "Browser handshake ->")
        
        # Send to EV3
        print("\nForwarding to EV3...")
        ev3_socket.send(data)
        
        # Get EV3 response
        ev3_response = ev3_socket.recv(1024)
        debug_bytes(ev3_response, "EV3 response <-")
    
        
        # Forward to browser
        browser_socket.send(ev3_response)
        
        print("\nHandshake complete, entering message loop")
        
        while True:
            # Get message from browser
            browser_data = browser_socket.recv(1024)
            if not browser_data:
                print("Browser closed connection")
                break
                
            debug_bytes(browser_data, "\nBrowser message ->")
            
            # Forward to EV3
            print("Forwarding to EV3...")
            ev3_socket.send(browser_data)
            
            # Get EV3 response
            ev3_data = ev3_socket.recv(1024)
            if not ev3_data:
                print("EV3 closed connection")
                break
                
            debug_bytes(ev3_data, "EV3 response <-")
            
            # Forward to browser
            browser_socket.send(ev3_data)
            
    except Exception as e:
        print("\nError: " + str(e))
    finally:
        print("\nClosing connections")
        browser_socket.close()
        ev3_socket.close()