import inspect
from clerk_backend_api import Clerk
print(inspect.signature(Clerk.authenticate_request))
