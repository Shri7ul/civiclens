import streamlit as st
import requests
from datetime import date
import os

API_URL = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="CivicLens",
    layout="wide"
)


# Helpers
def fetch_case_documents(police_request_id):
    try:
        r = requests.get(f"{API_URL}/case-documents/{police_request_id}")
        if r.status_code == 200:
            return r.json()
    except Exception:
        return []
    return []
def render_documents_section(police_request_id):
    docs = fetch_case_documents(police_request_id)
    if not docs:
        st.info("No documents uploaded for this case yet")
        return

    for d in docs:
        file_name = d.get('file_name')
        file_path = d.get('file_path')
        uploaded_at = d.get('uploaded_at')

        st.write(f"**{file_name}** — {uploaded_at}")

        # attempt to resolve full path on the same host (common dev setup)
        full_path = file_path or ""
        if full_path and not os.path.isabs(full_path):
            full_path = os.path.abspath(full_path)

        _, ext = os.path.splitext(file_name or "")
        ext = ext.lower()

        try:
            if ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp'] and os.path.exists(full_path):
                with open(full_path, 'rb') as fh:
                    img_bytes = fh.read()
                st.image(img_bytes, caption=file_name)
                if st.button("View Document", key=f"view_doc_{d.get('id')}"):
                    st.download_button("Download Image", data=img_bytes, file_name=file_name)
            elif ext == '.pdf' and os.path.exists(full_path):
                with open(full_path, 'rb') as fh:
                    pdf_bytes = fh.read()
                if st.button("View Document", key=f"view_doc_{d.get('id')}"):
                    st.download_button("Open / Download PDF", data=pdf_bytes, file_name=file_name)
            else:
                # fallback: provide download via fetching from backend if possible
                if st.button("View Document", key=f"view_doc_{d.get('id')}"):
                    try:
                        # try to fetch file bytes via direct HTTP if backend serves them
                        file_resp = requests.get(f"{API_URL}/{file_path}")
                        if file_resp.status_code == 200:
                            st.download_button("Download File", data=file_resp.content, file_name=file_name)
                        else:
                            st.write("Unable to preview/download file from server")
                    except Exception:
                        st.write("Unable to preview/download file")
        except Exception:
            st.write("Error rendering document")


# SESSION
if "token" not in st.session_state:
    st.session_state.token = None

if "role" not in st.session_state:
    st.session_state.role = None

if "user_id" not in st.session_state:
    st.session_state.user_id = None
    
if "show_identity_form" not in st.session_state:
    st.session_state.show_identity_form = False


# TITLE
st.title("CivicLens")

menu = st.sidebar.selectbox(
    "Menu",
    ["Login", "Register", "Admin Register"]
)

