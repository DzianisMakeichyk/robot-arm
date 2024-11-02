#!/usr/bin/env python3
import socket
import base64
import hashlib
import json
from ev3dev2.motor import (
    Motor,
    LargeMotor,
    MediumMotor,
    OUTPUT_A,
    OUTPUT_B,
    OUTPUT_C
)
import os

# Globalne zmienne dla silników
motors = {
    'A': None,
    'B': None,
    'C': None
}

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

def check_motors():
    """Check which motors are connected"""
    motors = {}
    print("Scanning for motors...")
    
    # List all motor devices
    try:
        motor_path = "/sys/class/tacho-motor/"
        if os.path.exists(motor_path):
            devices = os.listdir(motor_path)
            print("Found devices: " + str(devices))
            
            for device in devices:
                try:
                    with open(os.path.join(motor_path, device, 'address'), 'r') as f:
                        port = f.read().strip()
                        with open(os.path.join(motor_path, device, 'driver_name'), 'r') as f:
                            driver = f.read().strip()
                        print("Found " + driver + " on port: " + port)
                except:
                    print("Cannot read info for device: " + device)
    except Exception as e:
        print("Error scanning devices: " + str(e))

    # Try to initialize motors
    for port in [OUTPUT_A, OUTPUT_B, OUTPUT_C]:
        try:
            motor = get_motor(port)
            if motor:
                port_name = port.strip('ev3-ports:out')
                motors[port] = True
                print("Motor on port " + port_name + " initialized successfully")
            else:
                port_name = port.strip('ev3-ports:out')
                motors[port] = False
                print("No motor found on port " + port_name)
        except Exception as e:
            port_name = port.strip('ev3-ports:out')
            motors[port] = False
            print("Error on port " + port_name + ": " + str(e))
    return motors

def get_motor(port):
    """Safely get motor instance with correct type"""
    try:
        # Sprawdź typ silnika
        motor_path = "/sys/class/tacho-motor/"
        for device in os.listdir(motor_path):
            with open(os.path.join(motor_path, device, 'address'), 'r') as f:
                if port in f.read():
                    # Sprawdź czy to średni czy duży silnik
                    with open(os.path.join(motor_path, device, 'driver_name'), 'r') as f:
                        driver = f.read()
                        if 'lego-ev3-m-motor' in driver:
                            print("Initializing Medium Motor on " + port)
                            return MediumMotor(port)
                        else:
                            print("Initializing Large Motor on " + port)
                            return LargeMotor(port)
    except Exception as e:
        print("Error initializing motor on port " + port + ": " + str(e))
        return None

def convert_to_motor_angle(rotation, motor_type):
    # Convert radians to degrees
    degrees = (rotation * 180) / 3.14159
    
    # Apply motor-specific limits and scaling
    if motor_type == "BASE":
        return max(-180, min(180, degrees))
    elif motor_type == "ELBOW":
        return max(-90, min(90, degrees))
    elif motor_type == "HEIGHT":
        return max(0, min(120, degrees))
    return 0

def decode_message(data):
    try:
        if len(data) < 2:
            return None

        # Próbuj jako WebSocket frame
        if data[0] == 0x81:
            second_byte = data[1] & 0x7F
            mask_start = 2
            payload_length = 0

            if second_byte <= 125:
                payload_length = second_byte
            elif second_byte == 126:
                if len(data) < 4:
                    return None
                payload_length = (data[2] << 8) | data[3]
                mask_start = 4
                
            mask = data[mask_start:mask_start + 4]
            payload = bytearray()
            
            for i in range(mask_start + 4, mask_start + 4 + payload_length):
                payload.append(data[i] ^ mask[(i - (mask_start + 4)) % 4])

            return payload.decode('utf-8')

        # Jeśli to nie WebSocket frame, próbuj jako base64
        try:
            decoded = base64.b64decode(data)
            if decoded.startswith(b'{'):
                return decoded.decode('utf-8')
        except:
            pass

        # Próbuj jako surowe bajty
        try:
            if data.startswith(b'{'):
                return data.decode('utf-8')
        except:
            pass

        return None

    except Exception as e:
        print("Decode error: " + str(e))
        return None

def create_websocket_frame(data):
    """Simple WebSocket frame encoder"""
    try:
        if isinstance(data, str):
            data = data.encode('utf-8')

        length = len(data)
        frame = bytearray()
        frame.append(0x81)  # Text frame

        if length <= 125:
            frame.append(length)
        elif length <= 65535:
            frame.append(126)
            frame.append((length >> 8) & 0xFF)
            frame.append(length & 0xFF)
        else:
            return None  # Don't handle huge frames

        frame.extend(data)
        return bytes(frame)
    except Exception as e:
        print("Encode error: " + str(e))
        return None

def initialize_motors():
    """Initialize motors once"""
    print("Initializing motors...")
    try:
        motors['A'] = MediumMotor(OUTPUT_A)
        print("Medium Motor on port A initialized")
    except Exception as e:
        print("Error initializing port A: " + str(e))

    try:
        motors['B'] = LargeMotor(OUTPUT_B)
        print("Large Motor on port B initialized")
    except Exception as e:
        print("Error initializing port B: " + str(e))

    try:
        motors['C'] = LargeMotor(OUTPUT_C)
        print("Large Motor on port C initialized")
    except Exception as e:
        print("Error initializing port C: " + str(e))

