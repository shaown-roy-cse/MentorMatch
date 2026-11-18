
from django.db import models
from django.conf import settings

from bookings.models import Booking


class Notification(models.Model):

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=50,
        default='general'
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

        constraints = [
            models.UniqueConstraint(
                fields=[
                    'booking',
                    'recipient',
                    'notification_type'
                ],
                name='unique_booking_notification'
            )
        ]

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"