# REGISTER
if menu == "Register":

    st.subheader("Create Account")

    role = st.selectbox(
        "Select Role",
        [
            "citizen",
            "officer",
            "authority",
            "contractor"
        ]
    )

    # COMMON FIELDS
    name = st.text_input("Name")

    email = st.text_input("Email")
    password = st.text_input(
        "Password",
        type="password"
    )

    # CITIZEN
    confirm_password = st.text_input(
        "Confirm Password",
        type="password"
    )
    
    if role == "citizen":

        phone = st.text_input("Phone Number")

        if st.button("Register Citizen"):
            if password != confirm_password:
                st.error("Passwords do not match")
            else:
                data = {
                    "name": name,
                    "email": email,
                    "password": password,
                    "phone": phone,
                    "role": "citizen"
                }

                response = requests.post(
                    f"{API_URL}/register",
                    json=data
                )

                result = response.json()

                if response.status_code == 200:

                    st.success(result["message"])
                else:

                    st.error(result["detail"])

    # OFFICER
    elif role == "officer":

        nid = st.text_input("NID")

        designation = st.text_input(
            "Designation"
        )

        address = st.text_input("Address")

        area = st.text_input("Area")

        if st.button("Register Officer"):

            data = {
                "name": name,
                "email": email,
                "password": password,
                "nid": nid,
                "designation": designation,
                "address": address,
                "area": area
            }

            response = requests.post(
                f"{API_URL}/register-officer",
                json=data
            )

            result = response.json()

            if response.status_code == 200:

                st.success(result["message"])

            else:

                st.error(result["detail"])

    # AUTHORITY
    elif role == "authority":

        nid = st.text_input("NID")

        dob = st.date_input(
            "Date of Birth",
            min_value=date(1950, 1, 1),
            max_value=date(2010, 12, 31)
        )

        address = st.text_input("Address")

        if st.button("Register Contractor"):
            if password != confirm_password:
                st.error("Passwords do not match")
            else:
                data = {
                    "name": name,
                    "email": email,
                    "password": password,
                    "company": company,
                    "license_no": license_no,
                    "contact_info": contact_info
                }

                response = requests.post(
                    f"{API_URL}/register-contractor",
                    json=data
                )

                result = response.json()

                if response.status_code == 200:

                    st.success(result["message"])

                else:

                    st.error(result["detail"])
    elif role == "contractor":

        company = st.text_input("Company Name")

        license_no = st.text_input("License Number")

        contact_info = st.text_input("Contact Info")

        if st.button("Register Contractor"):

            data = {
                "name": name,
                "email": email,
                "password": password,
                "company": company,
                "license_no": license_no,
                "contact_info": contact_info
            }

            response = requests.post(
                f"{API_URL}/register-contractor",
                json=data
            )

            result = response.json()

            if response.status_code == 200:

                st.success(result["message"])

            else:

                st.error(result["detail"])


# LOGIN
if menu == "Login":

    st.subheader("Login")

    email = st.text_input("Email")

    password = st.text_input(
        "Password",
        type="password"
    )

    if st.button("Login"):

        data = {
            "email": email,
            "password": password
        }

        response = requests.post(
            f"{API_URL}/login",
            json=data
        )

        result = response.json()

        if response.status_code == 200:

            st.session_state.token = result["access_token"]

            st.session_state.role = result["role"]

            st.session_state.user_id = int(
                result["user_id"]
            )

            st.success("Login Successful")

            st.rerun()
        else:

            st.error(result["detail"])


