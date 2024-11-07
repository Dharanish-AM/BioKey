import React, { useState } from 'react';

function BluetoothConnect() {
  const [device, setDevice] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Function to discover all Bluetooth devices
  const discoverBluetoothDevice = async () => {
    try {
      setStatus("Searching for Bluetooth devices...");
      const selectedDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, 
        optionalServices: ["battery_service", "device_information"], 
      });

      setDevice(selectedDevice);
      setStatus(`Device selected: ${selectedDevice.name}`);
    } catch (error) {
      console.error("Error discovering Bluetooth device:", error);
      setStatus("Failed to connect");
    }
  };

  // Connect to the device and read characteristics (optional)
  const connectToDevice = async () => {
    if (!device) {
      console.error("No device selected");
      return;
    }

    try {
      const server = await device.gatt.connect();
      setStatus(`Connected to GATT server on ${device.name}`);
      setIsConnected(true);

      // Example: Get the Battery service and read battery level (if supported)
      const service = await server.getPrimaryService("battery_service");
      const characteristic = await service.getCharacteristic("battery_level");

      const value = await characteristic.readValue();
      const batteryLevel = value.getUint8(0);
      console.log(`Battery level is ${batteryLevel}%`);
    } catch (error) {
      console.error("Error connecting to GATT server:", error);
      setStatus("Failed to connect to GATT server");
      setIsConnected(false);
    }
  };

  // Send a message to the Bluetooth device
  const sendMessage = async () => {
    if (!device || !isConnected) {
      console.error("No device connected");
      return;
    }

    try {
      const service = await device.gatt.getPrimaryService("device_information");
      const characteristic = await service.getCharacteristic("characteristic_uuid"); // Replace with your writable characteristic's UUID

      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      await characteristic.writeValue(data);

      console.log(`Message sent: ${message}`);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("Failed to send message");
    }
  };

  return (
    <div className="bluetooth-container">
      <h1>Bluetooth Connect</h1>
      <p className="status">Status: {status}</p>
      
      <button onClick={discoverBluetoothDevice} disabled={isConnected}>
        Discover Bluetooth Device
      </button>
      
      {device && !isConnected && (
        <div>
          <p>Device: {device.name}</p>
          <button onClick={connectToDevice}>Connect to Device</button>
        </div>
      )}
      
      {isConnected && (
        <div className="message-container">
          <input
            type="text"
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send Message</button>
        </div>
      )}
    </div>
  );
}

export default BluetoothConnect;
