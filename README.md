# SecureOps Platform

A modern web-based security operations management platform designed to help security teams organize operations, manage workflows, and centralize security-related information in one place.

> **Status:** Active development

## Overview

SecureOps is a full-stack web application developed as an MVP for a security company. It provides a clean operational interface and a foundation for authentication, user management, security workflows, and future operational modules.

The project uses a Next.js frontend and a Node.js/Express backend, with Prisma and PostgreSQL forming the data layer.

## Key Features

- Responsive web interface
- User authentication workflow
- Login and account-recovery screens
- OTP verification flow
- Password-reset workflow
- REST API integration
- Prisma ORM and PostgreSQL database integration
- Modular backend architecture
- CORS and JSON API configuration

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript
- REST APIs

### Database
- PostgreSQL
- Prisma ORM

### Development
- Git / GitHub
- npm
- Vercel-compatible Next.js deployment

## Project Structure

```text
secureops-platform/
├── frontend/       # Next.js / React application
└── backend/        # Node.js / Express API
```

The backend is organized around controllers, routes, middleware, services, configuration and utilities to keep application responsibilities separated and maintainable.

## Authentication Flow

```text
Login
  ↓
OTP Verification
  ↓
Reset Password (when required)
```

The frontend includes account-recovery screens supporting password-reset workflows.

## Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Next.js development server normally runs at `http://localhost:3000`.

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on the port configured by the application environment.

### Environment Variables

Create the required `.env` configuration for the frontend and backend, including database and authentication settings required by your environment.

**Never commit secrets, API keys, database credentials, or production environment variables to GitHub.**

## Development Status

SecureOps is an evolving project. Current development includes strengthening authentication, database integration, backend services, and the operational modules required for a production-ready security management platform.

## Why I Built It

SecureOps was created to explore how modern web technologies can solve practical operational problems for security companies. The project brings together frontend engineering, backend API development, database design, authentication workflows, and product-focused UI development in one application.

## Author

**Eugene Kinyangi**  
Software Developer | Computer Science | Web Development | AI & Data

GitHub: https://github.com/EugeneCodes254

## License

This project is currently a personal/client-oriented development project. Licensing and production usage terms will be defined as the project evolves.
