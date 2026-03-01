"""
Celery Tasks Package
حزمة مهام Celery

تحتوي على جميع المهام الخلفية للنظام
"""

from .recommendation_tasks import *
from .training_tasks import *
from .analysis_tasks import *
from .feature_tasks import *
from .maintenance_tasks import *

__all__ = [
    'recommendation_tasks',
    'training_tasks',
    'analysis_tasks',
    'feature_tasks',
    'maintenance_tasks'
]