# ROLE DASHBOARDS
if st.session_state.role == "citizen":

    st.subheader("Citizen Dashboard")

    st.write("Welcome Citizen")

    status_response = requests.get(
        f"{API_URL}/verification-status/{st.session_state.user_id}"
    )

    status_data = status_response.json()

    if status_data.get("verified") == False:

        st.subheader("Phone Verification")

        otp = st.text_input("Enter OTP")

        if st.button("Verify OTP"):

            data = {
                "user_id": st.session_state.user_id,
                "otp_code": otp
            }

            response = requests.post(
                f"{API_URL}/verify-otp",
                json=data
            )

            result = response.json()

            if response.status_code == 200:

                st.success(result["message"])

                st.rerun()

            else:

                st.error(result["message"])

    else:
        st.success("Phone Verified Successfully")

        # Profile completion status
        if status_data.get("nid_verified") == False:

            st.write("Profile Completion: 75%")

            if st.button("Complete Identity Verification"):

                st.session_state.show_identity_form = True

                st.rerun()

            if st.session_state.show_identity_form:

                nid = st.text_input("NID")

                dob = st.date_input(
                    "DOB",
                    min_value=date(1950, 1, 1),
                    max_value=date.today()
                )

                address = st.text_input("Address")

                if st.button(
                    "Submit Identity Verification"
                ): 

                    data = {
                        "user_id":
                        st.session_state.user_id,

                        "nid": nid,

                        "dob": str(dob),

                        "address": address
                    }

                    st.write(data)

                    response = requests.post(
                        f"{API_URL}/verify-nid",
                        json=data
                    )

                    st.write(response.text)

                    verify_result = response.json()

                    if response.status_code == 200:

                        st.success(
                            verify_result.get("message")
                        )

                        st.session_state.show_identity_form = False

                        st.rerun()

                    else:

                        st.error(
                            verify_result.get("message")
                        )

        else:

            st.write("Profile Completion: 100%")

            st.divider()

            st.subheader("Submit GD")

            category = st.selectbox(
                "Category",
                [
                    "Theft",
                    "Fraud",
                    "Harassment",
                    "Cyber Crime",
                    "Missing Person"
                ]
            )

            request_type = st.text_input(
                "Request Type"
            )

            description = st.text_area(
                "Description"
            )

            if st.button("Submit GD"):

                data = {
                    "user_id": st.session_state.user_id,
                    "category": category,
                    "request_type": request_type,
                    "description": description
                }

                response = requests.post(
                    f"{API_URL}/add-police-request",
                    json=data
                )

                result = response.json()

                if response.status_code == 200:

                    st.success(result["message"])

                else:

                    st.error("GD Submission Failed")

            # My GD Requests section
            st.markdown("---")
            st.subheader("My GD Requests")

            my_requests = []
            try:
                r = requests.get(f"{API_URL}/my-police-requests/{st.session_state.user_id}")
                if r.status_code == 200:
                    my_requests = r.json()
                else:
                    st.error("Failed to fetch your GD requests")
            except Exception as e:
                st.error(f"Error fetching GDs: {e}")

            if not my_requests:
                st.info("You have not submitted any GD requests yet")
            else:
                for req in my_requests:
                    with st.container():
                        st.markdown(f"### GD #{req.get('id')}")
                        cols = st.columns([1, 3, 2])
                        with cols[0]:
                            st.write(f"**ID:** {req.get('id')}")
                            st.write(f"**Status:** {req.get('status')}")
                            st.write(f"**Created:** {req.get('created_at')}")
                        with cols[1]:
                            st.write(f"**Category:** {req.get('category')}  ")
                            st.write(f"**Request Type:** {req.get('request_type')}  ")
                            st.write(f"**Description:** {req.get('description')}  ")
                        with cols[2]:
                            if st.button("View Timeline", key=f"view_timeline_{req.get('id')}"):
                                try:
                                    ur = requests.get(f"{API_URL}/case-updates/{req.get('id')}")
                                    if ur.status_code == 200:
                                        updates = ur.json()
                                        if not updates:
                                            st.info("No investigation updates yet")
                                        else:
                                            with st.expander("Timeline / Updates", expanded=True):
                                                for u in updates:
                                                    st.write(f"- {u.get('updated_at')} — {u.get('note') or u.get('update_message')} ({u.get('status') or u.get('case_status')})")
                                    else:
                                        st.error("Failed to fetch updates")
                                except Exception as e:
                                    st.error(f"Error fetching timeline: {e}")

                            st.markdown("---")
                            st.subheader("Case Documents / Evidence")
                            render_documents_section(req.get('id'))

