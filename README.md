# Robotic Arm

## Intro

* api - A NodeJS project using MongoDB and Websocket connectivity for robot data
* model - The Mesh of the arm modelled in Blender
* hmi - A React Application using React Three Fiber and the API over Websockets for the telemetry data.

## Running the project

* Make sure Docker is installed running: [https://www.docker.com/get-started/](https://www.docker.com/get-started/)
* Clone the repo and run docker

```shell
git clone https://github.com/appeltje-c/robot-arm
cd robot-arm
docker compose up -d
```

When the project is running, you can open [http://localhost:3000](http://localhost:3000)

To stop the containers

```shell
docker compose down
```

## What's in the box

There are three main projects

[Hmi](hmi/README.md) : The React App

[API](./api/README.md) : The API

[Model](./model/README.md) : The Arm Model

