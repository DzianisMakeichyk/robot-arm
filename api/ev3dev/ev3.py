#!/usr/bin/env python3
import socket
import base64
import hashlib
from ev3dev2.motor import LargeMotor, OUTPUT_A

def decode_message(data):
    """Decode WebSocket message"""
    try:
        print("Raw message:", ' '.join(hex(b) for b in data))
        
        length = data[1] & 0x7F
        mask_start = 2
        if length == 126:
            mask_start = 4
        elif length == 127:
            mask_start = 10
            
        masks = data[mask_start:mask_start+4]
        data_start = mask_start + 4
        
        decoded = bytearray()
        for i in range(data_start, len(data)):
            decoded.append(data[i] ^ masks[(i - data_start) % 4])
            
        message = decoded.decode('utf-8')
        print("Decoded message:", message)
        return message
    except Exception as e:
        print("Decoding error:", str(e))
        return None

def create_websocket_frame(data):
    """Create WebSocket frame"""
    if isinstance(data, str):
        data = data.encode()
    frame = bytearray()
    frame.append(0x81)  # Text frame
    length = len(data)
    frame.append(length)
    frame.extend(data)
    return frame

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('0.0.0.0', 4000))
server.listen(1)
print("Server started on port 4000")

while True:
    try:
        client, addr = server.accept()
        print("Connected from:", addr)
        
        data = client.recv(1024)
        text_data = data.decode('utf-8', errors='ignore')
        
        if "Upgrade: websocket" in text_data:
            key = ""
            for line in text_data.split('\n'):
                if "Sec-WebSocket-Key" in line:
                    key = line.split(': ')[1].strip()
                    
            if key:
                accept = base64.b64encode(
                    hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode())
                    .digest()
                ).decode()
                
                response = (
                    "HTTP/1.1 101 Switching Protocols\r\n"
                    "Upgrade: websocket\r\n"
                    "Connection: Upgrade\r\n"
                    "Sec-WebSocket-Accept: " + accept + "\r\n"
                    "\r\n"
                )
                client.send(response.encode())
                print("WebSocket connection established")
                
                while True:
                    try:
                        frame = client.recv(1024)
                        if not frame:
                            break
                            
                        message = decode_message(frame)
                        if message:
                            print("Got message:", message)
                            if '"action":"test_motor"' in message:
                                print("Testing motor")
                                try:
                                    motor = LargeMotor(OUTPUT_A)
                                    motor.on_for_rotations(speed=50, rotations=1)
                                    # Wysyłamy odpowiedź JSON
                                    response = '{"status":"success","message":"Motor test completed"}'
                                    client.send(create_websocket_frame(response))
                                except Exception as e:
                                    error_response = '{"status":"error","message":"Motor error: ' + str(e) + '"}'
                                    client.send(create_websocket_frame(error_response))
                    except Exception as e:
                        print("Frame handling error:", str(e))
                        break
    except Exception as e:
        print("Main loop error:", str(e))
    finally:
        client.close()