# Developer Platform MVP - Backend

This is the backend for the Developer Platform MVP, built with FastAPI and PostgreSQL.

## Setup Instructions

1. **Install Dependencies**

```bash
# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

2. **Configure PostgreSQL**

Make sure PostgreSQL is installed and running.

```bash
# Create the database
psql -U postgres
CREATE DATABASE dev_platform;
\q
```

Update the database URL in `app/core/config.py` if needed.

3. **Run Migrations**

```bash
# Initialize migrations
alembic upgrade head
```

4. **Create Initial User**

```bash
python -m app.initial_data
```

5. **Run the Application**

```bash
python run.py
```

The API will be available at http://localhost:8000.

## API Documentation

When the server is running, you can access the auto-generated API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

- Authentication system with JWT tokens
- User story management with automatic Gherkin conversion
- Task management linked to user stories
- Documentation management with validation
