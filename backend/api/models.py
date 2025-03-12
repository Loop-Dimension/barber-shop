from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Customer(models.Model):
    """
    Customer entity, matches your 'customer' details from Firestore.
    In your Node code, you had fields like first_name, last_name, phoneNo, etc.
    We can either extend Django's User or store references here.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_no = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Barber(models.Model):
    """
    Barber entity, matches your 'barbers' collection in Firestore.
    """
    name = models.CharField(max_length=100)
    experience = models.IntegerField(default=0)  # in years, for example
    # We store working hours and available days in JSON-like fields or separate fields.
    # For simplicity, let's store them as text or JSON if you want more structure.
    working_hours_start = models.TimeField(default="09:00")
    working_hours_end = models.TimeField(default="17:00")
    slot_duration = models.IntegerField(default=30)  # in minutes
    
    # If you want to store available days as a JSON or separate table, you can do so.
    # For simplicity, let's store them as a CSV string or JSON:
    available_days = models.CharField(
        max_length=200,
        help_text="Comma-separated days (e.g., 'Monday,Tuesday,Wednesday')",
        default="Monday,Tuesday,Wednesday,Thursday,Friday"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    """
    Service entity: e.g. 'Haircut', 'Shave', etc.
    """
    service_name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=100, null=True, blank=True)
    service_duration = models.IntegerField(default=30)  # in minutes
    service_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    
    def __str__(self):
        return self.service_name

class Appointment(models.Model):
    """
    Appointment entity, referencing Barber and Customer.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('canceled', 'Canceled'),
        ('completed', 'Completed'),
    )
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    barber = models.ForeignKey(Barber, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    phone_no = models.CharField(max_length=20, null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    # We'll store the datetime of the appointment as a single field.
    appointment_time = models.DateTimeField()
    appointment_date = models.DateField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    position = models.IntegerField(default=0)  # You were calculating this on the fly
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment for {self.customer_name} on {self.appointment_date}"

class Queue(models.Model):
    """
    Queue entity, referencing a Customer (or just storing a name) plus status.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('canceled', 'Canceled'),
        ('completed', 'Completed'),
    )
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.status}"
