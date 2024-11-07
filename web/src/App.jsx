import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [message, setMessage] = useState('');
  const [receivedData, setReceivedData] = useState('');
  
  // Reference to the textarea to control scroll
  const textareaRef = useRef(null);

  // Suppress console logs in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log = () => {};  // Disable all console logs in development
    }
  }, []);

  // Scroll to the bottom of the textarea whenever receivedData changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [receivedData]);

  // Connect to the serial device
  const connectToDevice = async () => {
    if (!navigator.serial) {
      alert('Web Serial API not supported by this browser');
      return;
    }

    try {
      // Request a device with a USB interface
      const selectedDevice = await navigator.serial.requestPort();
      setDevice(selectedDevice);
      setStatus('Connecting...');

      // Open the connection to the device
      await selectedDevice.open({ baudRate: 115200 });
      setIsConnected(true);
      setStatus('Connected');

      // Start reading data from the device
      startReading(selectedDevice);
    } catch (error) {
      console.error('Failed to connect to device:', error);
      setStatus('Failed to connect');
    }
  };

  // Start reading data from the device
  const startReading = async (device) => {
    if (!device) return;

    const reader = device.readable.getReader();
    try {
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        // Append received data
        setReceivedData((prev) => prev + decoder.decode(value));
      }
    } catch (error) {
      console.error('Error reading data:', error);
    }
  };

  // Send a message to the device
  const sendMessage = async () => {
    if (!device) return;

    try {
      // Send the message to the device
      const writer = device.writable.getWriter();
      const encoder = new TextEncoder();
      writer.write(encoder.encode(message));
      writer.releaseLock();
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Close the serial connection
  const disconnectDevice = async () => {
    if (device) {
      await device.close();
      setIsConnected(false);
      setStatus('Disconnected');
      setDevice(null);
    }
  };

  return (
    <div>
      <h1>Serial Communication with ESP32</h1>
      <p>Status: {status}</p>

      {!isConnected ? (
        <button onClick={connectToDevice}>Connect to Device</button>
      ) : (
        <div>
          <textarea
            ref={textareaRef}
            rows="10"
            cols="50"
            value={receivedData}
            readOnly
          />
          <div>
            <input
              type="text"
              placeholder="Enter message to send"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send Message</button>
          </div>
          <button onClick={disconnectDevice}>Disconnect</button>
        </div>
      )}
    </div>
  );
};

export default App;
