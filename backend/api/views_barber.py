from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Barber
from .serializers import BarberSerializer

@api_view(['POST'])
@permission_classes([AllowAny])  # only admin can add
def add_barber(request):
    """
    POST /api/barbers
    Expects: { "name": "...", "experience": 2, "working_hours_start": "09:00", ... }
    """
    serializer = BarberSerializer(data=request.data)
    if serializer.is_valid():
        barber = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_barbers(request):
    """
    GET /api/barbers
    """
    barbers = Barber.objects.all().order_by('created_at')
    serializer = BarberSerializer(barbers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([AllowAny])  # only admin can delete
def delete_barber(request, barber_id):
    """
    DELETE /api/barbers/<barber_id>
    """
    try:
        barber = Barber.objects.get(id=barber_id)
        barber.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Barber.DoesNotExist:
        return Response({"error": "Barber not found"}, status=status.HTTP_404_NOT_FOUND)
