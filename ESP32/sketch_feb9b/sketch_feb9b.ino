#include <Adafruit_Fingerprint.h>  // Fingerprint sensor library
#include <EEPROM.h>                // Store fingerprint IDs and keys
#include <WiFi.h>                  // WiFi for WebSocket
#include <WebSocketsServer.h>      // WebSocket server
#include <HTTPClient.h>
#include <ArduinoJson.h>


#define RX_PIN 16
#define TX_PIN 17
#define STATUS_LED 2
#define MAX_ID 200
#define EEPROM_SIZE 512

const char* SSID = "AMD's WIFI";
const char* PASSWORD = "Dharanish123";

Adafruit_Fingerprint finger(&Serial2);
WebSocketsServer webSocket(81);

bool isDeviceRegistered = false;
int serialNumber = 123456789;

void setup() {
  Serial.begin(115200);
  Serial2.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);

  EEPROM.begin(EEPROM_SIZE);
  isDeviceRegistered = EEPROM.read(0) == 1;
  EEPROM.get(1, serialNumber);


    EEPROM.put(1, serialNumber);
    EEPROM.commit();

  finger.begin(57600);
  if (!finger.verifyPassword()) {
    Serial.println("Fingerprint sensor initialization failed.");
    while (true) blinkError();
  }
  Serial.println("Fingerprint sensor initialized.");

  WiFi.begin(SSID, PASSWORD);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  String command = String((char*)payload).substring(0, length);
  Serial.println("Received command: " + command);

  if (command.equalsIgnoreCase("register")) {
    handleRegister(num);
  } else if (command.equalsIgnoreCase("login")) {
    handleLogin(num);
  } else if (command.startsWith("delete ")) {
    int id = command.substring(7).toInt();
    handleDelete(num, id);
  } else if (command.equalsIgnoreCase("deleteAll")) {
    handleDeleteAll(num);
  } else if (command.equalsIgnoreCase("addFingerprint")) {
    handleAddFingerprint(num);
  } else if (command.startsWith("setKey ")) {
    String keyData = command.substring(7);
    handleSetKey(num, keyData);
  } else if (command.equalsIgnoreCase("resetDevice")) {
    resetDevice(num);
  }
}

void handleRegister(uint8_t client) {
  if (isDeviceRegistered) {
    webSocket.sendTXT(client, "Device already registered.");
    return;
  }

  int id = getAvailableID();
  if (id == -1) {
    webSocket.sendTXT(client, "No slots available.");
    return;
  }

  if (enrollFingerprint(id)) {
    writeID(id, 1);
    EEPROM.write(0, 1);
    EEPROM.commit();
    isDeviceRegistered = true;
    webSocket.sendTXT(client, "Registered. Serial: " + String(serialNumber) + ", Fingerprint ID: " + String(id));
  } else {
    webSocket.sendTXT(client, "Registration failed.");
  }
}

int getAvailableID() {
  for (int id = 1; id < MAX_ID; id++) {
    if (readID(id) == 0) {  // Check if ID slot is empty
      return id;
    }
  }
  return -1;  // No available slots
}



void handleLogin(uint8_t client) {
  if (!isDeviceRegistered) {
    webSocket.sendTXT(client, "Device not registered.");
    return;
  }

  if (verifyFingerprint()) {
    String uniqueKey = readEEPROMString(10);
    String publicKey = readEEPROMString(10 + uniqueKey.length() + 1);

    if (uniqueKey.isEmpty() || publicKey.isEmpty()) {
      webSocket.sendTXT(client, "No valid key found.");
      return;
    }

    String encryptedKey = encryptUsingAPI(uniqueKey, publicKey);
    if (encryptedKey.isEmpty()) {
      webSocket.sendTXT(client, "Encryption failed.");
      return;
    }

    webSocket.sendTXT(client, "Login successful. Encrypted Key: " + encryptedKey);
  } else {
    webSocket.sendTXT(client, "Login failed.");
  }
}

