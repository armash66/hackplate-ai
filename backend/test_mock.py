from fastapi import Request
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
import sys

# Mock request class that matches Requestish
class MockRequest:
    def __init__(self):
        self.headers = {"authorization": "Bearer fake_token"}
        self.url = "http://localhost:8000"
        self.method = "GET"

req = MockRequest()
clerk = Clerk(bearer_auth="sk_test_0OHLj7Wb1DsUuGWVF1pZwBHxDsa4eCVFbB6mya7kHs")

try:
    state = clerk.authenticate_request(req, AuthenticateRequestOptions())
    print("SUCCESS", state.is_signed_in)
except Exception as e:
    print("FAIL", getattr(e, "message", str(e)))
