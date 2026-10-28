import re
from urllib.parse import urlparse, parse_qs

YOUTUBE_VIDEO_ID_REGEX = re.compile(r'^[a-zA-Z0-9_-]{11}$')
YOUTUBE_PLAYLIST_ID_REGEX = re.compile(r'^[a-zA-Z0-9_-]{12,64}$')

def extract_youtube_info(url: str):
    """
    Extracts video_id and playlist_id from standard YouTube URL formats.
    Supported formats:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://m.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - https://www.youtube.com/playlist?list=PLAYLIST_ID
    - https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
    """
    if not url or not isinstance(url, str):
        return None, None

    url = url.strip()
    video_id = None
    playlist_id = None

    try:
        parsed = urlparse(url)
        hostname = (parsed.hostname or '').lower()

        # youtu.be/VIDEO_ID
        if 'youtu.be' in hostname:
            path_parts = parsed.path.strip('/').split('/')
            if path_parts and path_parts[0]:
                candidate = path_parts[0]
                if YOUTUBE_VIDEO_ID_REGEX.match(candidate):
                    video_id = candidate
            query = parse_qs(parsed.query)
            if 'list' in query:
                playlist_id = query['list'][0]

        # youtube.com
        elif 'youtube.com' in hostname:
            query = parse_qs(parsed.query)
            if 'v' in query:
                candidate = query['v'][0]
                if YOUTUBE_VIDEO_ID_REGEX.match(candidate):
                    video_id = candidate
            if 'list' in query:
                playlist_id = query['list'][0]

            # embed/VIDEO_ID
            if not video_id and '/embed/' in parsed.path:
                parts = parsed.path.split('/embed/')
                if len(parts) > 1:
                    candidate = parts[1].split('/')[0].split('?')[0]
                    if YOUTUBE_VIDEO_ID_REGEX.match(candidate):
                        video_id = candidate

            # /shorts/VIDEO_ID
            if not video_id and '/shorts/' in parsed.path:
                parts = parsed.path.split('/shorts/')
                if len(parts) > 1:
                    candidate = parts[1].split('/')[0].split('?')[0]
                    if YOUTUBE_VIDEO_ID_REGEX.match(candidate):
                        video_id = candidate

    except Exception:
        pass

    return video_id, playlist_id

def get_youtube_thumbnail_url(video_id: str) -> str:
    if video_id and YOUTUBE_VIDEO_ID_REGEX.match(video_id):
        return f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    return ""

def is_valid_youtube_video_id(video_id: str) -> bool:
    return bool(video_id and YOUTUBE_VIDEO_ID_REGEX.match(video_id))
