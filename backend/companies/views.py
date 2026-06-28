from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from utils.permissions import IsRecruiter, IsAdminUser
from .models import Company
from .serializers import CompanySerializer

class CompanyCreateView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsRecruiter | IsAdminUser]

class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]

class CompanyUpdateView(generics.UpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsRecruiter | IsAdminUser]

    def get_object(self):
        # Allow updating by passing ID in request data or query string
        company_id = self.request.data.get('id') or self.request.query_params.get('id')
        if not company_id:
            raise Response({"error": "Company ID is required to update."}, status=status.HTTP_400_BAD_REQUEST)
        return generics.get_object_or_404(Company, id=company_id)
