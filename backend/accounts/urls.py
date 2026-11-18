
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    CustomLoginView,
    ForgotPasswordView,
    ResetPasswordView,
    StudentProfileView,
    MentorProfileListCreateView,
    MentorProfileDetailView,
    PublicMentorListView,
    MentorAvailabilityListCreateView,
    MentorAvailabilityDetailView,
    mentor_available_slots,
    admin_dashboard_stats,
    admin_user_list,
)


urlpatterns = [

    # Authentication

    path(
        'register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'login/',
        CustomLoginView.as_view(),
        name='login'
    ),

    path(
        'forgot-password/',
        ForgotPasswordView.as_view(),
        name='forgot-password'
    ),

    path(
        'reset-password/',
        ResetPasswordView.as_view(),
        name='reset-password'
    ),

    path(
        'token/refresh/',
        TokenRefreshView.as_view(),
        name='token-refresh'
    ),


    # Student Profile

    path(
        'student/profile/',
        StudentProfileView.as_view(),
        name='student-profile'
    ),


    # Mentor Profile

    path(
        'mentor/profile/',
        MentorProfileListCreateView.as_view(),
        name='mentor-profile-list-create'
    ),

    path(
        'mentor/profile/<int:pk>/',
        MentorProfileDetailView.as_view(),
        name='mentor-profile-detail'
    ),


    # Public Mentor List

    path(
        'mentors/',
        PublicMentorListView.as_view(),
        name='public-mentor-list'
    ),


    # Mentor Availability

    path(
        'mentor/availability/',
        MentorAvailabilityListCreateView.as_view(),
        name='mentor-availability-list-create'
    ),

    path(
        'mentor/availability/<int:pk>/',
        MentorAvailabilityDetailView.as_view(),
        name='mentor-availability-detail'
    ),


    # Available Slots

    path(
        'mentors/<int:mentor_id>/available-slots/',
        mentor_available_slots,
        name='mentor-available-slots'
    ),


    # Admin Dashboard Statistics

    path(
        'admin/dashboard-stats/',
        admin_dashboard_stats,
        name='admin-dashboard-stats'
    ),


    # Admin User Management

    path(
        'admin/users/',
        admin_user_list,
        name='admin-user-list'
    ),

]
