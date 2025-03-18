from django.urls import path
from .views_auth import signup, login_view, update_profile, check_auth
from .views_barber import add_barber, get_barbers, delete_barber
from .views_queue import (
    create_queue_entry, get_all_queue_entries, get_queue_position_by_id,
    remove_from_queue, complete_queue_entry, cancel_queue_entry
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)
from .views_schedule import get_available_slots
from .views_appointment import (
    create_appointment, cancel_appointment, reschedule_appointment,
    complete_appointment, delete_appointment, get_appointments_by_date, get_single_appointment
)
from .views_service import create_service, get_services, delete_service, update_service

urlpatterns = [
    # Auth
    path('auth/signup/', signup, name='signup'),
    # Login -> obtain token
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Refresh token
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/update/', update_profile, name='update_profile'),
    path('auth/check/', check_auth, name='check_auth'),
    
    # Barber
    path('barbers/add/', add_barber, name='add_barber'),   # POST for adding a barber
    path('barbers/list/', get_barbers, name='get_barbers'), 
    path('barbers/<int:barber_id>/', delete_barber, name='delete_barber'),  # DELETE

    # Queue
    path('queue/', create_queue_entry, name='create_queue_entry'),  # POST
    path('queue/list/', get_all_queue_entries, name='get_all_queue_entries'),  # GET
    path('queue/search/<int:queueid>/', get_queue_position_by_id, name='get_queue_position_by_id'),
    path('queue/complete/<int:queue_id>/', complete_queue_entry, name='complete_queue_entry'),
    path('queue/cancel/<int:queue_id>/', cancel_queue_entry, name='cancel_queue_entry'),
    path('queue/<int:queue_id>/', remove_from_queue, name='remove_from_queue'),

    # Schedule
    path('schedule/<int:barber_id>/<str:date_str>/', get_available_slots, name='get_available_slots'),

    # Appointments
    path('appointments/', create_appointment, name='create_appointment'),  # POST
    # by id
    path('appointments/<int:appointment_id>/', get_single_appointment, name='get_single_appointment'),
    path('appointments/cancel/<int:appointment_id>/', cancel_appointment, name='cancel_appointment'),
    path('appointments/reschedule/<int:appointment_id>/', reschedule_appointment, name='reschedule_appointment'),
    path('appointments/complete/<int:appointment_id>/', complete_appointment, name='complete_appointment'),
    path('appointments/<int:appointment_id>/', delete_appointment, name='delete_appointment'),  # DELETE
    path('appointments/<str:date_str>/', get_appointments_by_date, name='get_appointments_by_date'),  # GET


    #Service
    path('services/', create_service, name='create_service'),  # POST
    path('services/list/', get_services, name='get_services'),  # GET
    path('services/<int:service_id>/', delete_service, name='delete_service'),  # DELETE
    path('services/update/<int:service_id>/', update_service, name='update_service'),  # PUT

]
