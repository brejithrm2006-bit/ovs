import re

def normalize_phone(phone: str) -> str:
    """Normalize phone by stripping non-digit characters and verifying length."""
    if not phone:
        return ""
    digits = re.sub(r"\D", "", str(phone).strip())
    return digits

def is_valid_phone(phone: str) -> bool:
    """Validates phone number has between 7 and 15 digits."""
    normalized = normalize_phone(phone)
    return len(normalized) >= 7 and len(normalized) <= 15

def normalize_username(username: str) -> str:
    """Normalize username by trimming and converting to lowercase."""
    if not username:
        return ""
    return str(username).strip().lower()

def is_valid_username(username: str) -> bool:
    """Validates username: 3-30 chars, alphanumeric or underscore."""
    norm = normalize_username(username)
    if len(norm) < 3 or len(norm) > 30:
        return False
    return bool(re.match(r"^[a-z0-9_]+$", norm))

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validates password has at least 6 characters and contains letters and numbers."""
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number."
    return True, ""

def slugify(text: str) -> str:
    """Creates a URL-safe slug from a string."""
    text = str(text).lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")
