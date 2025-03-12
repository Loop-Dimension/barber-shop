from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .models import Appointment, Barber, Service
from .serializers import AppointmentSerializer

# Helper function to calculate position for a given date
def calculate_position(appointment_date):
    # Count how many appointments for that date are in 'pending' status
    return Appointment.objects.filter(
        appointment_date=appointment_date,
        status='pending'
    ).count() + 1

@api_view(['POST'])
@permission_classes([AllowAny])
def create_appointment(request):
    """
    POST /api/appointments
    Expects: {
      "customerName": "...",
      "customerEmail": "...",
      "appointmentTime": "2025-03-12T10:00:00",
      "barberId": 1,
      "service": 1  (service ID)
    }
    """
    data = request.data
    try:
        barber = Barber.objects.get(id=data['barberId'])
    except Barber.DoesNotExist:
        return Response({"error": "Barber not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        service = Service.objects.get(id=data['service'])
    except Service.DoesNotExist:
        service = None  # optional

    appointment_time_str = data['appointmentTime']  # e.g. "2025-03-12T10:00:00"
    # parse the date from that
    dt_obj = datetime.fromisoformat(appointment_time_str)
    appointment_date = dt_obj.date()

    position = calculate_position(appointment_date)
    
    appointment = Appointment.objects.create(
        customer_name=data['customerName'],
        customer_email=data['customerEmail'],
        appointment_time=dt_obj,
        appointment_date=appointment_date,
        barber=barber,
        service=service,
        status='pending',
        position=position
    )
    
    return Response({
        "id": appointment.id,
        "appointmentTime": appointment_time_str,
        "position": position,
        "message": "Appointment created successfully"
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_appointment(request, appointment_id):
    """
    POST /api/appointments/cancel/<id>
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        appointment.status = 'canceled'
        appointment.save()
        return Response({"message": "Appointment canceled successfully"}, status=status.HTTP_200_OK)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def reschedule_appointment(request, appointment_id):
    """
    POST /api/appointments/reschedule/<id>
    Expects: { "newAppointmentTime": "2025-03-12T11:30:00" }
    """
    data = request.data
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)
    
    new_time_str = data['newAppointmentTime']
    dt_obj = datetime.fromisoformat(new_time_str)
    new_date = dt_obj.date()

    new_position = calculate_position(new_date)

    appointment.appointment_time = dt_obj
    appointment.appointment_date = new_date
    appointment.position = new_position
    appointment.save()

    return Response({"message": "Appointment rescheduled successfully"}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def complete_appointment(request, appointment_id):
    """
    POST /api/appointments/complete/<id>
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        appointment.status = 'completed'
        appointment.save()
        return Response({"message": "Appointment marked as completed"}, status=status.HTTP_200_OK)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_appointment(request, appointment_id):
    """
    DELETE /api/appointments/<id>
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        appointment.delete()
        return Response({"message": "Appointment deleted successfully"}, status=status.HTTP_200_OK)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_appointments_by_date(request, date_str):
    """
    GET /api/appointments/<YYYY-MM-DD>
    """
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
    
    appointments = Appointment.objects.filter(appointment_date=date_obj)
    if not appointments.exists():
        return Response({"message": "No appointments found for this date"}, status=status.HTTP_404_NOT_FOUND)

    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
