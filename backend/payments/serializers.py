
from rest_framework import serializers
from .models import MentorSessionFee, Payment


# ==================================
# Mentor Session Fee Serializer
# ==================================

class MentorSessionFeeSerializer(serializers.ModelSerializer):

    mentor_username = serializers.CharField(
        source='mentor.user.username',
        read_only=True
    )

    class Meta:
        model = MentorSessionFee

        fields = [
            'id',
            'mentor',
            'mentor_username',
            'amount',
            'currency',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'mentor',
            'mentor_username',
            'updated_at',
        ]

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Session fee must be greater than 0."
            )

        return value


# ==================================
# Payment Serializer
# ==================================

class PaymentSerializer(serializers.ModelSerializer):

    mentor_username = serializers.CharField(
        source='booking.mentor.username',
        read_only=True
    )

    class Meta:
        model = Payment

        fields = [
            'id',
            'booking',
            'mentor_username',
            'amount',
            'currency',
            'transaction_id',
            'payment_method',
            'status',
            'paid_at',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'amount',
            'currency',
            'transaction_id',
            'payment_method',
            'status',
            'paid_at',
            'created_at',
        ]
