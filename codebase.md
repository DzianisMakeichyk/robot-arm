# .gitignore

```
# dependencies
hmi/node_modules/
api/node_modules/

# IDE
.idea

# Docker
.docker

# MongoDB Data
data

# build
api/dist
api/debug.log

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

```

# api/.dockerignore

```
node_modules

```

# api/bluetooth/main.conf

```conf
[General]
Name = RoboticArm
Class = 0x000100
DiscoverableTimeout = 0
```

# api/debug.log

```log
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Bluetooth adapter state:"}
{"level":"info","message":"Starting scan for Bluetooth devices..."}
{"level":"error","message":"MongoDB connection error. Please make sure MongoDB is running. MongooseServerSelectionError: getaddrinfo ENOTFOUND storage"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Bluetooth adapter state:"}
{"level":"info","message":"Starting scan for Bluetooth devices..."}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"not seeding"}
{"level":"info","message":"App is running at http://localhost:3000"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"not seeding"}
{"level":"info","message":"App is running at http://localhost:3000"}
{"$__":{"activePaths":{"paths":{"__v":"init","_id":"init","createdAt":"init","nodes.gripper.position":"init","nodes.gripper.rotation":"init","nodes.gripper.scale":"init","nodes.hand.position":"init","nodes.hand.rotation":"init","nodes.hand.scale":"init","nodes.main_column.position":"init","nodes.main_column.rotation":"init","nodes.main_column.scale":"init","nodes.upper_arm.position":"init","nodes.upper_arm.rotation":"init","nodes.upper_arm.scale":"init","nodes.wrist_extension.position":"init","nodes.wrist_extension.rotation":"init","nodes.wrist_extension.scale":"init","updatedAt":"init"},"states":{"default":{},"init":{"__v":true,"_id":true,"createdAt":true,"nodes.gripper.position":true,"nodes.gripper.rotation":true,"nodes.gripper.scale":true,"nodes.hand.position":true,"nodes.hand.rotation":true,"nodes.hand.scale":true,"nodes.main_column.position":true,"nodes.main_column.rotation":true,"nodes.main_column.scale":true,"nodes.upper_arm.position":true,"nodes.upper_arm.rotation":true,"nodes.upper_arm.scale":true,"nodes.wrist_extension.position":true,"nodes.wrist_extension.rotation":true,"nodes.wrist_extension.scale":true,"updatedAt":true}}},"skipId":true},"$isNew":false,"_doc":{"__v":0,"_id":"6711434c365537e919c96c95","createdAt":"2024-10-17T17:03:08.087Z","nodes":{"gripper":{"position":[3.33,5.545,0.006],"rotation":[0,1.5708,0],"scale":[-0.01,-0.132,-0.325]},"hand":{"position":[3.368,5.728,-0.119],"rotation":[0,1.5708,0],"scale":[1,0.068,0.327]},"main_column":{"position":[0,1.462,0],"rotation":[],"scale":[1,1,1]},"upper_arm":{"position":[2.335,0,0.094],"rotation":[],"scale":[0.684,1,1]},"wrist_extension":{"position":[3.231,6.551,0.007],"rotation":[],"scale":[0.264,0.264,0.264]}},"updatedAt":"2024-10-17T17:03:08.087Z"},"level":"info","message":"state =>"}
{"$__":{"activePaths":{"paths":{"__v":"init","_id":"init","createdAt":"init","nodes.gripper.position":"init","nodes.gripper.rotation":"init","nodes.gripper.scale":"init","nodes.hand.position":"init","nodes.hand.rotation":"init","nodes.hand.scale":"init","nodes.main_column.position":"init","nodes.main_column.rotation":"init","nodes.main_column.scale":"init","nodes.upper_arm.position":"init","nodes.upper_arm.rotation":"init","nodes.upper_arm.scale":"init","nodes.wrist_extension.position":"init","nodes.wrist_extension.rotation":"init","nodes.wrist_extension.scale":"init","updatedAt":"init"},"states":{"default":{},"init":{"__v":true,"_id":true,"createdAt":true,"nodes.gripper.position":true,"nodes.gripper.rotation":true,"nodes.gripper.scale":true,"nodes.hand.position":true,"nodes.hand.rotation":true,"nodes.hand.scale":true,"nodes.main_column.position":true,"nodes.main_column.rotation":true,"nodes.main_column.scale":true,"nodes.upper_arm.position":true,"nodes.upper_arm.rotation":true,"nodes.upper_arm.scale":true,"nodes.wrist_extension.position":true,"nodes.wrist_extension.rotation":true,"nodes.wrist_extension.scale":true,"updatedAt":true}}},"skipId":true},"$isNew":false,"_doc":{"__v":0,"_id":"6711434c365537e919c96c95","createdAt":"2024-10-17T17:03:08.087Z","nodes":{"gripper":{"position":[3.33,5.545,0.006],"rotation":[0,1.5708,0],"scale":[-0.01,-0.132,-0.325]},"hand":{"position":[3.368,5.728,-0.119],"rotation":[0,1.5708,0],"scale":[1,0.068,0.327]},"main_column":{"position":[0,1.462,0],"rotation":[],"scale":[1,1,1]},"upper_arm":{"position":[2.335,0,0.094],"rotation":[],"scale":[0.684,1,1]},"wrist_extension":{"position":[3.231,6.551,0.007],"rotation":[],"scale":[0.264,0.264,0.264]}},"updatedAt":"2024-10-17T17:03:08.087Z"},"level":"info","message":"state =>"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"not seeding"}
{"level":"info","message":"App is running at http://localhost:3000"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"error","message":"Failed to get Bluetooth adapter: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.1","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"error","message":"Failed to initialize Bluetooth: No Bluetooth adapter available","stack":"Error: No Bluetooth adapter available\n    at /usr/src/api/dist/ev3/ev3Client.js:40:27\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"}
{"level":"info","message":"Enabling simulation mode due to Bluetooth initialization failure"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"error","message":"Failed to get Bluetooth adapter: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.2","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"error","message":"Failed to initialize Bluetooth: No Bluetooth adapter available","stack":"Error: No Bluetooth adapter available\n    at /usr/src/api/dist/ev3/ev3Client.js:40:27\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"}
{"level":"info","message":"Enabling simulation mode due to Bluetooth initialization failure"}
{"level":"error","message":"MongoDB connection error. Please make sure MongoDB is running. MongooseServerSelectionError: getaddrinfo ENOTFOUND storage"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"info","message":"Getting Bluetooth adapter..."}
{"level":"error","message":"Error in Bluetooth initialization: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.3","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"error","message":"Failed to initialize Bluetooth: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.3","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"info","message":"Retrying initialization (attempt 1/5)..."}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"info","message":"Getting Bluetooth adapter..."}
{"level":"error","message":"Error in Bluetooth initialization: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.4","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"error","message":"Failed to initialize Bluetooth: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.4","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"info","message":"Retrying initialization (attempt 2/5)..."}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"info","message":"Getting Bluetooth adapter..."}
{"level":"error","message":"Error in Bluetooth initialization: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.5","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"error","message":"Failed to initialize Bluetooth: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.5","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"info","message":"Retrying initialization (attempt 3/5)..."}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"info","message":"Getting Bluetooth adapter..."}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"error","message":"Error in Bluetooth initialization: D-Bus system socket not found. Waiting for D-Bus to initialize...","stack":"Error: D-Bus system socket not found. Waiting for D-Bus to initialize...\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:55:27)\n    at Generator.next (<anonymous>)\n    at /usr/src/api/dist/ev3/ev3Client.js:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (/usr/src/api/dist/ev3/ev3Client.js:4:12)\n    at EV3Client.initializeConnection (/usr/src/api/dist/ev3/ev3Client.js:50:16)\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:33:28)\n    at Generator.next (<anonymous>)\n    at fulfilled (/usr/src/api/dist/ev3/ev3Client.js:5:58)"}
{"level":"error","message":"Failed to initialize Bluetooth: D-Bus system socket not found. Waiting for D-Bus to initialize...","stack":"Error: D-Bus system socket not found. Waiting for D-Bus to initialize...\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:55:27)\n    at Generator.next (<anonymous>)\n    at /usr/src/api/dist/ev3/ev3Client.js:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (/usr/src/api/dist/ev3/ev3Client.js:4:12)\n    at EV3Client.initializeConnection (/usr/src/api/dist/ev3/ev3Client.js:50:16)\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:33:28)\n    at Generator.next (<anonymous>)\n    at fulfilled (/usr/src/api/dist/ev3/ev3Client.js:5:58)"}
{"level":"info","message":"Retrying initialization (attempt 1/5)..."}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"error","message":"Error in Bluetooth initialization: D-Bus system socket not found. Waiting for D-Bus to initialize...","stack":"Error: D-Bus system socket not found. Waiting for D-Bus to initialize...\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:55:27)\n    at Generator.next (<anonymous>)\n    at /usr/src/api/dist/ev3/ev3Client.js:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (/usr/src/api/dist/ev3/ev3Client.js:4:12)\n    at EV3Client.initializeConnection (/usr/src/api/dist/ev3/ev3Client.js:50:16)\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:33:28)\n    at Generator.next (<anonymous>)\n    at fulfilled (/usr/src/api/dist/ev3/ev3Client.js:5:58)"}
{"level":"error","message":"Failed to initialize Bluetooth: D-Bus system socket not found. Waiting for D-Bus to initialize...","stack":"Error: D-Bus system socket not found. Waiting for D-Bus to initialize...\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:55:27)\n    at Generator.next (<anonymous>)\n    at /usr/src/api/dist/ev3/ev3Client.js:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (/usr/src/api/dist/ev3/ev3Client.js:4:12)\n    at EV3Client.initializeConnection (/usr/src/api/dist/ev3/ev3Client.js:50:16)\n    at EV3Client.<anonymous> (/usr/src/api/dist/ev3/ev3Client.js:33:28)\n    at Generator.next (<anonymous>)\n    at fulfilled (/usr/src/api/dist/ev3/ev3Client.js:5:58)"}
{"level":"info","message":"Retrying initialization (attempt 2/5)..."}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"debug","message":"Logging initialized at debug level"}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"info","message":"Getting Bluetooth adapter..."}
{"level":"error","message":"Error in Bluetooth initialization: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.1","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"error","message":"Failed to initialize Bluetooth: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.1","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"info","message":"Retrying initialization (attempt 1/5)..."}
{"level":"info","message":"Initializing Bluetooth connection..."}
{"level":"info","message":"Getting Bluetooth adapter..."}
{"level":"error","message":"Error in Bluetooth initialization: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.2","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"error","message":"Failed to initialize Bluetooth: Launch helper exited with unknown return code 1","name":"DBusError","reply":{"_sent":false,"_serial":3,"body":["Launch helper exited with unknown return code 1"],"destination":":1.2","errorName":"org.freedesktop.DBus.Error.Spawn.ChildExited","flags":1,"replySerial":2,"sender":"org.freedesktop.DBus","signature":"s","type":3},"stack":"DBusError: Launch helper exited with unknown return code 1\n    at _methodReturnHandlers.<computed> (/usr/src/api/node_modules/dbus-next/lib/bus.js:343:27)\n    at handleMessage (/usr/src/api/node_modules/dbus-next/lib/bus.js:101:11)\n    at EventEmitter.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/bus.js:151:9)\n    at EventEmitter.emit (node:events:513:28)\n    at /usr/src/api/node_modules/dbus-next/lib/connection.js:132:14\n    at USocket.<anonymous> (/usr/src/api/node_modules/dbus-next/lib/message.js:65:9)\n    at USocket.emit (node:events:513:28)\n    at emitReadable_ (node:internal/streams/readable:578:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)","text":"Launch helper exited with unknown return code 1","type":"org.freedesktop.DBus.Error.Spawn.ChildExited"}
{"level":"info","message":"Retrying initialization (attempt 2/5)..."}

```

