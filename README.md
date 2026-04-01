# Finance Data Processing and Access Control Backend

## Project Overview

This project implements a backend system for a finance dashboard where users can manage financial records and access analytics based on their assigned roles.

The backend provides secure APIs for managing transactions, generating financial summaries, and enforcing role-based access control.

The system demonstrates backend architecture, API design, data modeling, validation, and access control mechanisms.

---

## API Documentation

Detailed API documentation is available in the docs folder.

docs/all the docs file

---

# Tech Stack

Backend Framework
Node.js with Express.js

Database
MongoDB with Mongoose ODM

Authentication
JWT (JSON Web Token)

Validation
Express Validator

Security
bcrypt password hashing

---

# Dependencies Used

* express
* mongoose
* bcrypt / bcryptjs
* jsonwebtoken
* express-validator
* dotenv
* cors

---

# Core Features

User Authentication
Secure user registration and login using JWT authentication.

Role Based Access Control (RBAC)
Users are assigned roles that determine which APIs they can access.

Financial Records Management
Users can manage financial transactions including:

* Creating transactions
* Viewing transactions
* Updating transactions
* Deleting transactions
* Filtering transactions

Dashboard Analytics
The backend provides aggregated financial insights including:

* Total Income
* Total Expenses
* Net Balance
* Category-wise expense summary
* Recent transaction activity

Validation & Error Handling
All APIs implement input validation and proper error responses.

---

# User Roles

The system supports three user roles.

Viewer
Can access dashboard summary data only.

Analyst
Can access dashboard summaries and view financial records.

Admin
Has full access including creating, updating, and deleting records and managing users.

---

# Database Schema

## User

```
User
 - name
 - email
 - password
 - role
 - status
 - createdAt
```

## Role

```
Role
 - name (viewer | analyst | admin)
```

## Transaction

```
Transaction
 - user
 - amount
 - type (income / expense)
 - category
 - date
 - notes
 - createdAt
```

---

# API Endpoints

## Authentication

POST /api/auth/register
Register a new user

POST /api/auth/login
Authenticate user and return JWT token

---

## Transactions

POST /api/transactions
Create a financial record (Admin)

GET /api/transactions
Get transactions with filtering (Analyst/Admin)

PUT /api/transactions/:id
Update transaction (Admin)

DELETE /api/transactions/:id
Delete transaction (Admin)

---

## Dashboard

GET /api/dashboard/summary
Returns total income, total expenses and net balance.

GET /api/dashboard/category-summary
Returns category-wise expense totals.

GET /api/dashboard/recent
Returns recent financial transactions.

---

# Access Control Matrix

| API                | Viewer | Analyst | Admin |
| ------------------ | ------ | ------- | ----- |
| Dashboard Summary  | Yes    | Yes     | Yes   |
| View Transactions  | No     | Yes     | Yes   |
| Create Transaction | No     | No      | Yes   |
| Update Transaction | No     | No      | Yes   |
| Delete Transaction | No     | No      | Yes   |

---

# Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

# Installation Guide

Clone the repository

```
git clone <repo_url>
cd Finance-Data-Processing
```

Install dependencies

```
npm install
```

Run server

```
npm run dev
```

---

# Project Structure

```
src
 ├ controllers
 ├ models
 ├ routes
 ├ middleware
 ├ services
 ├ config
 └ utils
```

---

# Future Improvements if required from your side

* Pagination for transactions
* API rate limiting
* Unit testing
* Swagger API documentation
* Audit logging

---
# Live link of Backend api

Base api link : 

https://finance-data-processing-pnk3.onrender.com/api

https://finance-data-processing-pnk3.onrender.com/api/health

# Author

Backend developed as part of internship technical assessment.

Author: Adarsh Kumar Pal
