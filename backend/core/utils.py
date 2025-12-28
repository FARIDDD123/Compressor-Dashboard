# backend/core/utils.py

# CHANGED: Added confidence parameter
def format_status_for_dashboard(status_text: str, confidence: float = 1.0) -> str:
    """Takes a status string and confidence level and formats it for display."""
    if not isinstance(status_text, str) or not status_text:
        return "Status: UNKNOWN"

    confidence_percent = confidence * 100

    # Format the status to include confidence
    return f"Status: {status_text.upper()} (Confidence: {confidence_percent:.1f}%)"
