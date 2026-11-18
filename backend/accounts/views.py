
from rest_framework import generics
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    BasePermission
)
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework import status

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import (
    UserProfile,
    MentorProfile,
    MentorAvailability,
    StudentProfile,
)

from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    MentorProfileSerializer,
    MentorAvailabilitySerializer,
    StudentProfileSerializer,
)

from bookings.models import Booking


# ==================================
# MENTOR PERMISSION
# ==================================

class IsMentor(BasePermission):

    def has_permission(self, request, view):

        profile = getattr(request.user, 'profile', None)

        return (
            request.user.is_authenticated
            and profile is not None
            and profile.role == 'mentor'
        )


# ==================================
# STUDENT PERMISSION
# ==================================

class IsStudent(BasePermission):

    def has_permission(self, request, view):

        profile = getattr(request.user, 'profile', None)

        return (
            request.user.is_authenticated
            and profile is not None
            and profile.role == 'student'
        )


# ==================================
# ADMIN PERMISSION
# ==================================

class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        profile = getattr(request.user, 'profile', None)

        return (
            request.user.is_authenticated
            and profile is not None
            and profile.role == 'admin'
        )


# ==================================
# FORGOT PASSWORD
# ==================================

class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email', '').strip().lower()

        if not email:

            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(
            email__iexact=email,
            is_active=True
        ).first()

        if user:

            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = default_token_generator.make_token(user)

            reset_link = (
                f"http://localhost:5173/reset-password/{uid}/{token}"
            )

            print("========== FORGOT PASSWORD ==========")
            print("RESET USER:", user.username)
            print("RESET EMAIL:", user.email)
            print("RESET LINK:", reset_link)
            print("=====================================")

            send_mail(
                subject='MentorMatch Password Reset',
                message=(
                    f"Hello {user.username},\n\n"
                    f"Click the following link to reset your password:\n\n"
                    f"{reset_link}\n\n"
                    f"If you did not request this, ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(
            {
                'message': (
                    'If an account with this email exists, '
                    'a password reset link has been sent.'
                )
            },
            status=status.HTTP_200_OK
        )


# ==================================
# RESET PASSWORD
# ==================================

class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uid or not token or not new_password:

            return Response(
                {'error': 'All fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user_id = force_str(
                urlsafe_base64_decode(uid)
            )

            user = User.objects.get(
                pk=user_id,
                is_active=True
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist
        ):

            print("RESET ERROR: USER NOT FOUND")

            return Response(
                {'error': 'Invalid password reset link.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_valid = default_token_generator.check_token(
            user,
            token
        )

        print("========== PASSWORD RESET DEBUG ==========")
        print("RESET USER:", user.username)
        print("RESET UID:", uid)
        print("TOKEN VALID:", is_valid)
        print("==========================================")

        if not is_valid:

            return Response(
                {'error': 'Invalid or expired reset link.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            validate_password(new_password, user)

        except ValidationError as error:

            return Response(
                {'error': error.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)

        user.save(update_fields=['password'])

        print("PASSWORD RESET SUCCESS:", user.username)

        return Response(
            {
                'message': 'Password reset successful. Please login.'
            },
            status=status.HTTP_200_OK
        )


# ==================================
# ADMIN DASHBOARD STATISTICS
# ==================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard_stats(request):

    total_users = User.objects.count()

    total_students = UserProfile.objects.filter(
        role='student'
    ).count()

    total_mentors = UserProfile.objects.filter(
        role='mentor'
    ).count()

    total_admins = UserProfile.objects.filter(
        role='admin'
    ).count()

    total_bookings = Booking.objects.count()

    pending_bookings = Booking.objects.filter(
        status='pending'
    ).count()

    confirmed_bookings = Booking.objects.filter(
        status='confirmed'
    ).count()

    completed_bookings = Booking.objects.filter(
        status='completed'
    ).count()

    cancelled_bookings = Booking.objects.filter(
        status='cancelled'
    ).count()

    return Response({
        'total_users': total_users,
        'total_students': total_students,
        'total_mentors': total_mentors,
        'total_admins': total_admins,
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'confirmed_bookings': confirmed_bookings,
        'completed_bookings': completed_bookings,
        'cancelled_bookings': cancelled_bookings,
    })


# ==================================
# STUDENT PROFILE
# ==================================

class StudentProfileView(generics.RetrieveUpdateAPIView):

    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_object(self):

        profile, created = StudentProfile.objects.get_or_create(
            user=self.request.user
        )

        return profile


# ==================================
# USER REGISTRATION
# ==================================

class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ==================================
# USER LOGIN
# ==================================

class CustomLoginView(TokenObtainPairView):

    serializer_class = CustomTokenObtainPairSerializer


# ==================================
# MENTOR PROFILE LIST AND CREATE
# ==================================

class MentorProfileListCreateView(generics.ListCreateAPIView):

    serializer_class = MentorProfileSerializer
    permission_classes = [IsAuthenticated, IsMentor]

    def get_queryset(self):

        return MentorProfile.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):

        if MentorProfile.objects.filter(
            user=self.request.user
        ).exists():

            raise PermissionDenied(
                "You already have a mentor profile."
            )

        serializer.save(user=self.request.user)


# ==================================
# MENTOR PROFILE DETAIL
# ==================================

class MentorProfileDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = MentorProfileSerializer
    permission_classes = [IsAuthenticated, IsMentor]

    def get_queryset(self):

        return MentorProfile.objects.filter(
            user=self.request.user
        )


# ==================================
# PUBLIC MENTOR LIST
# ==================================

class PublicMentorListView(generics.ListAPIView):

    serializer_class = MentorProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        return MentorProfile.objects.select_related(
            'user',
            'session_fee'
        ).all()


# ==================================
# MENTOR AVAILABILITY LIST AND CREATE
# ==================================

class MentorAvailabilityListCreateView(generics.ListCreateAPIView):

    serializer_class = MentorAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        profile = getattr(self.request.user, 'profile', None)

        if profile and profile.role == 'mentor':

            return MentorAvailability.objects.filter(
                mentor__user=self.request.user
            )

        return MentorAvailability.objects.filter(
            is_available=True
        )

    def perform_create(self, serializer):

        profile = getattr(self.request.user, 'profile', None)

        if profile is None or profile.role != 'mentor':

            raise PermissionDenied(
                "Only mentors can create availability."
            )

        mentor_profile = MentorProfile.objects.filter(
            user=self.request.user
        ).first()

        if mentor_profile is None:

            raise PermissionDenied(
                "Please create your mentor profile first."
            )

        serializer.save(mentor=mentor_profile)


# ==================================
# MENTOR AVAILABILITY DETAIL
# ==================================

class MentorAvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = MentorAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        profile = getattr(self.request.user, 'profile', None)

        if profile is None or profile.role != 'mentor':

            return MentorAvailability.objects.none()

        return MentorAvailability.objects.filter(
            mentor__user=self.request.user
        )


# ==================================
# MENTOR AVAILABLE SLOTS
# ==================================

@api_view(['GET'])
@permission_classes([AllowAny])
def mentor_available_slots(request, mentor_id):

    date = request.GET.get('date')

    if not date:

        return Response({
            'error': 'Date is required.'
        }, status=400)

    availabilities = MentorAvailability.objects.filter(
        mentor__id=mentor_id,
        date=date,
        is_available=True
    ).order_by('start_time')

    available_slots = []

    for availability in availabilities:

        existing_bookings = Booking.objects.filter(
            mentor=availability.mentor.user,
            date=date,
            status__in=['pending', 'confirmed'],
            start_time__lt=availability.end_time,
            end_time__gt=availability.start_time
        ).order_by('start_time', 'end_time')

        current_start = availability.start_time

        for booking in existing_bookings:

            if current_start < booking.start_time:

                available_slots.append({
                    'id': availability.id,
                    'start_time': current_start.strftime('%H:%M'),
                    'end_time': booking.start_time.strftime('%H:%M')
                })

            if booking.end_time > current_start:

                current_start = booking.end_time

        if current_start < availability.end_time:

            available_slots.append({
                'id': availability.id,
                'start_time': current_start.strftime('%H:%M'),
                'end_time': availability.end_time.strftime('%H:%M')
            })

    return Response({
        'date': date,
        'available_slots': available_slots
    })


# ==================================
# ADMIN USER MANAGEMENT
# ==================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_user_list(request):

    users = User.objects.select_related(
        'profile'
    ).all().order_by('-date_joined')

    user_list = []

    for user in users:

        profile = getattr(user, 'profile', None)

        user_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': profile.role if profile else 'unknown',
            'is_active': user.is_active,
            'date_joined': user.date_joined,
        })

    return Response({
        'total_users': len(user_list),
        'users': user_list
    })
