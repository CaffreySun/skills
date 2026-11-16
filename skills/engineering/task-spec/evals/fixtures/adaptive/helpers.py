def normalized_names(names):
    """Trim whitespace and return sorted names, preserving duplicates."""
    return sorted(name.strip() for name in names)
