
from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'student',
        'mentor',
        'date',
        'start_time',
        'end_time',
        'status',
    )

    list_filter = ('status', 'date')
    search_fields = (
        'student__username',
        'mentor__username',
    )

    ordering = ('-created_at',)