# api/docker-entrypoint.sh

```sh
#!/bin/bash

# Start D-Bus system bus
mkdir -p /var/run/dbus
dbus-daemon --system --fork --nopidfile

# Start Bluetooth service
/etc/init.d/bluetooth start || true

# Wait for D-Bus to be ready
sleep 2

# Start your application
npm run watch
```

# api/Dockerfile

```
FROM node:16-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-dev \
    python3-pip \
    make \
    gcc \
    g++ \
    bluetooth \
    bluez \
    libbluetooth-dev \
    libudev-dev \
    libusb-1.0-0-dev \
    dbus \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/api

# Copy package files
COPY package.json yarn.lock ./

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p /var/run/dbus
RUN mkdir -p /var/run/bluetooth

# Generate machine-id
RUN dbus-uuidgen > /var/lib/dbus/machine-id

# Set permissions
RUN chmod 777 /var/run/bluetooth
RUN chmod 777 /var/run/dbus

EXPOSE 3000

# Start D-Bus and your application
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
```

# api/index.d.ts

```ts
declare module 'ev3dev-lang' {
  export class Motor {
      constructor(port: string);
      runToRelativePosition(position: number, speed: number): void;
      position: number;
  }
}
```

# api/package.json

```json
{
  "name": "api",
  "version": "1.0.0",
  "description": "Lego arm API",
  "author": "Dzianis Makeichyk",
  "scripts": {
    "start": "node dist/server.js",
    "watch-node": "nodemon dist/server.js",
    "watch-ts": "tsc -w",
    "watch": "concurrently -k -p \"[{name}]\" \"npm run watch-ts\" \"npm run watch-node\""
  },
  "dependencies": {
    "dotenv": "^16.4.1",
    "express": "^4.17.1",
    "mongodb": "^3.0.7",
    "mongoose": "^6.0.9",
    "node-ble": "^1.11.0",
    "socket.io": "^4.7.4",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.10",
    "@types/socket.io": "^3.0.2",
    "concurrently": "^8.2.2",
    "nodemon": "^2.0.3"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}

```

# api/README.md

```md
# API

```

# api/src/config/logger.ts

```ts
 
import winston from "winston"

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        }),
        new winston.transports.File({filename: "debug.log", level: "debug"})
    ]
})

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level")
}

export default logger

```

# api/src/controllers/state.controller.ts

```ts
 
import {Socket} from 'socket.io/dist/socket'
import {RobotState} from '../models/RobotState'
import logger from '../config/logger'
import data from '../seed.json'
import EV3Client from '../ev3/ev3Client';

const ev3Client = new EV3Client();

/**
 * Retrieve the current state of the Robot
 *
 * @param socket Socket to respond on
 */
const getState = async (socket: Socket) => {
    const state = await RobotState.findOne({})
    // const ev3Position = ev3Client.getCurrentPosition();
    
    // if (state && state.nodes) {
    //     state.nodes.main_column.rotation[1] = ev3Position.mainColumn;
    //     state.nodes.upper_arm.rotation[1] = ev3Position.upperArm;
    //     state.nodes.wrist_extension.rotation[1] = ev3Position.wrist;
    //     state.nodes.gripper.position[2] = ev3Position.gripper;
    // }
    
    logger.info('state =>', state)
    socket.emit('state', state)
}

/**
 * Adding some initial seed data at startup if collection is empty
 */
export const seed = async () => {
    const state = await RobotState.find({})

    if (state.length === 0) {
        logger.info('seeding')
        await RobotState.insertMany(data)
    } else {
        logger.info('not seeding')
    }
}

/**
 * Map the websocket events to controller methods
 *
 * @param socket Socket to respond to
 */
export default function (socket: Socket, io: Socket) {
    socket.on("state:update", async (newState: any) => {
        try {
            await RobotState.findOneAndUpdate({}, newState, {upsert: true})
            io.emit('state', newState)  // Broadcast the new state to all connected clients
            logger.info('State updated:', newState)

            // Move EV3 robot
            // if (newState.nodes) {
            //     if (newState.nodes.main_column) {
            //         ev3Client.moveMainColumn(newState.nodes.main_column.rotation[1]);
            //     }
            //     if (newState.nodes.upper_arm) {
            //         ev3Client.moveUpperArm(newState.nodes.upper_arm.rotation[1]);
            //     }
            //     if (newState.nodes.wrist_extension) {
            //         ev3Client.moveWrist(newState.nodes.wrist_extension.rotation[1]);
            //     }
            //     if (newState.nodes.gripper) {
            //         ev3Client.moveGripper(newState.nodes.gripper.position[2]);
            //     }
            // }

            // v2
            // if (newState.nodes) {
            //     if (newState.nodes.main_column && newState.nodes.main_column.rotation) {
            //         const angle = Math.round(newState.nodes.main_column.rotation[1] * (180/Math.PI));
            //         await ev3Client.moveMainColumn(angle);
            //     }
                
            //     if (newState.nodes.upper_arm && newState.nodes.upper_arm.rotation) {
            //         const angle = Math.round(newState.nodes.upper_arm.rotation[1] * (180/Math.PI));
            //         await ev3Client.moveUpperArm(angle);
            //     }
                
            //     if (newState.nodes.wrist_extension && newState.nodes.wrist_extension.rotation) {
            //         const angle = Math.round(newState.nodes.wrist_extension.rotation[1] * (180/Math.PI));
            //         await ev3Client.moveWrist(angle);
            //     }
                
            //     if (newState.nodes.gripper && newState.nodes.gripper.position) {
            //         const distance = Math.round(newState.nodes.gripper.position[2] * 360);
            //         await ev3Client.moveGripper(distance);
            //     }
            // }
        } catch (error) {
            logger.error('Error updating state:', error)
        }
    })
    socket.on("state:get", () => getState(socket))
}

```

# api/src/ev3/config.ts

```ts
export const EV3_CONFIG = {
  bluetoothAddress: '00:16:53:80:5C:A5',
  port: 1234
}
```

# api/src/ev3/ev3Client.ts

