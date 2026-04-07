# 📘 User Authentication API (Node.js + Express + TypeScript)

A secure and scalable **User Authentication Module** built using **Node.js, Express, TypeScript, MongoDB, JWT, and bcrypt**.

This module provides user registration and login functionality with proper validation, password hashing, and token-based authentication.

---

## 🚀 Features

- ✅ User Registration with validation
- ✅ Secure Password Hashing using bcrypt
- ✅ User Login with credential verification
- ✅ JWT Token Generation (7 days expiry)
- ✅ HTTP-only Cookie Support
- ✅ Express Validator for input validation
- ✅ Centralized Error Handling using http-errors
- ✅ MongoDB with Mongoose schema
- ✅ TypeScript support for type safety

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt
- **Validation:** express-validator
- **Error Handling:** http-errors

---

## 📂 Project Structure

src/
│
├── user/
│ ├── userController.ts # Business logic (register/login)
│ ├── userModel.ts # Mongoose schema
│ ├── userTypes.ts # TypeScript interface
│ └── userRouter.ts # API routes
│
├── config/
│ └── config.ts # Environment configs

---

## 📌 API Endpoints

### 🔹 1. Register User

**POST /register**

#### 📥 Request Body

```json
{
  "name": "Hardeep Singh",
  "email": "hardeep@gmail.com",
  "password": "123456"
}
```

### **⚙️ Validations**

Name → Required
Email → Must be valid format
Password → Minimum 6 characters

### **📤 Response**

```js
{
  "accessToken": "jwt_token_here",
  "name": "Hardeep Singh",
  "email": "hardeep@gmail.com"
}
```

### **❌ Errors**

400 → Validation failed
409 → User already exists

---

### 🔹 2. Login User

**POST /login**

#### **📥 Request Body**

```js
{
  "email": "hardeep@gmail.com",
  "password": "123456"
}
```

#### **📤 Response**

```js
{
  "message": "Login successful",
  "accessToken": "jwt_token_here",
  "name": "Hardeep Singh",
  "email": "hardeep@gmail.com"
}
```

### **🍪 Cookie**

HTTP-only cookie (accessToken)
Secure in production
Expiry: 7 days

---

### **🔐 Authentication Flow**

User registers → Password is hashed using bcrypt
User logs in → Password is compared
If valid → JWT token is generated

**Token is:**
Sent in response
Stored in HTTP-only cookie
Token can be used for protected routes

### **🧠 Code Explanation**

**_🔹 Password Hashing_**

```ts
const hashedPassword = await bcrypt.hash(password, 10);
```

Uses salt rounds = 10
Ensures password security

**_🔹 Password Comparison_**

```ts
const isPasswordValid = await bcrypt.compare(password, user.password);
```

Compares plain password with hashed password

**_🔹 JWT Token Generation_**

```ts
const token = jwt.sign({ userId: user._id }, _config.jwtSecret, {
  expiresIn: '7d',
});
```

Payload → userId
Expiry → 7 days

**_🔹 Cookie Configuration_**

```ts
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

Prevents XSS attacks
Only accessible via server

#### **_🗄️ Database Schema_**

```ts
{
  "name": "String",
  "email": "String (unique)",
  "password": "String"
}
```

**_Features:_**
Email is unique
Auto timestamps (createdAt, updatedAt)
Email validation using regex

#### **⚠️ Error Handling**

Handled using http-errors:

`createHttpError(400, 'Validation failed')`
`createHttpError(409, 'User already exists')`
`createHttpError(401, 'Invalid credentials')`

#### **🧪 Validation (express-validator)**

Example:

```ts
body('email').isEmail().withMessage('Invalid email format');
```

#### **⚙️ Setup Instructions**

**1️⃣ Clone Repo
git clone https://github.com/your-repo.git
cd your-repo
**2️⃣ Install Dependencies**
npm install
**3️⃣ Create .env**
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
**4️⃣ Run Server\*\*
npm run dev

### **📌 Future Improvements**

🔐 Refresh Tokens
📧 Email Verification
🔑 Forgot Password Feature
👤 User Profile Management
🛡️ Role-based Authorization
