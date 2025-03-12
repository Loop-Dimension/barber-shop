from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Service
from .serializers import ServiceSerializer

@api_view(['POST'])
def create_service(request):
    """
    Create a new Service.
    Expected JSON payload, for example:
    {
      "service_name": "Hair Styling",
      "service_type": "Cut & Style",
      "service_duration": 45,
      "service_price": "29.99"
    }
    """
    serializer = ServiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_services(request):
    """
    Retrieve a list of all Services.
    """
    services = Service.objects.all().order_by('id')
    serializer = ServiceSerializer(services, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_service(request, service_id):
    """
    Delete a Service by its ID.
    """
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
    
    service.delete()
    return Response({"message": "Service deleted successfully"}, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_service(request, service_id):
    """
    Update an existing Service.
    Accepts a partial update.
    """
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ServiceSerializer(service, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