```ts
import { createBluetooth } from 'node-ble';
import logger from '../config/logger';

class EV3Client {
    private bluetooth: any;
    private adapter: any;
    private device: any;
    private isConnected: boolean = false;
    private isSimulated: boolean = false;
    private readonly EV3_ADDRESS: string = '00:16:53:80:5C:A5';
    private readonly SERVICE_UUID = 'fff0';
    private readonly CHARACTERISTIC_UUID = 'fff1';
    private initializeRetries = 0;
    private maxInitializeRetries = 5;

    constructor() {
        this.initializeWithRetry();
    }

    private async initializeWithRetry() {
        try {
            // Wait for Bluetooth services to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            await this.initializeConnection();
        } catch (error) {
            logger.error('Failed to initialize Bluetooth:', error);
            
            if (this.initializeRetries < this.maxInitializeRetries) {
                this.initializeRetries++;
                logger.info(`Retrying initialization (attempt ${this.initializeRetries}/${this.maxInitializeRetries})...`);
                setTimeout(() => this.initializeWithRetry(), 5000);
            } else {
                logger.error('Max initialization retries reached, enabling simulation mode');
                this.enableSimulationMode();
            }
        }
    }

    private async initializeConnection() {
        try {
            logger.info('Initializing Bluetooth connection...');
            
            const { bluetooth, destroy } = createBluetooth();
            this.bluetooth = bluetooth;

            // Get Bluetooth adapter
            logger.info('Getting Bluetooth adapter...');
            this.adapter = await this.bluetooth.defaultAdapter();
            
            if (!this.adapter) {
                throw new Error('No Bluetooth adapter found');
            }

            logger.info('Bluetooth adapter found');

            // Power on the adapter if it's not already
            if (!await this.adapter.isPowered()) {
                logger.info('Powering on Bluetooth adapter...');
                await this.adapter.setPowered(true);
            }

            // Start discovery if not already scanning
            if (!await this.adapter.isDiscovering()) {
                logger.info('Starting device discovery...');
                await this.adapter.startDiscovery();
            }

            logger.info('Searching for EV3 device...');
            await this.findAndConnect();

        } catch (error) {
            logger.error('Error in Bluetooth initialization:', error);
            throw error;
        }
    }

    private enableSimulationMode() {
        logger.info('Enabling simulation mode due to Bluetooth initialization failure');
        this.isSimulated = true;
        this.isConnected = true;
    }

    private async findAndConnect() {
        try {
            // Wait for the EV3 device to be discovered
            const device = await this.adapter.waitDevice(this.EV3_ADDRESS);
            this.device = device;

            logger.info('EV3 device found, attempting to connect...');

            if (!await this.device.isPaired()) {
                await this.device.pair();
                logger.info('Device paired successfully');
            }

            await this.device.connect();
            this.isConnected = true;
            logger.info('Connected to EV3');

            // Get GATT service
            const gattServer = await this.device.gatt();
            const service = await gattServer.getPrimaryService(this.SERVICE_UUID);
            const characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);

            this.setupDisconnectHandler();

        } catch (error) {
            logger.error('Error connecting to device:', error);
            this.enableSimulationMode();
        }
    }

    private setupDisconnectHandler() {
        if (this.device) {
            this.device.on('disconnect', async () => {
                logger.info('Device disconnected');
                this.isConnected = false;
                await this.findAndConnect();
            });
        }
    }

    async sendCommand(command: Buffer) {
        if (this.isSimulated) {
            logger.info('Simulation mode - Command logged:', command);
            return;
        }

        if (!this.isConnected) {
            logger.error('Not connected to EV3');
            return;
        }

        try {
            const characteristic = await this.device.getCharacteristic(this.CHARACTERISTIC_UUID);
            await characteristic.writeValue(command);
            logger.info('Command sent successfully:', command);
        } catch (error) {
            logger.error('Error sending command:', error);
        }
    }

    async moveMainColumn(angle: number) {
        const command = Buffer.from([
            0x0C, 0x00, 
            0x00, 
            0x00, 
            0x80, 
            0x00, 
            0x00, 
            angle & 0xFF,
            (angle >> 8) & 0xFF
        ]);
        await this.sendCommand(command);
    }

    async moveUpperArm(angle: number) {
        const command = Buffer.from([
            0x0C, 0x00,
            0x00,
            0x00,
            0x80,
            0x01,
            0x00,
            angle & 0xFF,
            (angle >> 8) & 0xFF
        ]);
        await this.sendCommand(command);
    }

    async moveWrist(angle: number) {
        const command = Buffer.from([
            0x0C, 0x00,
            0x00,
            0x00,
            0x80,
            0x02,
            0x00,
            angle & 0xFF,
            (angle >> 8) & 0xFF
        ]);
        await this.sendCommand(command);
    }

    async moveGripper(distance: number) {
        const command = Buffer.from([
            0x0C, 0x00,
            0x00,
            0x00,
            0x80,
            0x03,
            0x00,
            distance & 0xFF,
            (distance >> 8) & 0xFF
        ]);
        await this.sendCommand(command);
    }

    async disconnect() {
        if (this.isConnected && !this.isSimulated && this.device) {
            try {
                await this.device.disconnect();
                this.isConnected = false;
                logger.info('Disconnected from EV3');
            } catch (error) {
                logger.error('Error disconnecting:', error);
            }
        }
    }
}

export default EV3Client;
```

# api/src/models/RobotState.ts

```ts
 
import mongoose from "mongoose"

enum NodeName {
    mainColumn = 'main_column',
    upperArm = 'upper_arm',
    wristExtension = 'wrist_extension',
    hand = 'hand',
    gripper = 'gripper'
}

export interface RobotNode {
    position: [number, number, number],
    scale: [number, number, number]
    rotation?: [number, number, number]
}

export type RobotStateDocument = mongoose.Document & {
    nodes: {
        [NodeName.mainColumn]: RobotNode
        [NodeName.upperArm]: RobotNode
        [NodeName.wristExtension]: RobotNode
        [NodeName.hand]: RobotNode
        [NodeName.gripper]: RobotNode
    }
}

const robotStateSchema = new mongoose.Schema<RobotStateDocument>(
    {
        nodes: {
            [NodeName.mainColumn]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.upperArm]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.wristExtension]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.hand]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.gripper]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            }
        }
    },
    {
        timestamps: true
    }
)

export const RobotState = mongoose.model<RobotStateDocument>("RobotState", robotStateSchema)

```

# api/src/seed.json

```json
[
  {
    "nodes": {
      "main_column": {
        "position": [
          0,
          1.462,
          0
        ],
        "scale": [
          1,
          1,
          1
        ]
      },
      "upper_arm": {
        "position": [
          2.335,
          0,
          0.094
        ],
        "scale": [
          0.684,
          1,
          1
        ]
      },
      "wrist_extension": {
        "position": [
          3.231,
          6.551,
          0.007
        ],
        "scale": [
          0.264,
          0.264,
          0.264
        ]
      },
      "hand": {
        "position": [
          3.368,
          5.728,
          -0.119
        ],
        "scale": [
          1,
          0.068,
          0.327
        ],
        "rotation": [0, 1.5708, 0]
      },
      "gripper": {
        "position": [
          3.33,
          5.545,
          0.006
        ],
        "scale": [
          -0.01,
          -0.132,
          -0.325
        ],
        "rotation": [0, 1.5708, 0]
      }
    }
  }
]
```

# api/src/server.ts

```ts
 
import 'dotenv/config'
import express from 'express'
import logger from './config/logger'
import {Server} from 'socket.io'
import mongoose from 'mongoose'
import stateController, {seed} from './controllers/state.controller'

const app = express()

// First ensure we get a mongo connection
mongoose.connect(process.env.MONGODB_URL, {}).then(() => {

    // seed if needed
    seed().then(() => {

        // Start Express server
        const server = app.listen(process.env.PORT, () => {
            logger.info(`App is running at http://localhost:${process.env.PORT}`)
        })

        // Setup websockets channel
        const io = new Server(server, {cors: {origin: '*'}})

        // 'Bind' the controllers on incoming socket connection
        io.on('connection', socket => {
            stateController(socket)
        })

    })

}).catch(err => {
    logger.error(`MongoDB connection error. Please make sure MongoDB is running. ${err}`)
    process.exit(1)
})

```

# api/tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "target": "es6",
    "noImplicitAny": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "*": [
        "node_modules/*",
        "src/types/*"
      ]
    }
  },
  "include": [
    "src/**/*"
  ]
}

```

# compose.yaml

```yaml
version: '3'
services:

  # The Robot hmi
  hmi:
    container_name: robot-hmi
    build:
      context: hmi
    ports:
      - 3000:3000
    stdin_open: true
    volumes:
      - ./hmi:/usr/src/hmi
      - /usr/src/hmi/node_modules
    restart: always
    networks:
      - hmi-network
    depends_on:
      - api

  # The Robot API
  api:
    container_name: robot-api
    restart: always
    build:
      context: api
    volumes:
      - ./api:/usr/src/api
      - /usr/src/api/node_modules
      - /var/run/dbus:/var/run/dbus
    depends_on:
      - storage
    privileged: true
    network_mode: host
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - NOBLE_MULTI_ROLE=1
      - NOBLE_REPORT_ALL_HCI_EVENTS=1
      - BLENO_HCI_DEVICE_ID=0
      - PYTHON=/usr/bin/python3
    devices:
      - "/dev/bus/usb:/dev/bus/usb"
      - "/dev/mem:/dev/mem"
    cap_add:
      - SYS_ADMIN
      - NET_ADMIN
      - NET_RAW

  # MongoDB Storage
  storage:
    container_name: robot-state
    restart: always
    image: mongo:4.2.0
    volumes:
      - ./data:/data/db
    networks:
      - storage-network
    expose:
      - 27017

networks:
  hmi-network:
  storage-network:
```

