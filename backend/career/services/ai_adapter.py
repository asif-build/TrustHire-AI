import os
import json
import logging
import requests

logger = logging.getLogger(__name__)

class AIAdapter:
    """
    Unified AI Adapter supporting ultra-low-latency Groq LLM inference,
    Google Gemini, and zero-hallucination deterministic NLP fallback.
    """

    @classmethod
    def get_api_key(cls):
        return (
            os.getenv('GROQ_API_KEY') or 
            os.getenv('AI_API_KEY') or 
            os.getenv('GEMINI_API_KEY')
        )

    @classmethod
    def get_provider(cls):
        key = cls.get_api_key()
        if not key or key in ['your-gemini-api-key', 'your-groq-api-key']:
            return 'deterministic'
        if key.startswith('gsk_') or os.getenv('GROQ_API_KEY'):
            return 'groq'
        return 'gemini'

    @classmethod
    def is_configured(cls):
        return cls.get_provider() != 'deterministic'

    @classmethod
    def get_status(cls):
        provider = cls.get_provider()
        if provider == 'groq':
            model = os.getenv('GROQ_MODEL', 'openai/gpt-oss-120b')
            return {
                'provider': 'Groq AI (Llama / GPT-OSS)',
                'configured': True,
                'model': model,
                'notice': 'High-performance ultra-low-latency Groq AI connected.'
            }
        elif provider == 'gemini':
            return {
                'provider': 'Google Gemini',
                'configured': True,
                'model': 'gemini-1.5-flash',
                'notice': 'Google Gemini API connected.'
            }
        else:
            return {
                'provider': 'Deterministic NLP & Semantic Engine',
                'configured': False,
                'model': 'TrustHire Grounded Rule-Engine v1.2',
                'notice': 'Running high-precision deterministic algorithms with zero hallucination guarantee.'
            }

    @classmethod
    def generate_json(cls, prompt, system_instruction=None, fallback_fn=None):
        """
        Executes an AI prompt expecting structured JSON.
        Calls Groq or Gemini API with structured JSON schema.
        If unavailable or fails, executes verified deterministic fallback function.
        """
        provider = cls.get_provider()

        if provider == 'groq':
            key = cls.get_api_key()
            model = os.getenv('GROQ_MODEL', 'openai/gpt-oss-120b')
            headers = {
                'Authorization': f'Bearer {key}',
                'Content-Type': 'application/json'
            }
            system_prompt = system_instruction or "You are an expert career intelligence engine. Return valid JSON only with no markdown wrapping."
            payload = {
                'model': model,
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f"{prompt}\n\nIMPORTANT: Return valid JSON only. Do not enclose in backticks or markdown codeblocks."}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.2
            }
            try:
                res = requests.post('https://api.groq.com/openai/v1/chat/completions', headers=headers, json=payload, timeout=15)
                if res.status_code == 200:
                    data = res.json()
                    content = data['choices'][0]['message']['content'].strip()
                    if content.startswith('```'):
                        content = content.strip('`').replace('json\n', '', 1).strip()
                    parsed = json.loads(content)
                    return {
                        'success': True,
                        'data': parsed,
                        'provider': f'groq/{model}',
                        'error': None
                    }
                else:
                    logger.warning(f"Groq API returned HTTP {res.status_code}: {res.text}")
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}")

        elif provider == 'gemini':
            try:
                import google.generativeai as genai
                genai.configure(api_key=cls.get_api_key())
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=system_instruction or "You are an expert career intelligence engine. Return valid JSON only with no markdown wrapping.",
                    generation_config={"response_mime_type": "application/json", "temperature": 0.2}
                )
                response = model.generate_content(prompt, request_options={"timeout": 15})
                if response and response.text:
                    parsed = json.loads(response.text.strip())
                    return {
                        'success': True,
                        'data': parsed,
                        'provider': 'gemini-1.5-flash',
                        'error': None
                    }
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}")

        # Fallback to deterministic engine
        if fallback_fn:
            return {
                'success': True,
                'data': fallback_fn(),
                'provider': 'deterministic_fallback',
                'error': None
            }

        return {
            'success': False,
            'data': None,
            'provider': 'none',
            'error': 'AI API call failed and no fallback handler was supplied.'
        }
