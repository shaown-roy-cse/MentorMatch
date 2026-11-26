
# MentorMatch – 1:1 Tech Mentorship & Mock Interview Platform

MentorMatch is a web-based platform designed to connect students with experienced technology mentors for personalized mentorship and mock interview sessions.

The platform helps students discover mentors, check their availability, book mentorship sessions, and receive guidance to improve their technical and interview skills.

## 🚀 Project Overview

Finding the right mentor and scheduling technical mentorship sessions can be challenging for students. MentorMatch provides a centralized platform where students can easily find mentors and book one-to-one mentorship sessions.

The system also helps mentors manage their availability and handle booking requests efficiently.

## ✨ Key Features

### Authentication & User Management
- User registration and login
- JWT-based authentication
- Role-based access control
- Student and Mentor profiles

### Mentor Management
- Browse available mentors
- View mentor profiles
- Check mentor availability
- Manage availability schedules

### Booking Management
- Students can book mentorship sessions
- Prevent double booking
- Validate mentor availability
- Manage booking status
- Automatic meeting link generation when a booking is confirmed

### Booking Status
- Pending
- Confirmed
- Completed
- Cancelled

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- JavaScript

### Backend
- Python
- Django
- Django REST Framework

### Database
- PostgreSQL

### Authentication & API
- JWT Authentication
- REST API
- Postman

### Development Tools
- Visual Studio Code
- Git
- GitHub

## 🏗️ Project Architecture

MentorMatch follows a client-server architecture.

- Frontend: Handles user interface and interactions.
- Backend: Manages business logic, authentication, and APIs.
- Database: Stores users, mentor profiles, availability, and bookings.

## 📂 Project Modules

- Authentication Module
- Student Management
- Mentor Management
- Mentor Availability Management
- Booking Management
- Meeting Link Generation
- Role-Based Authorization

## ⚙️ Backend Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
```

### 2. Navigate to Backend

```bash
cd backend
```

### 3. Create Virtual Environment

```bash
python -m venv venv
```

### 4. Activate Virtual Environment

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Configure Environment Variables

Configure your PostgreSQL database credentials and Django environment settings.

### 7. Run Migrations

```bash
python manage.py migrate
```

### 8. Start Development Server

```bash
python manage.py runserver
```

Backend API will be available at:

```text
http://127.0.0.1:8000/
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register/ | User Registration |
| POST | /api/auth/login/ | User Login |
| GET | /api/auth/mentors/ | View Mentors |
| POST | /api/bookings/ | Create Booking |
| GET | /api/bookings/ | View Bookings |
| GET | /api/bookings/{id}/ | Booking Details |
| PATCH | /api/bookings/{id}/status/ | Update Booking Status |

## 🗄️ Database

PostgreSQL is used as the primary database.

Main database entities include:

- User
- UserProfile
- StudentProfile
- MentorProfile
- MentorAvailability
- Booking

## 🔐 Security

- JWT-based authentication
- Role-based permissions
- API request validation
- Booking ownership validation
- Duplicate booking prevention
- Mentor availability validation

## 🎯 Project Objectives

- Make technical mentorship accessible to students.
- Simplify mentor discovery and session booking.
- Prevent scheduling conflicts and double bookings.
- Improve interview preparation through mock interviews.
- Provide a structured mentorship management system.

## 👨‍💻 Developer

**Dhrubo Jyoti Roy Shaown**

B.Sc. in Computer Science & Engineering

**Project:** MentorMatch – 1:1 Tech Mentorship & Mock Interview Platform

## 📌 Project Status

Under Development

---

⭐ If you find this project interesting, feel free to explore the repository.