elif st.session_state.role == "officer":

    st.subheader("Officer Dashboard")

    st.write("Welcome Officer")

    # fetch assigned cases
    assigned_cases = []
    officer_id = None
    try:
        resp_off = requests.get(f"{API_URL}/officer-by-user/{st.session_state.user_id}")
        if resp_off.status_code == 200:
            officer_id = resp_off.json().get('officer_id')
        else:
            st.error("No officer record found for current user")
    except Exception as e:
        st.error(f"Error resolving officer record: {e}")

    if officer_id:
        try:
            resp = requests.get(f"{API_URL}/assigned-cases/{officer_id}")
            if resp.status_code == 200:
                assigned_cases = resp.json()
            else:
                st.error("Failed to fetch assigned cases")
        except Exception as e:
            st.error(f"Error fetching assigned cases: {e}")

    st.markdown("---")
    st.subheader("Assigned Cases")

    if not assigned_cases:
        st.info("No assigned cases found")
    else:
        # container for cards
        for case in assigned_cases:
            with st.container():
                st.markdown("#### Police Request #{id}".format(id=case.get('id')))
                cols = st.columns([1, 3, 2])
                with cols[0]:
                    st.write(f"**ID:** {case.get('id')}")
                    st.write(f"**Status:** {case.get('status')}")
                with cols[1]:
                    st.write(f"**Category:** {case.get('category')}  ")
                    st.write(f"**Request Type:** {case.get('request_type')}  ")
                    st.write(f"**Description:** {case.get('description')}  ")
                with cols[2]:
                    # View updates button
                    if st.button("View Updates", key=f"view_updates_{case.get('id')}"):
                        try:
                            uresp = requests.get(f"{API_URL}/case-updates/{case.get('id')}")
                            if uresp.status_code == 200:
                                st.session_state.setdefault('case_updates_cache', {})[case.get('id')] = uresp.json()
                            else:
                                st.error("Failed to fetch updates")
                        except Exception as e:
                            st.error(f"Error fetching updates: {e}")

                    # show cached updates if present
                    cached = st.session_state.get('case_updates_cache', {}).get(case.get('id'))
                    if cached:
                        with st.expander("Timeline / Updates", expanded=False):
                            for upd in cached:
                                st.write(f"- {upd.get('updated_at')} — {upd.get('note') or upd.get('update_message')} ({upd.get('status') or upd.get('case_status')})")

                    st.markdown("---")
                    st.write("**Upload Evidence**")
                    upload_file = st.file_uploader("Select file to upload", key=f"upload_file_{case.get('id')}")
                    if upload_file is not None:
                        if st.button("Upload Evidence", key=f"upload_btn_{case.get('id')}"):
                            try:
                                files = {
                                    'file': (upload_file.name, upload_file.getvalue(), upload_file.type or 'application/octet-stream')
                                }
                                data = {
                                    'police_request_id': case.get('id'),
                                    'officer_id': officer_id
                                }
                                with st.spinner("Uploading..."):
                                    resp = requests.post(f"{API_URL}/upload-case-document", data=data, files=files)
                                try:
                                    j = resp.json()
                                except Exception:
                                    j = {"message": resp.text}

                                if resp.status_code == 200:
                                    st.success(j.get('message') or 'Upload successful')
                                    st.rerun()
                                else:
                                    st.error(j.get('detail') or j.get('message') or resp.text)
                            except Exception as e:
                                st.error(f"Error uploading file: {e}")

    st.markdown("---")
    st.subheader("Add Case Update")

    # prepare list of case ids for dropdown
    case_options = {c.get('id'): f"#{c.get('id')} — {c.get('category')}" for c in assigned_cases} if assigned_cases else {}

    selected_case = None
    if case_options:
        selected_case_id = st.selectbox("Select Case", options=list(case_options.keys()), format_func=lambda x: case_options.get(x))
        selected_case = selected_case_id
    else:
        st.info("No cases available to update")

    update_message = st.text_area("Update Message")

    status = st.selectbox(
        "Case Status",
        [
            "Under Investigation",
            "Evidence Collected",
            "Suspect Identified",
            "Closed"
        ]
    )

    if st.button("Submit Update"):
        if not selected_case:
            st.error("Please select a case to update")
        elif not update_message.strip():
            st.error("Please enter an update message")
        else:
            payload = {
                "police_request_id": selected_case,
                "officer_id": st.session_state.user_id,
                "update_message": update_message,
                "case_status": status
            }
            try:
                with st.spinner("Submitting update..."):
                    r = requests.post(f"{API_URL}/add-case-update", json=payload)
                if r.status_code == 200:
                    st.success("Case update submitted successfully")
                    st.rerun()
                else:
                    # try to show backend message
                    try:
                        err = r.json()
                        st.error(err.get('detail') or err.get('message') or r.text)
                    except Exception:
                        st.error(r.text)
            except Exception as e:
                st.error(f"Error submitting update: {e}")

