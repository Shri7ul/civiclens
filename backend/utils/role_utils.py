HIERARCHY = [
    'citizen',
    'contractor',
    'officer',
    'authority',
    'admin'
]

def get_inherited_roles(role: str):
    """Return a list of roles that the given role inherits, including itself.

    Example: get_inherited_roles('officer') -> ['citizen','contractor','officer']
    """
    if not role:
        return []

    role = role.lower()
    try:
        idx = HIERARCHY.index(role)
    except ValueError:
        # Unknown role: return just the role itself
        return [role]

    return HIERARCHY[: idx + 1]


def has_role(user_role: str, required_role: str) -> bool:
    """Return True if user_role inherits required_role."""
    return required_role in get_inherited_roles(user_role)
