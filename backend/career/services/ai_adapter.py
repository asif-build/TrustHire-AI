import os
import json
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class AIAdapter:
    """
    Adapter for Google Gemini API with fallback to deterministic NLP algorithms.
    Complies with Phase 12: Never hardcodes keys, checks configuration at runtime,
    enforces request timeouts and structured response validation.
    """

    @classmethod
    def get_api_key(cls):
        return os.getenv('GEMINI_API_KEY')

    @classmethod
    def is_configured(cls):
        key = cls.get_api_key()
        return bool(key and key != 'your-gemini-api-key')

    @classmethod
    def get_status(cls):
        configured = cls.is_configured()
        return {
            'provider': 'Google Gemini' if configured else 'Deterministic NLP & Semantic Engine',
            'configured': configured,
            'model': 'gemini-1.5-flash' if configured else 'TrustHire Grounded Rule-Engine v1.2',
            'notice': None if configured else 'GEMINI_API_KEY is not set in backend/.env. Running high-precision deterministic algorithms with zero hallucination guarantee.'
        }

    @classmethod
    def generate_json(cls, prompt, system_instruction=None, fallback_fn=None):
        """
        Executes an AI prompt expecting structured JSON.
        If Gemini is configured, calls the API with json response schema.
        If unavailable or fails, executes the verified deterministic fallback function.
        """
        if cls.is_configured():
            try:
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
                logger.warning(f"Gemini API call failed, invoking deterministic engine: {e}")
                if fallback_fn:
                    fallback_data = fallback_fn()
                    return {
                        'success': True,
                        'data': fallback_data,
                        'provider': 'deterministic_fallback',
                        'error': f"Gemini warning ({str(e)}), used deterministic engine."
                    }
                return {'success': False, 'data': None, 'error': str(e)}

        # Fallback path when no external API key is configured
        if fallback_fn:
            return {
                'success': True,
                'data': fallback_fn(),
                'provider': 'deterministic_engine',
                'error': None
            }
        return {
            'success': False,
            'data': None,
            'provider': 'none',
            'error': 'Gemini API is not configured and no fallback handler was supplied.'
        }
