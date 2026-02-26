def send_email(to: str, subject: str, body: str) -> bool:
    """
    Email notification stub.
    Logs to console instead of sending real email.
    Pluggable provider support (SendGrid integration pending).
    """
    print(f"  [email-stub] To: {to}")
    print(f"  [email-stub] Subject: {subject}")
    print(f"  [email-stub] Body: {body[:200]}...")
    return True
