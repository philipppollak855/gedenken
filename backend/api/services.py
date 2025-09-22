# backend/api/services.py
# Service-Funktionen für Trauerdruck-Workflow

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import TrauerdruckEntwurf, TrauerdruckBenachrichtigung, MemorialPage, FamilyLink

User = get_user_model()


def get_family_links_for_deceased(deceased_user):
    """
    Hilfsfunktion für FamilyLink-Queries mit Datenbank-Kompatibilität
    """
    try:
        # Versuche normale Django ORM-Query
        return FamilyLink.objects.filter(deceased_user=deceased_user)
    except Exception as e:
        # Fallback: Verwende Raw SQL wenn Django ORM fehlschlägt
        if "column api_familylink.id does not exist" in str(e):
            from django.db import connection
            with connection.cursor() as cursor:
                # Prüfe welche Spalten existieren
                cursor.execute("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'api_familylink' AND table_schema = 'public'
                """)
                existing_columns = [row[0] for row in cursor.fetchall()]
                
                # Verwende passende SQL basierend auf vorhandenen Spalten
                if 'role' not in existing_columns:
                    # Alte Struktur: Verwende link_id und alte Spalten
                    if 'created_at' in existing_columns:
                        # Struktur mit created_at/updated_at
                        cursor.execute("""
                            SELECT fl.link_id as id, fl.relationship, 
                                   CASE WHEN fl.is_main_contact THEN 'main_contact' ELSE 'family_member' END as role,
                                   CASE 
                                       WHEN fl.can_edit_precaution_data THEN 'manage_all'
                                       WHEN fl.can_edit_memorial_page THEN 'edit_memorial'
                                       ELSE 'view_only'
                                   END as permission_level,
                                   true as is_active, false as is_validated_by_admin, null as validated_at,
                                   fl.created_at, fl.updated_at, '' as notes,
                                   fl.deceased_user_id, fl.relative_user_id, null as validated_by_id, null as created_by_id,
                                   u1.first_name as deceased_first_name, u1.last_name as deceased_last_name,
                                   u2.first_name as relative_first_name, u2.last_name as relative_last_name
                            FROM api_familylink fl
                            LEFT JOIN auth_user u1 ON fl.deceased_user_id = u1.id
                            LEFT JOIN auth_user u2 ON fl.relative_user_id = u2.id
                            WHERE fl.deceased_user_id = %s
                            ORDER BY fl.created_at DESC
                        """, [deceased_user.id])
                    else:
                        # Älteste Struktur: Nur Grundfelder ohne Zeitstempel
                        cursor.execute("""
                            SELECT fl.link_id as id, fl.relationship, 
                                   CASE WHEN fl.is_main_contact THEN 'main_contact' ELSE 'family_member' END as role,
                                   CASE 
                                       WHEN fl.can_edit_precaution_data THEN 'manage_all'
                                       WHEN fl.can_edit_memorial_page THEN 'edit_memorial'
                                       ELSE 'view_only'
                                   END as permission_level,
                                   true as is_active, false as is_validated_by_admin, null as validated_at,
                                   null as created_at, null as updated_at, '' as notes,
                                   fl.deceased_user_id, fl.relative_user_id, null as validated_by_id, null as created_by_id,
                                   u1.first_name as deceased_first_name, u1.last_name as deceased_last_name,
                                   u2.first_name as relative_first_name, u2.last_name as relative_last_name
                            FROM api_familylink fl
                            LEFT JOIN auth_user u1 ON fl.deceased_user_id = u1.id
                            LEFT JOIN auth_user u2 ON fl.relative_user_id = u2.id
                            WHERE fl.deceased_user_id = %s
                            ORDER BY fl.link_id DESC
                        """, [deceased_user.id])
                else:
                    # Neue Struktur: Verwende id und neue Spalten
                    cursor.execute("""
                        SELECT fl.id, fl.relationship, fl.role, fl.permission_level, 
                               fl.is_active, fl.is_validated_by_admin, fl.validated_at,
                               fl.created_at, fl.updated_at, fl.notes,
                               fl.deceased_user_id, fl.relative_user_id, fl.validated_by_id, fl.created_by_id,
                               u1.first_name as deceased_first_name, u1.last_name as deceased_last_name,
                               u2.first_name as relative_first_name, u2.last_name as relative_last_name
                        FROM api_familylink fl
                        LEFT JOIN auth_user u1 ON fl.deceased_user_id = u1.id
                        LEFT JOIN auth_user u2 ON fl.relative_user_id = u2.id
                        WHERE fl.deceased_user_id = %s
                        ORDER BY fl.created_at DESC
                    """, [deceased_user.id])
                
                # Erstelle Mock-Objekte für die Services
                class MockFamilyLink:
                    def __init__(self, row):
                        self.id = row[0]
                        self.relationship = row[1] or ''
                        self.role = row[2] or 'family_member'
                        self.permission_level = row[3] or 'view_only'
                        self.is_active = row[4] if row[4] is not None else True
                        self.is_validated_by_admin = row[5] if row[5] is not None else False
                        self.validated_at = row[6]
                        self.created_at = row[7]
                        self.updated_at = row[8]
                        self.notes = row[9] or ''
                        
                        # Mock User-Objekte
                        self.deceased_user = type('User', (), {
                            'id': row[10],
                            'first_name': row[14] or '',
                            'last_name': row[15] or '',
                            'get_full_name': lambda: f"{row[14] or ''} {row[15] or ''}".strip(),
                            'email': f"user{row[10]}@example.com"
                        })()
                        
                        self.relative_user = type('User', (), {
                            'id': row[11],
                            'first_name': row[16] or '',
                            'last_name': row[17] or '',
                            'get_full_name': lambda: f"{row[16] or ''} {row[17] or ''}".strip(),
                            'email': f"user{row[11]}@example.com"
                        })()
                        
                        self.created_by = None
                        self.validated_by = None
                
                rows = cursor.fetchall()
                return [MockFamilyLink(row) for row in rows]
        else:
            # Andere Fehler: Leere Liste zurückgeben
            return []


class TrauerdruckNotificationService:
    """Service für Trauerdruck-Benachrichtigungen"""
    
    @staticmethod
    def create_notification(user, entwurf, notification_type, title, message):
        """Erstellt eine neue Benachrichtigung"""
        try:
            return TrauerdruckBenachrichtigung.objects.create(
                user=user,
                entwurf=entwurf,
                notification_type=notification_type,
                title=title,
                message=message
            )
        except Exception as e:
            print(f"Fehler beim Erstellen der Benachrichtigung: {e}")
            print(f"User: {user}, Entwurf: {entwurf}, Type: {notification_type}")
            import traceback
            traceback.print_exc()
            raise
    
    @staticmethod
    def notify_new_draft(entwurf):
        """Benachrichtigt Angehörige über neuen Entwurf"""
        # Alle Familienmitglieder der Gedenkseite benachrichtigen
        family_links = get_family_links_for_deceased(entwurf.memorial_page.user)
        
        for family_link in family_links:
            if family_link.relative_user and family_link.relative_user.email:
                TrauerdruckNotificationService.create_notification(
                    user=family_link.relative_user,
                    entwurf=entwurf,
                    notification_type='new_draft',
                    title=f'Neuer Trauerdruck-Entwurf für {entwurf.memorial_page.deceased_name}',
                    message=f'Ein neuer {entwurf.trauerdruck_type.name}-Entwurf wurde erstellt und wartet auf Ihre Freigabe.'
                )
                
                # E-Mail senden
                TrauerdruckNotificationService.send_email_notification(
                    user=family_link.relative_user,
                    entwurf=entwurf,
                    notification_type='new_draft'
                )
    
    @staticmethod
    def notify_approval_requested(entwurf):
        """Benachrichtigt Angehörige über Freigabeanfrage"""
        family_links = get_family_links_for_deceased(entwurf.memorial_page.user)
        
        for family_link in family_links:
            if family_link.relative_user and family_link.relative_user.email:
                TrauerdruckNotificationService.create_notification(
                    user=family_link.relative_user,
                    entwurf=entwurf,
                    notification_type='approval_requested',
                    title=f'Freigabe angefordert für {entwurf.title}',
                    message=f'Der Entwurf "{entwurf.title}" wartet auf Ihre Freigabe.'
                )
    
    @staticmethod
    def notify_decision(entwurf, decision, reviewer):
        """Benachrichtigt Bestatter über Entscheidung"""
        # Bestatter benachrichtigen
        if entwurf.created_by and entwurf.created_by.email:
            decision_text = {
                'approved': 'freigegeben',
                'revision_requested': 'zur Revision angefordert',
                'rejected': 'abgelehnt'
            }.get(decision, decision)
            
            TrauerdruckNotificationService.create_notification(
                user=entwurf.created_by,
                entwurf=entwurf,
                notification_type=decision,
                title=f'Entwurf {decision_text}',
                message=f'Der Entwurf "{entwurf.title}" wurde von {reviewer.first_name} {reviewer.last_name} {decision_text}.'
            )
            
            # E-Mail senden
            TrauerdruckNotificationService.send_email_notification(
                user=entwurf.created_by,
                entwurf=entwurf,
                notification_type=decision
            )
    
    @staticmethod
    def notify_comment_added(entwurf, comment_author):
        """Benachrichtigt relevante Personen über neuen Kommentar"""
        # Alle Personen benachrichtigen, die mit dem Entwurf verbunden sind
        users_to_notify = set()
        
        # Bestatter
        if entwurf.created_by:
            users_to_notify.add(entwurf.created_by)
        
        # Zugewiesene Personen
        users_to_notify.update(entwurf.assigned_to.all())
        
        # Familienmitglieder
        family_links = get_family_links_for_deceased(entwurf.memorial_page.user)
        for family_link in family_links:
            if family_link.relative_user:
                users_to_notify.add(family_link.relative_user)
        
        # Kommentar-Autor nicht benachrichtigen
        users_to_notify.discard(comment_author)
        
        for user in users_to_notify:
            TrauerdruckNotificationService.create_notification(
                user=user,
                entwurf=entwurf,
                notification_type='comment_added',
                title=f'Neuer Kommentar zu {entwurf.title}',
                message=f'{comment_author.first_name} {comment_author.last_name} hat einen Kommentar hinzugefügt.'
            )
    
    @staticmethod
    def send_email_notification(user, entwurf, notification_type):
        """Sendet E-Mail-Benachrichtigung"""
        if not user.email:
            return
        
        subject_templates = {
            'new_draft': f'Neuer Trauerdruck-Entwurf für {entwurf.memorial_page.deceased_name}',
            'approval_requested': f'Freigabe angefordert für {entwurf.title}',
            'approved': f'Entwurf freigegeben: {entwurf.title}',
            'revision_requested': f'Revision angefordert: {entwurf.title}',
            'rejected': f'Entwurf abgelehnt: {entwurf.title}',
            'comment_added': f'Neuer Kommentar zu {entwurf.title}'
        }
        
        subject = subject_templates.get(notification_type, f'Trauerdruck-Benachrichtigung: {entwurf.title}')
        
        context = {
            'user': user,
            'entwurf': entwurf,
            'notification_type': notification_type,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        }
        
        try:
            html_message = render_to_string('emails/trauerdruck_notification.html', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@gedenken.at'),
                recipient_list=[user.email],
                fail_silently=True,  # Fehler nicht anzeigen, um 500-Fehler zu vermeiden
            )
        except Exception as e:
            print(f"Fehler beim Senden der E-Mail: {e}")
            # E-Mail-Fehler sollen den Workflow nicht stoppen


class TrauerdruckWorkflowService:
    """Service für Trauerdruck-Workflow-Logik"""
    
    @staticmethod
    def create_new_version(entwurf, new_design_file, new_preview_file=None):
        """Erstellt eine neue Version eines Entwurfs"""
        # Alte Version als nicht neueste markieren
        entwurf.is_latest_version = False
        entwurf.save()
        
        # Neue Version erstellen
        new_version = TrauerdruckEntwurf.objects.create(
            title=entwurf.title,
            description=entwurf.description,
            trauerdruck_type=entwurf.trauerdruck_type,
            memorial_page=entwurf.memorial_page,
            design_file=new_design_file,
            preview_file=new_preview_file,
            created_by=entwurf.created_by,
            version=entwurf.version + 1,
            is_latest_version=True,
            status='pending_approval',
            priority=entwurf.priority,
            deadline=entwurf.deadline
        )
        
        # Zuweisungen übertragen
        new_version.assigned_to.set(entwurf.assigned_to.all())
        
        # Benachrichtigungen senden
        TrauerdruckNotificationService.notify_new_draft(new_version)
        
        return new_version
    
    @staticmethod
    def process_approval(entwurf, decision, reviewer, comment='', revision_notes=''):
        """Verarbeitet eine Freigabe-Entscheidung"""
        from .models import TrauerdruckFreigabe
        
        try:
            # Freigabe-Entscheidung speichern (immer neue Freigabe erstellen)
            freigabe = TrauerdruckFreigabe.objects.create(
                entwurf=entwurf,
                reviewer=reviewer,
                decision=decision,
                comment=comment,
                revision_notes=revision_notes
            )
            
            # Entwurf-Status aktualisieren
            if decision == 'approved':
                entwurf.status = 'approved'
            elif decision == 'revision_requested':
                entwurf.status = 'revision_requested'
            elif decision == 'rejected':
                entwurf.status = 'rejected'
            
            entwurf.save()
            
            # Benachrichtigungen senden
            try:
                TrauerdruckNotificationService.notify_decision(entwurf, decision, reviewer)
            except Exception as notification_error:
                print(f"Fehler beim Senden der Benachrichtigungen: {notification_error}")
                # Benachrichtigungsfehler sollen den Workflow nicht stoppen
            
            return freigabe
        except Exception as e:
            print(f"Fehler im process_approval: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    @staticmethod
    def notify_revision_requested(entwurf, requester):
        """Benachrichtigt Bestatter über Revisionsanfrage"""
        if entwurf.created_by and entwurf.created_by.email:
            TrauerdruckNotificationService.create_notification(
                user=entwurf.created_by,
                entwurf=entwurf,
                notification_type='revision_requested',
                title=f'Revision angefordert für {entwurf.title}',
                message=f'{requester.first_name} {requester.last_name} hat eine Revision für den Entwurf angefordert.'
            )
    
    @staticmethod
    def notify_completed(entwurf):
        """Benachrichtigt alle Beteiligten über Abschluss"""
        # Alle Familienmitglieder benachrichtigen
        family_links = get_family_links_for_deceased(entwurf.memorial_page.user)
        
        for family_link in family_links:
            if family_link.relative_user and family_link.relative_user.email:
                TrauerdruckNotificationService.create_notification(
                    user=family_link.relative_user,
                    entwurf=entwurf,
                    notification_type='completed',
                    title=f'Trauerdruck abgeschlossen: {entwurf.title}',
                    message=f'Der Trauerdruck-Entwurf "{entwurf.title}" wurde erfolgreich abgeschlossen.'
                )