# data/_mdb_catalog.wt

This is a binary file of the type: Binary

# data/collection-0--188536456211366303.wt

This is a binary file of the type: Binary

# data/collection-0--1093803086368506637.wt

This is a binary file of the type: Binary

# data/collection-2--1093803086368506637.wt

This is a binary file of the type: Binary

# data/collection-4--1093803086368506637.wt

This is a binary file of the type: Binary

# data/collection-8--549222828002248186.wt

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-16T13-36-39Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-16T15-26-12Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-16T15-28-48Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-16T16-02-18Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T08-41-12Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T08-45-45Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T08-46-40Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T08-56-07Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T08-58-01Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T09-00-09Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T09-01-17Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T09-05-22Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T09-08-50Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T09-34-08Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T09-36-04Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T09-37-32Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T15-20-47Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T15-22-13Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T15-42-21Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T15-43-17Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-17T15-47-18Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-19T19-10-41Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T10-27-26Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T10-51-19Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T10-59-17Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T11-00-24Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T11-04-39Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T11-06-57Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T11-09-48Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-21T11-12-44Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-22T07-42-44Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-22-16Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-27-44Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-33-53Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-40-41Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-43-54Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-52-04Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-53-58Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-55-34Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T13-57-08Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T14-01-22Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T15-07-58Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T15-12-19Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T15-31-46Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T15-39-39Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T15-47-21Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-23T15-53-40Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-24T06-47-58Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-24T07-33-29Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.2024-10-24T07-53-03Z-00000

This is a binary file of the type: Binary

# data/diagnostic.data/metrics.interim

This is a binary file of the type: Binary

# data/index-1--188536456211366303.wt

This is a binary file of the type: Binary

# data/index-1--1093803086368506637.wt

This is a binary file of the type: Binary

# data/index-3--1093803086368506637.wt

This is a binary file of the type: Binary

# data/index-5--1093803086368506637.wt

This is a binary file of the type: Binary

# data/index-6--1093803086368506637.wt

This is a binary file of the type: Binary

# data/index-9--549222828002248186.wt

This is a binary file of the type: Binary

# data/journal/WiredTigerLog.0000000049

This is a binary file of the type: Binary

# data/journal/WiredTigerPreplog.0000000001

This is a binary file of the type: Binary

# data/journal/WiredTigerPreplog.0000000002

This is a binary file of the type: Binary

# data/mongod.lock

```lock
1

```

# data/sizeStorer.wt

This is a binary file of the type: Binary

# data/storage.bson

This is a binary file of the type: Binary

# data/WiredTiger

```
WiredTiger
WiredTiger 3.2.0: (May  9, 2019)

```

# data/WiredTiger.lock

```lock
WiredTiger lock file

```

# data/WiredTiger.turtle

```turtle
WiredTiger version string
WiredTiger 3.2.0: (May  9, 2019)
WiredTiger version
major=3,minor=2,patch=0
file:WiredTiger.wt
access_pattern_hint=none,allocation_size=4KB,app_metadata=,assert=(commit_timestamp=none,durable_timestamp=none,read_timestamp=none),block_allocation=best,block_compressor=,cache_resident=false,checkpoint=(WiredTigerCheckpoint.303=(addr="018081e44229f53e8181e45c13e2a18281e394adba808080e2efc0e22fc0",order=303,time=1729756382,size=24576,newest_durable_ts=0,oldest_start_ts=0,oldest_start_txn=0,newest_stop_ts=-1,newest_stop_txn=-11,write_gen=765)),checkpoint_lsn=(49,256),checksum=uncompressed,collator=,columns=,dictionary=0,encryption=(keyid=,name=),format=btree,huffman_key=,huffman_value=,id=0,ignore_in_memory_cache_size=false,internal_item_max=0,internal_key_max=0,internal_key_truncate=true,internal_page_max=4KB,key_format=S,key_gap=10,leaf_item_max=0,leaf_key_max=0,leaf_page_max=32KB,leaf_value_max=0,log=(enabled=true),memory_page_image_max=0,memory_page_max=5MB,os_cache_dirty_max=0,os_cache_max=0,prefix_compression=false,prefix_compression_min=4,split_deepen_min_child=0,split_deepen_per_child=0,split_pct=90,value_format=S,version=(major=1,minor=1)

```

# data/WiredTiger.wt

This is a binary file of the type: Binary

# data/WiredTigerLAS.wt

This is a binary file of the type: Binary

# docker-entrypoint.sh

```sh

```

# hmi/.dockerignore

```
node_modules

```

# hmi/config-overrides.js

```js
const { alias } = require('react-app-rewire-alias')

module.exports = function override (config) {
  alias({
    '@components': 'src/components',
    '@styles': 'src/styles',
    '@types': 'src/types',
    '@utils': 'src/utils'
  })(config)

  return config
}

```

# hmi/Dockerfile

```

FROM node:lts-buster

WORKDIR /usr/src/hmi

COPY package.json /usr/src/hmi
COPY yarn.lock /usr/src/hmi
RUN yarn install

COPY . /usr/src/hmi

EXPOSE 3000

CMD ["npm", "start"]

```

# hmi/package.json

```json
{
  "name": "hmi",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@react-three/drei": "^9.97.0",
    "@react-three/fiber": "^8.15.15",
    "leva": "^0.9.35",
    "lodash.clamp": "^4.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.7.4",
    "stats.js": "^0.17.0",
    "three": "^0.161.0"
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
    "@types/lodash.clamp": "^4.0.9",
    "@types/node": "^16.18.70",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/three": "^0.160.0",
    "react-app-rewire-alias": "^1.1.7",
    "react-app-rewired": "^2.2.1",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "GENERATE_SOURCEMAP=false react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-app-rewired eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:4000"
}

```

# hmi/public/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="#F84823"/>
    <meta name="description" content="Robotic Arm"/>
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json"/>
    <Style>
        html,
        body,
        #root {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            background: #303035;
        }
    </Style>
    <title>Robotic Arm</title>
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
</body>
</html>

