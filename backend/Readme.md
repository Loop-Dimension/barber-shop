# Barber Queue Management Backend API

This project provides a complete backend for a barber appointment and queue management system. It supports user registration, appointment creation with queue management, real‑time updates on appointment status (pending, canceled, rescheduled, completed), and dynamic queue position recalculations.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Barber Endpoints](#barber-endpoints)
  - [Appointment Endpoints](#appointment-endpoints)
  - [Queue Endpoints](#queue-endpoints)
- [cURL Examples](#curl-examples)
- [Notes](#notes)

## Features

- **User Authentication:** Signup and login using Firebase Authentication with additional user data stored in Firestore.
- **Admin Control:** Admin users can add barbers and mark appointments as completed.
- **Barber Management:** Add barbers with working hours and available days.
- **Appointment Scheduling:** Create, cancel, reschedule, complete, and delete appointments with double booking prevention.
- **Queue Management:** Automatically add appointments to the queue. Queue positions are recalculated on cancellation, deletion, or completion.
- **Dynamic Queue Search:** Retrieve a user’s queue based on their email and appointment date.

## Project Structure

```
barber-queue-app/
├── config/
│ └── serviceAccountKey.json # Firebase service account key
├── controllers/
│ ├── appointmentController.js # Appointment CRUD and status updates
│ ├── authController.js # Signup, login, and update user
│ ├── barberController.js # Add and list barbers
│ ├── queueController.js # Queue management endpoints
│ ├── notificationController.js # (Optional) Email notifications using Nodemailer
│ └── scheduleController.js # (Optional) Get available time slots (if used)
├── middleware/
│ └── authMiddleware.js # Admin authentication middleware
├── routes/
│ ├── appointment.js # Appointment-related routes
│ ├── auth.js # Authentication routes
│ ├── barber.js # Barber routes
│ └── queue.js # Queue routes
├── .env # Environment variables
├── app.js # Express app entry point
├── package.json
└── README.md # This documentation file

```

## Setup and Installation

1. **Clone the Repository:**

   ```bash
   git clone <repository_url>
   cd barber-queue-app
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Setup Environment Variables:**

   Create a `.env` file in the root directory and add:

   ```
   PORT=3000
   DATABASE_URL=https://your-project-id.firebaseio.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   FIREBASE_API_KEY=your_firebase_api_key
   ```

4. **Place Firebase Service Account Key:**

   Save your Firebase service account JSON file as `config/serviceAccountKey.json`.

5. **Start the Server:**

   ```bash
   npm start
   ```

   The server will run on the port specified in the `.env` file (default is 3000).

## Environment Variables

- **PORT:** Port number for the server.
- **DATABASE_URL:** Firebase database URL.
- **EMAIL_USER & EMAIL_PASS:** Credentials for sending email notifications.
- **FIREBASE_API_KEY:** Your Firebase API key for authentication endpoints.

## API Endpoints

### Authentication Endpoints

#### 1. **Signup**

- **Endpoint:** `POST /api/auth/signup`
- **Description:** Creates a new user and saves extra user data in Firestore.
- **Request Body:**

  ```json
  {
    "email": "user@example.com",
    "password": "your_password",
    "name": "John Doe",
    "isAdmin": false // Optional: only set by admin
  }
  ```

#### 2. **Login**

- **Endpoint:** `POST /api/auth/login`
- **Description:** Logs in a user using Firebase Auth’s REST API.
- **Request Body:**

  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```

#### 3. **Update User** (Optional)

- **Endpoint:** `POST /api/auth/updateUser`
- **Description:** Updates user details (e.g., name, admin flag) in Firestore.
- **Request Body:**

  ```json
  {
    "uid": "user_uid",
    "name": "New Name",
    "isAdmin": true
  }
  ```

### Barber Endpoints

#### 1. **Add Barber** (Admin Only)

- **Endpoint:** `POST /api/barbers`
- **Description:** Adds a new barber with working hours and available days.
- **Headers:** `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
- **Request Body:**

  ```json
  {
    "name": "Barber Mike",
    "experience": 5,
    "workingHours": {
      "start": "08:00",
      "end": "16:00",
      "slotDuration": 30
    },
    "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }
  ```

#### 2. **Get Barbers**

- **Endpoint:** `GET /api/barbers`
- **Description:** Retrieves all barbers.

### Appointment Endpoints

#### 1. **Create Appointment**

- **Endpoint:** `POST /api/appointments`
- **Description:** Creates a new appointment (with double booking protection) and adds a corresponding queue record.
- **Request Body:**

  ```json
  {
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "appointmentTime": "2023-06-01T10:00:00Z",
    "barberId": "<barber_id>"
  }
  ```

#### 2. **Cancel Appointment**

- **Endpoint:** `POST /api/appointments/cancel`
- **Description:** Cancels an appointment, sends a cancellation notification, and removes its queue record.
- **Request Body:**

  ```json
  {
    "appointmentId": "<appointment_id>",
    "customerEmail": "john@example.com"
  }
  ```

#### 3. **Reschedule Appointment**

- **Endpoint:** `POST /api/appointments/reschedule`
- **Description:** Reschedules an appointment and updates the corresponding queue record.
- **Request Body:**

  ```json
  {
    "appointmentId": "<appointment_id>",
    "newAppointmentTime": "2023-06-01T11:00:00Z"
  }
  ```

#### 4. **Complete Appointment** (Admin Only)

- **Endpoint:** `POST /api/appointments/complete`
- **Description:** Marks an appointment as completed (admin action) and removes its queue record.
- **Headers:** `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
- **Request Body:**

  ```json
  {
    "appointmentId": "<appointment_id>"
  }
  ```

#### 5. **Delete Appointment**

- **Endpoint:** `DELETE /api/appointments`
- **Description:** Deletes an appointment and its associated queue record.
- **Request Body:**

  ```json
  {
    "appointmentId": "<appointment_id>"
  }
  ```

### Queue Endpoints

#### 1. **Get Queue**

- **Endpoint:** `GET /api/queue`
- **Description:** Retrieves the current queue sorted by position.

#### 2. **Search Queue by Email and Date**

- **Endpoint:** `GET /api/queue/search`
- **Query Parameters:** `email` and `date` (YYYY-MM-DD)
- **Description:** Returns queue records for a user on a specific date.
- **Example:** `/api/queue/search?email=john@example.com&date=2023-06-01`

#### 3. **Update Queue Positions**

- **Endpoint:** `POST /api/queue/update`
- **Description:** Manually updates queue positions.
- **Request Body:**

  ```json
  {
    "updates": [
      { "id": "queueDocID1", "newPosition": 1 },
      { "id": "queueDocID2", "newPosition": 2 }
    ]
  }
  ```

#### 4. **Remove from Queue**

- **Endpoint:** `DELETE /api/queue/:id`
- **Description:** Removes a queue entry (e.g., when a customer leaves) and recalculates the queue.

## cURL Examples

### Authentication

**Signup:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password",
    "name": "John Doe",
    "isAdmin": false
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "barber@example.com",
    "password": "secret"
  }'
```

### Barber Endpoints

**Add Barber (Admin Only):**

```bash
curl -X POST http://localhost:3000/api/barbers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
  -d '{
    "name": "Barber Mike",
    "experience": 5,
    "workingHours": {
      "start": "08:00",
      "end": "16:00",
      "slotDuration": 30
    },
    "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }'
```

**Get Barbers:**

```bash
curl http://localhost:3000/api/barbers
```

### Appointment Endpoints

**Create Appointment:**

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "appointmentTime": "2023-06-01T10:00:00Z",
    "barberId": "<barber_id>"
  }'
```

**Reschedule Appointment:**

```bash
curl -X POST http://localhost:3000/api/appointments/reschedule \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "<appointment_id>",
    "newAppointmentTime": "2023-06-01T11:00:00Z"
  }'
```

**Cancel Appointment:**

```bash
curl -X POST http://localhost:3000/api/appointments/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "<appointment_id>",
    "customerEmail": "john@example.com"
  }'
```

**Complete Appointment (Admin Only):**

```bash
curl -X POST http://localhost:3000/api/appointments/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
  -d '{
    "appointmentId": "<appointment_id>"
  }'
```

**Delete Appointment:**

```bash
curl -X DELETE http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "<appointment_id>"
  }'
```

### Queue Endpoints

**Get Queue:**

```bash
curl http://localhost:3000/api/queue
```

**Search Queue by Email and Date:**

```bash
curl "http://localhost:3000/api/queue/search?email=john@example.com&date=2023-06-01"
```

**Update Queue Positions:**

```bash
curl -X POST http://localhost:3000/api/queue/update \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      { "id": "queueDocID1", "newPosition": 1 },
      { "id": "queueDocID2", "newPosition": 2 }
    ]
  }'
```

**Remove from Queue:**

```bash
curl -X DELETE http://localhost:3000/api/queue/<queue_entry_id>
```

## Notes

- **Admin Endpoints:** Endpoints like adding a barber or completing an appointment require a valid Firebase ID token with admin privileges. The token is verified using the `authMiddleware`.
- **Double Booking:** The appointment endpoints prevent double booking by checking if the same barber already has an appointment at the same time.
- **Queue Management:** When an appointment is created, a corresponding queue record is added. Updates to appointment status (cancellation, reschedule, deletion, completion) update the queue accordingly.
- **Dynamic Queue Search:** The `/api/queue/search` endpoint lets you query queue records by customer email and appointment date.

---
