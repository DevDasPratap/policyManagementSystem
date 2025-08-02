# Policy Management System

This project provides a Node.js-based backend system to upload insurance policy data via CSV, search policies by name, aggregate policy data by user, and schedule automated messages.

---

## Setup Instructions

### 1. **Clone the Repository**
```bash
git clone https://github.com/DevDasPratap/policyManagementSystem.git
cd policyManagementSystem
```
### 2. Install Dependencies

```bash
npm install
```

### 3. Create .env File
```bash
# MongoDB connection URI
MONGO_URI=mongodb://localhost:27017/insuranceDB

# Server port
PORT=3000

# Node environment
NODE_ENV=development

# Optional: Cron or CPU check interval (in seconds)
CPU_CHECK_INTERVAL=10
```

### 4. Run the Server 
```bash
# For development mode with auto-restart (requires nodemon install global):
npm run dev
# or
npm run start
# or 
npm start
```