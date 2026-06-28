import re
from pydantic import BaseModel, Field, field_validator

def sanitize_text(value: str) -> str:
    if not isinstance(value, str):
        return value
    # Remove HTML tags
    value = re.sub(r'<[^>]*?>', '', value)
    # Strip dangerous characters to prevent injection/XSS
    value = re.sub(r'[<>\'"\\/&;]', '', value)
    return value.strip()

class JobCreateSchema(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description_text: str = Field(..., min_length=20, max_length=10000)

    @field_validator('title', 'description_text')
    @classmethod
    def clean_fields(cls, v):
        return sanitize_text(v)
