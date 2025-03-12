from django.contrib import admin
from .models import Customer, Barber, Service, Appointment, Queue

admin.site.register(Customer)
admin.site.register(Barber)
admin.site.register(Service)
admin.site.register(Appointment)
admin.site.register(Queue)