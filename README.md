# Developer Platform MVP

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

An internal developer platform MVP designed to streamline the software development lifecycle through organized user story management, automated Gherkin specification generation, and centralized task tracking.

## 🌟 Features

- **User Authentication System**
  - Secure login/logout with JWT token-based authentication
  - Protected routes for authenticated users

- **User Story Management**
  - Create, read, update, and delete user stories
  - Automatic Gherkin generation from descriptions using Claude AI
  - Status tracking throughout the development lifecycle
  - User story assignment to team members
  - Filtering stories by status

- **Task Management**
  - Tasks linked to user stories
  - Task assignment and status tracking
  - Task filtering and organization

- **Document Management**
  - Upload and manage documentation related to development work
  - Document validation and organization

- **Dashboard**
  - Overview of current development work
  - Quick access to important items

## 🛠️ Tech Stack

### Backend

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Authentication**: JWT Tokens
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/en/latest/)
- **API Calls**: [aiohttp](https://docs.aiohttp.org/) (for Claude integration)

### Frontend

- **Framework**: [React 18](https://reactjs.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Build Tool**: [Create React App](https://create-react-app.dev/)

### Integrations

- **Claude AI API** (for Gherkin generation)

## 📁 Project Structure

### Backend Structure (FastAPI)

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/              # API endpoint routers
│   │   └── deps.py              # Dependency injections
│   ├── core/                    # Core configuration
│   ├── crud/                    # CRUD operations
│   ├── db/                      # Database setup
│   ├── models/                  # SQLAlchemy models
│   ├── schemas/                 # Pydantic schemas
│   └── services/                # External services (Claude AI)
├── migrations/                  # Alembic migration scripts
├── .env                         # Environment variables
├── alembic.ini                  # Alembic configuration
├── main.py                      # Application entry point
├── requirements.txt             # Dependencies
└── run.py                       # Development server runner
```

### Frontend Structure (React)

```
frontend/
├── public/                      # Static files
├── src/
│   ├── components/              # Reusable UI components
│   ├── context/                 # React context providers
│   ├── pages/                   # Page components
│   ├── services/                # API client services
│   ├── utils/                   # Utility functions
│   ├── App.js                   # Main application component
│   └── index.js                 # Application entry point
├── package.json                 # Dependencies and scripts
└── tailwind.config.js           # TailwindCSS configuration
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL 12+

### Backend Setup

1. **Clone the repository**

2. **Navigate to the backend directory**
   ```bash
   cd dev-platform-mvp/backend
   ```

3. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   Create a `.env` file in the `backend` directory with the following content:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost/dev_platform
   SECRET_KEY=your_secret_key_here
   CLAUDE_API_KEY=your_anthropic_api_key_here  # Optional, for Claude AI integration
   ```

6. **Create the database**
   ```bash
   psql -U postgres
   CREATE DATABASE dev_platform;
   \q
   ```

7. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

8. **Start the backend server**
   ```bash
   python run.py
   ```
   The API will be available at http://localhost:8000

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd dev-platform-mvp/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

## 📚 API Documentation

When the backend server is running, you can access the auto-generated API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## ✨ Key Takeaways From Previous Runs

- Use the configured API service that includes authentication tokens
- Ensure route prefixes are consistent between backend router configuration and frontend API calls
- Either use app-level prefixes only in main.py or router-level prefixes in route files, but not both for the same path segments
- Check all imported models in your application and use the correct schema names
- Create missing constants files or update references to use the correct paths when referencing utility constant files

## 📝 License

This project is intended for internal use only.

## 🤝 Contributing

For contributing to this project, please follow the established Git workflow and coding standards. Contact the project maintainer for more information.