```

# hmi/public/manifest.json

```json
{
  "short_name": "Robotic Arm",
  "name": "Robotic Arm Control Panel",
  "icons": [
    {
      "src": "favicon.png",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

```

# hmi/public/robot_v2.glb

This is a binary file of the type: Binary

# hmi/public/robot.glb

This is a binary file of the type: Binary

# hmi/public/robots.txt

```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```

# hmi/README.md

```md
# Hmi

### To do
- Persist matrix data
- Inverse Kinematics
- Material UI
- Redux Tookit
- 

```

# hmi/src/App.tsx

```tsx
import React, {useState, useEffect, useCallback} from 'react'
import {Canvas} from '@react-three/fiber'
import {GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera} from '@react-three/drei'
import {Shadows, Ground} from '@components/stage'
import socketIOClient from 'socket.io-client'
import {Robot} from '@types'
import {RobotArm} from "@components/model/RobotArm"

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>()
    const socket = socketIOClient('/')

    useEffect(() => {
        if (!robotData) socket.emit("state:get")

        socket.on("state", (data: Robot.RobotNodes) => {
            setRobotData(data)
        })

        return () => {
            socket.off("state")
        }
    }, [socket])

    const updateRobotData = useCallback((newData: Partial<Robot.RobotNodes>) => {
        setRobotData(prevData => {
            if (prevData) {
                const updatedData = {...prevData, ...newData}
                socket.emit("state:update", updatedData)
                return updatedData
            }
            return prevData
        })
    }, [socket])

    return (
        <>
            {robotData &&
                <Canvas>
                    <PerspectiveCamera makeDefault fov={40} position={[10, 8, 25]}/>
                    <RobotArm data={robotData} onUpdate={updateRobotData}/>
                    <Shadows/>
                    <Ground/>
                    <Environment preset="city"/>
                    <OrbitControls makeDefault/>
                    <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
                        <GizmoViewport labelColor="white" axisHeadScale={1}/>
                    </GizmoHelper>
                    <Stats/>
                </Canvas>
            }
        </>
    )
}
```

# hmi/src/components/gizmo/context.ts

```ts
 
import {createContext} from 'react'
import {Robot} from '@types'

export const context = createContext<Robot.GizmoState>(null!)

```

# hmi/src/components/gizmo/index.tsx

```tsx
 
import React, {useEffect, useRef} from 'react'
import {useThree} from '@react-three/fiber'
import {Translate} from './Translate'
import {Rotate} from './Rotate'
import {context} from './context'
import {Vector3, Matrix4, Box3, Group} from 'three'
import {Robot} from '@types'

// local matrices
const localMatrix0 = new Matrix4()
const localMatrix = new Matrix4()
const localMatrix0Inv = new Matrix4()
const localDeltaMatrix = new Matrix4()

// world matrices
const worldMatrix0 = new Matrix4()
const worldMatrix = new Matrix4()

// parent matrices
const parentMatrix = new Matrix4()
const parentMatrixInv = new Matrix4()

/**
 * The Gizmo component accepts a configuration and the children (meshes) to control.
 *
 * Both Translate as Rotate is handled. The type of operation is depending on the
 * configuration of activeAxis, disableTranslation and disableRotation. Mixing operations
 * is supported. e.g. a gizmo to rotate and translate with.
 */
export const Gizmo = ((
        {
            scale = 1,
            matrix,
            anchor,
            activeAxes = [true, true, true],
            disableTranslation = false,
            disableRotation = false,
            translationLimits,
            rotationLimits,
            userData,
            onUpdate,
            children,
        }: Robot.GizmoProperties) => {

        // A handle to the underlying canvas invalidation method.
        // [useThree] Accesses R3F's internal state (WebGL), containing renderer, canvas, scene, etc.
        // [state.invalidate] flags the canvas for render, but doesn't render in itself
        const invalidate = useThree((state) => state.invalidate)

        // grouping the gizmo and objects
        const parentGroup = useRef<Group>(null!)
        const matrixGroup = useRef<Group>(null!)
        const gizmoGroup = useRef<Group>(null!)
        const childrenGroup = useRef<Group>(null!)

        useEffect(() => {

            // if an anchor is given we adjust the gizmo position
            if (anchor) {

                // the group under control of this gizmo
                const targetGroup = childrenGroup.current

                // calculate a bounding box to determine gizmo location
                const boundingBox = new Box3()

                if (targetGroup) {

                    // Update the global transform of the object group
                    targetGroup.updateWorldMatrix(true, true)

                    // Invert the matrix
                    parentMatrixInv.copy(targetGroup.matrixWorld).invert()

                    // Clear the bounding box for the new calculation
                    boundingBox.makeEmpty()

                    // traverse over the objects in the targetGroup
                    targetGroup.traverse((object: any) => {

                        // calculate the bounding box for objects with geometry
                        if (!object.geometry) return
                        if (!object.geometry.boundingBox) object.geometry.computeBoundingBox()

                        localMatrix.copy(object.matrixWorld).premultiply(parentMatrixInv)

                        // get the bounding box of this object
                        const objectBoundingBox = new Box3()
                        objectBoundingBox.copy(object.geometry.boundingBox)
                        objectBoundingBox.applyMatrix4(localMatrix)

                        // Computes the union of this boundingBox and objectBoundingBox, setting the upper bound of
                        // boundingBox to the greater of the two boxes' upper bounds and the lower bound of boundingBox
                        // to the lesser of the two boxes' lower bounds.
                        boundingBox.union(objectBoundingBox)
                    })

                    // calculate vectors
                    const vectorCenter = new Vector3()
                    const vectorSize = new Vector3()

                    vectorCenter.copy(boundingBox.max).add(boundingBox.min).multiplyScalar(0.5)
                    vectorSize.copy(boundingBox.max).sub(boundingBox.min).multiplyScalar(0.5)

                    const anchorOffsetVector = new Vector3()
                    const positionVector = new Vector3()

                    anchorOffsetVector
                        .copy(vectorSize)
                        .multiply(new Vector3(...anchor)) // given anchor
                        .add(vectorCenter)

                    positionVector.set(0, 0, 0).add(anchorOffsetVector)

                    // copy the position to the gizmo group to apply gizmo anchor
                    gizmoGroup.current.position.copy(positionVector)

                    invalidate()
                }
            }

        }, [anchor, invalidate])

        /**
         * The Gizmo configuration contains scale, limits and userdata for the gizmo
         * and holds the implementation for both Translate and Rotate matrix updates
         * based on the gizmo mouse pointer events.
         *
         * This configuration is stored in Context, see the context.Provider below
         *
         * With useMemo we only recalculate when the dependencies have changed since the last render, more specific in
         * this case when any of the onDragStart, onDrag, onDragEnd dependencies change
         */
        const configuration = {

            /**
             * onDragStart is invoked by the group onPointerDown with the information on
             * what operation (Translate/Rotate) which axis, origin and direction array
             */
            onDragStart: () => {

                // @todo learn about matrix operations
                localMatrix0.copy(matrixGroup.current.matrix)
                worldMatrix0.copy(matrixGroup.current.matrixWorld)
                invalidate()
            },

            /**
             * onDrag is invoked by the group onPointerMove method
             * which calculated the delta matrix
             */
            onDrag: (worldDeltaMatrix: Matrix4) => {

                // @todo learn about matrix operations
                parentMatrix.copy(parentGroup.current.matrixWorld)
                parentMatrixInv.copy(parentMatrix).invert()

                // After applying the delta
                worldMatrix.copy(worldMatrix0).premultiply(worldDeltaMatrix)
                localMatrix.copy(worldMatrix).premultiply(parentMatrixInv)
                localMatrix0Inv.copy(localMatrix0).invert()
                localDeltaMatrix.copy(localMatrix).multiply(localMatrix0Inv)

                // @todo point of interest, the update of matrix group with change
                matrixGroup.current.matrix.copy(localMatrix)

                console.log(1, 'matrixGroup:', matrixGroup)

                // Extract the new position from the matrix
                const position = new Vector3().setFromMatrixPosition(matrixGroup.current.matrix)
                
                // Call onUpdate with the new position
                // if (onUpdate) {
                //     onUpdate(position.toArray() as [number, number, number])
                // }

                invalidate()
            },

            /**
             * Mouse/pointer up
             */
            onDragEnd: () => {
                invalidate()
            },

            translationLimits,
            rotationLimits,
            scale,
            userData
        }

        return (
            <context.Provider value={configuration}>

                <group ref={parentGroup}>

                    <group ref={matrixGroup} matrix={matrix} matrixAutoUpdate={false}>

                        <group ref={gizmoGroup}>

                            {
                                !disableTranslation &&
                              <>
                                  {activeAxes[0] && <Translate axis={0}/>}
                                  {activeAxes[1] && <Translate axis={1}/>}
                                  {activeAxes[2] && <Translate axis={2}/>}
                              </>
                            }

                            {
                                !disableRotation &&
                              <>
                                  {activeAxes[0] && activeAxes[1] && <Rotate axis={2}/>}
                                  {activeAxes[0] && activeAxes[2] && <Rotate axis={1}/>}
                                  {activeAxes[2] && activeAxes[1] && <Rotate axis={0}/>}
                              </>
                            }

                        </group>

                        <group ref={childrenGroup}>{children}</group>

                    </group>

                </group>
            </context.Provider>
        )
    }
)

```

# hmi/src/components/gizmo/Rotate.tsx

```tsx
 
import React, {useContext, useRef, useState, useCallback, useMemo, FC} from 'react'
import {ThreeEvent, useThree} from '@react-three/fiber'
import {Line, Html} from '@react-three/drei'
import clamp from 'lodash.clamp'
import {context} from './context'
import {Vector3, Matrix4, Ray, Group, Plane} from 'three'
import {calculateAngle, toDegrees, toRadians, minimizeAngle} from '@utils'

/**
 * Rotate lets the user drag the gizmo and, with it, the child objects over the configured rotation axis/axes
 */
export const Rotate: FC<{ axis: 0 | 1 | 2 }> = ({axis}) => {

    // get the gizmo config & event implementations from context
    const {
        rotationLimits,
        scale,
        onDragStart,
        onDrag,
        onDragEnd,
        userData
    } = useContext(context)

    // determine directions
    const direction1 =
        axis === 2 ? new Vector3(1, 0, 0) :
            axis === 1 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0)
    const direction2 =
        axis === 2 ? new Vector3(0, 1, 0) :
            axis === 1 ? new Vector3(1, 0, 0) : new Vector3(0, 0, 1)

    // get a handle on the cam controls to enable/disable while operating the gizmo
    const camControls = useThree((state) => state.controls) as unknown as { enabled: boolean }

    // the label showing the rotated value
    const rotationLabel = useRef<HTMLDivElement>(null!)

    // Object3D group for this Gizmo
    const gizmoGroup = useRef<Group>(null!)

    // ref to keep info where the mouse/pointer click occurred
    const clickInfo = useRef<{
        clickPoint: Vector3
        origin: Vector3
        e1: Vector3
        e2: Vector3
        normal: Vector3
        plane: Plane
    } | null>(null)

    // is the mouse hovering over the gizmo. we change the color when hovering over
    const [isHovered, setIsHovered] = useState(false)

    // the angle calculated on start and used while moving
    const angle0 = useRef<number>(0)
    const angle = useRef<number>(0)

    /**
     * On pointer down (click) we prepare to start dragging
     */
    const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {

        // update label with rotation value
        rotationLabel.current.innerText = `${toDegrees(angle.current).toFixed(0)}°`
        rotationLabel.current.style.display = 'block'

        // avoid handlers firing
        event.stopPropagation()

        // get the xyz vector for the mouse click
        const clickPoint = event.point.clone()

        // @todo learn what is going on here
        const origin = new Vector3().setFromMatrixPosition(gizmoGroup.current.matrixWorld)
        const e1 = new Vector3().setFromMatrixColumn(gizmoGroup.current.matrixWorld, 0).normalize()
        const e2 = new Vector3().setFromMatrixColumn(gizmoGroup.current.matrixWorld, 1).normalize()
        const normal = new Vector3().setFromMatrixColumn(gizmoGroup.current.matrixWorld, 2).normalize()
        const plane = new Plane().setFromNormalAndCoplanarPoint(normal, origin)

        // set the click info
        clickInfo.current = {clickPoint, origin, e1, e2, normal, plane}

        // invoke drag start for rotation operation
        onDragStart({action: 'Rotate', axis, origin, directions: [e1, e2, normal]})

        // disable the cam controls to avoid it fighting with the gizmo movements
        camControls && (camControls.enabled = false)

        // @ts-ignore - setPointerCapture is not in the type definition
        event.target.setPointerCapture(event.pointerId)

    }, [camControls, onDragStart, axis])

    /**
     * Mouse/pointer moving
     */
    const onPointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {

        // avoid handlers firing
        event.stopPropagation()

        if (!isHovered) setIsHovered(true)

        if (clickInfo.current) {

            const {clickPoint, origin, e1, e2, normal, plane} = clickInfo.current

            /**
             * Check if we are still within translation limits
             */
            const [min, max] = rotationLimits?.[axis] || [undefined, undefined]
            const ray = new Ray()
            const intersection = new Vector3()

            ray.copy(event.ray)
            ray.intersectPlane(plane, intersection)
            ray.direction.negate()
            ray.intersectPlane(plane, intersection)

            let deltaAngle = calculateAngle(clickPoint, intersection, origin, e1, e2)
            let degrees = toDegrees(deltaAngle)

            if (event.shiftKey) {
                degrees = Math.round(degrees / 10) * 10
                deltaAngle = toRadians(degrees)
            }

            if (min !== undefined && max !== undefined && max - min < 2 * Math.PI) {
                deltaAngle = minimizeAngle(deltaAngle)
                deltaAngle = deltaAngle > Math.PI ? deltaAngle - 2 * Math.PI : deltaAngle
                deltaAngle = clamp(deltaAngle, min - angle0.current, max - angle0.current)
                angle.current = angle0.current + deltaAngle
            } else {
                angle.current = minimizeAngle(angle0.current + deltaAngle)
                angle.current = angle.current > Math.PI ? angle.current - 2 * Math.PI : angle.current
            }

            // update label values
            degrees = toDegrees(angle.current)
            rotationLabel.current.innerText = `${degrees.toFixed(0)}°`

            const rotationMatrix = new Matrix4()
            const posNew = new Vector3()

            rotationMatrix.makeRotationAxis(normal, deltaAngle)
            posNew.copy(origin).applyMatrix4(rotationMatrix).sub(origin).negate()
            rotationMatrix.setPosition(posNew)

            // invoke the onDrag method with the calculated rotation matrix
            onDrag(rotationMatrix)
        }

    }, [onDrag, isHovered, rotationLimits, axis])

    /**
     * Pointer up ends the gizmo interaction
     */
    const onPointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {

        // hide label
        rotationLabel.current.style.display = 'none'

        // avoid handlers firing
        event.stopPropagation()

        angle0.current = angle.current

        // reset click info
        clickInfo.current = null

        // call the onDragEnd
        onDragEnd()

        // give cam controls back
        camControls && (camControls.enabled = true)

        // @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
        event.target.releasePointerCapture(event.pointerId)

    }, [camControls, onDragEnd])

    /**
     * In the pointer out we mark hovered as false
     */
    const onPointerOut = useCallback((event: ThreeEvent<PointerEvent>) => {
        // avoid handlers firing
        event.stopPropagation()
        setIsHovered(false)
    }, [])


    /**
     * Gizmo group matrix
     */
    const matrix = useMemo(() => {
        const dir1N = direction1.clone().normalize()
        const dir2N = direction2.clone().normalize()
        return new Matrix4().makeBasis(dir1N, dir2N, dir1N.clone().cross(dir2N))
    }, [direction1, direction2])

    const r = scale * 0.65

    /**
     * Calculate gizmo arc shape
     */
    const arc = useMemo(() => {
        const segments = 32
        const points: Vector3[] = []
        for (let j = 0; j <= segments; j++) {
            const angle = (j * (Math.PI / 2)) / segments
            points.push(new Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0))
        }
        return points
    }, [r])

    // colors of the axes and a hover color
    const axisColors = ['#ff2060', '#20df80', '#2080ff']
    const color = isHovered ? '#ffff40' : axisColors[axis]

    return (
        <group ref={gizmoGroup}
               onPointerDown={onPointerDown}
               onPointerMove={onPointerMove}
               onPointerUp={onPointerUp}
               onPointerOut={onPointerOut}
               matrix={matrix}
               matrixAutoUpdate={false}>

            {/** the label showing the rotation value */}
            <Html position={[r, r, 0]}>
                <div
                    style={{
                        display: 'none',
                        fontFamily: 'monospace',
                        background: '#F84823',
                        color: 'white',
                        padding: '6px 8px',
                        borderRadius: 7,
                        whiteSpace: 'nowrap'
                    }}
                    ref={rotationLabel}
                />
            </Html>

            {/* The invisible mesh being raycast */}
            <Line points={arc} lineWidth={8} visible={false} userData={userData}/>

            {/* The visible mesh */}
            <Line
                transparent
                raycast={() => null}
                points={arc}
                lineWidth={2}
                color={color}
                polygonOffset
                polygonOffsetFactor={-10}
            />

        </group>
    )
}

