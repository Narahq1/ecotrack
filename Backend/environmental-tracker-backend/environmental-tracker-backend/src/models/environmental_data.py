from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class EnvironmentalData(db.Model):
    __tablename__ = 'environmental_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data_type = db.Column(db.String(50), nullable=False)  # 'co2', 'water', 'waste', 'energy'
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)  # 'kg', 'liters', 'kWh', etc.
    description = db.Column(db.Text)
    date_recorded = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'data_type': self.data_type,
            'value': self.value,
            'unit': self.unit,
            'description': self.description,
            'date_recorded': self.date_recorded.isoformat() if self.date_recorded else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ImpactLimit(db.Model):
    __tablename__ = 'impact_limits'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data_type = db.Column(db.String(50), nullable=False)
    limit_value = db.Column(db.Float, nullable=False)
    period = db.Column(db.String(20), nullable=False)  # 'monthly', 'quarterly', 'yearly'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'data_type': self.data_type,
            'limit_value': self.limit_value,
            'period': self.period,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

