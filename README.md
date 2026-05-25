# Hotel-Booking Website - Full-Stack MERN Application

A comprehensive hotel booking platform built with MERN stack, featuring user authentication, hotel management, room bookings, and admin capabilities.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [License](#license)

## Features

### User Features
- **Authentication**: Secure signup and login using JWT tokens
- **Hotel Discovery**: Search and filter hotels by location
- **Hotel Details**: View detailed hotel information including images, amenities, and reviews
- **Room Booking**: Book rooms with date selection and guest count
- **Booking Management**: View, cancel, or modify bookings
- **Profile Management**: Manage user profile and booking history

### Admin Features
- **Dashboard**: Overview of bookings, rooms, and users
- **Hotel Management**: Add, edit, delete hotels and rooms
- **Booking Management**: Approve, reject, or manage all bookings
- **User Management**: View and manage all registered users

## Tech Stack

### Frontend
- **React**: UI library for building user interfaces
- **React Router**: For client-side routing
- **Redux Toolkit**: State management
- **Axios**: HTTP client
- **Material UI**: UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Formik & Yup**: Form handling and validation
- **Chart.js**: Data visualization

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM (Object Data Modeling)
- **JWT (JSON Web Tokens)**: Authentication
- **Bcrypt**: Password hashing
- **Multer**: File uploads (for hotel images)
- **dotenv**: Environment variable management

## Prerequisites

- **Node.js** (v14.0.0 or higher)
- **npm** (Node Package Manager) or **Yarn**
- **MongoDB** (local or MongoDB Atlas)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Hotel-booking-webiste
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Running the Application

### Backend
```bash
cd backend
npm start
```
The backend server will start on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm start
```
The frontend application will start on `http://localhost:3000`

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Database Setup

**Option 1: Local MongoDB**
- Ensure MongoDB is installed and running
- The default connection string is `mongodb://localhost:27017/hotelbooking`
- To change, update `mongoURI` in `backend/config/db.js`

**Option 2: MongoDB Atlas (Cloud)**
1. Create a MongoDB Atlas account and database
2. Get your connection string from Atlas dashboard
3. Update `mongoURI` in `backend/config/db.js`:
   ```javascript
   const mongoURI = 'mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority';
   ```

## Project Structure

```
Hotel-booking-webiste/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Utility functions
│   ├── uploads/          # Uploaded hotel images
│   ├── server.js         # Express server entry point
│   ├── package.json
│   └── .env              # Environment variables (create this)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   ├── Auth/     # Login/Signup components
│   │   │   ├── Admin/    # Admin dashboard components
│   │   │   ├── Common/   # Reusable components
│   │   │   └── Hotel/    # Hotel listing and booking components
│   │   ├── features/     # Feature-specific components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store configuration
│   │   ├── api/          # API service
│   │   ├── App.js        # Main application component
│   │   ├── index.js      # Entry point
│   │   └── index.css     # Global styles
│   ├── package.json
│   └── .env              # Environment variables (create this)
│
└── README.md
```

## Environment Variables

Create a `.env` file in both `backend` and `frontend` directories with the following variables:

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hotelbooking
JWT_SECRET=your_jwt_secret_key
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get token
- `GET /api/auth/profile` - Get user profile

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create a new hotel (admin)
- `PUT /api/hotels/:id` - Update hotel (admin)
- `DELETE /api/hotels/:id` - Delete hotel (admin)

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/all` - Get all bookings (admin)
- `PUT /api/bookings/:id` - Update booking status (admin)
- `DELETE /api/bookings/:id` - Cancel booking

## Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Hotel Details
![Hotel Details](screenshots/hotel_details.png)

### Booking Confirmation
![Booking Confirmation](screenshots/booking.png)

### User Dashboard
![User Dashboard](screenshots/user_dashboard.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin_dashboard.png)

### Admin Hotel Management
![Admin Hotel Management](screenshots/admin_hotels.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue in the repository.