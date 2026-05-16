import pymysql, requests, json
try:
    DB={'host':'localhost','user':'root','password':'','database':'civiclens_db'}
    api='http://127.0.0.1:8000'
    conn = pymysql.connect(**DB)
    cur = conn.cursor()
    cur.execute('SELECT id, user_id FROM officers LIMIT 5')
    rows = cur.fetchall()
    print('officers rows:', rows)
    if not rows:
        print('No officers found in DB')
    else:
        officer_id_db, user_id_db = rows[0]
        print(f'Using first officer -> officer_id: {officer_id_db}, user_id: {user_id_db}')
        try:
            r = requests.get(f'{api}/officer-by-user/{user_id_db}', timeout=5)
            print(f'/officer-by-user status {r.status_code} resp: {r.text}')
        except Exception as e:
            print('Error calling /officer-by-user', e)
        try:
            r2 = requests.get(f'{api}/assigned-cases/{officer_id_db}', timeout=5)
            print(f'/assigned-cases status {r2.status_code}')
            try:
                print('assigned cases json:', json.dumps(r2.json(), indent=2))
            except Exception:
                print('assigned cases text:', r2.text)
        except Exception as e:
            print('Error calling /assigned-cases', e)
    cur.close()
    conn.close()
except Exception as e:
    print('Script Error:', e)