elif st.session_state.role == "authority":

    st.subheader("Authority Dashboard")

    st.write("Welcome Authority")
    
    # Fetch unassigned police requests and available officers
    unassigned = []
    officers = []
    try:
        r = requests.get(f"{API_URL}/unassigned-police-requests")
        if r.status_code == 200:
            unassigned = r.json()
        else:
            st.error("Failed to fetch unassigned police requests")
    except Exception as e:
        st.error(f"Error fetching unassigned requests: {e}")

    try:
        r2 = requests.get(f"{API_URL}/all-officers")
        if r2.status_code == 200:
            officers = r2.json()
        else:
            st.error("Failed to fetch officers")
    except Exception as e:
        st.error(f"Error fetching officers: {e}")

    st.markdown("---")
    st.subheader("Unassigned GDs")

    if not unassigned:
        st.info("No unassigned GD requests")
    else:
        # prepare officer options mapping for dropdowns
        officer_options = {o.get('id'): f"{o.get('name')} — {o.get('designation')} — {o.get('area')}" for o in officers}

        for req in unassigned:
            with st.container():
                st.markdown(f"### GD #{req.get('id')}")
                cols = st.columns([1, 3, 2])
                with cols[0]:
                    st.write(f"**ID:** {req.get('id')}")
                    st.write(f"**Status:** {req.get('status')}")
                    st.write(f"**Created:** {req.get('created_at')}")
                with cols[1]:
                    st.write(f"**Category:** {req.get('category')}  ")
                    st.write(f"**Request Type:** {req.get('request_type')}  ")
                    st.write(f"**Description:** {req.get('description')}  ")
                with cols[2]:
                    # officer select
                    if officer_options:
                        selected = st.selectbox(
                            "Select Officer",
                            options=list(officer_options.keys()),
                            format_func=lambda x: officer_options.get(x),
                            key=f"assign_select_{req.get('id')}"
                        )
                    else:
                        st.info("No approved officers available")
                        selected = None

                    if st.button("Assign Officer", key=f"assign_btn_{req.get('id')}"):
                        if not selected:
                            st.error("Please select an officer to assign")
                        else:
                            payload = {
                                "police_request_id": req.get('id'),
                                "officer_id": selected
                            }
                            try:
                                with st.spinner("Assigning officer..."):
                                    resp = requests.post(f"{API_URL}/assign-case", json=payload)
                                try:
                                    j = resp.json()
                                except Exception:
                                    j = {"message": resp.text}

                                if resp.status_code == 200:
                                    msg = j.get('message') if isinstance(j, dict) else str(j)
                                    if msg == "Case already assigned":
                                        st.warning(msg)
                                    else:
                                        st.success(msg)
                                    st.rerun()
                                else:
                                    st.error(j.get('detail') or j.get('message') or resp.text)
                            except Exception as e:
                                st.error(f"Error assigning officer: {e}")

elif st.session_state.role == "contractor":

    st.subheader("Contractor Dashboard")

    st.write("Welcome Contractor")

