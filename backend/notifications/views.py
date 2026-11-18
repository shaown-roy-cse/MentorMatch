
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        )


class MarkNotificationReadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            notification = Notification.objects.get(
                pk=pk,
                recipient=request.user
            )

            notification.is_read = True
            notification.save(update_fields=['is_read'])

            return Response({
                'message': 'Notification marked as read.'
            }, status=status.HTTP_200_OK)

        except Notification.DoesNotExist:

            return Response({
                'error': 'Notification not found.'
            }, status=status.HTTP_404_NOT_FOUND)
