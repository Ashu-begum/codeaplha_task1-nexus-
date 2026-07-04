# 🚀 Nexus Social

A modern, production-inspired social media platform built with **Node.js, Express.js, MongoDB, and Vanilla JavaScript**. Nexus Social delivers a clean, responsive, and feature-rich experience with secure authentication, user profiles, social interactions, notifications, image uploads, and an intuitive interface inspired by today's leading social platforms.

Designed with scalability, clean architecture, and maintainability in mind, the project follows industry-standard development practices using the MVC pattern and RESTful APIs.

---

## 📸 Features

### 🔐 Authentication
- User Registration
- Secure Login & Logout
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Input Validation
- Error Handling

### 👤 User Profiles
- Custom Username
- Profile Picture Upload
- Bio Section
- Edit Profile
- Followers Count
- Following Count
- Total Posts Count

### 📝 Posts
- Create Posts
- Edit Posts
- Delete Posts
- Image Upload Support
- Responsive Post Cards
- Timestamp Display

### ❤️ Social Interactions
- Like & Unlike Posts
- Add Comments
- Delete Own Comments
- Live Like & Comment Counts
- Prevent Duplicate Likes

### 👥 Follow System
- Follow / Unfollow Users
- Followers List
- Following List

### 🔔 Notifications
- Activity Notifications
- Notification Feed

### 🔍 Discover
- User Search
- Trending Posts
- Suggested Users

### 🎨 User Experience
- Responsive Design
- Dark & Light Mode
- Professional Layout
- Smooth UI Interactions
- Mobile, Tablet & Desktop Support

---

# 🛠 Tech Stack

## Frontend
- HTML5
- CSS3
- Vanilla JavaScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JSON Web Tokens (JWT)
- HTTP Only Cookies
- bcrypt

---

# 📂 Project Structure

```
Nexus/
│
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── seed.js
│
├── uploads/
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/Ashu-begum/codeaplha_task1-nexus-.git
```

Navigate into the project

```bash
cd codeaplha_task1-nexus-
```

Install dependencies

```bash
npm install
```

Create your environment file

```bash
cp .env.example .env
```

Seed the database

```bash
npm run seed
```

Start the development server

```bash
npm run dev
```

Open your browser and visit

```
http://localhost:5000
```

---

# 👥 Demo Accounts

Password for all users

```
Password123!
```

Sample users

- maya@nexus.dev
- aarav@nexus.dev
- lina@nexus.dev

---

# 📡 REST API

## Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

## Posts

```
GET    /api/posts
POST   /api/posts
PATCH  /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like
POST   /api/posts/:id/comments
DELETE /api/comments/:id
```

## Users

```
GET    /api/users/search?q=
GET    /api/users/:username
PATCH  /api/users/me
POST   /api/users/:id/follow
GET    /api/users/:id/followers
GET    /api/users/:id/following
```

## Notifications

```
GET /api/notifications
```

---

# 🗄 Database Collections

### Users

- username
- email
- password
- avatar
- bio
- followers
- following
- createdAt

### Posts

- author
- content
- image
- likes
- comments
- createdAt

### Comments

- postId
- userId
- text
- createdAt

### Followers

- followerId
- followingId

---

# 🏗 Architecture

- MVC Pattern
- RESTful API Design
- Modular Folder Structure
- Environment Variable Configuration
- Authentication Middleware
- Error Handling Middleware
- Clean Code Practices
- Scalable Project Structure

---

# ✨ Highlights

- Secure JWT Authentication
- Image Upload Support
- Responsive UI
- Trending Posts
- Suggested Users
- Activity Notifications
- Live Search
- Profile Statistics
- Mobile-First Design
- Dark & Light Theme
- Production-Oriented Folder Structure