elif st.session_state.role == "admin":
    st.subheader("Admin Dashboard")

    # System stats
    try:
        stats_resp = requests.get(f"{API_URL}/system-stats")
        stats = stats_resp.json() if stats_resp.status_code == 200 else {}
    except Exception:
        stats = {}

    cols = st.columns(5)
    cols[0].metric("Total Users", stats.get('total_users', 0))
    cols[1].metric("Officers", stats.get('total_officers', 0))
    cols[2].metric("Authorities", stats.get('total_authorities', 0))
    cols[3].metric("Contractors", stats.get('total_contractors', 0))
    cols[4].metric("Active Investigations", stats.get('total_active_investigations', 0))

    st.markdown("---")

    # Pending officers
    st.subheader("Pending Officers")
    try:
        po = requests.get(f"{API_URL}/pending-officers")
        pending_officers = po.json() if po.status_code == 200 else []
    except Exception:
        pending_officers = []

    if not pending_officers:
        st.info("No pending officers")
    else:
        for u in pending_officers:
            with st.container():
                st.markdown(f"**{u.get('name')}** — {u.get('email')}")
                st.write(f"{u.get('designation')} — {u.get('area')}")
                c1, c2 = st.columns([1,1])
                with c1:
                    if st.button("Approve", key=f"approve_off_{u.get('id')}"):
                        try:
                            # resolve admin_id mapped to current logged-in user
                            am = requests.get(f"{API_URL}/admin-by-user/{st.session_state.user_id}")
                            if am.status_code != 200:
                                try:
                                    err = am.json()
                                    st.error(err.get('detail') or 'Admin mapping not found')
                                except Exception:
                                    st.error('Admin mapping not found')
                                continue
                            admin_id = am.json().get('admin_id')
                            resp = requests.put(f"{API_URL}/approve-user/{u.get('id')}", json={"admin_id": admin_id})
                            if resp.status_code == 200:
                                st.success(resp.json().get('message'))
                                st.rerun()
                            else:
                                st.error(resp.text)
                        except Exception as e:
                            st.error(f"Error: {e}")
                with c2:
                    if st.button("Reject", key=f"reject_off_{u.get('id')}"):
                        try:
                            am = requests.get(f"{API_URL}/admin-by-user/{st.session_state.user_id}")
                            if am.status_code != 200:
                                try:
                                    err = am.json()
                                    st.error(err.get('detail') or 'Admin mapping not found')
                                except Exception:
                                    st.error('Admin mapping not found')
                                continue
                            admin_id = am.json().get('admin_id')
                            resp = requests.put(f"{API_URL}/reject-user/{u.get('id')}", json={"admin_id": admin_id})
                            if resp.status_code == 200:
                                st.success(resp.json().get('message'))
                                st.rerun()
                            else:
                                st.error(resp.text)
                        except Exception as e:
                            st.error(f"Error: {e}")

    st.markdown("---")

    # Pending authorities
    st.subheader("Pending Authorities")
    try:
        pa = requests.get(f"{API_URL}/pending-authorities")
        pending_auth = pa.json() if pa.status_code == 200 else []
    except Exception:
        pending_auth = []

    if not pending_auth:
        st.info("No pending authorities")
    else:
        for u in pending_auth:
            with st.container():
                st.markdown(f"**{u.get('name')}** — {u.get('email')}")
                st.write(f"NID: {u.get('nid')} — {u.get('address')}")
                c1, c2 = st.columns([1,1])
                with c1:
                    if st.button("Approve", key=f"approve_auth_{u.get('id')}"):
                        try:
                            am = requests.get(f"{API_URL}/admin-by-user/{st.session_state.user_id}")
                            if am.status_code != 200:
                                try:
                                    err = am.json()
                                    st.error(err.get('detail') or 'Admin mapping not found')
                                except Exception:
                                    st.error('Admin mapping not found')
                                continue
                            admin_id = am.json().get('admin_id')
                            resp = requests.put(f"{API_URL}/approve-user/{u.get('id')}", json={"admin_id": admin_id})
                            if resp.status_code == 200:
                                st.success(resp.json().get('message'))
                                st.rerun()
                            else:
                                st.error(resp.text)
                        except Exception as e:
                            st.error(f"Error: {e}")
                with c2:
                    if st.button("Reject", key=f"reject_auth_{u.get('id')}"):
                        try:
                            am = requests.get(f"{API_URL}/admin-by-user/{st.session_state.user_id}")
                            if am.status_code != 200:
                                try:
                                    err = am.json()
                                    st.error(err.get('detail') or 'Admin mapping not found')
                                except Exception:
                                    st.error('Admin mapping not found')
                                continue
                            admin_id = am.json().get('admin_id')
                            resp = requests.put(f"{API_URL}/reject-user/{u.get('id')}", json={"admin_id": admin_id})
                            if resp.status_code == 200:
                                st.success(resp.json().get('message'))
                                st.rerun()
                            else:
                                st.error(resp.text)
                        except Exception as e:
                            st.error(f"Error: {e}")

    st.markdown("---")

    # Pending contractors
    st.subheader("Pending Contractors")
    try:
        pc = requests.get(f"{API_URL}/pending-contractors")
        pending_cont = pc.json() if pc.status_code == 200 else []
    except Exception:
        pending_cont = []

    if not pending_cont:
        st.info("No pending contractors")
    else:
        for u in pending_cont:
            with st.container():
                st.markdown(f"**{u.get('name')}** — {u.get('email')}")
                st.write(f"Company: {u.get('company')} — {u.get('contact_info')}")
                c1, c2 = st.columns([1,1])
                with c1:
                    if st.button("Approve", key=f"approve_cont_{u.get('id')}"):
                        try:
                            am = requests.get(f"{API_URL}/admin-by-user/{st.session_state.user_id}")
                            if am.status_code != 200:
                                try:
                                    err = am.json()
                                    st.error(err.get('detail') or 'Admin mapping not found')
                                except Exception:
                                    st.error('Admin mapping not found')
                                continue
                            admin_id = am.json().get('admin_id')
                            resp = requests.put(f"{API_URL}/approve-user/{u.get('id')}", json={"admin_id": admin_id})
                            if resp.status_code == 200:
                                st.success(resp.json().get('message'))
                                st.rerun()
                            else:
                                st.error(resp.text)
                        except Exception as e:
                            st.error(f"Error: {e}")
                with c2:
                    if st.button("Reject", key=f"reject_cont_{u.get('id')}"):
                        try:
                            am = requests.get(f"{API_URL}/admin-by-user/{st.session_state.user_id}")
                            if am.status_code != 200:
                                try:
                                    err = am.json()
                                    st.error(err.get('detail') or 'Admin mapping not found')
                                except Exception:
                                    st.error('Admin mapping not found')
                                continue
                            admin_id = am.json().get('admin_id')
                            resp = requests.put(f"{API_URL}/reject-user/{u.get('id')}", json={"admin_id": admin_id})
                            if resp.status_code == 200:
                                st.success(resp.json().get('message'))
                                st.rerun()
                            else:
                                st.error(resp.text)
                        except Exception as e:
                            st.error(f"Error: {e}")

    st.markdown("---")

    # Recent Audit Logs
    st.subheader("Recent Audit Logs")
    try:
        al = requests.get(f"{API_URL}/audit-logs")
        audit_logs = al.json() if al.status_code == 200 else []
    except Exception:
        audit_logs = []

    if not audit_logs:
        st.info("No audit logs found")
    else:
        for a in audit_logs:
            st.write(f"- {a.get('timestamp')} — {a.get('action')}")

