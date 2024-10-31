#!/usr/bin/env python3
import socket
import base64
import hashlib
import random
import sys

def create_websocket_key():
    random_bytes = bytes(random.getrandbits(8) for _ in range(16))
    return base64.b64encode(random_bytes).decode()

def create_handshake_request(host, port):
    key = create_websocket_key()
    request = (
        f"GET / HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        "Sec-WebSocket-Version: 13\r\n"
        "\r\n"
    )
    return request, key

def test_websocket():
    host = '192.168.2.3'
    port = 4000
    
    print(f"Connecting to {host}:{port}")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        sock.connect((host, port))
        print("Connected!")
        
        request, key = create_handshake_request(host, port)
        print("Sending handshake...")
        sock.send(request.encode())
        
        response = sock.recv(1024).decode()
        print("\nReceived response:")
        print(response)
        
        # Test sending message
        print("\nSending test message...")
        sock.send(b"Hello from Python client!")
        
        data = sock.recv(1024)
        print("Received:", data)
        
    except Exception as e:
        print("Error:", str(e))
    finally:
        sock.close()

if __name__ == "__main__":
    test_websocket()