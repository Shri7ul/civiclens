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
