FROM node:lts-bookworm

# Install Python 3.8+ and build dependencies
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/api

COPY package.json /usr/src/api/package.json
COPY yarn.lock /usr/src/api/yarn.lock

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

# Install node-gyp globally with a version that supports Python 3.8
RUN npm install -g node-gyp@9.0.0

# Install dependencies
RUN yarn install

COPY . /usr/src/api

EXPOSE 3000

# Add Bluetooth configuration
RUN mkdir -p /var/run/dbus
RUN sed -i 's/#AutoEnable=false/AutoEnable=true/' /etc/bluetooth/main.conf

CMD [ "npm", "run", "watch" ]