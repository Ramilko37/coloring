# Coloring Book Backend

Backend service for the Coloring Book application with authentication and user management.

## Features

- User Registration and Login
- JWT-based Authentication
- User Profile Management
- Role-based Authorization (Admin/User)
- MongoDB Integration

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Configure environment variables:

   - Create a `.env` file based on the provided sample
   - Set MongoDB connection string
   - Set JWT secret and expiration time

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/logout` - Logout user

### User (Protected Routes)

- `GET /api/v1/users/me` - Get logged in user details
- `PUT /api/v1/users/password/update` - Update user password
- `PUT /api/v1/users/me/update` - Update user profile

### Admin (Protected Routes)

- `GET /api/v1/users/admin/users` - Get all users (admin only)
- `GET /api/v1/users/admin/user/:id` - Get user details (admin only)
- `PUT /api/v1/users/admin/user/:id` - Update user role (admin only)
- `DELETE /api/v1/users/admin/user/:id` - Delete user (admin only)

## Requirements

- Node.js 18.x or higher
- MongoDB (local or Atlas)

mongodb+srv://ramilko37:YzStixBFC4Kw5N3E@cluster0.krxyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

PORT=8080
MONGODB*URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coloring-book?retryWrites=true&w=majority
JWT_SECRET=ваш*очень*секретный*ключ
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
