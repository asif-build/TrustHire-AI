from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    action = models.CharField(max_length=255)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='common_audit_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.performed_by.email if self.performed_by else "System"
        return f"{self.action} by {user_str} at {self.timestamp}"
