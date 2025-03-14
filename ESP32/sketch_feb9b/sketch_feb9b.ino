#include <Adafruit_Fingerprint.h>
#include <EEPROM.h>
#include <ArduinoCrypto.h>    

#define RX_PIN 16
#define TX_PIN 17

Adafruit_Fingerprint finger(&Serial2);
String uniqueKey = "";

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial2.begin(57600, SERIAL_8N1, RX_PIN, TX_PIN);

  EEPROM.begin(512);
  uniqueKey = loadUniqueKey();

  finger.begin(57600);
  if (!finger.verifyPassword()) {
    Serial.println("Fingerprint sensor initialization failed.");
    while (true)
      ;
  }
  Serial.println("Fingerprint sensor initialized successfully.");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    Serial.println("Received command: " + command);

    if (command.startsWith("register")) {
      String key = command.substring(9);  
      key.trim();                         
      handleRegister(key);
    } else if (command.startsWith("login")) {
      String challenge = command.substring(6);
      challenge.trim();
      handleLogin(challenge);
    } else if (command.equalsIgnoreCase("details")) {
      handleDetails();
    } else if (command.equalsIgnoreCase("reset")) {
      handleReset();
    }
  }
}

void handleRegister(String key) {
  if (uniqueKey.length() == 0) {
    uniqueKey = key;
    saveUniqueKey(key);
    Serial.println("Unique key stored. Proceeding with fingerprint registration.");
  } else if (uniqueKey != key) {
    Serial.println("Invalid key. Registration denied.");
    return;
  }

  Serial.println("Registering fingerprint...");
  if (enrollFingerprint()) {
    Serial.println("Fingerprint registered successfully.");
  } else {
    Serial.println("Registration failed.");
  }
}

void handleLogin(String challenge) {
  if (verifyFingerprint()) {
    String response = generateHMAC(uniqueKey, challenge);
    Serial.println("HMAC Response: " + response);
  } else {
    Serial.println("Login failed.");
  }
}

void handleDetails() {
  Serial.println(finger.loadModel(1) == FINGERPRINT_OK ? "Fingerprint stored." : "No fingerprint stored.");
}

void handleReset() {
  Serial.println("Resetting fingerprint and unique key...");
  uniqueKey = "";
  saveUniqueKey("");
  if (deleteFingerprint()) {
    Serial.println("Fingerprint deleted.");
  } else {
    Serial.println("No fingerprint to delete.");
  }
}

bool enrollFingerprint() {
  Serial.println("Place finger on sensor...");

  for (int i = 0; i < 2; i++) {
    unsigned long startTime = millis();
    while (finger.getImage() != FINGERPRINT_OK) {
      if (millis() - startTime > 5000) {
        Serial.println("Timed out. Try again.");
        return false;
      }
      delay(100);
    }

    if (finger.image2Tz(i + 1) != FINGERPRINT_OK) {
      Serial.println("Error processing fingerprint. Try again.");
      return false;
    }

    if (i == 0) {
      Serial.println("Remove finger and place it again...");
      delay(1000);
    }
  }

  if (finger.createModel() != FINGERPRINT_OK || finger.storeModel(1) != FINGERPRINT_OK) {
    Serial.println("Failed to store fingerprint.");
    return false;
  }

  return true;
}

bool verifyFingerprint() {
  while (finger.getImage() != FINGERPRINT_OK) delay(100);
  if (finger.image2Tz(1) != FINGERPRINT_OK) return false;
  return (finger.fingerFastSearch() == FINGERPRINT_OK);
}

bool deleteFingerprint() {
  return (finger.deleteModel(1) == FINGERPRINT_OK);
}

String generateHMAC(String key, String challenge) {
  byte hmacResult[32];

  byte keyBytes[key.length()];
  byte challengeBytes[challenge.length()];

  key.getBytes(keyBytes, key.length() + 1);
  challenge.getBytes(challengeBytes, challenge.length() + 1);

  CryptoHMAC hmac(SHA256);
  hmac.setKey(keyBytes, key.length());
  hmac.update(challengeBytes, challenge.length());
  hmac.finalize(hmacResult, sizeof(hmacResult));

  
  String hexResult = "";
  for (int i = 0; i < sizeof(hmacResult); i++) {
    if (hmacResult[i] < 16) hexResult += "0";
    hexResult += String(hmacResult[i], HEX);
  }

  return hexResult;
}

void saveUniqueKey(String key) {
  for (int i = 0; i < key.length(); i++) {
    EEPROM.write(i, key[i]);
  }
  EEPROM.write(key.length(), '\0');
  EEPROM.commit();
}

String loadUniqueKey() {
  char storedKey[33];  
  int i;
  for (i = 0; i < 32; i++) {
    storedKey[i] = EEPROM.read(i);
    if (storedKey[i] == '\0') break;  
  }
  storedKey[i] = '\0';  
  return String(storedKey);
}