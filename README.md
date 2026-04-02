# Faculty Activity Tracker

A full-stack application designed to track and manage faculty activities, performance metrics, and Academic Performance Index (API) scores.

## Project Structure

The project is divided into two main directories:
- `backend/`: Node.js, Express, PostgreSQL application.
- `frontend/`: React single-page application built with Vite.

## Tech Stack

### Backend
- **Framework**: Node.js & Express
- **Database**: PostgreSQL (`pg`)
- **Authentication**: JSON Web Token (`jsonwebtoken`), Bcrypt (`bcryptjs`)
- **Utilities**: `multer` (file uploads), `nodemailer` (emails), `csv-parse` (data seeding)

### Frontend
- **Framework**: React 19 & Vite
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **API Client**: Axios

---

## Installation Tips

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database installed and running locally or in the cloud.

### 1. Setting up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `backend` directory and add your configuration details. Example:
   ```env
   # Database Configuration
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=faculty_tracker

   # JWT Secret for authentication
   JWT_SECRET=your_super_secret_key

   # SMTP Configuration for Email setup (Nodemailer)
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```
4. Start the backend server (using nodemon for development):
   ```bash
   npx nodemon server.js
   ```

### 2. Setting up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

---

