
from django.db import models


# ==================================
# Mentor Session Fee Model
# ==================================

class MentorSessionFee(models.Model):

    mentor = models.OneToOneField(
        'accounts.MentorProfile',
        on_delete=models.CASCADE,
        related_name='session_fee'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    currency = models.CharField(
        max_length=3,
        default='BDT'
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.mentor.user.username} - "
            f"{self.amount} {self.currency}"
        )


# ==================================
# Payment Model
# ==================================

class Payment(models.Model):

    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.PROTECT,
        related_name='payments'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    currency = models.CharField(
        max_length=3,
        default='BDT'
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True
    )

    validation_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    bank_transaction_id = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    payment_method = models.CharField(
        max_length=50,
        default='sslcommerz'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='initiated'
    )

    gateway_response = models.JSONField(
        default=dict,
        blank=True
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.transaction_id} - "
            f"{self.amount} {self.currency} - "
            f"{self.status}"
        )
