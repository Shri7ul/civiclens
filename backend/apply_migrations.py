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
]

with engine.connect() as conn:
    for c in checks:
        q = text(
            "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA=:schema AND TABLE_NAME=:table AND COLUMN_NAME=:column"
        )
        res = conn.execute(q, {'schema': DB_NAME, 'table': c['table'], 'column': c['column']})
        cnt = res.scalar()
        if cnt == 0:
            print(f"Adding column {c['column']} to {c['table']}")
            conn.execute(text(c['ddl']))
        else:
            print(f"Column {c['column']} already exists on {c['table']}")

print('Migrations applied (if needed).')

