# backend/api/views.py
# HINWEIS: Ihr Originalcode wurde als Basis verwendet. Es waren keine logischen Änderungen nötig.
# Lediglich Umlaute und Formatierung wurden zur Konsistenz korrigiert.

import os
import json
from datetime import timedelta
from django.core.management import call_command
from django.urls import reverse
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import make_password
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


from .serializers import (
    RegisterSerializer, UserSerializer, DigitalLegacyItemSerializer,
    FinancialItemSerializer, InsuranceItemSerializer, ContractItemSerializer,
    DocumentSerializer, LastWishesSerializer, MemorialPageSerializer, 
    CondolenceSerializer, MemorialCandleSerializer, TimelineEventSerializer, 
    GalleryItemSerializer, ReleaseRequestSerializer,
    MemorialPageListSerializer, SiteSettingsSerializer, CondolenceTemplateSerializer,
    CandleImageSerializer, CandleMessageTemplateSerializer, EventAttendanceSerializer,
    MemorialEventSerializer, MeinBereichDataSerializer
)
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem, ContractItem, 
    Document, LastWishes, MemorialPage, Condolence, MemorialCandle,
    TimelineEvent, GalleryItem, ReleaseRequest, SiteSettings, CondolenceTemplate,
    CandleImage, CandleMessageTemplate, EventLocation, MemorialEvent, EventAttendance,
    FamilyLink
)

class GlobalSearchView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', None)
        results = []
        if query and len(query) > 2:
            try:
                users = User.objects.filter(
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query) |
                    Q(email__icontains=query)
                )[:10]
                for user in users:
                    results.append({
                        'type': 'Benutzer',
                        'title': f"{user.first_name} {user.last_name} ({user.email})",
                        'url': reverse('admin:api_user_change', args=[user.pk])
                    })
            except Exception as e:
                print(f"Fehler bei der Benutzersuche: {e}")
            try:
                pages = MemorialPage.objects.filter(
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query)
                )[:10]
                for page in pages:
                    results.append({
                        'type': 'Gedenkseite',
                        'title': f"Gedenkseite für {page.first_name} {page.last_name}",
                        'url': reverse('admin:api_memorialpage_change', args=[page.pk])
                    })
            except Exception as e:
                print(f"Fehler bei der Gedenkseitensuche: {e}")
            try:
                condolences = Condolence.objects.filter(
                    Q(guest_name__icontains=query) |
                    Q(message__icontains=query)
                ).select_related('page')[:10]
                for condolence in condolences:
                    results.append({
                        'type': 'Kondolenz',
                        'title': f"'{condolence.message[:30]}...' von {condolence.guest_name} für {condolence.page}",
                        'url': reverse('admin:api_condolence_change', args=[condolence.condolence_id])
                    })
            except Exception as e:
                print(f"Fehler bei der Kondolenzsuche: {e}")
            try:
                candles = MemorialCandle.objects.filter(
                    Q(guest_name__icontains=query) |
                    Q(message__icontains=query)
                ).select_related('page')[:10]
                for candle in candles:
                    results.append({
                        'type': 'Gedenkkerze',
                        'title': f"'{candle.message[:30]}...' von {candle.guest_name} für {candle.page}",
                        'url': reverse('admin:api_memorialcandle_change', args=[candle.candle_id])
                    })
            except Exception as e:
                print(f"Fehler bei der Kerzensuche: {e}")

        return Response(results)

class AllowGuestPostIsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class SeedDatabaseView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, key):
        SECRET_KEY = os.environ.get('SEED_SECRET_KEY')
        if not SECRET_KEY:
            return Response({"error": "Secret key for seeding is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if key != SECRET_KEY:
            return Response({"error": "Invalid secret key."}, status=status.HTTP_403_FORBIDDEN)
        try:
            print('Starting database seeding via API...')
            call_command('seed_data')
            print('Database seeding finished.')
            return Response({"message": "Database seeding initiated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"An error occurred during seeding: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        frontend_url = 'https://gedenken.netlify.app'
        reset_link = f"{frontend_url}/password-reset-confirm/{uid}/{token}/"

        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("PASSWORT-RESET-LINK (normalerweise per E-Mail gesendet):")
        print(reset_link)
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        password2 = request.data.get('password2')

        if not all([uidb64, token, password, password2]):
            return Response({'error': 'Alle Felder sind erforderlich.'}, status=status.HTTP_400_BAD_REQUEST)

        if password != password2:
            return Response({'error': 'Passwörter stimmen nicht überein.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            try:
                validate_password(password, user)
            except ValidationError as e:
                return Response({'errors': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(password)
            user.save()
            return Response({'status': 'Passwort erfolgreich zurückgesetzt.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Ungültiger Link.'}, status=status.HTTP_400_BAD_REQUEST)

class CandleImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CandleImage.objects.all()
    serializer_class = CandleImageSerializer
    permission_classes = [permissions.AllowAny]

class CandleMessageTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CandleMessageTemplate.objects.all()
    serializer_class = CandleMessageTemplateSerializer
    permission_classes = [permissions.AllowAny]

class CondolenceTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CondolenceTemplate.objects.all()
    serializer_class = CondolenceTemplateSerializer
    permission_classes = [permissions.AllowAny]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class CanViewVorsorgeDataPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        return FamilyLink.objects.filter(
            deceased_user=obj.user, relative_user=user,
            can_view_precaution_data=True, is_validated_by_admin=True
        ).exists()

class CanEditVorsorgeDataPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        return FamilyLink.objects.filter(
            deceased_user=obj.user, relative_user=user,
            can_edit_precaution_data=True, is_validated_by_admin=True
        ).exists()

class CanEditMemorialPagePermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated: return False
        if user.is_staff or obj.user == user: return True
        return FamilyLink.objects.filter(
            deceased_user=obj.user, relative_user=user,
            can_edit_memorial_page=True
        ).exists()

class DigitalLegacyItemViewSet(viewsets.ModelViewSet):
    serializer_class = DigitalLegacyItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return DigitalLegacyItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class FinancialItemViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return FinancialItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class InsuranceItemViewSet(viewsets.ModelViewSet):
    serializer_class = InsuranceItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return InsuranceItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class ContractItemViewSet(viewsets.ModelViewSet):
    serializer_class = ContractItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return ContractItem.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    parser_classes = [MultiPartParser, FormParser]
    def get_queryset(self):
        user = self.request.user
        linked_deceased_ids = FamilyLink.objects.filter(relative_user=user, can_view_precaution_data=True, is_validated_by_admin=True).values_list('deceased_user_id', flat=True)
        return Document.objects.filter(Q(user=user) | Q(user_id__in=list(linked_deceased_ids)))
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class LastWishesView(generics.RetrieveUpdateAPIView):
    serializer_class = LastWishesSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewVorsorgeDataPermission]
    def get_object(self):
        obj, created = LastWishes.objects.get_or_create(user=self.request.user)
        self.check_object_permissions(self.request, obj)
        return obj

class MemorialPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MemorialPage.objects.filter(status='active')
    serializer_class = MemorialPageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    def get_serializer_context(self):
        return {'request': self.request}
    @action(detail=False, methods=['get'])
    def listing(self, request):
        queryset = self.get_queryset()
        serializer = MemorialPageListSerializer(queryset, many=True)
        return Response(serializer.data)

class ManagedMemorialPageViewSet(viewsets.ModelViewSet):
    serializer_class = MemorialPageSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission]
    lookup_field = 'slug'
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return MemorialPage.objects.all()
        linked_deceased_ids = FamilyLink.objects.filter(
            relative_user=user, 
            can_edit_memorial_page=True,
            deceased_user__role=User.Role.VERSTORBENER
        ).values_list('deceased_user_id', flat=True)
        return MemorialPage.objects.filter(
            Q(user=user) | Q(user_id__in=list(linked_deceased_ids))
        )

class CondolenceViewSet(viewsets.ModelViewSet):
    serializer_class = CondolenceSerializer
    permission_classes = [AllowGuestPostIsOwnerOrReadOnly]
    def get_queryset(self):
        if 'page_slug' in self.kwargs:
            return Condolence.objects.filter(page__slug=self.kwargs['page_slug'], is_approved=True)
        return Condolence.objects.all()
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        author = self.request.user if self.request.user.is_authenticated else None
        is_approved_on_creation = (page.condolence_moderation == MemorialPage.ModerationStatus.NOT_MODERATED)
        serializer.save(page=page, author=author, is_approved=is_approved_on_creation)

class MemorialCandleViewSet(viewsets.ModelViewSet):
    serializer_class = MemorialCandleSerializer
    permission_classes = [AllowGuestPostIsOwnerOrReadOnly]
    def get_queryset(self):
        if 'page_slug' in self.kwargs:
            return MemorialCandle.objects.filter(page__slug=self.kwargs['page_slug'])
        return MemorialCandle.objects.all()
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        author = self.request.user if self.request.user.is_authenticated else None
        serializer.save(page=page, author=author)

class TimelineEventViewSet(viewsets.ModelViewSet):
    serializer_class = TimelineEventSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission]
    def get_queryset(self):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        return TimelineEvent.objects.filter(page=page)
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        serializer.save(page=page)

class GalleryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditMemorialPagePermission]
    def get_queryset(self):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        return GalleryItem.objects.filter(page=page)
    def perform_create(self, serializer):
        page = generics.get_object_or_404(MemorialPage, slug=self.kwargs['page_slug'])
        self.check_object_permissions(self.request, page)
        serializer.save(page=page)

class ReleaseRequestViewSet(viewsets.ModelViewSet):
    queryset = ReleaseRequest.objects.all()
    serializer_class = ReleaseRequestSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        password = make_password(serializer.validated_data['reporter_password'])
        serializer.save(reporter_password=password)

class SiteSettingsView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        obj, created = SiteSettings.objects.get_or_create(pk=1)
        return obj

class MyContributionsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        condolences = Condolence.objects.filter(author=user)
        candles = MemorialCandle.objects.filter(author=user)
        
        condolence_serializer = CondolenceSerializer(condolences, many=True, context={'request': request})
        candle_serializer = MemorialCandleSerializer(candles, many=True, context={'request': request})

        return Response({
            'condolences': condolence_serializer.data,
            'candles': candle_serializer.data
        })

class MemorialEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MemorialEventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return MemorialEvent.objects.filter(page__slug=self.kwargs['page_slug'], is_public=True)

class EventAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = EventAttendanceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return EventAttendance.objects.filter(event_id=self.kwargs['event_pk'])

    def perform_create(self, serializer):
        event = generics.get_object_or_404(MemorialEvent, pk=self.kwargs['event_pk'])
        author = self.request.user if self.request.user.is_authenticated else None
        serializer.save(event=event, user=author)

class MeinBereichDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        try:
            own_page = MemorialPage.objects.get(user=user)
        except MemorialPage.DoesNotExist:
            own_page = None
        
        managed_links = FamilyLink.objects.filter(relative_user=user, can_edit_memorial_page=True)
        managed_pages = [link.deceased_user.memorial_page for link in managed_links if hasattr(link.deceased_user, 'memorial_page')]

        has_vorsorge_links = FamilyLink.objects.filter(
            Q(can_view_precaution_data=True) | Q(can_edit_precaution_data=True),
            relative_user=user
        ).exists()
        
        serializer = MeinBereichDataSerializer({
            'own_page': own_page,
            'managed_pages': managed_pages,
            'has_vorsorge_links': has_vorsorge_links,
        }, context={'request': request})
        
        return Response(serializer.data)

class CreateMemorialPageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if hasattr(user, 'memorial_page'):
            return Response({'error': 'Für diesen Benutzer existiert bereits eine Gedenkseite.'}, status=status.HTTP_400_BAD_REQUEST)

        # Erstellt eine minimale, inaktive Gedenkseite
        page = MemorialPage.objects.create(
            user=user,
            first_name=user.first_name,
            last_name=user.last_name,
            status=MemorialPage.Status.INACTIVE
        )
        serializer = MemorialPageSerializer(page, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

