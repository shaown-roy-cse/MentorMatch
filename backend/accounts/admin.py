
from django.contrib import admin
from .models import (
    UserProfile,
    StudentProfile,
    MentorProfile,
    MentorAvailability,
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'university', 'education_level')
    search_fields = ('user__username', 'university')


@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'expertise', 'experience_years')
    search_fields = ('user__username', 'expertise')


@admin.register(MentorAvailability)
class MentorAvailabilityAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'mentor', 'date',
        'start_time', 'end_time', 'is_available'
    )
    list_filter = ('date', 'is_available')
    search_fields = ('mentor__user__username',)
