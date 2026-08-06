from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Profile


def require_admin():
    current_user = User.query.get_or_404(get_jwt_identity())
    if current_user.role != 'admin':
        return None, {'message': 'Admin access required'}, 403
    return current_user, None, None


class AdminUserListResource(Resource):
    @jwt_required()
    def get(self):
        current_user, error, status = require_admin()
        if error:
            return error, status

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        query = User.query.order_by(User.username.asc())
        if request.args.get('role'):
            query = query.filter_by(role=request.args.get('role'))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
        }, 200

    @jwt_required()
    def post(self):
        current_user, error, status = require_admin()
        if error:
            return error, status

        data = request.get_json() or {}
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'tutor')
        full_name = data.get('full_name', username)
        bio = data.get('bio', '')

        if not all([username, email, password]):
            return {'message': 'username, email, and password are required'}, 400
        if role not in ('tutor', 'admin', 'student'):
            return {'message': 'Invalid role'}, 400

        existing = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing:
            return {'message': 'User already exists'}, 400

        user = User(username=username, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        profile = Profile(full_name=full_name, bio=bio, user_id=user.id)
        db.session.add(profile)
        db.session.commit()

        return user.to_dict(), 201


class AdminUserResource(Resource):
    @jwt_required()
    def delete(self, user_id):
        current_user, error, status = require_admin()
        if error:
            return error, status

        user = User.query.get_or_404(user_id)
        if user.id == current_user.id:
            return {'message': 'Cannot delete yourself'}, 400
        if user.role == 'admin':
            return {'message': 'Cannot delete admin users'}, 403

        db.session.delete(user)
        db.session.commit()
        return {'message': 'User deleted'}, 200
