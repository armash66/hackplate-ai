import sqlalchemy as sa
from app.database import engine, Base
from app.models import User

print("Connecting to database...")
with engine.connect() as conn:
    print("Dropping schema cascade...")
    conn.execute(sa.text("DROP SCHEMA public CASCADE;"))
    conn.execute(sa.text("CREATE SCHEMA public;"))
    conn.execute(sa.text("GRANT ALL ON SCHEMA public TO postgres;"))
    conn.execute(sa.text("GRANT ALL ON SCHEMA public TO public;"))
    conn.commit()

print("Recreating tables...")
Base.metadata.create_all(bind=engine)
print("Migration complete!")
