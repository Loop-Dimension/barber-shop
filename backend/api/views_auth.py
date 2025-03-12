from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Customer
from .serializers import CustomerSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    POST /api/auth/signup
    Expected JSON: {
        "username": "john",
        "email": "john@example.com",
        "password": "secret",
        ... (any extra fields)
    }
    """
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.first_name = data.get('first_name', '')
    user.last_name = data.get('last_name', '')
    user.save()

    # If you have a Customer model that references User:
    Customer.objects.create(
        user=user,
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        phone_no=data.get('phone_no', ''),
        address=data.get('address', ''),
        gender=data.get('gender', ''),
        email=email
    )

    return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint: POST /api/auth/login
    Expected JSON: {
        "username": "...",
        "password": "..."
    }
    """
    data = request.data
    user = authenticate(username=data['username'], password=data['password'])
    if user is not None:
        # For session-based auth:
        login(request, user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Endpoint: POST /api/auth/update
    Allows an authenticated user to update their profile.
    """
    data = request.data
    user = request.user
    try:
        customer = Customer.objects.get(user=user)
        customer.first_name = data.get('first_name', customer.first_name)
        customer.last_name = data.get('last_name', customer.last_name)
        customer.phone_no = data.get('phone_no', customer.phone_no)
        customer.address = data.get('address', customer.address)
        customer.gender = data.get('gender', customer.gender)
        customer.email = data.get('email', customer.email)
        customer.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """
    Endpoint: POST /api/auth/check
    Simply checks if the user is authenticated.
    """
    return Response({"message": "User is authenticated"}, status=status.HTTP_200_OK)
