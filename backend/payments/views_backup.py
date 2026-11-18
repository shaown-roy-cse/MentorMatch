
import uuid

from django.utils import timezone
from django.db import transaction

from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MentorSessionFee, Payment
from .serializers import (
    MentorSessionFeeSerializer,
    PaymentSerializer
)
from bookings.models import Booking


# ==================================
# Mentor Session Fee API
# ==================================

class MentorSessionFeeView(generics.RetrieveUpdateAPIView):

    serializer_class = MentorSessionFeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):

        user = self.request.user

        if not hasattr(user, 'profile'):
            raise PermissionDenied("User profile not found.")

        if user.profile.role != 'mentor':
            raise PermissionDenied(
                "Only mentors can manage their session fee."
            )

        if not hasattr(user, 'mentor_profile'):
            raise PermissionDenied("Mentor profile not found.")

        fee, created = MentorSessionFee.objects.get_or_create(
            mentor=user.mentor_profile,
            defaults={
                'amount': 0,
                'currency': 'BDT'
            }
        )

        return fee


# ==================================
# Create Mock bKash Payment
# ==================================

class CreateMockPaymentView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        booking_id = request.data.get('booking')

        if not booking_id:
            return Response(
                {'error': 'Booking ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking = Booking.objects.select_for_update().get(
                id=booking_id,
                student=request.user
            )

        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if booking.status != 'pending':
            return Response(
                {'error': 'Only pending bookings can be paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Payment.objects.filter(
            booking=booking,
            status='success'
        ).exists():

            return Response(
                {'error': 'This booking has already been paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        fee = MentorSessionFee.objects.filter(
            mentor__user=booking.mentor
        ).first()

        if not fee or fee.amount <= 0:
            return Response(
                {'error': 'Mentor session fee is not configured.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment = Payment.objects.create(
            booking=booking,
            amount=fee.amount,
            currency=fee.currency,
            transaction_id=f"MM-{uuid.uuid4().hex[:12].upper()}",
            payment_method='mock_bkash',
            status='pending'
        )

        return Response(
            {
                'message': 'Mock bKash payment initialized.',
                'payment': PaymentSerializer(payment).data
            },
            status=status.HTTP_201_CREATED
        )


# ==================================
# Confirm Mock bKash Payment
# ==================================

class ConfirmMockPaymentView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, payment_id):

        try:
            payment = Payment.objects.select_for_update().select_related(
                'booking'
            ).get(
                id=payment_id,
                booking__student=request.user
            )

        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.status != 'pending':
            return Response(
                {'error': 'Payment is not pending.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.data.get('action') != 'success':
            return Response(
                {'error': 'Invalid payment action.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.status = 'success'
        payment.paid_at = timezone.now()
        payment.gateway_response = {
            'gateway': 'MOCK_BKASH',
            'result': 'SUCCESS',
            'demo': True
        }

        payment.save()

        booking = payment.booking
        booking.status = 'confirmed'
        booking.save(update_fields=['status'])

        return Response(
            {
                'message': 'Mock bKash payment successful.',
                'payment': PaymentSerializer(payment).data,
                'booking_status': booking.status
            },
            status=status.HTTP_200_OK
        )
