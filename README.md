# Course Enrollment System

A full-stack course enrollment app built with Flask + Flask-RESTful + SQLAlchemy on the backend and React + Vite on the frontend.

## Features
- JWT-based authentication and role-based access
- 1:1 user profile relationship
- 1:many teacher-to-course relationship
- many-to-many enrollments with grade data
- pagination on list endpoints
- deep querying for course stats and enrolled students
- migrations and seed data

## Backend setup
1. cd backend
2. pip install -r requirements.txt
3. python -m flask --app app db upgrade
4. python seed.py
5. python app.py

## Frontend setup
1. cd frontend
2. npm install
3. npm run dev

## API highlights
- POST /register
- POST /login
- GET /me
- GET /courses
- POST /courses
- GET /courses/<id>
- PUT /courses/<id>
- DELETE /courses/<id>
- GET /courses/<id>/students
- GET /courses/<id>/stats
- GET /enrollments
- POST /enrollments
- PUT /enrollments/<id>
- DELETE /enrollments/<id>
