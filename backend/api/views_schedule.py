from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from .models import Barber, Appointment

@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_slots(request, barber_id, date_str):
    """
    GET /api/schedule/<barber_id>/<YYYY-MM-DD>
    """
    try:
        barber = get_object_or_404(Barber, id=barber_id)
    except Barber.DoesNotExist:
        return Response({"error": "Barber not found"}, status=status.HTTP_404_NOT_FOUND)

    # Convert date_str (YYYY-MM-DD) to a date
    try:
        appointment_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

    # Generate all possible slots
    slots = generate_time_slots(
        date_str,
        barber.working_hours_start.strftime("%H:%M"),
        barber.working_hours_end.strftime("%H:%M"),
        barber.slot_duration
    )

    # Get all appointments for that barber on the given date, with status pending or scheduled
    appointments = Appointment.objects.filter(
        barber=barber,
        appointment_date=appointment_date,
        status__in=['pending', 'scheduled']
    )

    # Collect the times (HH:MM) that are booked
    booked_slots = {appt.appointment_time.strftime("%H:%M") for appt in appointments}

    # Filter out the booked slots
    available_slots = [slot for slot in slots if slot not in booked_slots]

    return Response({"availableSlots": available_slots}, status=status.HTTP_200_OK)

def generate_time_slots(date_str, start_time, end_time, slot_duration):
    """
    Generate time slots in HH:MM format from start_time to end_time with the given slot_duration (minutes).
    """
    slots = []
    
    # Convert start_time and end_time (e.g. "09:00") to datetime objects
    start_dt = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
    end_dt = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")

    current = start_dt
    while current < end_dt:
        slot_str = current.strftime("%H:%M")
        slots.append(slot_str)
        current += timedelta(minutes=slot_duration)
    
    return slots