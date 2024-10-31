#!/usr/bin/env python3
import socket
import base64
import hashlib
import json
from ev3dev2.motor import LargeMotor, OUTPUT_A, OUTPUT_B, OUTPUT_C

# Default robot state
DEFAULT_ROBOT_STATE = {
    "nodes": {
        "main_column": {
            "position": [0, 1.462, 0],
            "scale": [1, 1, 1],
            "rotation": [0, 0, 0]
        },
        "upper_arm": {
            "position": [2.335, 0, 0.094],
            "scale": [0.684, 1, 1],
            "rotation": [0, 0, 0]
        },
        "wrist_extension": {
            "position": [3.231, 6.551, 0.007],
            "scale": [0.264, 0.264, 0.264],
            "rotation": [0, 0, 0]
        },
        "hand": {
            "position": [3.368, 5.728, -0.119],
            "scale": [1, 0.068, 0.327],
            "rotation": [0, 1.5708, 0]
        },
        "gripper": {
            "position": [3.33, 5.545, 0.006],
            "scale": [-0.01, -0.132, -0.325],
            "rotation": [0, 1.5708, 0]
        }
    }
}

def get_motor(port):
    try:
        return LargeMotor(port)
    except Exception as e:
        print("Error initializing motor on port " + str(port) + ": " + str(e))
        return None

def convert_to_motor_angle(rotation, motor_type):
    degrees = (rotation * 180) / 3.14159
    if motor_type == "BASE":
        return max(-180, min(180, degrees))
    elif motor_type == "ELBOW":
        return max(-90, min(90, degrees))
    elif motor_type == "HEIGHT":
        return max(0, min(120, degrees))
    return 0

def decode_message(data):
    """Decode WebSocket frame"""
    try:
        print("Decoding message of length: " + str(len(data)))
        length = data[1] & 0x7F
        mask_start = 2
        
        if length == 126:
            mask_start = 4
        elif length == 127:
            mask_start = 10
            
        if len(data) < mask_start + 4:
            print("Message too short")
            return None
            
        masks = data[mask_start:mask_start+4]
        data_start = mask_start + 4
        
        decoded = bytearray()
        for i in range(data_start, len(data)):
            decoded.append(data[i] ^ masks[(i - data_start) % 4])
            
        result = decoded.decode('utf-8')
        print("Decoded message: " + result)
        return result
    except Exception as e:
        print("Decoding error: " + str(e))
        return None

def create_websocket_frame(data):
    """Properly format WebSocket frame"""
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    frame = bytearray()
    frame.append(0x81)  # Text frame
    
    length = len(data)
    if length <= 125:
        frame.append(length)
    elif length <= 65535:
        frame.append(126)
        frame.append((length >> 8) & 0xFF)
        frame.append(length & 0xFF)
    else:
        frame.append(127)
        for i in range(8):
            frame.append((length >> (7-i)*8) & 0xFF)
    
    frame.extend(data)
    return bytes(frame)


def handle_robot_update(data):
    try:
        state = json.loads(data)
        if 'action' in state:
            del state['action']
            
        current_state = DEFAULT_ROBOT_STATE.copy()
        current_state.update(state)
        nodes = current_state.get('nodes', {})
        
        # Handle base rotation (main_column)
        if 'main_column' in nodes and 'rotation' in nodes['main_column']:
            rotation = nodes['main_column']['rotation'][1]
            angle = convert_to_motor_angle(rotation, "BASE")
            motor = get_motor(OUTPUT_A)
            if motor:
                motor.on_to_position(speed=20, position=angle)
        
        # Handle elbow movement (upper_arm)
        if 'upper_arm' in nodes and 'rotation' in nodes['upper_arm']:
            rotation = nodes['upper_arm']['rotation'][1]
            angle = convert_to_motor_angle(rotation, "ELBOW")
            motor = get_motor(OUTPUT_B)
            if motor:
                motor.on_to_position(speed=20, position=angle)
        
        # Handle height adjustment (wrist_extension)
        if 'wrist_extension' in nodes and 'rotation' in nodes['wrist_extension']:
            rotation = nodes['wrist_extension']['rotation'][1]
            angle = convert_to_motor_angle(rotation, "HEIGHT")
            motor = get_motor(OUTPUT_C)
            if motor:
                motor.on_to_position(speed=20, position=angle)
            
        return {"status": "success", "message": "Robot position updated", "state": current_state}
    except Exception as e:
        return {"status": "error", "message": str(e)}

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('0.0.0.0', 4000))
server.listen(1)
print("Server started on port 4000")

while True:
    try:
        client, addr = server.accept()
        print("Connected from: " + str(addr))
        
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
                
                # Send initial state
                try:
                    initial_state = {"status": "success", "state": DEFAULT_ROBOT_STATE}
                    frame = create_websocket_frame(json.dumps(initial_state))
                    client.send(frame)
                    print("Sent initial state")
                except Exception as e:
                    print("Error sending initial state: " + str(e))
                
                while True:
                    try:
                        frame = client.recv(1024)
                        if not frame:
                            break
                            
                        message = decode_message(frame)
                        if message:
                            print("Got message: " + message)
                            
                            if '"action":"test_motor"' in message:
                                try:
                                    motor = get_motor(OUTPUT_A)
                                    if motor:
                                        motor.on_for_rotations(speed=50, rotations=1)
                                        response = {"status": "success", "message": "Motor test completed"}
                                    else:
                                        response = {"status": "error", "message": "Motor not found"}
                                except Exception as e:
                                    response = {"status": "error", "message": str(e)}
                                    
                            elif '"action":"update"' in message:
                                response = handle_robot_update(message)
                            else:
                                response = {"status": "error", "message": "Unknown action"}
                                
                            frame = create_websocket_frame(json.dumps(response))
                            client.send(frame)
                            
                    except Exception as e:
                        print("Frame handling error: " + str(e))
                        break
    except Exception as e:
        print("Main loop error: " + str(e))
    finally:
        client.close()