"""
Email service for sending password reset and notification emails.
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails."""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", self.smtp_username)
        
        # Check if email is configured
        self.is_configured = bool(self.smtp_username and self.smtp_password)
        
        if not self.is_configured:
            logger.warning("Email service not configured. Set SMTP_* environment variables.")
    
    def send_email(self, to_email: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
        """
        Send an email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body_html: HTML body content
            body_text: Plain text body content (optional)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.is_configured:
            logger.error("Cannot send email: Email service not configured")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Add text and HTML parts
            if body_text:
                part1 = MIMEText(body_text, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(body_html, 'html')
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    def send_password_reset_email(self, to_email: str, username: str, reset_token: str, base_url: str) -> bool:
        """
        Send password reset email.
        
        Args:
            to_email: User's email address
            username: User's username
            reset_token: Password reset token
            base_url: Base URL of the application
            
        Returns:
            True if successful, False otherwise
        """
        reset_link = f"{base_url}/reset-password?token={reset_token}"
        
        subject = "Password Reset Request - Gas Turbine Monitoring System"
        
        body_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Password Reset Request</h2>
            <p>Hello {username},</p>
            <p>We received a request to reset your password for the Gas Turbine Monitoring System.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>{reset_link}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Gas Turbine Monitoring System</p>
        </body>
        </html>
        """
        
        body_text = f"""
        Password Reset Request
        
        Hello {username},
        
        We received a request to reset your password for the Gas Turbine Monitoring System.
        
        Click the link below to reset your password:
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        Gas Turbine Monitoring System
        """
        
        return self.send_email(to_email, subject, body_html, body_text)


# Global email service instance
email_service = EmailService()

