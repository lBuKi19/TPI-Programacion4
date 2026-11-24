from datetime import datetime, timezone


def utc_now() -> datetime:
    """Devuelve la fecha y hora actual con zona horaria UTC."""
    return datetime.now(timezone.utc)