```

# hmi/src/components/gizmo/Translate.tsx

```tsx
 
import React, {useContext, useCallback, useMemo, useRef, useState, FC} from 'react'
import {ThreeEvent, useThree} from '@react-three/fiber'
import {Line, Html} from '@react-three/drei'
import {context} from './context'
import {Vector3, Matrix4, Group, Quaternion} from 'three'
import {calculateOffset} from '@utils'

/**
 * Translate lets the user drag the gizmo and, with it, the child objects over the configured translation axis/axes
 */
export const Translate: FC<{ axis: 0 | 1 | 2 }> = ({axis}) => {

    // get the gizmo config & event implementations from context
    const {
        translationLimits,
        scale,
        onDragStart,
        onDrag,
        onDragEnd,
        userData
    } = useContext(context)

    // determine direction.
    const direction =
        axis === 0 ? new Vector3(1, 0, 0) :
            axis === 1 ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1)

    // get a handle on the cam controls to enable/disable while operating the gizmo
    const camControls = useThree((state) => state.controls) as unknown as { enabled: boolean }

    // the label showing the translated value
    const translationLabel = useRef<HTMLDivElement>(null!)

    // Object3D group for this Gizmo
    const gizmoGroup = useRef<Group>(null!)

    // ref to keep info where the mouse/pointer click occurred
    const clickInfo = useRef<{ clickPoint: Vector3; dir: Vector3 } | null>(null)

    // the offset calculated on start and used while moving
    const offset0 = useRef<number>(0)

    // is the mouse hovering over the gizmo. we change the color when hovering over
    const [isHovered, setIsHovered] = useState(false)

    const translation = useRef<[number, number, number]>([0, 0, 0])

    /**
     * On pointer down (click) we prepare to start dragging
     */
    const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {

            // update label with current translation value for this axis and show it
            translationLabel.current.innerText = `${translation.current[axis].toFixed(2)}`
            translationLabel.current.style.display = 'block'

            // stopPropagation will stop underlying handlers from firing
            event.stopPropagation()

            // get the xyz vector for the mouse click
            const clickPoint = event.point.clone()

            // @todo learn what is going on here
            const rotation = new Matrix4().extractRotation(gizmoGroup.current.matrixWorld)
            const origin = new Vector3().setFromMatrixPosition(gizmoGroup.current.matrixWorld)
            const dir = direction.clone().applyMatrix4(rotation).normalize()

            // set the click info
            clickInfo.current = {clickPoint, dir}
            offset0.current = translation.current[axis]

            // invoke drag start for translation operation
            onDragStart({action: 'Translate', axis, origin, directions: [dir]})

            // disable the cam controls to avoid it fighting with the gizmo movements
            camControls && (camControls.enabled = false)

            // @ts-ignore - setPointerCapture is not in the type definition
            event.target.setPointerCapture(event.pointerId)

        }, [direction, camControls, onDragStart, translation, axis]
    )

    /**
     * Mouse/pointer moving
     */
    const onPointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {

            // stopPropagation will stop underlying handlers from firing
            event.stopPropagation()

            if (!isHovered) setIsHovered(true)

            if (clickInfo.current) {

                const {clickPoint, dir} = clickInfo.current

                /**
                 * Check if we are still within translation limits
                 */
                const [min, max] = translationLimits?.[axis] || [undefined, undefined]
                let offset = calculateOffset(clickPoint, dir, event.ray.origin, event.ray.direction)
                if (min !== undefined) offset = Math.max(offset, min - offset0.current)
                if (max !== undefined) offset = Math.min(offset, max - offset0.current)

                // set the current translation
                translation.current[axis] = offset0.current + offset

                // update label with translation value
                translationLabel.current.innerText = `${translation.current[axis].toFixed(2)}`

                // create and calculate the offset matrix for the on drag method
                const offsetMatrix = new Matrix4().makeTranslation(dir.x * offset, dir.y * offset, dir.z * offset)

                // invoke the onDrag method with the calculated offset matrix
                onDrag(offsetMatrix)
            }

        }, [onDrag, isHovered, translation, translationLimits, axis]
    )

    /**
     * Pointer up ends the gizmo interaction
     */
    const onPointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {

            // hide label
            translationLabel.current.style.display = 'none'

            // avoid handlers firing
            event.stopPropagation()

            // reset click info
            clickInfo.current = null

            // call the onDragEnd
            onDragEnd()

            // give cam controls back
            camControls && (camControls.enabled = true)

            // @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
            event.target.releasePointerCapture(event.pointerId)

        }, [camControls, onDragEnd]
    )

    /**
     * In the pointer out we mark hovered as false
     */
    const onPointerOut = useCallback((event: ThreeEvent<PointerEvent>) => {
        // avoid handlers firing
        event.stopPropagation()
        setIsHovered(false)
    }, [])

    // calculate properties for the translation arrow meshes
    const {cylinderLength, coneWidth, coneLength, matrix} = useMemo(() => {
        const coneWidth = scale / 20
        const coneLength = scale / 5
        const cylinderLength = scale - coneLength
        const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize())
        const matrixL = new Matrix4().makeRotationFromQuaternion(quaternion)
        return {cylinderLength, coneWidth, coneLength, matrix: matrixL}
    }, [direction, scale])

    // colors of the axes and a hover color
    const axisColors = ['#ff2060', '#20df80', '#2080ff']
    const color = isHovered ? '#ffff40' : axisColors[axis]

    return (
        <group ref={gizmoGroup}>

            {/** group on which we set the gizmo event implementations */}
            <group
                matrix={matrix}
                matrixAutoUpdate={false}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerOut={onPointerOut}>

                {/** the label showing the translation value */}
                <Html position={[0, -coneLength, 0]}>
                    <div
                        style={{
                            display: 'none',
                            fontFamily: 'monospace',
                            background: '#F84823',
                            color: 'white',
                            padding: '6px 8px',
                            borderRadius: 7,
                            whiteSpace: 'nowrap'
                        }}
                        ref={translationLabel}
                    />
                </Html>

                {/* The invisible mesh being raycast
                    @todo learn how this works
                 */}
                <mesh visible={false} position={[0, (cylinderLength + coneLength) / 2.0, 0]} userData={userData}>
                    <cylinderGeometry args={[coneWidth * 1.4, coneWidth * 1.4, cylinderLength + coneLength, 8, 1]}/>
                </mesh>

                {/* The visible mesh */}
                <Line transparent
                      raycast={() => null}
                      points={[0, 0, 0, 0, cylinderLength, 0]}
                      lineWidth={2}
                      color={color}
                      polygonOffset
                      renderOrder={1}
                      polygonOffsetFactor={-10}/>
                <mesh raycast={() => null} position={[0, cylinderLength + coneLength / 2.0, 0]} renderOrder={500}>
                    <coneGeometry args={[coneWidth, coneLength, 24, 1]}/>
                    <meshBasicMaterial transparent={true} color={color}/>
                </mesh>

            </group>
        </group>
    )
}

