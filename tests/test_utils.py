# CORRECTED: Use an absolute import from the 'backend' package root
from backend.core.utils import format_status_for_dashboard


def test_format_status_normal():
    """Tests the function with a normal status string, including confidence."""
    # Updated to expect the confidence text
    assert (
        format_status_for_dashboard("Normal") == "Status: NORMAL (Confidence: 100.0%)"
    )


def test_format_status_fault():
    """Tests the function with a different status string, including confidence."""
    # Updated to expect the confidence text
    assert format_status_for_dashboard("Fault") == "Status: FAULT (Confidence: 100.0%)"


def test_format_status_empty():
    """Tests the function with an empty input."""
    assert format_status_for_dashboard("") == "Status: UNKNOWN"


def test_format_status_none():
    """Tests the function with a None input."""
    assert format_status_for_dashboard(None) == "Status: UNKNOWN"