elif menu == "Admin Register":

    st.subheader("Admin Register")

    invitation_code = st.text_input("Invitation Code")
    name = st.text_input("Name")
    email = st.text_input("Email")
    phone = st.text_input("Phone")
    password = st.text_input("Password", type="password")
    confirm_password_admin = st.text_input("Confirm Password", type="password")

    if st.button("Register Admin"):
        if password != confirm_password_admin:
            st.error("Passwords do not match")
        else:
            data = {
                "invitation_code": invitation_code,
                "name": name,
                "email": email,
                "phone": phone,
                "password": password
            }
        try:
            resp = requests.post(f"{API_URL}/register-admin", json=data)
            try:
                j = resp.json()
            except Exception:
                j = {"message": resp.text}

            if resp.status_code == 200 and j.get('message') == 'Admin Registered Successfully':
                st.success("Admin Registered Successfully — logging in...")
                # attempt immediate login
                login_payload = {"email": email, "password": password}
                lr = requests.post(f"{API_URL}/login", json=login_payload)
                try:
                    lj = lr.json()
                except Exception:
                    lj = {}

                if lr.status_code == 200:
                    st.session_state.token = lj.get('access_token')
                    st.session_state.role = lj.get('role')
                    st.session_state.user_id = int(lj.get('user_id'))
                    st.success("Logged in as admin")
                    st.rerun()
                else:
                    st.info("Registration succeeded but auto-login failed; please login manually.")
            else:
                # show error message from backend
                st.error(j.get('message') or j.get('detail') or resp.text)
        except Exception as e:
            st.error(f"Error: {e}")

    

# LOGOUT
if st.session_state.token:

    if st.sidebar.button("Logout"):

        st.session_state.token = None
        st.session_state.role = None
        st.session_state.user_id = None

        st.rerun()