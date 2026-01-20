# BioKey – Biometric Cloud Storage

## Description

BioKey is a comprehensive, cross-platform biometric authentication and cloud storage solution that combines a custom FINGY fingerprint scanner device with a React/Vite web client, an Expo/React Native mobile app, and a secure Express/MongoDB/MinIO backend. Users authenticate using fingerprints or credentials and can seamlessly manage encrypted files, folders, password vaults, and receive real-time notifications across all platforms.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Web App Setup](#web-app-setup)
  - [Mobile App Setup](#mobile-app-setup)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [File Management](#file-management)
  - [Password Vault](#password-vault)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Credits & Acknowledgments](#credits--acknowledgments)

## Features

✅ **Biometric & Credential Authentication** – Secure login via FINGY fingerprint device or email/password  
🔐 **End-to-End Encryption** – RSA key pairs and AES encryption for files and password vault  
☁️ **Cloud File Storage** – Upload, organize, preview, and manage files with automatic thumbnails  
📁 **Smart Organization** – Create folders, mark favorites, and manage recycle bin with 30-day retention  
🔒 **Password Manager** – Securely store and encrypt passwords with breach-check integration  
📱 **Cross-Platform** – Unified experience on web and mobile with real-time sync  
🔔 **Notifications** – Push notifications and activity logs for security awareness  
📊 **Storage Analytics** – Track usage by file type and manage storage quotas  

## Architecture

The system is divided into four core components:

- **Backend API** ([server/](server/)): Express.js with Node.js, MongoDB, MinIO object storage, JWT authentication, and AES encryption for the password vault
- **Web Client** ([web/](web/)): React 19 + Vite + Redux with a global axios client that injects JWT tokens automatically
- **Mobile App** ([app/](app/)): Expo/React Native + Redux with configurable API host for device/simulator access
- **Hardware Device** ([ESP32/](ESP32/)): ESP32 microcontroller running a fingerprint sensor (e.g., R305) to generate biometric authentication tokens

All API calls from web and mobile clients automatically include JWT tokens via request interceptors. File operations enforce per-user ownership, MIME-type validation, and size limits. The password vault uses client-side AES encryption for sensitive data.

## Repository Structure

```
BioKey/
├── server/              # Express API, MongoDB schemas, MinIO integration
│   ├── config/          # Database and MinIO configuration
│   ├── controllers/     # Route handlers for auth, files, passwords, users
│   ├── routes/          # API endpoint definitions
│   ├── models/          # MongoDB schemas
│   ├── middleware/      # Token verification middleware
│   ├── utils/           # Crypto, token generation, validators
│   ├── .env             # Environment variables (see Installation)
│   └── package.json
├── web/                 # Vite + React web client
│   ├── src/
│   │   ├── services/    # API calls with axios client
│   │   ├── redux/       # State management (auth, files, UI)
│   │   ├── pages/       # Main app pages (Home, Folders, Passwords, etc.)
│   │   └── components/  # Reusable UI components
│   ├── .env             # VITE_API_URL configuration
│   └── package.json
├── app/                 # Expo + React Native mobile client
│   ├── src/
│   │   ├── services/    # API calls with Redux-based host config
│   │   ├── redux/       # State management (app config, auth, files)
│   │   ├── screens/     # Mobile app screens
│   │   └── navigation/  # React Navigation setup
│   ├── app.json         # Expo configuration
│   └── package.json
├── ESP32/               # Arduino sketches for FINGY device
│   └── sketch_feb9b/
│       └── sketch_feb9b.ino
└── README.md            # This file
```

## Prerequisites

- **Node.js** 18+ with npm
- **MongoDB** (local or cloud instance such as MongoDB Atlas)
- **MinIO** (local or S3-compatible storage service)
- **Expo CLI** (for mobile development): `npm install -g expo-cli`
- **iOS/Android Tooling** (Xcode for iOS, Android Studio for Android, or use Expo Go for testing)

## Installation

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the `server/` directory with the following variables:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/biokey
   JWT_SECRET=your_secure_jwt_secret_here
   AES_KEY=your_32_character_encryption_key_1
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_USE_SSL=false
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET_NAME=biokey
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. Ensure MongoDB and MinIO are running on your machine.

4. Start the server:
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:8000`.

### Web App Setup

1. Navigate to the web directory:
   ```bash
   cd web
   npm install
   ```

2. Create a `.env` file in the `web/` directory:
   ```env
   VITE_API_URL=localhost:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The web app will be available at `http://localhost:5173`.

4. To build for production:
   ```bash
   npm run build
   npm run preview
   ```

### Mobile App Setup

1. Navigate to the app directory:
   ```bash
   cd app
   npm install
   ```

2. Configure the API host by editing [app/src/redux/reducers/appConfigReducer.js](app/src/redux/reducers/appConfigReducer.js):
   ```javascript
   API_IP: "192.168.x.x:8000",  // Replace with your machine's IP (reachable from device/simulator)
   ```

3. Start the Metro bundler:
   ```bash
   npm run start
   ```
   Or with dev client:
   ```bash
   expo start --dev-client
   ```

4. Run on Android:
   ```bash
   npm run android
   ```

5. Run on iOS:
   ```bash
   npm run ios
   ```

6. Alternatively, use **Expo Go** app on your phone to scan the QR code displayed by the Metro bundler.

## Usage

### Authentication

**Register a New Account:**
- Navigate to the auth screen and provide name, email, password, phone, and location.
- Optionally link a FINGY device (requires serial number from device inventory).
- On successful registration, you receive an RSA public key and unique key for device authentication.

**Login with Credentials:**
- Enter email and password; the API returns a JWT token.
- Token is stored in `localStorage` (web) or Redux (mobile) and automatically attached to subsequent requests.

**Login with Fingerprint (FINGY Device):**
- Scan fingerprint on the device; it generates an encrypted unique key.
- Send encrypted key and serial number to the API for decryption and token generation.

### File Management

**Upload Files:**
- Use the upload button in the Files page (web) or home screen (mobile).
- The system validates MIME type, enforces a 200MB per-file limit, and generates thumbnails.
- Files are stored in MinIO under `userId/category/filename` paths.

**Organize Files:**
- Create custom folders for organization.
- Move files between folders using the file context menu.
- Star files to mark them as favorites; view them in the Favorites section.

**Preview & Download:**
- Click on a file to preview its content (images, videos, PDFs, etc.).
- Use the download button to fetch files from MinIO via presigned URLs (1-hour expiry).

**Recycle Bin:**
- Deleted files are moved to the recycle bin (not permanently deleted for 30 days).
- Restore files by selecting them in the Recycle Bin and clicking Restore.
- Permanently delete files to free up storage quota.

### Password Vault

**Add Password:**
- Navigate to Passwords and click "Add Password".
- Provide account name, username, email, password, website, and optional notes.
- The password is encrypted with AES-256-CBC before storage.

**Retrieve Password:**
- Click on a password entry to reveal the decrypted password (requires valid session).
- Use the copy button to quickly copy to clipboard.

**Check for Breaches:**
- The app integrates with Have I Been Pwned API to check if your password has appeared in known breaches.
- A warning badge indicates if a password is at risk.

## API Documentation

### Authentication Endpoints

- `POST /api/users/register` – Register a new user (public)
- `POST /api/users/login-credentials` – Login with email/password (public)
- `POST /api/users/login-fingerprint` – Login with FINGY biometric (public)
- `POST /api/users/check-token-is-valid` – Validate JWT token (requires token)

### Protected Endpoints

All endpoints below require an `Authorization: Bearer <token>` header:

**User Management:**
- `GET /api/users/user-details` – Fetch user profile
- `PUT /api/users/updateuserprofile` – Update profile info
- `POST /api/users/setprofile` – Upload profile picture
- `DELETE /api/users/delete` – Delete account

**File Operations:**
- `POST /api/files/upload` – Upload files (MIME validation, size caps)
- `GET /api/files/list` – List files by category
- `GET /api/files/recent` – Fetch recent files
- `DELETE /api/files/delete` – Move files to recycle bin
- `GET /api/files/recyclebinfiles` – List recycle bin items
- `POST /api/files/restorefile` – Restore from recycle bin
- `DELETE /api/files/permanentdelete` – Permanently delete

**Folder Management:**
- `POST /api/users/createfolder` – Create a folder
- `GET /api/users/listfolder` – List user's folders
- `PUT /api/users/renamefolder` – Rename folder
- `DELETE /api/users/deletefolder` – Delete folder
- `POST /api/users/addfilestofolder` – Add files to folder

**Password Vault:**
- `POST /api/passwords/addpassword` – Add a new password
- `GET /api/passwords/getallpasswords` – Fetch all passwords
- `GET /api/passwords/getpassword` – Fetch single password
- `PUT /api/passwords/updatepassword` – Update password
- `DELETE /api/passwords/deletepassword` – Delete password

**Notifications & Logs:**
- `GET /api/users/getallnotifications` – Fetch user notifications
- `POST /api/users/clearnotification` – Clear notification
- `GET /api/users/getactivitylogs` – Fetch activity logs

## Troubleshooting

### 401 Unauthorized Errors

**Cause:** Missing or invalid JWT token.  
**Solution:**
- Ensure the client stores the token after login (check `localStorage` on web or Redux state on mobile).
- Verify the token is being sent in the `Authorization: Bearer <token>` header.
- Check that `JWT_SECRET` in `.env` matches the secret used to sign tokens.

### MinIO Connection Errors

**Cause:** MinIO service not running or incorrect credentials.  
**Solution:**
- Start MinIO: `minio server ~/minio-data` (or via Docker).
- Verify credentials in `.env`: `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`.
- Ensure the bucket exists: `mc mb local/biokey` (using MinIO Client).

### API Host Not Reachable (Mobile)

**Cause:** Mobile device cannot reach the backend host (e.g., using `localhost`).  
**Solution:**
- Use your machine's local IP address (e.g., `192.168.1.100:8000`) in the app config.
- Ensure both device and machine are on the same network.
- For simulators, `localhost` or `127.0.0.1` may work; test with `adb reverse` (Android).

### CORS Errors

**Cause:** Client origin not in `ALLOWED_ORIGINS`.  
**Solution:**
- Add the client's full origin (e.g., `http://localhost:5173`) to `ALLOWED_ORIGINS` in `.env`.
- Separate multiple origins with commas: `http://localhost:5173,http://localhost:3000`.

## Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository on GitHub.
2. **Create a feature branch** (`git checkout -b feature/your-feature`).
3. **Commit your changes** with clear, descriptive messages.
4. **Push to your fork** (`git push origin feature/your-feature`).
5. **Open a Pull Request** with a detailed description of your changes.

### Guidelines

- Write clear commit messages and document code changes.
- Test your changes locally before submitting a PR.
- Follow the existing code style (use ESLint/Prettier if configured).
- Report bugs by opening an **Issue** with reproduction steps and expected behavior.
- Suggest features via **Discussions** or **Issues**.

## License

This project is licensed under the [ISC License](LICENSE.txt). See the LICENSE file for details.

## Credits & Acknowledgments

- **FINGY Hardware**: Custom ESP32-based fingerprint scanner for biometric authentication.
- **MinIO**: S3-compatible object storage for secure file management.
- **MongoDB**: NoSQL database for user, file, and metadata storage.
- **Express.js**: Lightweight, flexible web framework for the backend API.
- **React & Vite**: Modern UI libraries and tooling for fast, responsive frontends.
- **Expo & React Native**: Cross-platform mobile development framework.
- **Have I Been Pwned API**: For password breach detection and security awareness.
- **Socket.io**: For real-time WebSocket communication (planned feature).

---

**For more information, issues, or feature requests, please visit the [GitHub repository](https://github.com/Dharanish-AM/BioKey).**
