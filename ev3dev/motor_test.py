#!/usr/bin/env python3
from ev3dev2.motor import LargeMotor, OUTPUT_A
from time import sleep

# Initialize Motor A
motor = LargeMotor(OUTPUT_A)

# Run the motor forward at 50% speed
motor.on(speed=50)

# Let the motor run for 2 seconds
sleep(2)

# Stop the motor
motor.off()