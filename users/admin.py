from django.contrib import admin
from .models import CandidateProfile,User

# Register your models here.
admin.site.register(CandidateProfile)
admin.site.register(User)