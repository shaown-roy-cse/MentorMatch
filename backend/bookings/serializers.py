
from rest_framework import serializers

from accounts.models import MentorAvailability, MentorProfile
from .models import Booking


class MentorProfilePrimaryKeyField(serializers.PrimaryKeyRelatedField):

    queryset = MentorProfile.objects.all()

    def use_pk_only_optimization(self):
        return False

    def to_internal_value(self, data):
        mentor_profile = super().to_internal_value(data)
        return mentor_profile.user

    def to_representation(self, value):
        return value.mentor_profile.id


class BookingSerializer(serializers.ModelSerializer):

    student = serializers.ReadOnlyField(
        source='student.username'
    )

    mentor_username = serializers.ReadOnlyField(
        source='mentor.username'
    )

    mentor = MentorProfilePrimaryKeyField()

    class Meta:
        model = Booking

        fields = [
            'id',
            'student',
            'mentor',
            'mentor_username',
            'date',
            'start_time',
            'end_time',
            'status',
            'meeting_link',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'student',
            'status',
            'meeting_link',
            'created_at',
        ]

    def validate(self, attrs):

        mentor = attrs.get(
            'mentor',
            self.instance.mentor if self.instance else None
        )

        date = attrs.get(
            'date',
            self.instance.date if self.instance else None
        )

        start_time = attrs.get(
            'start_time',
            self.instance.start_time if self.instance else None
        )

        end_time = attrs.get(
            'end_time',
            self.instance.end_time if self.instance else None
        )

        # 1. Validate session time
        if start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })

        request = self.context.get('request')

        # 2. Prevent self booking
        if request and mentor == request.user:
            raise serializers.ValidationError({
                'mentor': 'You cannot book yourself.'
            })

        # 3. Check mentor availability
        available_slot = MentorAvailability.objects.filter(
            mentor__user=mentor,
            date=date,
            is_available=True,
            start_time__lte=start_time,
            end_time__gte=end_time
        ).exists()

        if not available_slot:
            raise serializers.ValidationError({
                'detail': 'Mentor is not available during this time.'
            })

        # 4. Find existing bookings
        existing_bookings = Booking.objects.filter(
            mentor=mentor,
            date=date,
            status__in=['pending', 'confirmed']
        )

        # 5. Exclude current booking during update
        if self.instance:
            existing_bookings = existing_bookings.exclude(
                pk=self.instance.pk
            )

        # 6. Prevent overlapping bookings
        overlapping = existing_bookings.filter(
            start_time__lt=end_time,
            end_time__gt=start_time
        )

        if overlapping.exists():
            raise serializers.ValidationError({
                'detail': 'This mentor is already booked during this time.'
            })

        return attrs
