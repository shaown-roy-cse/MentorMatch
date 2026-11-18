from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ('student', 'Student'),
        ('mentor', 'Mentor'),
        ('admin', 'Admin'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# Student Profile
class StudentProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )

    university = models.CharField(
        max_length=200,
        blank=True
    )

    education_level = models.CharField(
        max_length=100,
        blank=True
    )

    bio = models.TextField(
        blank=True
    )

    def __str__(self):
        return f"Student: {self.user.username}"


# Mentor Profile
class MentorProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='mentor_profile'
    )

    expertise = models.CharField(
        max_length=200
    )

    experience_years = models.PositiveIntegerField(
        default=0
    )

    bio = models.TextField(
        blank=True
    )

    def __str__(self):
        return f"Mentor: {self.user.username}"


# Mentor Availability
class MentorAvailability(models.Model):

    mentor = models.ForeignKey(
        MentorProfile,
        on_delete=models.CASCADE,
        related_name='availabilities'
    )

    date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    is_available = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.mentor.user.username} - "
            f"{self.date} ({self.start_time}-{self.end_time})"
        )