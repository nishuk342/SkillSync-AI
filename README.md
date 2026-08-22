# SkillSync AI

> AI-powered interview preparation and resume optimization platform that
> analyzes a candidate's resume and a target job description to generate
> a personalized interview strategy.

## 🚀 Live Demo

**Frontend:** https://skillsync-ai-delta.vercel.app/

**Backend:** https://skillsync-ai-6d1v.onrender.com/

------------------------------------------------------------------------

## 📌 Overview

SkillSync AI is a full-stack web application designed to help job
seekers prepare for technical interviews.

Users can provide their:

-   Resume
-   Self-description
-   Target job description

The application uses Google's Gemini AI to analyze the candidate's
profile against the target role and generate a personalized interview
preparation report.

The generated report includes:

-   Job match score
-   Technical interview questions
-   Behavioral interview questions
-   Skill gaps
-   Skill-gap severity
-   7-day preparation plan

SkillSync AI also provides AI-powered resume generation tailored to a
specific job description and converts the generated resume into a PDF.

------------------------------------------------------------------------

## ✨ Features

### 🤖 AI-Powered Interview Strategy

The application analyzes the candidate's resume and target job
description using Google Gemini.

It generates:

-   Match score between candidate and job
-   Technical interview questions
-   Behavioral interview questions
-   Recommended answers and interview approach
-   Skill gaps with severity
-   Seven-day preparation plan

### 📄 AI Resume Generator

SkillSync AI can generate a job-specific resume from the candidate's
existing information.

The generated resume is designed to:

-   Highlight relevant skills and experience
-   Match the target job description
-   Remain ATS-friendly
-   Use a clean and professional structure
-   Fit approximately 1--2 pages
-   Be converted into a PDF

### 🔐 Authentication

The application includes:

-   User registration
-   User login
-   JWT authentication
-   HTTP-only cookies
-   Protected routes
-   Logout
-   Token blacklist
-   Current-user authentication

### 📧 Email OTP Verification

During registration, users receive an OTP through email.

The OTP is:

-   Generated on the backend
-   Hashed before being stored
-   Valid only for a limited amount of time
-   Verified before the user completes registration

### 📊 Interview Reports

Generated interview reports are stored in MongoDB.

Users can access their previous interview preparation reports from the
home page.

### 🐳 Docker

The frontend and backend are separately containerized using Docker.

Docker provides a consistent environment for running the application
across development and deployment environments.

### ⚙️ Continuous Integration

GitHub Actions runs CI checks for pull requests targeting the `main`
branch.

The pipeline currently:

1.  Installs backend dependencies
2.  Builds the backend Docker image
3.  Installs frontend dependencies
4.  Builds the frontend
5.  Builds the frontend Docker image

The `main` branch can be protected so that required CI checks must pass
before a pull request can be merged.

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React
-   React Router
-   Axios
-   SCSS
-   Vite

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   bcryptjs
-   Cookie Parser
-   CORS
-   Multer

### AI

-   Google Gemini API
-   `@google/genai`
-   Zod
-   `zod-to-json-schema`

Zod is used to validate structured AI-generated responses before they
are stored in the database.

### PDF Generation

-   Puppeteer
-   PDF parsing libraries

### Email

-   Brevo
-   Email-based OTP verification

### DevOps

-   Docker
-   GitHub Actions
-   Git
-   GitHub

### Deployment

-   Vercel
-   Render
-   MongoDB

------------------------------------------------------------------------

## 🏗️ Project Structure

``` text
SkillSync AI/
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── interview/
│   │   ├── app.routes.jsx
│   │   └── ...
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## 🔄 Application Flow

### Interview Strategy Generation

``` text
User
  │
  ├── Resume
  ├── Self Description
  └── Job Description
          │
          ▼
       Frontend
          │
          ▼
       Backend API
          │
          ▼
     Google Gemini
          │
          ▼
   Structured JSON
          │
          ▼
    Zod Validation
          │
          ▼
       MongoDB
          │
          ▼
   Interview Report
          │
          ▼
       Frontend
```

### Authentication Flow

``` text
Register
   │
   ▼
Create User
   │
   ▼
Generate OTP
   │
   ▼
Send OTP through Email
   │
   ▼
Verify OTP
   │
   ▼
Generate JWT
   │
   ▼
HTTP-only Cookie
   │
   ▼
