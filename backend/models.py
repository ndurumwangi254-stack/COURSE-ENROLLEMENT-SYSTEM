from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()


class User(db.Model, SerializerMixin):
    __tablename__ = "users"
    serialize_only = ("id", "username", "email", "role")
    serialize_rules = ("profile",)

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="student")

    profile = db.relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    courses_taught = db.relationship("Course", back_populates="teacher", cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Profile(db.Model, SerializerMixin):
    __tablename__ = "profiles"
    serialize_only = ("id", "full_name", "bio", "user_id")

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)

    user = db.relationship("User", back_populates="profile")


class Course(db.Model, SerializerMixin):
    __tablename__ = "courses"
    serialize_only = ("id", "title", "description", "teacher_id", "grade_requirements", "cost", "duration")
    serialize_rules = ("teacher",)

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    grade_requirements = db.Column(db.String(120), nullable=True)
    cost = db.Column(db.Float, nullable=True, default=0.0)
    duration = db.Column(db.String(80), nullable=True)

    teacher = db.relationship("User", back_populates="courses_taught")
    enrollments = db.relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class Enrollment(db.Model, SerializerMixin):
    __tablename__ = "enrollments"
    serialize_only = ("id", "student_id", "course_id", "grade", "enrolled_at")
    serialize_rules = ("student", "course")

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    grade = db.Column(db.Float, nullable=True)
    enrolled_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    student = db.relationship("User", back_populates="enrollments")
    course = db.relationship("Course", back_populates="enrollments")
