import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import get_settings

settings = get_settings()


def send_email(to: str, subject: str, body: str) -> bool:
    """Send an email notification via SMTP."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"  [email] SMTP not configured — logging instead")
        print(f"  [email] To: {to} | Subject: {subject}")
        print(f"  [email] Body: {body[:300]}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
        msg["To"] = to
        msg["Subject"] = subject

        # Plain text
        msg.attach(MIMEText(body, "plain"))

        # HTML version
        html = f"""
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <div style="font-size: 14px; font-weight: 700; color: #5B5BD6; margin-bottom: 24px;">HackPlate</div>
            <h2 style="font-size: 18px; color: #1A1A1A; margin-bottom: 16px;">{subject}</h2>
            <div style="font-size: 14px; color: #4B5563; line-height: 1.6; white-space: pre-line;">{body}</div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
                Sent by HackPlate · Event Intelligence for Students
            </div>
        </div>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"  [email] Sent to {to}: {subject}")
        return True

    except Exception as e:
        print(f"  [email] Failed to send to {to}: {e}")
        return False
