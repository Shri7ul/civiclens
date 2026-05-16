import streamlit as st
import requests
import pandas as pd

st.title("CivicLens")

# =========================
# USER MODULE
# =========================

st.header("User Registration")

name = st.text_input("Name")
email = st.text_input("Email")
password = st.text_input("Password")
role = st.selectbox(
    "Role",
    ["citizen", "admin"]
)

if st.button("Register User"):

    data = {
        "name": name,
        "email": email,
        "password": password,
        "role": role
    }

    response = requests.post(
        "http://127.0.0.1:8000/add-user",
        json=data
    )

    if response.status_code == 200:
        st.success("User Added Successfully")

st.subheader("All Users")

response = requests.get(
    "http://127.0.0.1:8000/users"
)

users = response.json()

df = pd.DataFrame(users)

st.table(df)

# =========================
# TENDER MODULE
# =========================

st.header("Tender Tracking")

title = st.text_input("Tender Title")
area = st.text_input("Area")
budget = st.number_input("Budget")
deadline = st.date_input("Deadline")
status = st.selectbox(
    "Tender Status",
    ["Pending", "Ongoing", "Completed"]
)

if st.button("Add Tender"):

    data = {
        "title": title,
        "area": area,
        "budget": budget,
        "deadline": str(deadline),
        "status": status
    }

    response = requests.post(
        "http://127.0.0.1:8000/add-tender",
        json=data
    )

    if response.status_code == 200:
        st.success("Tender Added Successfully")

st.subheader("All Tenders")

response = requests.get(
    "http://127.0.0.1:8000/tenders"
)

tenders = response.json()

df = pd.DataFrame(tenders)

st.table(df)

# =========================
# POLICE REQUEST MODULE
# =========================

st.header("Police Request Tracking")

user_id = st.number_input(
    "User ID",
    min_value=1,
    step=1
)

request_type = st.selectbox(
    "Request Type",
    ["GD", "Verification", "Complaint"]
)

description = st.text_area("Description")

request_status = st.selectbox(
    "Request Status",
    ["Submitted", "Under Review", "Resolved"]
)

if st.button("Submit Police Request"):

    data = {
        "user_id": int(user_id),
        "request_type": request_type,
        "description": description,
        "status": request_status
    }

    response = requests.post(
        "http://127.0.0.1:8000/add-police-request",
        json=data
    )

    if response.status_code == 200:
        st.success("Police Request Submitted")

st.subheader("All Police Requests")

response = requests.get(
    "http://127.0.0.1:8000/police-requests"
)

requests_data = response.json()

df = pd.DataFrame(requests_data)

st.table(df)