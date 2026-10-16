import os
import sys
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Windows compatibility:
# Windows lacks fork(), causing billiard.pool.SpawnPoolWorker to fail with WinError 5 / WinError 6.
# Automatically set worker_pool to 'solo' when running on Windows (sys.platform == 'win32').
# On Linux (including Docker containers), sys.platform is 'linux', so it will use the default prefork pool.
if sys.platform == 'win32':
    app.conf.worker_pool = 'solo'



@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