String encryptUsingAPI(String uniqueKey, String publicKey) {
  HTTPClient http;
  String serverUrl = "http://192.168.56.1:3000/encrypt";  

  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Create JSON object
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["uniqueKey"] = uniqueKey;
  jsonDoc["publicKey"] = publicKey;

  String requestBody;
  serializeJson(jsonDoc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  String response = "";

  if (httpResponseCode > 0) {
    response = http.getString();
  } else {
    Serial.println("Error on HTTP request");
  }

  http.end();
  return response;
}


String readEEPROMString(int start) {
  String data = "";
  char ch;
  for (int i = start; i < EEPROM_SIZE; i++) {
    ch = EEPROM.read(i);
    if (ch == '\0') break;
    data += ch;
  }
  return data;
}


void handleDelete(uint8_t client, int id) {
  if (id <= 0 || id >= MAX_ID) {
    webSocket.sendTXT(client, "Invalid fingerprint ID.");
    return;
  }

  if (readID(id) != 1) {
    webSocket.sendTXT(client, "Fingerprint not found.");
    return;
  }

  if (finger.deleteModel(id) == FINGERPRINT_OK) {
    writeID(id, 0);
    webSocket.sendTXT(client, "Deleted fingerprint ID: " + String(id));
  } else {
    webSocket.sendTXT(client, "Failed to delete fingerprint.");
  }
}

void handleDeleteAll(uint8_t client) {
  if (finger.emptyDatabase() == FINGERPRINT_OK) {
    for (int i = 1; i < MAX_ID; i++) {
      writeID(i, 0);  // Reset stored fingerprint flags
    }
    EEPROM.write(0, 0);  // Reset registration flag
    EEPROM.commit();
    webSocket.sendTXT(client, "All fingerprints deleted. IDs reset.");
  } else {
    webSocket.sendTXT(client, "Failed to delete all fingerprints.");
  }
}


void handleAddFingerprint(uint8_t client) {
  int id = getAvailableID();
  if (id == -1) {
    webSocket.sendTXT(client, "No slots available.");
    return;
  }

  if (enrollFingerprint(id)) {
    writeID(id, 1);
    webSocket.sendTXT(client, "Fingerprint added successfully. ID: " + String(id));
  } else {
    webSocket.sendTXT(client, "Failed to add fingerprint.");
  }
}

void handleSetKey(uint8_t client, String keyData) {
  int separatorIndex = keyData.indexOf('|');  // Expecting "uniqueKey|publicKey"
  if (separatorIndex == -1) {
    webSocket.sendTXT(client, "Invalid format. Expected 'uniqueKey|publicKey'.");
    return;
  }

  String uniqueKey = keyData.substring(0, separatorIndex);
  String publicKey = keyData.substring(separatorIndex + 1);

  if (uniqueKey.length() + publicKey.length() + 2 > EEPROM_SIZE - 10) {
    webSocket.sendTXT(client, "Keys too large.");
    return;
  }

  // Store uniqueKey at EEPROM address 10
  for (int i = 0; i < uniqueKey.length(); i++) {
    EEPROM.write(10 + i, uniqueKey[i]);
  }
  EEPROM.write(10 + uniqueKey.length(), '\0');  // Null terminator

  // Store publicKey after uniqueKey
  int publicKeyStart = 10 + uniqueKey.length() + 1;
  for (int i = 0; i < publicKey.length(); i++) {
    EEPROM.write(publicKeyStart + i, publicKey[i]);
  }
  EEPROM.write(publicKeyStart + publicKey.length(), '\0');  // Null terminator

  EEPROM.commit();

  webSocket.sendTXT(client, "Keys stored successfully.");
}

void resetDevice(uint8_t client) {
  Serial.println("Resetting device...");

  // Clear all fingerprints
  if (finger.emptyDatabase() != FINGERPRINT_OK) {
    webSocket.sendTXT(client, "Failed to clear fingerprint database.");
    return;
  }

  // Clear EEPROM (reset all stored values)
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);  // Writing 0 instead of 0xFF for a proper reset
  }
  EEPROM.commit();

  // Reset key storage locations explicitly
  for (int i = 10; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();

  // Reset serial number and registration flag
  isDeviceRegistered = false;
  serialNumber = 0;

  Serial.println("Device reset successful.");
  webSocket.sendTXT(client, "Device reset successful. Restart the device.");
}



bool enrollFingerprint(int id) {
  digitalWrite(STATUS_LED, HIGH);
  for (int i = 0; i < 2; i++) {
    unsigned long startTime = millis();
    while (finger.getImage() != FINGERPRINT_OK) {
      if (millis() - startTime > 10000) {
        digitalWrite(STATUS_LED, LOW);
        return false;
      }
      delay(100);
    }
    if (finger.image2Tz(i + 1) != FINGERPRINT_OK) {
      digitalWrite(STATUS_LED, LOW);
      return false;
    }
    if (i == 0) delay(2000);
  }
  if (finger.createModel() == FINGERPRINT_OK && finger.storeModel(id) == FINGERPRINT_OK) {
    digitalWrite(STATUS_LED, LOW);
    return true;
  }
  digitalWrite(STATUS_LED, LOW);
  return false;
}

bool verifyFingerprint() {
  unsigned long startTime = millis();
  while (finger.getImage() != FINGERPRINT_OK) {
    if (millis() - startTime > 10000) {
      return false;
    }
    delay(100);
  }
  if (finger.image2Tz(1) != FINGERPRINT_OK) return false;
  return (finger.fingerFastSearch() == FINGERPRINT_OK);
}

void writeID(int id, int status) {
  EEPROM.write(id, status);
  EEPROM.commit();
}

int readID(int id) {
  return EEPROM.read(id);
}

void blinkError() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(500);
    digitalWrite(STATUS_LED, LOW);
    delay(500);
  }
}
