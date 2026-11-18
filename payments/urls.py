
from django.urls import path

from .views import (
    MentorSessionFeeView,
    CreateMockPaymentView,
    ConfirmMockPaymentView
)

urlpatterns = [
    # Mentor Session Fee
    path(
        'session-fee/',
        MentorSessionFeeView.as_view(),
        name='mentor-session-fee'
    ),

    # Create Mock bKash Payment
    path(
        'create/',
        CreateMockPaymentView.as_view(),
        name='create-mock-payment'
    ),

    # Confirm Mock bKash Payment
    path(
        'confirm/<int:payment_id>/',
        ConfirmMockPaymentView.as_view(),
        name='confirm-mock-payment'
    ),
]
