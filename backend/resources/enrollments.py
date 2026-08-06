from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Enrollment, Course, User


class EnrollmentListResource(Resource):
    @jwt_required()
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        query = Enrollment.query

        if user.role == "student":
            query = query.filter(Enrollment.student_id == user.id)
        elif request.args.get("student_id"):
            query = query.filter(Enrollment.student_id == request.args.get("student_id", type=int))

        if request.args.get("course_id"):
            query = query.filter(Enrollment.course_id == request.args.get("course_id", type=int))

        pagination = query.order_by(Enrollment.id.asc()).paginate(page=page, per_page=per_page, error_out=False)
        return {
            "enrollments": [e.to_dict() for e in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_pages": pagination.pages,
        }, 200

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        course = Course.query.get_or_404(data["course_id"])

        if user.role != "student" and user.role != "admin":
            return {"message": "Only students can enroll"}, 403

        existing = Enrollment.query.filter_by(student_id=user.id, course_id=course.id).first()
        if existing:
            return {"message": "Already enrolled"}, 400

        enrollment = Enrollment(student_id=user.id, course_id=course.id, grade=data.get("grade"))
        db.session.add(enrollment)
        db.session.commit()
        return enrollment.to_dict(), 201


class EnrollmentDetailResource(Resource):
    @jwt_required()
    def put(self, enrollment_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        enrollment = Enrollment.query.get_or_404(enrollment_id)
        if user.id != enrollment.student_id and user.role != "admin":
            return {"message": "Not authorized"}, 403

        data = request.get_json()
        if data.get("course_id") is not None:
            new_course = Course.query.get_or_404(data["course_id"])
            if Enrollment.query.filter_by(student_id=enrollment.student_id, course_id=new_course.id).first():
                return {"message": "Already enrolled in that course"}, 400
            enrollment.course_id = new_course.id

        enrollment.grade = data.get("grade", enrollment.grade)
        db.session.commit()
        return enrollment.to_dict(), 200

    @jwt_required()
    def delete(self, enrollment_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        enrollment = Enrollment.query.get_or_404(enrollment_id)
        if user.id != enrollment.student_id and user.role != "admin":
            return {"message": "Not authorized"}, 403

        db.session.delete(enrollment)
        db.session.commit()
        return {"message": "Enrollment deleted"}, 200
