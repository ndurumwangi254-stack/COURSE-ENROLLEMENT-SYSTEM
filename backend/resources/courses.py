from flask import request
from flask_restful import Resource
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Course, User, Enrollment


class CourseListResource(Resource):
    @jwt_required()
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        query = Course.query.options(joinedload(Course.teacher))

        if request.args.get("teacher_id"):
            query = query.filter(Course.teacher_id == request.args.get("teacher_id", type=int))
        if request.args.get("search"):
            search = request.args.get("search")
            query = query.filter(Course.title.ilike(f"%{search}%"))

        pagination = query.order_by(Course.id.asc()).paginate(page=page, per_page=per_page, error_out=False)
        return {
            "courses": [course.to_dict() for course in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_pages": pagination.pages,
        }, 200

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        if user.role != "teacher" and user.role != "admin":
            return {"message": "Only teachers/admins can create courses"}, 403

        data = request.get_json()
        course = Course(title=data["title"], description=data["description"], teacher_id=user.id)
        db.session.add(course)
        db.session.commit()
        return course.to_dict(), 201


class CourseDetailResource(Resource):
    @jwt_required()
    def get(self, course_id):
        course = Course.query.get_or_404(course_id)
        return course.to_dict(), 200

    @jwt_required()
    def put(self, course_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        course = Course.query.get_or_404(course_id)
        if user.id != course.teacher_id and user.role != "admin":
            return {"message": "Not authorized"}, 403

        data = request.get_json()
        course.title = data.get("title", course.title)
        course.description = data.get("description", course.description)
        db.session.commit()
        return course.to_dict(), 200

    @jwt_required()
    def delete(self, course_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        course = Course.query.get_or_404(course_id)
        if user.id != course.teacher_id and user.role != "admin":
            return {"message": "Not authorized"}, 403

        db.session.delete(course)
        db.session.commit()
        return {"message": "Course deleted"}, 200


class CourseStudentsResource(Resource):
    @jwt_required()
    def get(self, course_id):
        course = Course.query.get_or_404(course_id)
        students = (
            db.session.query(User)
            .join(Enrollment, Enrollment.student_id == User.id)
            .filter(Enrollment.course_id == course_id)
            .order_by(User.username)
            .all()
        )
        return [{"id": s.id, "username": s.username, "email": s.email} for s in students], 200


class CourseStatsResource(Resource):
    @jwt_required()
    def get(self, course_id):
        course = Course.query.get_or_404(course_id)
        stats = (
            db.session.query(
                func.count(Enrollment.id).label("student_count"),
                func.avg(Enrollment.grade).label("average_grade"),
            )
            .filter(Enrollment.course_id == course_id)
            .first()
        )
        return {
            "course_id": course.id,
            "title": course.title,
            "student_count": int(stats.student_count or 0),
            "average_grade": round(float(stats.average_grade or 0), 2),
        }, 200
