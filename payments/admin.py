from django.contrib import admin
from .models import MentorSessionFee, Payment


@admin.register(MentorSessionFee)
class MentorSessionFeeAdmin(admin.ModelAdmin):

    list_display = (
        'mentor',
        'amount',
        'currency',
        'updated_at',
    )

    search_fields = (
        'mentor__user__username',
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        'transaction_id',
        'booking',
        'amount',
        'currency',
        'status',
        'payment_method',
        'created_at',
    )

    list_filter = (
        'status',
        'payment_method',
        'currency',
    )

    search_fields = (
        'transaction_id',
        'booking__student__username',
        'booking__mentor__username',
    )

    readonly_fields = (
        'transaction_id',
        'validation_id',
        'bank_transaction_id',
        'gateway_response',
        'paid_at',
        'created_at',
        'updated_at',
    )