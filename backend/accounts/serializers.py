
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    UserProfile,
    StudentProfile,
    MentorProfile,
    MentorAvailability,
)

from payments.models import MentorSessionFee


# ==================================
# User Registration Serializer
# ==================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    role = serializers.ChoiceField(
        choices=[
            ('student', 'Student'),
            ('mentor', 'Mentor'),
        ],
        default='student'
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):

        role = validated_data.pop('role', 'student')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        UserProfile.objects.create(
            user=user,
            role=role
        )

        return user

    def to_representation(self, instance):

        data = super().to_representation(instance)
        data['role'] = instance.profile.role

        return data


# ==================================
# Custom JWT Login Serializer
# ==================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token['username'] = user.username
        token['role'] = user.profile.role

        return token


# ==================================
# Mentor Session Fee Serializer
# ==================================

class MentorSessionFeeReadSerializer(serializers.ModelSerializer):

    class Meta:
        model = MentorSessionFee

        fields = [
            'amount',
            'currency',
            'updated_at',
        ]

        read_only_fields = [
            'amount',
            'currency',
            'updated_at',
        ]


# ==================================
# Mentor Profile Serializer
# ==================================

class MentorProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    session_fee = serializers.SerializerMethodField()

    class Meta:
        model = MentorProfile

        fields = [
            'id',
            'user',
            'username',
            'expertise',
            'experience_years',
            'bio',
            'session_fee',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'session_fee',
        ]

    def get_session_fee(self, obj):

        try:

            fee = obj.session_fee

            return MentorSessionFeeReadSerializer(fee).data

        except MentorSessionFee.DoesNotExist:

            return None


# ==================================
# Mentor Availability Serializer
# ==================================

class MentorAvailabilitySerializer(serializers.ModelSerializer):

    mentor_name = serializers.CharField(
        source='mentor.user.username',
        read_only=True
    )

    class Meta:
        model = MentorAvailability

        fields = [
            'id',
            'mentor',
            'mentor_name',
            'date',
            'start_time',
            'end_time',
            'is_available',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'mentor',
            'mentor_name',
            'created_at',
        ]

    def validate(self, attrs):

        date = attrs.get(
            'date',
            getattr(self.instance, 'date', None)
        )

        start_time = attrs.get(
            'start_time',
            getattr(self.instance, 'start_time', None)
        )

        end_time = attrs.get(
            'end_time',
            getattr(self.instance, 'end_time', None)
        )

        if start_time and end_time:

            if start_time >= end_time:

                raise serializers.ValidationError({
                    'end_time': 'End time must be later than start time.'
                })

        if self.instance:

            mentor_profile = self.instance.mentor

        else:

            request = self.context.get('request')

            mentor_profile = None

            if request and request.user.is_authenticated:

                mentor_profile = MentorProfile.objects.filter(
                    user=request.user
                ).first()

        if mentor_profile and date and start_time and end_time:

            overlapping_slots = MentorAvailability.objects.filter(
                mentor=mentor_profile,
                date=date,
                start_time__lt=end_time,
                end_time__gt=start_time
            )

            if self.instance:

                overlapping_slots = overlapping_slots.exclude(
                    pk=self.instance.pk
                )

            if overlapping_slots.exists():

                raise serializers.ValidationError({
                    'non_field_errors': (
                        'This time overlaps with an existing availability.'
                    )
                })

        return attrs


# ==================================
# Student Profile Serializer
# ==================================

class StudentProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = StudentProfile

        fields = [
            'id',
            'username',
            'university',
            'education_level',
            'bio',
        ]

        read_only_fields = [
            'id',
            'username',
        ]
