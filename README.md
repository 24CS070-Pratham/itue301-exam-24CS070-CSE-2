# FitZone Gym & Class Booking System

**FitZone** is a modern full-stack web application designed to replace informal WhatsApp-based gym class bookings with a robust, centralized scheduling platform. It empowers gym members to browse certified trainers, check live availability, reserve workout slots, and manage their booking history. It also provides gym administrators with a dedicated Admin Panel for trainer roster and booking status management.

---

## 🚀 Technology Stack

- **Frontend**: React, React Router v6, React Context API (`useState`, `useContext`), Vanilla CSS (Modern Gym Dark Mode Aesthetic)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: Bearer Token (JWT-based)
- **HTTP Client**: Fetch API
- **Testing**: Postman / Thunder Client / Automated test suite

---

## 📁 Project Structure

```text
d:/exam/
├── .env.example
├── .gitignore
├── README.md
├── backend/
│   ├── models/
│   │   ├── Member.js          # Mongoose Member schema & validation
│   │   ├── Trainer.js         # Mongoose Trainer schema & validation
│   │   └── ClassBooking.js    # Mongoose ClassBooking schema with refs
│   ├── middleware/
│   │   ├── requestLogger.js   # Global logger: [METHOD] [PATH] [STATUS] [TIME ms]
│   │   ├── authGuard.js       # Bearer token validator & req.member injector
│   │   └── errorHandler.js    # Global error handler with clean JSON output
│   ├── routes/
│   │   ├── authRoutes.js      # POST /api/v1/auth/login, register
│   │   ├── trainerRoutes.js   # GET /api/v1/trainers, availability toggle
│   │   └── bookingRoutes.js   # POST /api/v1/bookings, GET /my, PATCH /:id/status
│   ├── seed.js                # Database seeding script for initial data
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── .env                   # Ignored from Git
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── index.css          # Design system & dark mode gym styling
        ├── main.jsx           # React DOM root entry
        ├── App.jsx            # Routing, ProtectedRoute, Suspense/lazy AdminPanel
        ├── context/
        │   └── AuthContext.jsx # Global member, token, role state management
        ├── services/
        │   └── api.js         # Centralized API service with Bearer auth headers
        ├── components/
        │   ├── Navigation.jsx # Reusable navigation bar with active links
        │   ├── ProtectedRoute.jsx # Route protector redirecting to /
        │   ├── TrainerCard.jsx    # Reusable trainer card with availability badge
        │   └── Loading.jsx        # Spinner and Suspense fallback component
        └── pages/
            ├── LoginPage.jsx      # Authentication & demo account switcher
            ├── ClassesPage.jsx    # Trainer browsing, local search, booking form
            ├── MyBookingsPage.jsx # Authenticated member bookings with populate
            └── AdminPanel.jsx     # Lazy-loaded roster & booking manager
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MongoDB instance (Local MongoDB or MongoDB Atlas URI)

---

### 1. MongoDB Configuration
1. Ensure your MongoDB database is running locally on `mongodb://127.0.0.1:27017/fitzone` or prepare your MongoDB Atlas connection string.
2. In the `backend/` directory, create a `.env` file from `.env.example`:
   ```bash
   cp .env.example backend/.env
   ```
3. Set your connection values in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/fitzone
   JWT_SECRET=fitzone_super_secret_jwt_key_2026
   ```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Run the seed script to preload members, trainers, and sample bookings:
   ```bash
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm start
   # or: node server.js
   ```
   The backend server runs on `http://localhost:5000` (API base: `http://localhost:5000/api/v1`).

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
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
4. Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Member** | `john@fitzone.com` | `password123` | Classes, My Bookings, Booking creation |
| **Member** | `emily@fitzone.com` | `password123` | Classes, My Bookings, Booking creation |
| **Admin** | `admin@fitzone.com` | `admin123` | Admin Panel, Roster & Booking Management |

*(Quick-fill demo buttons are also provided directly on the Login Page for convenience).*

---

## 📡 API Endpoints Specification

| Method | Endpoint | Access | Purpose | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates member/admin and returns JWT token | `200 OK` + token, member, role |
| `GET` | `/api/v1/trainers` | Public | Retrieves all trainers with specialization & availability | `200 OK` + trainers array |
| `POST` | `/api/v1/bookings` | Protected (Bearer) | Creates a class booking with Mongoose validation | `201 Created` + booking object |
| `GET` | `/api/v1/bookings/my` | Protected (Bearer) | Retrieves bookings for the logged-in member with populated fields | `200 OK` + populated bookings |
| `PATCH` | `/api/v1/bookings/:id/status` | Protected (Bearer) | Updates booking status (`booked`, `attended`, `cancelled`) | `200 OK` (or `400` on invalid status) |

---

## 🛡️ Middleware Architecture

1. **`requestLogger`**:
   - Registered globally (`app.use(requestLogger)`).
   - Hooked into `res.on('finish')` to accurately calculate request latency and capture final response status codes.
   - Logs: `[METHOD] [PATH] [STATUS] [RESPONSE-TIME ms]`.
2. **`authGuard`**:
   - Inspects the `Authorization` header for `Bearer <token>`.
   - Verifies the cryptographic JWT signature and finds the member record in MongoDB.
   - Injects the authenticated member into `req.member`.
   - Protects `/api/v1/bookings`, `/api/v1/bookings/my`, and `/api/v1/bookings/:id/status`.
