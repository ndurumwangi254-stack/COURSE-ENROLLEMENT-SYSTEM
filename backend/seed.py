from app import app
from models import db, User, Profile, Course, Enrollment
from datetime import datetime


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        admin = User(username="admin", email="admin@example.com", role="admin")
        admin.set_password("password")
        teacher = User(username="tutor", email="tutor@example.com", role="tutor")
        teacher.set_password("password")
        student1 = User(username="student1", email="student1@example.com", role="student")
        student1.set_password("password")
        student2 = User(username="student2", email="student2@example.com", role="student")
        student2.set_password("password")

        db.session.add_all([admin, teacher, student1, student2])
        db.session.flush()

        profile_admin = Profile(full_name="Site Admin", bio="Platform administrator", user_id=admin.id)
        profile_teacher = Profile(full_name="Ms. Rivera", bio="Course tutor", user_id=teacher.id)
        profile_student1 = Profile(full_name="Alicia Gomez", bio="Aspiring developer", user_id=student1.id)
        profile_student2 = Profile(full_name="Ben Carter", bio="Data enthusiast", user_id=student2.id)

        course1 = Course(title="Python Foundations", description="Intro to Python programming", teacher_id=teacher.id)
        course2 = Course(title="Database Design", description="Relational database concepts", teacher_id=teacher.id)

        db.session.add_all([profile_admin, profile_teacher, profile_student1, profile_student2, course1, course2])
        db.session.flush()

        utcnow = datetime.now(datetime.UTC)
        db.session.add_all([
            Enrollment(student_id=student1.id, course_id=course1.id, grade=88.5, enrolled_at=utcnow),
            Enrollment(student_id=student2.id, course_id=course1.id, grade=92.0, enrolled_at=utcnow),
            Enrollment(student_id=student1.id, course_id=course2.id, grade=79.0, enrolled_at=utcnow),
        ])
        db.session.commit()
        print("Seed data created successfully")


if __name__ == "__main__":
    seed()
