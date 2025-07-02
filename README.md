# 🔐 BioKey – Fingerprint Authenticated Cloud Storage

**BioKey** is a cross-platform biometric authentication system that secures access to cloud storage using fingerprint verification via a custom-built hardware device named **FINGY**. Designed for secure environments, BioKey ensures that only verified users can access encrypted files—across web and mobile apps.

---

## 🧩 What is BioKey?

BioKey is an end-to-end solution combining:

- 🧑‍💻 A secure **Web App**
- 📱 A companion **Mobile App**
- 🔧 A dedicated fingerprint scanner **(FINGY hardware)**

Together, they offer seamless biometric login, file encryption, and cloud-based file management.

---

## 🔐 Core Features

- ✅ **Fingerprint-Based Authentication**  
  Plug in FINGY and scan your fingerprint to access your account securely.

- 🔑 **Encrypted Cloud Storage**  
  All files are encrypted using RSA/AES keys linked to your biometric identity.

- 📁 **Cross-Platform Access**  
  Web and mobile interfaces for uploading, downloading, and managing files.

- 🛡️ **Zero-Knowledge Architecture**  
  BioKey never stores raw fingerprints—only encrypted references tied to your private key.

- 🔄 **WebSocket/USB Communication**  
  Real-time communication with the FINGY device during login or verification.

---


## 🛠️ Tech Stack

- **Frontend:** React.js (Web), React Native (Mobile)
- **Backend:** Node.js, Express.js, MongoDB
- **Security:** RSA Key Pair, AES Encryption, JWT Auth
- **Device:** ESP32 with Fingerprint Sensor (e.g., R305)
- **Communication:** USB Serial / WebSocket

## 🌐 Use Cases

- 🔐 **Enterprise File Access Control**
- 🧪 **Research Lab Data Storage**
- 🏫 **Student Exam Material Access**
- 🏥 **Medical Report Privacy & Retrieval**
