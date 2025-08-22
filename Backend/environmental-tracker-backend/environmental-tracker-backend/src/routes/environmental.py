from flask import Blueprint, request, jsonify
from src.models.environmental_data import EnvironmentalData, ImpactLimit, db
from datetime import datetime, timedelta
from sqlalchemy import func

environmental_bp = Blueprint('environmental', __name__)

@environmental_bp.route('/environmental-data', methods=['POST'])
def add_environmental_data():
    try:
        data = request.get_json()
        
        new_data = EnvironmentalData(
            user_id=data.get('user_id', 1),  # Default user for MVP
            data_type=data['data_type'],
            value=float(data['value']),
            unit=data['unit'],
            description=data.get('description', ''),
            date_recorded=datetime.fromisoformat(data['date_recorded']) if data.get('date_recorded') else datetime.utcnow()
        )
        
        db.session.add(new_data)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Dados ambientais adicionados com sucesso',
            'data': new_data.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro ao adicionar dados: {str(e)}'
        }), 400

@environmental_bp.route('/environmental-data', methods=['GET'])
def get_environmental_data():
    try:
        user_id = request.args.get('user_id', 1)
        data_type = request.args.get('data_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = EnvironmentalData.query.filter_by(user_id=user_id)
        
        if data_type:
            query = query.filter_by(data_type=data_type)
            
        if start_date:
            query = query.filter(EnvironmentalData.date_recorded >= datetime.fromisoformat(start_date))
            
        if end_date:
            query = query.filter(EnvironmentalData.date_recorded <= datetime.fromisoformat(end_date))
            
        data = query.order_by(EnvironmentalData.date_recorded.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [item.to_dict() for item in data]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao buscar dados: {str(e)}'
        }), 400

@environmental_bp.route('/environmental-data/summary', methods=['GET'])
def get_data_summary():
    try:
        user_id = request.args.get('user_id', 1)
        period = request.args.get('period', 'monthly')  # monthly, quarterly, yearly
        
        # Calculate date range based on period
        end_date = datetime.utcnow()
        if period == 'monthly':
            start_date = end_date - timedelta(days=30)
        elif period == 'quarterly':
            start_date = end_date - timedelta(days=90)
        else:  # yearly
            start_date = end_date - timedelta(days=365)
        
        # Get summary by data type
        summary = db.session.query(
            EnvironmentalData.data_type,
            func.sum(EnvironmentalData.value).label('total'),
            func.avg(EnvironmentalData.value).label('average'),
            func.count(EnvironmentalData.id).label('count')
        ).filter(
            EnvironmentalData.user_id == user_id,
            EnvironmentalData.date_recorded >= start_date,
            EnvironmentalData.date_recorded <= end_date
        ).group_by(EnvironmentalData.data_type).all()
        
        result = []
        for item in summary:
            result.append({
                'data_type': item.data_type,
                'total': float(item.total) if item.total else 0,
                'average': float(item.average) if item.average else 0,
                'count': item.count
            })
        
        return jsonify({
            'success': True,
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'summary': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao gerar resumo: {str(e)}'
        }), 400

@environmental_bp.route('/impact-limits', methods=['POST'])
def set_impact_limit():
    try:
        data = request.get_json()
        
        # Check if limit already exists
        existing_limit = ImpactLimit.query.filter_by(
            user_id=data.get('user_id', 1),
            data_type=data['data_type'],
            period=data['period']
        ).first()
        
        if existing_limit:
            existing_limit.limit_value = float(data['limit_value'])
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Limite atualizado com sucesso',
                'data': existing_limit.to_dict()
            }), 200
        else:
            new_limit = ImpactLimit(
                user_id=data.get('user_id', 1),
                data_type=data['data_type'],
                limit_value=float(data['limit_value']),
                period=data['period']
            )
            
            db.session.add(new_limit)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Limite definido com sucesso',
                'data': new_limit.to_dict()
            }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro ao definir limite: {str(e)}'
        }), 400

@environmental_bp.route('/impact-limits', methods=['GET'])
def get_impact_limits():
    try:
        user_id = request.args.get('user_id', 1)
        
        limits = ImpactLimit.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'success': True,
            'data': [limit.to_dict() for limit in limits]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao buscar limites: {str(e)}'
        }), 400

