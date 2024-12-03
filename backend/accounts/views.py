from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Employee
from .serializers import EmployeeSerializer
from rest_framework.decorators import api_view

class EmployeeListCreate(generics.ListCreateAPIView):
    queryset = Employee.objects.all().order_by('created_at')
    serializer_class = EmployeeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class EmployeeRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "従業員を削除しました"},
            status=status.HTTP_204_NO_CONTENT
        )

@api_view(['POST'])
def set_password(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    password = request.data.get('password')
    
    if not password or not password.isdigit() or len(password) != 4:
        return Response(
            {"error": "パスワードは4桁の数字である必要があります"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    employee.password = password
    employee.save()
    return Response({"message": "パスワードが設定されました"})

@api_view(['POST'])
def verify_password(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    password = request.data.get('password')
    
    if not employee.password:
        return Response(
            {"error": "パスワードが設定されていません"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if employee.password != password:
        return Response(
            {"error": "パスワードが正しくありません"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    return Response({"message": "認証成功"})