import os

# Folder structure
folders = [
    "backend",
    "backend/models",
    "backend/routes",
    "backend/schemas",
    "backend/utils",
    "frontend"
]

# Files to create
files = [
    # Backend Core
    "backend/main.py",
    "backend/database.py",

    # Models
    "backend/models/__init__.py",
    "backend/models/user_model.py",
    "backend/models/tender_model.py",
    "backend/models/police_model.py",

    # Schemas
    "backend/schemas/__init__.py",
    "backend/schemas/user_schema.py",
    "backend/schemas/tender_schema.py",
    "backend/schemas/police_schema.py",

    # Routes
    "backend/routes/__init__.py",
    "backend/routes/user_routes.py",
    "backend/routes/tender_routes.py",
    "backend/routes/police_routes.py",

    # Utils
    "backend/utils/__init__.py",
    "backend/utils/db.py",

    # Frontend
    "frontend/app.py",

    # Root files
    "requirements.txt",
    "README.md"
]

# Create folders
for folder in folders:
    os.makedirs(folder, exist_ok=True)
    print(f"Created folder: {folder}")

# Create files
for file in files:
    if not os.path.exists(file):
        with open(file, "w") as f:
            pass
        print(f"Created file: {file}")
    else:
        print(f"Already exists: {file}")

print("\nCivicLens project structure created successfully!")