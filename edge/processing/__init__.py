"""
Edge Processing Module

Provides processing capabilities for edge computing including RTM and DVR.
"""

from .rtm_processor import EdgeRTMProcessor
from .dvr_processor import EdgeDVRProcessor

__all__ = ["EdgeRTMProcessor", "EdgeDVRProcessor"]

