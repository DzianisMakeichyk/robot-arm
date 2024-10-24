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
    systemd \
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

# Create necessary directories and set permissions
RUN mkdir -p /var/run/dbus \
    && mkdir -p /var/run/bluetooth \
    && mkdir -p /etc/bluetooth

# Generate machine-id
RUN dbus-uuidgen > /var/lib/dbus/machine-id

# Set permissions
RUN chmod 777 /var/run/bluetooth \
    && chmod 777 /var/run/dbus

# Copy bluetooth configuration
COPY bluetooth/main.conf /etc/bluetooth/main.conf

EXPOSE 3000

# Start D-Bus and your application
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]