```

# hmi/src/components/mesh/Mesh.tsx

```tsx
 
import React from 'react'
import {Robot} from '@types'
import { Euler } from 'three'

/**
 * Defines a Mesh with material and location
 *
 * @param node The GLTF Mesh
 * @param data The node 3d data
 */


const Mesh = ({node, data}: Robot.MeshProperties) => {
    //   @ts-ignore
    const rotation = data.rotation.length > 0 ? new Euler().fromArray(data.rotation) : new Euler(0, 0, 0)

    return (
        <mesh geometry={node.geometry}
              material={node.material}
              position={data.position}
              rotation={rotation}
              scale={data.scale}
        />
    )
}

export default Mesh

```

# hmi/src/components/model/index.ts

```ts
 

/**
 * The model folder contains the models we want to render.
 * Model is created in Blender, exported to glb and converted to tsx.
 *
 * Using a Barrel for clean import
 */
export {RobotArm} from './RobotArm'

```

# hmi/src/components/model/RobotArm.tsx

```tsx
import React from 'react'
import {Gizmo} from '@components/gizmo'
import {useGLTF} from '@react-three/drei'
import {Robot} from '@types'
import Mesh from "@components/mesh/Mesh"

interface RobotProps {
    data: Robot.RobotNodes
    onUpdate: (newData: Partial<Robot.RobotNodes>) => void
}

export const RobotArm = ({data, onUpdate}: RobotProps) => {
    const {nodes} = useGLTF('/robot.glb') as unknown as Robot.DreiGLTF
    const node = Robot.NodeName

    const handleGizmoUpdate = (nodeName: Robot.NodeName, newPosition: [number, number, number]) => {
        onUpdate({
            nodes: {
                ...data.nodes,
                [nodeName]: {
                    ...data.nodes[nodeName],
                    position: newPosition
                }
            }
        })
    }

    return (
        <group>
            <Gizmo scale={5}
                   disableTranslation
                   activeAxes={[true, false, true]}
                   userData={[node.mainColumn]}
                   onUpdate={(newPosition) => handleGizmoUpdate(node.mainColumn, newPosition)}>
                <Mesh node={nodes[node.mainColumn]} data={data.nodes[node.mainColumn]}/>

                <Gizmo activeAxes={[false, true, false]}
                       translationLimits={[undefined, [-1, .8], undefined]}
                       disableRotation
                       anchor={[-0.8, 1.5, 0]}
                       scale={1}
                       userData={[node.upperArm]}
                       onUpdate={(newPosition) => handleGizmoUpdate(node.upperArm, newPosition)}>
                    <Mesh node={nodes[node.upperArm]} data={data.nodes[node.upperArm]}/>

                    <Mesh node={nodes[node.wristExtension]} data={data.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={data.nodes[node.hand]}/>

                    <Gizmo activeAxes={[false, false, true]}
                           translationLimits={[undefined, undefined, [0, 0.4]]}
                           anchor={[2, 0, 2]}
                           scale={0.75}
                           userData={[node.gripper]}
                           onUpdate={(newPosition) => handleGizmoUpdate(node.gripper, newPosition)}>
                        <Mesh node={nodes[node.gripper]} data={data.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    )
}

useGLTF.preload('/robot.glb')
```

# hmi/src/components/stage/Ground.tsx

```tsx
 
import React from 'react'
import {Grid} from '@react-three/drei'

/**
 * A drei Grid providing a plane for the model to be presented on
 *
 * @todo move properties to user/app configuration
 */
export const Ground = () => {

    return <Grid position={[0, -0.01, 0]}
                 args={[10.5, 10.5]}
                 cellSize={0.5}
                 cellThickness={0.5}
                 cellColor={'#6f6f6f'}
                 sectionSize={3}
                 sectionThickness={1}
                 sectionColor={'#9d4b4b'}
                 fadeDistance={30}
                 fadeStrength={1}
                 followCamera={false}
                 infiniteGrid={true}/>
}

```

# hmi/src/components/stage/index.ts

```ts
 

/**
 * The stage folder contains the 'stage' Components,
 * visual elements that define the environment our models
 * appear in such as Lights, floors, shadows, ambient lights
 *
 * Using a Barrel for clean import
 */
export {Shadows} from './Shadows'
export {Ground} from './Ground'

```

# hmi/src/components/stage/Shadows.tsx

```tsx
 
import React, {memo} from 'react'
import {AccumulativeShadows, RandomizedLight} from '@react-three/drei'

/**
 * Providing natural looking shadow/light
 */
export const Shadows = memo(() => (
    <AccumulativeShadows temporal frames={100} color="#9d4b4b" colorBlend={0.5} alphaTest={0.9} scale={20}>
        <RandomizedLight amount={8} radius={4} position={[5, 5, -10]}/>
    </AccumulativeShadows>
))

```

# hmi/src/index.tsx

```tsx
 
import React from 'react'
import App from './App'
import ReactDOM from 'react-dom/client'

// Render the App on the root div
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)

root.render(<App/>)

```

# hmi/src/types/index.ts

```ts
 
import {ReactNode} from 'react'
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Vector3, Mesh, MeshStandardMaterial, Matrix4} from 'three'

/**
 * Types for the project
 */
export namespace Robot {

    /**
     * The Node names we expect on a Robot
     */
    export enum NodeName {
        mainColumn = 'main_column',
        upperArm = 'upper_arm',
        wristExtension = 'wrist_extension',
        hand = 'hand',
        gripper = 'gripper'
    }

    /**
     * Nodes expected in robot data
     */
    export interface RobotNodes {
        nodes: {
            [NodeName.mainColumn]: RobotNode,
            [NodeName.upperArm]: RobotNode,
            [NodeName.wristExtension]: RobotNode,
            [NodeName.hand]: RobotNode,
            [NodeName.gripper]: RobotNode
        }
    }

    /**
     * Robot Node data
     */
    export interface RobotNode {
        position: Vector3,
        scale: Vector3
        rotation?: Vector3
    }

    /**
     * Since useGLTF does not supply the nodes and materials types we define them ourselves.
     * Seems like missing typing in drei.
     */
    export type DreiGLTF = GLTF & {
        nodes: Record<string, Mesh>
        materials: Record<string, MeshStandardMaterial>
    }