Authenticated API Requests
```

------------------------------------------------------------------------

## 🧠 AI Response Validation

SkillSync AI uses Zod to validate the generated interview report before
it is stored.

The report contains:

``` text
matchScore
technicalQuestions
behavioralQuestions
skillGaps
preparationPlan
title
```

Technical questions use:

``` javascript
{
  question: "...",
  intention: "...",
  answer: "..."
}
```

Skill gaps use:

``` javascript
{
  skill: "...",
  severity: "low | medium | high"
}
```

Preparation-plan entries use:

``` javascript
{
  day: 1,
  focus: "...",
  tasks: [
    "...",
    "..."
  ]
}
```

------------------------------------------------------------------------

## 📡 API Overview

### Authentication

  Method   Endpoint                 Description
  -------- ------------------------ --------------------------------
  POST     `/api/auth/register`     Register a new user
  POST     `/api/auth/login`        Login
  POST     `/api/auth/verify-otp`   Verify registration OTP
  GET      `/api/auth/get-me`       Get current authenticated user
  GET      `/api/auth/logout`       Logout

### Interview

Interview-related endpoints are available under:

``` text
/api/interview
```

These endpoints handle generating and retrieving personalized interview
reports.

------------------------------------------------------------------------

## ⚙️ Local Development

### Prerequisites

Install:

-   Node.js 20+
-   npm
-   MongoDB
-   Docker
-   Git

You will also need:

-   MongoDB credentials
-   Google Gemini API key
-   Email/Brevo credentials
-   JWT secret

### 1. Clone the Repository

``` bash
git clone https://github.com/nishuk342/SkillSync-AI.git
cd SkillSync-AI
```

### 2. Backend Setup

``` bash
cd backend
npm install
```

Create `backend/.env`:

``` env
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
```

Add the email/Brevo variables required by your email configuration.

Start the backend:

``` bash
npm start
```

Backend:

``` text
http://localhost:5050
```

### 3. Frontend Setup

Open another terminal:

``` bash
cd frontend
npm install
```

If your frontend uses an environment variable for the backend URL:

``` env
VITE_API_URL=http://localhost:5050
```

Start the frontend:

``` bash
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 🐳 Docker

The application is containerized using Docker, with separate containers for the frontend and backend.

Docker Compose is used to run the application services together.

### Start the application with Docker Compose

From the project root:

```bash
docker compose up --build
```

To run the services in the background:

```bash
docker compose up --build -d
```

To stop the services:

```bash
docker compose down
```

The frontend and backend services can then communicate through the Docker Compose network.

------------------------------------------------------------------------

## 🔄 GitHub Actions CI

The CI workflow is located at:

``` text
.github/workflows/ci.yml
```

The workflow runs for pull requests targeting `main`.

### Backend CI

``` text
Checkout Repository
        ↓
Setup Node.js
        ↓
npm ci
        ↓
Docker Build
```

### Frontend CI

``` text
Checkout Repository
        ↓
Setup Node.js
        ↓
npm ci
        ↓
npm run build
        ↓
Docker Build
```

### Pull Request Workflow

``` text
Create Feature Branch
        ↓
Push Changes
        ↓
Create Pull Request
        ↓
GitHub Actions
        ↓
Backend CI + Frontend CI
        ↓
   All Checks Pass?
      ↙       ↘
    Yes        No
     ↓          ↓
  Merge      Fix Code
               ↓
           Push Again
               ↓
          CI Runs Again
```

The `main` branch can be configured with branch protection rules
requiring the CI checks to pass before merging.

------------------------------------------------------------------------

## ☁️ Deployment

### Frontend

The frontend is deployed on Vercel.

``` text
React + Vite
     │
     ▼
   Vercel
```

### Backend

The backend is deployed on Render.

``` text
Node.js + Express
        │
        ▼
      Render
```

MongoDB is used as the application's database.

------------------------------------------------------------------------

## 🔑 Environment Variables

Never commit `.env` files or API keys to GitHub.

### Backend

``` env
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
```

Also configure the email service credentials required by the
application.

### Frontend

If using Vite environment variables:

``` env
VITE_API_URL=https://your-backend-url
```

For production, configure environment variables through the deployment
platform rather than committing them to the repository.

------------------------------------------------------------------------

## 🔒 Security

SkillSync AI uses:

-   Password hashing using bcryptjs
-   JWT-based authentication
-   HTTP-only cookies
-   CORS configuration
-   OTP hashing
-   OTP expiration
-   Token blacklist
-   Protected API routes
-   Environment variables for secrets

Sensitive credentials should not be committed to source control.

------------------------------------------------------------------------

## 🧪 Testing the CI Pipeline

1.  Create a feature branch:

``` bash
git checkout -b test-ci
```

2.  Make a change.

3.  Commit:

``` bash
git add .
git commit -m "Test CI workflow"
```

4.  Push:

``` bash
git push -u origin test-ci
```

5.  Create a pull request:

``` text
test-ci → main
```

6.  GitHub Actions runs the CI checks.

7.  If a check fails, fix the issue and push another commit to the same
    branch.

8.  The existing pull request updates automatically and CI runs again.

------------------------------------------------------------------------

## 📈 Future Improvements

- Automated unit and integration tests
- More comprehensive CI checks
- Continuous Deployment through GitHub Actions
- Docker image publishing
- API rate limiting
- Improved error handling
- More detailed interview analytics
- AI-powered mock interviews
- Real-time interview simulation
- Resume ATS scoring
- Role-specific interview simulations

------------------------------------------------------------------------

## 🎯 Learning Outcomes

Building SkillSync AI provided practical experience with:

-   Full-stack MERN development
-   React application development
-   REST API development
-   Authentication and authorization
-   JWT and HTTP-only cookies
-   MongoDB and Mongoose
-   Google Gemini API integration
-   Structured AI responses
-   Zod schema validation
-   PDF generation
-   Docker containerization
-   Git and GitHub
-   GitHub Actions
-   Pull request workflows
-   Branch protection
-   Cloud deployment
-   Vercel
-   Render

------------------------------------------------------------------------

## 👨‍💻 Author

### Nishu Kumar

GitHub: https://github.com/nishuk342

------------------------------------------------------------------------

## ⭐ Project

If you find SkillSync AI useful, consider giving the repository a star.
