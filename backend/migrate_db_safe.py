import sqlalchemy as sa
from sqlalchemy import MetaData
from app.database import engine, Base

msg = "Fetching all DB tables..."
print(msg)

meta = MetaData()
meta.reflect(bind=engine)

for table in reversed(meta.sorted_tables):
    print(f"Dropping {table.name}...")
    table.drop(engine)

print("Tables dropped. Recreating from models...")
Base.metadata.create_all(bind=engine)
print("Migration SUCCESS!")