    /**
     * With mesh and robot data we construct each Robot node
     */
    export type MeshProperties = {
        node: Mesh
        data: RobotNode
    }

    /**
     * Properties we receive for a Robot Gizmo
     */
    export type GizmoProperties = {

        // gizmo scale
        scale?: number

        // start matrix
        matrix?: Matrix4

        // gizmo anchor
        anchor?: [number, number, number]

        // axis to operate on
        activeAxes?: [boolean, boolean, boolean]

        // switch off all rotation or translation
        disableTranslation?: boolean
        disableRotation?: boolean

        // translation limits array: x:[start,end] y[start,end] z[start,end]
        translationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]

        // rotation limits array: x:[start,end] y[start,end] z[start,end]
        rotationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]

        // custom data
        userData?: { [key: string]: any }
        
        children?: ReactNode

        onUpdate: (matrix: [number, number, number]) => void

    }

    /**
     * The state we hold for a Gizmo
     */
    export type GizmoState = {
        onDragStart: (props: GizmoStart) => void
        onDrag: (local: Matrix4) => void
        onDragEnd: () => void
        translationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
        rotationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
        scale: number
        userData?: { [key: string]: any }
    }

    /**
     * The start event when Gizmo is invoked
     */
    export type GizmoStart = {
        action: 'Translate' | 'Rotate'
        axis: 0 | 1 | 2
        origin: Vector3
        directions: Vector3[]
    }
}

```

# hmi/src/utils/index.ts

```ts
 
import {Vector3} from "three";

/**
 * Calculate degrees from radians
 * @param radians
 */
const toDegrees = (radians: number) => (radians * 180) / Math.PI

/**
 * Calculate radians from degrees
 * @param degrees
 */
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/**
 *
 * @param clickPoint
 * @param intersectionPoint
 * @param origin
 * @param e1
 * @param e2
 */
const calculateAngle = (clickPoint: Vector3, intersectionPoint: Vector3, origin: Vector3, e1: Vector3, e2: Vector3) => {

    const clickDir = new Vector3()
    const intersectionDir = new Vector3()

    clickDir.copy(clickPoint).sub(origin)
    intersectionDir.copy(intersectionPoint).sub(origin)

    const dote1e1 = e1.dot(e1)
    const dote2e2 = e2.dot(e2)
    const uClick = clickDir.dot(e1) / dote1e1
    const vClick = clickDir.dot(e2) / dote2e2
    const uIntersection = intersectionDir.dot(e1) / dote1e1
    const vIntersection = intersectionDir.dot(e2) / dote2e2
    const angleClick = Math.atan2(vClick, uClick)
    const angleIntersection = Math.atan2(vIntersection, uIntersection)

    return angleIntersection - angleClick
}

/**
 *
 * @param num
 * @param denom
 */
const fmod = (num: number, denom: number) => {

    let k = Math.floor(num / denom)
    k = k < 0 ? k + 1 : k

    return num - k * denom
}

/**
 *
 * @param angle
 */
const minimizeAngle = (angle: number) => {

    let result = fmod(angle, 2 * Math.PI)

    if (Math.abs(result) < 1e-6) {
        return 0.0
    }

    if (result < 0.0) {
        result += 2 * Math.PI
    }

    return result
}

/**
 * Helper method to calculate the offset when determining
 * if we are still within translation limits
 * @todo move to utils
 */
const calculateOffset = (clickPoint: Vector3, normal: Vector3, rayStart: Vector3, rayDir: Vector3) => {

    const vec1 = new Vector3()
    const vec2 = new Vector3()
    const e1 = normal.dot(normal)
    const e2 = normal.dot(clickPoint) - normal.dot(rayStart)
    const e3 = normal.dot(rayDir)

    if (e3 === 0) return -e2 / e1

    vec1.copy(rayDir).multiplyScalar(e1 / e3).sub(normal)
    vec2.copy(rayDir).multiplyScalar(e2 / e3).add(rayStart).sub(clickPoint)

    return -vec1.dot(vec2) / vec1.dot(vec1)
}

export {
    toDegrees,
    toRadians,
    calculateAngle,
    fmod,
    minimizeAngle,
    calculateOffset
}

```

# hmi/tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": [
        "src/components/*"
      ],
      "@styles": [
        "src/styles"
      ],
      "@types": [
        "src/types"
      ],
      "@utils": [
        "src/utils"
      ]
    },
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}

```

# model/crane copy.blend

This is a binary file of the type: Binary

# model/crane_lego.blend

This is a binary file of the type: Binary

# model/crane.blend

This is a binary file of the type: Binary

# model/crane.blend1

This is a binary file of the type: Binary

# model/crane.glb

This is a binary file of the type: Binary

# model/Crane.jsx

```jsx
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./hmi/public/robot_v2.glb 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/robot_v2.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.main_column.geometry} material={nodes.main_column.material} position={[0, 1.462, 0]} />
      <mesh geometry={nodes.upper_arm.geometry} material={nodes.upper_arm.material} position={[2.335, 0, 0.094]} scale={[0.684, 1, 1]} />
      <mesh geometry={nodes.wrist_extension.geometry} material={nodes.wrist_extension.material} position={[3.241, 6.541, 0.007]} scale={0.264} />
      <mesh geometry={nodes.hand.geometry} material={nodes.hand.material} position={[3.318, 5.71, -0.101]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.068, 0.327]} />
      <mesh geometry={nodes.gripper.geometry} material={nodes.gripper.material} position={[3.275, 5.505, 0.286]} rotation={[Math.PI, -Math.PI / 2, 0]} scale={[-0.01, -0.132, -0.325]} />
    </group>
  )
}

useGLTF.preload('/robot_v2.glb')

```

# model/README.md

```md
# Model

## Process

### Create Model in Blender

When modeling, mind the origins of the meshes.

- Create 1 mesh for those elements that need a gizmo for translating / rotating
- 

of what you want to : move object when replacing origin, only scale and move in edit mode to preserve origin and prevent needing scaling data

### Export to glb/glTF

Blender has an option to export your mesh to glb/glTF

### Convert to JSX

Use [GLB to JSX Converter](https://github.com/pmndrs/gltfjsx) to convert the glb/glTF file from blender 
to a ready to use jsx file.

\`\`\`shell
  npx gltfjsx Model.glb
\`\`\`

```

# model/robot_v2.glb

This is a binary file of the type: Binary

# README.md

```md
# Robotic Arm

## Intro

* api - A NodeJS project using MongoDB and Websocket connectivity for robot data
* model - The Mesh of the arm modelled in Blender
* hmi - A React Application using React Three Fiber and the API over Websockets for the telemetry data.

## Running the project

* Make sure Docker is installed running: [https://www.docker.com/get-started/](https://www.docker.com/get-started/)
* Clone the repo and run docker

\`\`\`shell
git clone https://github.com/appeltje-c/robot-arm
cd robot-arm
docker compose up -d
\`\`\`

When the project is running, you can open [http://localhost:3000](http://localhost:3000)

To stop the containers

\`\`\`shell
docker compose down
\`\`\`

## What's in the box

There are three main projects

[Hmi](hmi/README.md) : The React App

[API](./api/README.md) : The API

[Model](./model/README.md) : The Arm Model


```

# Robot_v2.jsx

```jsx
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./hmi/public/robot_v2.glb 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/robot_v2.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.main_column.geometry} material={nodes.main_column.material} position={[0, 1.462, 0]} />
      <mesh geometry={nodes.upper_arm.geometry} material={nodes.upper_arm.material} position={[2.335, 0, 0.094]} scale={[0.684, 1, 1]} />
      <mesh geometry={nodes.wrist_extension.geometry} material={nodes.wrist_extension.material} position={[3.241, 6.541, 0.007]} scale={0.264} />
      <mesh geometry={nodes.hand.geometry} material={nodes.hand.material} position={[3.318, 5.71, -0.101]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.068, 0.327]} />
      <mesh geometry={nodes.gripper.geometry} material={nodes.gripper.material} position={[3.275, 5.505, 0.286]} rotation={[Math.PI, -Math.PI / 2, 0]} scale={[-0.01, -0.132, -0.325]} />
    </group>
  )
}

useGLTF.preload('/robot_v2.glb')

```

# Robot.jsx

```jsx
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./hmi/public/robot.glb 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/robot.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.main_column.geometry} material={nodes.main_column.material} position={[0, 1.462, 0]} />
      <mesh geometry={nodes.upper_arm.geometry} material={nodes.upper_arm.material} position={[2.335, 0, 0.094]} scale={[0.684, 1, 1]} />
      <mesh geometry={nodes.wrist_extension.geometry} material={nodes.wrist_extension.material} position={[3.241, 6.541, 0.007]} scale={0.264} />
      <mesh geometry={nodes.hand.geometry} material={nodes.hand.material} position={[3.918, 5.71, 0.049]} scale={[1, 0.068, 0.327]} />
      <mesh geometry={nodes.gripper.geometry} material={nodes.gripper.material} position={[4.355, 5.515, 0.006]} rotation={[-Math.PI, 0, 0]} scale={[-0.01, -0.132, -0.325]} />
    </group>
  )
}

useGLTF.preload('/robot.glb')

```

