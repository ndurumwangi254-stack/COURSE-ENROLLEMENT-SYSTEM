from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Profile


class RegisterResource(Resource):
    def post(self):
        data = request.get_json()
        if not data:
            return {"message": "Missing JSON body"}, 400

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "student")

        if not all([username, email, password]):
            return {"message": "username, email, and password are required"}, 400

        existing = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing:
            return {"message": "User already exists"}, 400

        user = User(username=username, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        profile = Profile(full_name=data.get("full_name", username), bio=data.get("bio", ""), user_id=user.id)
        db.session.add(profile)
        db.session.commit()

        return {"message": "User registered", "user": user.to_dict()}, 201


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return {"message": "Invalid credentials"}, 401

        token = create_access_token(identity=str(user.id))
        return {"access_token": token, "user": user.to_dict()}, 200


class MeResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        return {"user": user.to_dict()}, 200
