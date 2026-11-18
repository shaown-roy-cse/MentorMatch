
import uuid

from django.db import transaction
from django.utils.dateparse import parse_date

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import MentorAvailability

from .models import Booking
from .serializers import BookingSerializer

from notifications.models import Notification


# ==================================
# CREATE BOOKING
# ==================================

class BookingCreateView(generics.CreateAPIView):

    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        profile = getattr(request.user, 'profile', None)

        if profile is None:
            raise PermissionDenied(
                "User profile not found."
            )

        if profile.role != 'student':
            raise PermissionDenied(
                "Only students can create bookings."
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):

        serializer.save(
            student=self.request.user
        )


# ==================================
# BOOKING LIST
# ==================================

class BookingListView(generics.ListAPIView):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user
        profile = getattr(user, 'profile', None)

        if profile is None:
            raise PermissionDenied(
                "User profile not found."
            )

        if profile.role == 'student':

            return Booking.objects.filter(
                student=user
            ).order_by('-created_at')

        elif profile.role == 'mentor':

            return Booking.objects.filter(
                mentor=user
            ).order_by('-created_at')

        raise PermissionDenied(
            "You do not have permission to view bookings."
        )


# ==================================
# BOOKING STATUS UPDATE
# ==================================

class BookingStatusUpdateView(generics.UpdateAPIView):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    http_method_names = [
        'patch',
        'options',
        'head'
    ]

    def get_queryset(self):

        user = self.request.user

        profile = getattr(
            user,
            'profile',
            None
        )

        if profile is None:
            raise PermissionDenied(
                "User profile not found."
            )

        if profile.role != 'mentor':
            raise PermissionDenied(
                "Only mentors can update booking status."
            )

        return Booking.objects.filter(
            mentor=user
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):

        booking = self.get_object()

        new_status = request.data.get('status')

        # ----------------------------------
        # VALIDATE STATUS
        # ----------------------------------

        allowed_statuses = [
            'confirmed',
            'cancelled',
            'completed'
        ]

        if new_status not in allowed_statuses:

            return Response(
                {
                    'detail': (
                        'Invalid status. Allowed statuses: '
                        'confirmed, cancelled, completed.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        current_status = booking.status

        # ----------------------------------
        # VALIDATE STATUS TRANSITION
        # ----------------------------------

        if current_status == 'pending':

            if new_status not in [
                'confirmed',
                'cancelled'
            ]:

                return Response(
                    {
                        'detail': (
                            'Pending bookings can only be '
                            'confirmed or cancelled.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        elif current_status == 'confirmed':

            if new_status != 'completed':

                return Response(
                    {
                        'detail': (
                            'Confirmed bookings can only '
                            'be marked as completed.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        else:

            return Response(
                {
                    'detail': (
                        'This booking has already been '
                        'completed or cancelled and cannot '
                        'be updated.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------
        # UPDATE BOOKING STATUS
        # ----------------------------------

        booking.status = new_status

        if new_status == 'confirmed':

            meeting_id = uuid.uuid4().hex[:12]

            booking.meeting_link = (
                f'https://meet.jit.si/MentorMatch-{meeting_id}'
            )

        elif new_status == 'cancelled':

            booking.meeting_link = None

        booking.save(
            update_fields=[
                'status',
                'meeting_link'
            ]
        )

        # ----------------------------------
        # CREATE NOTIFICATIONS
        # ----------------------------------

        if new_status == 'confirmed':

            # Student notification

            Notification.objects.get_or_create(
                booking=booking,
                recipient=booking.student,
                notification_type='booking_confirmed',
                defaults={
                    'title': 'Booking Confirmed',
                    'message': (
                        f'Your booking with mentor '
                        f'{booking.mentor.username} '
                        f'has been confirmed.'
                    )
                }
            )

            # Mentor notification

            Notification.objects.get_or_create(
                booking=booking,
                recipient=booking.mentor,
                notification_type='booking_confirmed',
                defaults={
                    'title': 'Booking Confirmation Successful',
                    'message': (
                        f'You have successfully confirmed '
                        f'the booking with student '
                        f'{booking.student.username}.'
                    )
                }
            )

        elif new_status == 'cancelled':

            # Student notification

            Notification.objects.get_or_create(
                booking=booking,
                recipient=booking.student,
                notification_type='booking_cancelled',
                defaults={
                    'title': 'Booking Cancelled',
                    'message': (
                        f'Your booking with mentor '
                        f'{booking.mentor.username} '
                        f'has been cancelled.'
                    )
                }
            )

        elif new_status == 'completed':

            # Student notification

            Notification.objects.get_or_create(
                booking=booking,
                recipient=booking.student,
                notification_type='booking_completed',
                defaults={
                    'title': 'Session Completed',
                    'message': (
                        f'Your mentorship session with '
                        f'mentor {booking.mentor.username} '
                        f'has been marked as completed.'
                    )
                }
            )

            # Mentor notification

            Notification.objects.get_or_create(
                booking=booking,
                recipient=booking.mentor,
                notification_type='booking_completed',
                defaults={
                    'title': 'Session Completed Successfully',
                    'message': (
                        f'Your mentorship session with '
                        f'student {booking.student.username} '
                        f'has been completed successfully.'
                    )
                }
            )

        # ----------------------------------
        # RETURN UPDATED BOOKING
        # ----------------------------------

        return Response(
            BookingSerializer(
                booking,
                context={
                    'request': request
                }
            ).data,
            status=status.HTTP_200_OK
        )


# ==================================
# MENTOR AVAILABLE SLOTS
# ==================================

class AvailableSlotsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, mentor_id):

        date_value = request.query_params.get('date')

        if not date_value:

            return Response(
                {
                    'detail': 'Date is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        selected_date = parse_date(date_value)

        if selected_date is None:

            return Response(
                {
                    'detail': 'Invalid date format.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------
        # GET MENTOR AVAILABILITY
        # ----------------------------------

        availabilities = MentorAvailability.objects.filter(
            mentor__user_id=mentor_id,
            date=selected_date,
            is_available=True
        ).order_by('start_time')

        available_slots = []

        for slot in availabilities:

            # Check existing bookings

            overlapping_booking = Booking.objects.filter(
                mentor_id=mentor_id,
                date=selected_date,
                status__in=[
                    'pending',
                    'confirmed'
                ],
                start_time__lt=slot.end_time,
                end_time__gt=slot.start_time
            ).exists()

            if not overlapping_booking:

                available_slots.append({
                    'id': slot.id,
                    'date': slot.date.isoformat(),
                    'start_time': slot.start_time.strftime('%H:%M:%S'),
                    'end_time': slot.end_time.strftime('%H:%M:%S')
                })

        return Response(
            available_slots,
            status=status.HTTP_200_OK
        )
