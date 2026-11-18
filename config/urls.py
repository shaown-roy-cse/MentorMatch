"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication API
    path('api/auth/', include('accounts.urls')),

    # Booking API
    path('api/bookings/', include('bookings.urls')),

    # Notifications API
    path('api/notifications/', include('notifications.urls')),

    # Payments API
    path('api/payments/', include('payments.urls')),
]