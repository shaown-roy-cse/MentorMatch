
from django.urls import path

from .views import (
    BookingCreateView,
    BookingListView,
    BookingStatusUpdateView,
    AvailableSlotsView,
)

app_name = 'bookings'

urlpatterns = [

    path(
        'create/',
        BookingCreateView.as_view(),
        name='booking-create'
    ),

    path(
        'list/',
        BookingListView.as_view(),
        name='booking-list'
    ),

    path(
        '<int:pk>/status/',
        BookingStatusUpdateView.as_view(),
        name='booking-status-update'
    ),

    path(
        'availability/<int:mentor_id>/',
        AvailableSlotsView.as_view(),
        name='available-slots'
    ),

]