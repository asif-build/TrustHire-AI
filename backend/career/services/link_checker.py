import urllib.request
import urllib.error
import ssl

def verify_external_url(url: str, timeout: int = 5) -> dict:
    """
    Lightweight, non-intrusive URL validation.
    Performs an HTTP HEAD/GET request with short timeout and clean User-Agent.
    Does not continuously scrape or spam third-party sites.
    """
    if not url or not isinstance(url, str) or not url.startswith(('http://', 'https://')):
        return {
            'is_valid': False,
            'status_code': 0,
            'status': 'removed_by_provider',
            'detail': 'Invalid URL format'
        }

    # SSL context with default certificates
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TrustHireVerificationBot/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        method='HEAD'
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            code = response.getcode()
            if 200 <= code < 400:
                return {
                    'is_valid': True,
                    'status_code': code,
                    'status': 'verified_active',
                    'detail': f'HTTP {code} OK'
                }
            return {
                'is_valid': False,
                'status_code': code,
                'status': 'needs_verification',
                'detail': f'Unexpected status code {code}'
            }
    except urllib.error.HTTPError as e:
        # Some servers disallow HEAD (403 or 405) but allow GET
        if e.code in (403, 405):
            try:
                get_req = urllib.request.Request(
                    url,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TrustHireVerificationBot/1.0'
                    },
                    method='GET'
                )
                with urllib.request.urlopen(get_req, timeout=timeout, context=ctx) as get_resp:
                    code = get_resp.getcode()
                    if 200 <= code < 400:
                        return {
                            'is_valid': True,
                            'status_code': code,
                            'status': 'verified_active',
                            'detail': f'HTTP {code} OK via GET fallback'
                        }
            except Exception:
                pass
        return {
            'is_valid': False,
            'status_code': e.code,
            'status': 'temporarily_unavailable' if e.code in (429, 500, 502, 503, 504) else 'removed_by_provider',
            'detail': f'HTTP Error {e.code}'
        }
    except urllib.error.URLError as e:
        return {
            'is_valid': False,
            'status_code': 0,
            'status': 'temporarily_unavailable',
            'detail': str(e.reason)
        }
    except Exception as e:
        return {
            'is_valid': False,
            'status_code': 0,
            'status': 'needs_verification',
            'detail': str(e)
        }
