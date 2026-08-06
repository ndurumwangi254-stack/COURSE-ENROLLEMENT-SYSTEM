from flask import Flask
from flask_restful import Api
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from resources.auth import RegisterResource, LoginResource, MeResource
from resources.courses import CourseListResource, CourseDetailResource, CourseStudentsResource, CourseStatsResource
from resources.enrollments import EnrollmentListResource, EnrollmentDetailResource
from resources.admin import AdminUserListResource, AdminUserResource


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)
    api = Api(app)

    api.add_resource(RegisterResource, "/register")
    api.add_resource(LoginResource, "/login")
    api.add_resource(MeResource, "/me")
    api.add_resource(CourseListResource, "/courses")
    api.add_resource(CourseDetailResource, "/courses/<int:course_id>")
    api.add_resource(CourseStudentsResource, "/courses/<int:course_id>/students")
    api.add_resource(CourseStatsResource, "/courses/<int:course_id>/stats")
    api.add_resource(EnrollmentListResource, "/enrollments")
    api.add_resource(EnrollmentDetailResource, "/enrollments/<int:enrollment_id>")
    api.add_resource(AdminUserListResource, "/admin/users")
    api.add_resource(AdminUserResource, "/admin/users/<int:user_id>")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, port=5001)