def handle_robot_update(data):
    """Handle robot update using global motors"""
    try:
        state = json.loads(data)
        if 'action' in state:
            del state['action']
            
        nodes = state.get('nodes', {})
        # print("====>>>> Received state update:", nodes)
        response = {"status": "success", "message": [], "state": state}
        
        # Handle base rotation (main_column)
        if 'main_column' in nodes and 'rotation' in nodes['main_column'] and motors['A']:
            # print("------>>>> main")
            rotation = nodes['main_column']['rotation'][1]
            angle = (rotation * 180) / 3.14159
            angle = max(-180, min(180, angle))

            # print("------>>>> rotation:", rotation)
            # print("------>>>> angle:", angle)
            # print("------>>>> angle:", angle)
            try:
                motors['A'].on_for_degrees(speed=20, degrees=1)
                response["message"].append("Base motor moved")
            except Exception as e:
                response["message"].append("Base motor error: " + str(e))

        # Handle elbow movement (upper_arm)
        if 'upper_arm' in nodes and 'rotation' in nodes['upper_arm'] and motors['B']:
            rotation = nodes['upper_arm']['rotation'][1]
            angle = (rotation * 180) / 3.14159
            angle = max(-90, min(90, angle))
            try:
                motors['B'].on_for_degrees(speed=20, degrees=1)
                response["message"].append("Elbow motor moved")
            except Exception as e:
                response["message"].append("Elbow motor error: " + str(e))

        # Handle height adjustment (gripper)
        if 'gripper' in nodes and 'rotation' in nodes['gripper'] and motors['C']:
            rotation = nodes['gripper']['rotation'][1]
            angle = (rotation * 180) / 3.14159
            angle = max(0, min(120, angle))
            try:
                motors['C'].on_for_degrees(speed=20, degrees=1)
                response["message"].append("Height motor moved")
            except Exception as e:
                response["message"].append("Height motor error: " + str(e))
            
        response["message"] = "; ".join(response["message"])
        return response
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Inicjalizacja silników przy starcie
initialize_motors()

print("Checking available motors...")
available_motors = check_motors()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('0.0.0.0', 4000))
server.listen(1)
print("Server started on port 4000")

BYTES = [0x6e, 0x66, 0x48, 0x2e, 0x3, 0xc7, 0xad, 0xa6, 0xfa]

def is_valid_json_frame(data):
   try:
       if data[0] == 0x81:  # WebSocket text frame
           mask_start = 2
           payload_length = data[1] & 0x7F
           
           if payload_length == 126:
               if len(data) < 4:
                   return False
               payload_length = (data[2] << 8) | data[3]
               mask_start = 4

           if len(data) < mask_start + 4 + payload_length:
               return False

           mask = data[mask_start:mask_start + 4]
           payload = bytearray()
           
           for i in range(mask_start + 4, mask_start + 4 + payload_length):
               payload.append(data[i] ^ mask[(i - (mask_start + 4)) % 4])

           decoded = payload.decode('utf-8')
           json.loads(decoded)  # Sprawdź czy to JSON
           return True
   except:
       return False
   return False

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
                initial_state = {"status": "success", "state": DEFAULT_ROBOT_STATE}
                client.send(create_websocket_frame(json.dumps(initial_state)))
                
                while True:
                  try:
                      data = client.recv(1024)
                      if not data:
                          print("Client disconnected")
                          break
                      
                    #   if data[0] in BYTES:  # Pomijamy niepoprawne ramki
                    #       continue
                      
                      if not is_valid_json_frame(data):
                          continue

                      message = decode_message(data)
                      if message:
                          print("Received message:", message)
                          try:
                              parsed = json.loads(message)
                              if "action" in parsed:
                                  if parsed["action"] == "test_motor":
                                      try:
                                          if motors['A']:
                                              print("Running motor test")
                                            #   motors['A'].on_for_rotations(speed=50, rotations=1)
                                            #   response = {"status": "success", "message": "Motor test completed"}
                                          else:
                                              response = {"status": "error", "message": "Motor not available"}
                                      except Exception as e:
                                          response = {"status": "error", "message": str(e)}
                                  elif parsed["action"] == "update":
                                      print("===>>> Handling robot update <<<===")
                                      response = handle_robot_update(message)
                                  else:
                                      response = {"status": "error", "message": "Unknown action"}

                                  frame = create_websocket_frame(json.dumps(response))
                                  if frame:
                                      client.send(frame)
                          except Exception as e:
                              print("Error processing message: " + str(e))
                      else:
                          print("===>>> Skipping invalid data" + str(data))
                          print("===>>> Skipping invalid message" + str(message))

                  except Exception as e:
                      print("Socket error: " + str(e))
                      break
    except Exception as e:
        print("Main loop error: " + str(e))
    finally:
        client.close()