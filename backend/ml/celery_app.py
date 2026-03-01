"""
Celery Application for Background Tasks
تطبيق Celery للمهام الخلفية

يدير المهام الخلفية مثل:
- تدريب النماذج
- توليد التوصيات
- تحليل السير الذاتية
- تحديث الميزات
"""

from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv

# تحميل المتغيرات البيئية
load_dotenv()

# إعدادات Redis
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = os.getenv('REDIS_PORT', '6379')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
REDIS_DB = os.getenv('REDIS_DB', '0')

# بناء URL Redis
if REDIS_PASSWORD:
    REDIS_URL = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
else:
    REDIS_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# إنشاء تطبيق Celery
app = Celery(
    'careerak_ml',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        'tasks.recommendation_tasks',
        'tasks.training_tasks',
        'tasks.analysis_tasks',
        'tasks.feature_tasks'
    ]
)

# إعدادات Celery
app.conf.update(
    # إعدادات عامة
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # إعدادات النتائج
    result_expires=3600,  # ساعة واحدة
    result_backend_transport_options={
        'master_name': 'mymaster'
    },
    
    # إعدادات المهام
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 دقيقة
    task_soft_time_limit=25 * 60,  # 25 دقيقة
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    
    # إعدادات إعادة المحاولة
    task_default_retry_delay=60,  # دقيقة واحدة
    task_max_retries=3,
    
    # إعدادات الأولوية
    task_default_priority=5,
    task_inherit_parent_priority=True,
    
    # إعدادات السجلات
    worker_log_format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    worker_task_log_format='[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s(%(task_id)s)] %(message)s',
    
    # إعدادات المراقبة
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# جدولة المهام الدورية
app.conf.beat_schedule = {
    # تحديث التوصيات اليومي
    'update-recommendations-daily': {
        'task': 'tasks.recommendation_tasks.update_all_recommendations',
        'schedule': crontab(hour=2, minute=0),  # 2:00 صباحاً يومياً
        'options': {'priority': 8}
    },
    
    # إعادة تدريب النماذج أسبوعياً
    'retrain-models-weekly': {
        'task': 'tasks.training_tasks.retrain_all_models',
        'schedule': crontab(day_of_week=1, hour=3, minute=0),  # الإثنين 3:00 صباحاً
        'options': {'priority': 9}
    },
    
    # تحديث الميزات كل 6 ساعات
    'update-features-6h': {
        'task': 'tasks.feature_tasks.update_all_features',
        'schedule': crontab(minute=0, hour='*/6'),  # كل 6 ساعات
        'options': {'priority': 6}
    },
    
    # تنظيف الكاش القديم يومياً
    'cleanup-cache-daily': {
        'task': 'tasks.maintenance_tasks.cleanup_old_cache',
        'schedule': crontab(hour=4, minute=0),  # 4:00 صباحاً يومياً
        'options': {'priority': 3}
    },
    
    # تحليل الأداء أسبوعياً
    'analyze-performance-weekly': {
        'task': 'tasks.analysis_tasks.analyze_model_performance',
        'schedule': crontab(day_of_week=0, hour=5, minute=0),  # الأحد 5:00 صباحاً
        'options': {'priority': 7}
    }
}

# معالجات الأحداث
@app.task(bind=True)
def debug_task(self):
    """مهمة تجريبية للتحقق من عمل Celery"""
    print(f'Request: {self.request!r}')
    return 'Celery is working!'

# تكوين قوائم الانتظار
app.conf.task_routes = {
    'tasks.recommendation_tasks.*': {'queue': 'recommendations'},
    'tasks.training_tasks.*': {'queue': 'training'},
    'tasks.analysis_tasks.*': {'queue': 'analysis'},
    'tasks.feature_tasks.*': {'queue': 'features'},
    'tasks.maintenance_tasks.*': {'queue': 'maintenance'}
}

# تكوين الأولويات
app.conf.task_queue_max_priority = 10
app.conf.task_default_priority = 5

if __name__ == '__main__':
    app.start()
