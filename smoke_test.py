import time
import requests
import sys

import os

PORT = int(os.environ.get('SMOKE_PORT', '8001'))
base=f'http://127.0.0.1:{PORT}'

def get(p):
    try:
        r = requests.get(base+p, timeout=5)
        print('\n== GET', p, 'status', r.status_code)
        print(r.text[:2000])
        return r
    except Exception as e:
        print('ERROR GET', p, e)
        return None

if __name__ == '__main__':
    time.sleep(1)
    u = get('/unassigned-police-requests')
    a = get('/all-officers')

    if not u or not a:
        print('Could not fetch required endpoints; aborting')
        sys.exit(1)

    try:
        un = u.json()
        off = a.json()
    except Exception as e:
        print('JSON parse error', e)
        sys.exit(1)

    if not un:
        print('No unassigned requests available to test assign.')
    else:
        pid = un[0].get('id') or un[0].get('police_request_id')
        area = un[0].get('area')
        print('\nSelected police_request id:', pid, 'area:', area)
        candidate = None
        for o in off:
            if (o.get('area') or '').lower() == (area or '').lower():
                candidate = o
                break
        if not candidate and off:
            candidate = off[0]
            print('No same-area officer found; picking first available officer (for test only)')

        if candidate:
            print('Attempting assign to officer:', candidate.get('id'), candidate.get('name'))
            try:
                r = requests.post(base+'/assign-case', json={'police_request_id': pid, 'officer_id': candidate.get('id'), 'assigned_by_authority_id': 1}, timeout=5)
                print('\n== POST /assign-case status', r.status_code)
                print(r.text)
            except Exception as e:
                print('Assign request failed', e)

    get('/assigned-cases')
    if un:
        pid = un[0].get('id') or un[0].get('police_request_id')
        get(f'/case-updates/{pid}')

    print('\nSmoke test completed')
