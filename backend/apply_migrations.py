from database import engine
from sqlalchemy import text

DB_NAME = 'civiclens_db'

checks = [
    {
        'table': 'officers',
        'column': 'specialization',
        'ddl': "ALTER TABLE officers ADD COLUMN specialization VARCHAR(200) NULL"
    },
    {
        'table': 'police_requests',
        'column': 'area',
        'ddl': "ALTER TABLE police_requests ADD COLUMN area VARCHAR(100) NULL"
    }
    ,
    {
        'table': 'police_requests',
        'column': 'location',
        'ddl': "ALTER TABLE police_requests ADD COLUMN location VARCHAR(255) NULL"
    }
    ,
    {
        'table': 'police_requests',
        'column': 'citizen_confirmation_pending',
        'ddl': "ALTER TABLE police_requests ADD COLUMN citizen_confirmation_pending BOOLEAN DEFAULT FALSE"
    },
    {
        'table': 'police_requests',
        'column': 'is_archived',
        'ddl': "ALTER TABLE police_requests ADD COLUMN is_archived BOOLEAN DEFAULT FALSE"
    },
    {
        'table': 'police_requests',
        'column': 'resolved_at',
        'ddl': "ALTER TABLE police_requests ADD COLUMN resolved_at DATETIME NULL"
    },
    {
        'table': 'officers',
        'column': 'resolved_cases',
        'ddl': "ALTER TABLE officers ADD COLUMN resolved_cases INT DEFAULT 0"
    }
,
    {
        'table': 'public_cases',
        'column': 'title',
        'ddl': "CREATE TABLE public_cases (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            title VARCHAR(255),\n            description TEXT,\n            area VARCHAR(100),\n            status VARCHAR(100),\n            source_name VARCHAR(255),\n            source_url VARCHAR(512),\n            assigned_officer_id INT NULL,\n            created_by_admin_id INT NULL,\n            is_featured BOOLEAN DEFAULT FALSE,\n            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n        )"
    }
]

with engine.connect() as conn:
    for c in checks:
        q = text(
            "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA=:schema AND TABLE_NAME=:table AND COLUMN_NAME=:column"
        )
        res = conn.execute(q, {"schema": DB_NAME, "table": c["table"], "column": c["column"]})
        cnt = res.scalar()
        if cnt == 0:
            print(f"Adding column {c['column']} to {c['table']}")
            conn.execute(text(c['ddl']))
        else:
            print(f"Column {c['column']} already exists on {c['table']}")

print('Migrations applied (if needed).')
