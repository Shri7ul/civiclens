import streamlit as st
import requests
from datetime import date

API_URL = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="CivicLens",
    layout="wide"
)

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
    ["Login", "Register"]
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
    if role == "citizen":

        phone = st.text_input("Phone Number")

        if st.button("Register Citizen"):

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

        if st.button("Register Authority"):

            data = {
                "name": name,
                "email": email,
                "password": password,
                "nid": nid,
                "dob": str(dob),
                "address": address
            }

            response = requests.post(
                f"{API_URL}/register-authority",
                json=data
            )

            result = response.json()

            if response.status_code == 200:

                st.success(result["message"])

            else:

                st.error(result["detail"])

    # CONTRACTOR
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

    st.write("Pending Approval Requests")

    response = requests.get(
        f"{API_URL}/pending-users"
    )

    users = response.json()

    for user in users:

        st.write("---------------")

        st.write(f"ID: {user['id']}")

        st.write(f"Name: {user['name']}")

        st.write(f"Email: {user['email']}")

        st.write(f"Role: {user['role']}")

        col1, col2 = st.columns(2)

        # APPROVE
        with col1:

            if st.button(
                f"Approve {user['id']}"
            ):

                approve_response = requests.put(
                    f"{API_URL}/approve-user/{user['id']}"
                )

                st.success(
                    approve_response.json()["message"]
                )

                st.rerun()

        # REJECT
        with col2:

            if st.button(
                f"Reject {user['id']}"
            ):

                reject_response = requests.put(
                    f"{API_URL}/reject-user/{user['id']}"
                )

                st.error(
                    reject_response.json()["message"]
                )

                st.rerun()

    

# LOGOUT
if st.session_state.token:

    if st.sidebar.button("Logout"):

        st.session_state.token = None
        st.session_state.role = None
        st.session_state.user_id = None

        st.rerun()