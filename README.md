# Nexus Social

A polished mini social media platform with authentication, profiles, posts, comments, likes, follows, notifications, search, trending posts, suggested users, dark/light mode, image uploads, and responsive UI.

## Stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT in an httpOnly cookie

## Run Locally

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

Open `http://localhost:5000`.

Seed users use password `Password123!`.

## Sample Accounts

- `maya@nexus.dev`
- `aarav@nexus.dev`
- `lina@nexus.dev`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/posts`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/comments`
- `DELETE /api/comments/:id`
- `GET /api/users/search?q=`
- `GET /api/users/:username`
- `PATCH /api/users/me`
- `POST /api/users/:id/follow`
- `GET /api/users/:id/followers`
- `GET /api/users/:id/following`
- `GET /api/notifications`
