from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User


class AdminUserListResource(Resource):
    @jwt_required()
    def get(self):
        current_user = User.query.get_or_404(get_jwt_identity())
        if current_user.role != 'admin':
            return {'message': 'Admin access required'}, 403

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        pagination = User.query.order_by(User.username.asc()).paginate(page=page, per_page=per_page, error_out=False)
        return {
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
        }, 200
