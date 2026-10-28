import os
from django.core.exceptions import ValidationError

def validate_resume_file(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.pdf', '.docx']
    if ext not in valid_extensions:
        raise ValidationError('Unsupported file extension. Only PDF and DOCX resumes are accepted.')
    
    # Check file size (limit to 10MB)
    limit = 10 * 1024 * 1024  # 10 MB
    if value.size > limit:
        raise ValidationError('File size exceeds 10MB limit.')
    
    # Magic bytes validation
    try:
        if hasattr(value, 'read') and hasattr(value, 'seek'):
            header = value.read(1024)
            value.seek(0)
            if ext == '.pdf' and b'%PDF-' not in header[:1024]:
                raise ValidationError('Invalid PDF file signature. Magic bytes (%PDF-) not detected.')
            elif ext == '.docx' and not header.startswith(b'PK\x03\x04'):
                raise ValidationError('Invalid DOCX file signature. Not a valid Word document archive.')
    except Exception as e:
        if isinstance(e, ValidationError):
            raise e
        # If seek/read fails, let file pass validator to be caught in parser
        pass
