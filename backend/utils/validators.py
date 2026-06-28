import os
from django.core.exceptions import ValidationError

def validate_resume_file(value):
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.pdf']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension. Only PDF resumes are accepted.')
    
    # Check file size (limit to 10MB)
    limit = 10 * 1024 * 1024  # 10 MB
    if value.size > limit:
        raise ValidationError('File size exceeds 10MB limit.')
