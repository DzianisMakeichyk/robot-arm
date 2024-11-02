#!/usr/bin/env python3
import socket
import select
import base64
import hashlib

BROWSER_PORT = 4001
EV3_HOST = '192.168.2.3' 
EV3_PORT = 4000

def handle_websocket_connection(browser_socket, ev3_socket):
    # Ustaw non-blocking mode
    browser_socket.setblocking(0)
    ev3_socket.setblocking(0)
    
    inputs = [browser_socket, ev3_socket]
    
    while True:
        try:
            readable, _, exceptional = select.select(inputs, [], inputs, 1.0)
            
            for sock in readable:
                if sock is browser_socket:
                    # Dane z przeglądarki
                    data = sock.recv(1024)
                    if not data:
                        print("Browser disconnected")
                        return
                        
                    if data[0] == 0x81:  # WebSocket text frame
                        print("Browser -> EV3 (WS frame)")
                        ev3_socket.send(data)
                    
                elif sock is ev3_socket:
                    # Dane z EV3
                    data = sock.recv(1024)
                    if not data:
                        print("EV3 disconnected")
                        return
                        
                    print("EV3 -> Browser")
                    browser_socket.send(data)
                    
            for sock in exceptional:
                print("Socket exception")
                return
                
        except Exception as e:
            print("Connection error: " + str(e))
            return

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', BROWSER_PORT))
    server.listen(1)
    print("Proxy listening on port " + str(BROWSER_PORT))

    while True:
        try:
            browser_socket, addr = server.accept()
            print("Browser connected from " + str(addr))
            
            ev3_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            print("Connecting to EV3...")
            ev3_socket.connect((EV3_HOST, EV3_PORT))
            print("Connected to EV3")
            
            # WebSocket handshake
            init_data = browser_socket.recv(1024)
            ev3_socket.send(init_data)
            response = ev3_socket.recv(1024)
            browser_socket.send(response)
            
            print("Starting WebSocket relay")
            handle_websocket_connection(browser_socket, ev3_socket)
            
        except Exception as e:
            print("Error: " + str(e))
        finally:
            try:
                browser_socket.close()
                ev3_socket.close()
            except:
                pass
        
        print("Connection closed, restarting...")

if __name__ == "__main__":
    main()