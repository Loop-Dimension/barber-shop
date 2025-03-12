from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Queue
from .serializers import QueueSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def create_queue_entry(request):
    """
    POST /api/queue
    Expects: { "name": "John Doe", "status": "pending" } # status optional
    """
    data = request.data
    name = data.get('name', '').strip()
    if not name:
        return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    valid_statuses = ["pending", "canceled", "completed"]
    status_value = data.get('status', 'pending')
    if status_value not in valid_statuses:
        status_value = 'pending'
    
    queue_entry = Queue.objects.create(
        name=name,
        status=status_value
    )
    
    # Compute position if status is pending
    position = 0
    if queue_entry.status == 'pending':
        pending_entries = Queue.objects.filter(status='pending').order_by('created_at')
        # position is index in the sorted list
        for idx, entry in enumerate(pending_entries, start=1):
            if entry.id == queue_entry.id:
                position = idx
                break
    
    return Response({"id": queue_entry.id, "position": position}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_queue_entries(request):
    """
    GET /api/queue
    Returns all queue entries, with positions computed for 'pending' ones.
    """
    all_entries = Queue.objects.all()
    pending_entries = []
    other_entries = []

    for entry in all_entries:
        if entry.status == 'pending':
            pending_entries.append(entry)
        else:
            other_entries.append(entry)
    
    # Sort pending by created_at
    pending_entries.sort(key=lambda x: x.created_at)
    
    # Assign positions
    pending_serialized = []
    for idx, entry in enumerate(pending_entries, start=1):
        ser = QueueSerializer(entry).data
        ser['position'] = idx
        pending_serialized.append(ser)
    
    # For non-pending, position = 0
    other_serialized = []
    for entry in other_entries:
        ser = QueueSerializer(entry).data
        ser['position'] = 0
        other_serialized.append(ser)
    
    # Combine
    combined = pending_serialized + other_serialized
    return Response(combined, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_queue_position_by_id(request, queueid):
    """
    GET /api/queue/search/<queueid>
    """
    try:
        queue_entry = Queue.objects.get(id=queueid)
    except Queue.DoesNotExist:
        return Response({"error": "Queue entry not found"}, status=status.HTTP_404_NOT_FOUND)
    
    position = 0
    if queue_entry.status == 'pending':
        pending_entries = Queue.objects.filter(status='pending').order_by('created_at')
        for idx, entry in enumerate(pending_entries, start=1):
            if entry.id == queue_entry.id:
                position = idx
                break
    return Response({"id": queue_entry.id, "position": position}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def remove_from_queue(request, queue_id):
    """
    DELETE /api/queue/<id>
    """
    try:
        queue_entry = Queue.objects.get(id=queue_id)
        queue_entry.delete()
        return Response({"message": "Queue entry removed"}, status=status.HTTP_200_OK)
    except Queue.DoesNotExist:
        return Response({"error": "Queue entry not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def complete_queue_entry(request, queue_id):
    """
    POST /api/queue/complete/<id>
    """
    try:
        queue_entry = Queue.objects.get(id=queue_id)
        queue_entry.status = 'completed'
        queue_entry.save()
        return Response({"message": "Queue entry completed"}, status=status.HTTP_200_OK)
    except Queue.DoesNotExist:
        return Response({"error": "Queue entry not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_queue_entry(request, queue_id):
    """
    POST /api/queue/cancel/<id>
    """
    try:
        queue_entry = Queue.objects.get(id=queue_id)
        queue_entry.status = 'canceled'
        queue_entry.save()
        return Response({"message": "Queue entry canceled"}, status=status.HTTP_200_OK)
    except Queue.DoesNotExist:
        return Response({"error": "Queue entry not found"}, status=status.HTTP_404_NOT_FOUND)
