from backend.database import Base, engine, SessionLocal

# Compatibility shim: allows imports like `from database import Base` from modules
# that expect the database module at the project root. This file re-exports
# the backend.database symbols.