3. **`errorHandler`**:
   - The terminal middleware in the Express request pipeline.
   - Catches Mongoose validation errors (`err.name === 'ValidationError'`), duplicate key conflicts, and general errors.
   - Maps errors into structured JSON: `{ success: false, message: "...", errors: [...] }` without leaking stack traces.

---

## 📚 Viva Preparation — Questions & Answers

### 1. Why use Context API/useContext for auth state?
> **Answer**: Authentication state (member profile, JWT token, role) is global and needed across many disparate components (Navbar, ProtectedRoute, ClassesPage, MyBookingsPage, AdminPanel). Context API avoids "prop drilling" (passing props through intermediary components that do not need them) and provides a single, unified source of truth for `login()` and `logout()`.

### 2. How does `ProtectedRoute` work?
> **Answer**: `ProtectedRoute` is a higher-order wrapper component that reads the current `token` from `AuthContext`. If the user is authenticated, it renders the requested component/children. If the user is unauthenticated, it intercepts navigation and performs a declarative redirect (`<Navigate to="/" replace />`) to the login page.

### 3. Difference between state and props?
> **Answer**:
> - **Props** (properties) are read-only inputs passed from a parent component to a child component to configure it (e.g. `<TrainerCard name={...} specialization={...} available={...} />`).
> - **State** is local, mutable data managed internally by the component itself using `useState()`, which triggers a re-render when updated (e.g. `searchTerm`, `selectedTrainer`, `date`).

### 4. Why use `useEffect` for the trainer API call?
> **Answer**: In React, fetching data from an external REST API is a side effect. `useEffect(..., [])` ensures the API request runs once when the component mounts into the DOM, preventing infinite re-rendering loops and correctly synchronizing external backend data with component state.

### 5. Why keep `trainers` and `filteredTrainers` separate conceptually?
> **Answer**: Keeping the master `trainers` array in state and deriving `filteredTrainers` via `trainers.filter(...)` allows instantaneous, zero-latency search filtering without making redundant network calls to the backend. It also preserves the complete dataset so clearing the search bar immediately restores the full list.

### 6. What does Bearer token authentication mean?
> **Answer**: A Bearer token is a security token where possession of the token ("the bearer") grants access to protected resources. The client includes it in the HTTP request header: `Authorization: Bearer <token>`. The server decodes and validates the signature without needing session state stored on the server.

### 7. What does `authGuard` do?
> **Answer**: `authGuard` is Express middleware that checks the incoming request for a valid `Bearer <token>`, verifies the JWT, retrieves the corresponding `Member` record from MongoDB, and attaches it to `req.member`. If the token is missing or invalid, it immediately halts the request and returns `401 Unauthorized`.

### 8. Why use `res.on('finish')` in `requestLogger`?
> **Answer**: In Express middleware, the response has not yet finished when the middleware function is first called. By listening to the `'finish'` event emitted by the Node.js HTTP response stream, the logger accurately records the final HTTP status code and calculates the exact round-trip response time (`Date.now() - startTime`).

### 9. Why does `POST /api/v1/bookings` return 201 instead of 200?
> **Answer**: In REST architectural conventions, HTTP status code `201 Created` specifically signifies that the request succeeded and resulted in the successful creation of a new resource in the database, whereas `200 OK` signifies generic success.

### 10. What does `ref: 'Member'` / `ref: 'Trainer'` mean in Mongoose?
> **Answer**: In Mongoose schemas, `ref` defines a relationship between collections. It tells Mongoose which model to use when resolving `ObjectId` references during query population (`.populate()`), establishing foreign key-like relationships in MongoDB.

### 11. What does `populate()` do?
> **Answer**: `populate()` replaces specified `ObjectId` reference fields in a document with the actual matching document(s) from the referenced collection. For example, `.populate('trainerId', 'name specialization')` replaces `trainerId` with the trainer's `name` and `specialization`.

### 12. How does Mongoose enum validation work?
> **Answer**: Mongoose enum validation enforces that a string field's value must strictly match one of the predefined allowed string values in an array (e.g. `status: { type: String, enum: ['booked', 'attended', 'cancelled'] }`). If an invalid value is supplied, Mongoose throws a `ValidationError` before persisting to MongoDB.

### 13. Why must `errorHandler` be the last middleware?
> **Answer**: Express identifies error-handling middleware by its 4-argument signature `(err, req, res, next)`. It must be mounted after all route handlers and standard middleware so that any error passed via `next(error)` from preceding routes bubbles up directly to this handler for consistent JSON formatting.

### 14. Why use `React.lazy` and `Suspense` for `AdminPanel`?
> **Answer**: `React.lazy()` enables code splitting, meaning the JavaScript bundle for the `AdminPanel` is only downloaded over the network when the user actually navigates to `/admin`. `<Suspense>` provides a seamless fallback UI (such as a loading spinner) while the bundle is being fetched asynchronously.

### 15. Why must `.env` not be committed to Git?
> **Answer**: `.env` files contain sensitive secrets, database connection credentials, and private keys. Committing them to version control creates major security vulnerabilities. A sanitized template `.env.example` is committed instead to document the required environment variable keys.
