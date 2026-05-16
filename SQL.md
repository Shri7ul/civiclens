
## Core Tables

```text id="pwwn98"
users
user_profiles
user_verification
notifications
audit_logs
```

## Tender Module

```text id="04f0m0"
tender_categories
contractors
authorities
tenders
tender_documents
tender_updates
tender_assignments
```

## Police Module

```text id="8r3pjx"
crime_categories
officers
police_requests
crime_assignments
case_documents
case_updates
```

## Admin Module

```text id="wafjtf"
admins
```

---

# STEP 1 — Create Database


```sql id="3laz0n"

CREATE DATABASE civiclens_db;

USE civiclens_db;
```

---

# STEP 2 — FULL FINAL SQL CODE

## USERS

```sql id="7thb5n"
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50)
);
```

---

## USER PROFILES

```sql id="i2k6xv"
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    phone VARCHAR(20),
    address VARCHAR(255),

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```

---

## USER VERIFICATION

```sql id="x6cc5h"
CREATE TABLE user_verification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    phone_verified BOOLEAN DEFAULT FALSE,
    nid_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(10),
    otp_expiry DATETIME,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```

---

## NOTIFICATIONS

```sql id="0sqh29"
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    req_id INT,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```

---

## AUDIT LOGS

```sql id="nys8di"
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```

---

# TENDER MODULE

## TENDER CATEGORIES

```sql id="24uy1h"
CREATE TABLE tender_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## CONTRACTORS

```sql id="nyb5em"
CREATE TABLE contractors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    company VARCHAR(100),
    license_no VARCHAR(100),
    contact_info VARCHAR(255)
);
```

---

## ADMINS

```sql id="2l72wt"
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
);
```

---

## AUTHORITIES

```sql id="jlwmrh"
CREATE TABLE authorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    nid VARCHAR(100),
    dob DATE,
    address VARCHAR(255),
    created_by_admin_id INT,

    FOREIGN KEY (created_by_admin_id)
    REFERENCES admins(id)
    ON DELETE SET NULL
);
```

---

## TENDERS

```sql id="r8gaj6"
CREATE TABLE tenders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    category_id INT,
    contractor_id INT,
    area VARCHAR(100),
    budget DECIMAL(12,2),
    deadline DATE,
    status VARCHAR(50),
    approved_by_authority_id INT,

    FOREIGN KEY (category_id)
    REFERENCES tender_categories(id),

    FOREIGN KEY (contractor_id)
    REFERENCES contractors(id),

    FOREIGN KEY (approved_by_authority_id)
    REFERENCES authorities(id)
);
```

---

## TENDER DOCUMENTS

```sql id="h1y7x0"
CREATE TABLE tender_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT,
    file_name VARCHAR(255),
    document_type VARCHAR(100),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tender_id)
    REFERENCES tenders(id)
    ON DELETE CASCADE
);
```

---

## TENDER UPDATES

```sql id="v2k3r6"
CREATE TABLE tender_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT,
    status VARCHAR(100),
    progress_percentage INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tender_id)
    REFERENCES tenders(id)
    ON DELETE CASCADE
);
```

---

## OFFICERS

```sql id="z04q5d"
CREATE TABLE officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    nid VARCHAR(100),
    designation VARCHAR(100),
    address VARCHAR(255),
    created_by_admin_id INT,
    area VARCHAR(100),

    FOREIGN KEY (created_by_admin_id)
    REFERENCES admins(id)
    ON DELETE SET NULL
);
```

---

## TENDER ASSIGNMENTS

```sql id="4f0mho"
CREATE TABLE tender_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT,
    officer_id INT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tender_id)
    REFERENCES tenders(id)
    ON DELETE CASCADE,

    FOREIGN KEY (officer_id)
    REFERENCES officers(id)
    ON DELETE CASCADE
);
```

---

# POLICE MODULE

## CRIME CATEGORIES

```sql id="zn2z8r"
CREATE TABLE crime_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);
```

---

## POLICE REQUESTS

```sql id="jlwm3g"
CREATE TABLE police_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    description TEXT,
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (category_id)
    REFERENCES crime_categories(id)
);
```

---

## CRIME ASSIGNMENTS

```sql id="76txzq"
CREATE TABLE crime_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    officer_id INT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id)
    REFERENCES police_requests(id)
    ON DELETE CASCADE,

    FOREIGN KEY (officer_id)
    REFERENCES officers(id)
    ON DELETE CASCADE
);
```

---

## CASE DOCUMENTS

```sql id="twb2nl"
CREATE TABLE case_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    file_url VARCHAR(255),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id)
    REFERENCES police_requests(id)
    ON DELETE CASCADE
);
```

---

## CASE UPDATES

```sql id="0x2qxo"
CREATE TABLE case_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    status VARCHAR(100),
    note TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id)
    REFERENCES police_requests(id)
    ON DELETE CASCADE
);
```

---

# STEP 3 — DEMO DATA

## Admin

```sql id="0kmw4q"
INSERT INTO admins (name, email, phone)
VALUES
('System Admin', 'admin@civiclens.com', '01700000000');
```

---

## Users

```sql id="rt8xvb"
INSERT INTO users (name, email, password, role)
VALUES
('Rahim', 'rahim@gmail.com', '1234', 'citizen'),
('Karim', 'karim@gmail.com', '1234', 'citizen');
```

---

## Officers

```sql id="i3ykyn"
INSERT INTO officers
(name, nid, designation, address, created_by_admin_id, area)
VALUES
('Officer Arif', '123456789', 'SI', 'Dhaka', 1, 'Dhaka');
```

---

## Crime Categories

```sql id="n4txtr"
INSERT INTO crime_categories (name)
VALUES
('GD'),
('Cyber Crime'),
('Theft');
```

---

## Police Requests

```sql id="xlf6j7"
INSERT INTO police_requests
(user_id, category_id, description, status)
VALUES
(1, 1, 'Lost NID card', 'Under Review');
```

---

## Tender Categories

```sql id="88vw3u"
INSERT INTO tender_categories
(name, description)
VALUES
('Road Development', 'Road related projects');
```

---

## Contractors

```sql id="w3z3vq"
INSERT INTO contractors
(name, company, license_no, contact_info)
VALUES
('ABC Contractor', 'ABC Ltd', 'LIC123', '01711111111');
```

---

## Authorities

```sql id="1s1pmh"
INSERT INTO authorities
(name, nid, dob, address, created_by_admin_id)
VALUES
('Authority One', '987654321', '1980-01-01', 'Dhaka', 1);
```

---

## Tenders

```sql id="39aj8v"
INSERT INTO tenders
(title, category_id, contractor_id, area, budget, deadline, status, approved_by_authority_id)
VALUES
(
'Road Construction',
1,
1,
'Dhaka',
5000000,
'2026-06-30',
'Ongoing',
1
);
```

---

```sql id="39aj8v"
ALTER TABLE users
ADD COLUMN is_approved BOOLEAN DEFAULT TRUE;
```

```sql id="39aj8v"
ALTER TABLE users
ADD COLUMN is_rejected BOOLEAN DEFAULT FALSE;
```

```sql id="39aj8v"
ALTER TABLE admins
ADD COLUMN password VARCHAR(255);
```

```sql id="39aj8v"
ALTER TABLE officers
ADD COLUMN user_id INT;

ALTER TABLE officers
ADD CONSTRAINT fk_officer_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;
```

```sql id="39aj8v"
ALTER TABLE officers
DROP COLUMN name;
```

```sql id="39aj8v"
ALTER TABLE authorities
ADD COLUMN user_id INT;

ALTER TABLE authorities
ADD CONSTRAINT fk_authority_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE authorities
DROP COLUMN name;
```

```sql id="39aj8v"
ALTER TABLE contractors
ADD COLUMN user_id INT;

ALTER TABLE contractors
ADD CONSTRAINT fk_contractor_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE contractors
DROP COLUMN name;
```

```sql id="39aj8v"
ALTER TABLE contractors
ADD COLUMN created_by_admin_id INT;

ALTER TABLE contractors
ADD CONSTRAINT fk_contractor_admin
FOREIGN KEY (created_by_admin_id)
REFERENCES admins(id)
ON DELETE SET NULL;
```

```sql id="39aj8v"
ALTER TABLE user_verification
ADD COLUMN nid VARCHAR(100);

ALTER TABLE user_verification
ADD COLUMN dob VARCHAR(100);
```

```sql id="39aj8v"
CREATE TABLE demo_nid_data (

    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100),

    nid VARCHAR(100),

    dob DATE,

    phone VARCHAR(20)
);
```
```sql id="39aj8v"
INSERT INTO demo_nid_data
(full_name, nid, dob, phone)

VALUES

(
    'Rahim Ahmed',
    '123456789',
    '2003-05-10',
    '01711111111'
),

(
    'Karim Hasan',
    '987654321',
    '2001-08-15',
    '01822222222'
);
```
```sql id="39aj8v"
ALTER TABLE user_verification
ADD COLUMN verification_completed BOOLEAN DEFAULT FALSE;
```
```sql id="39aj8v"
ALTER TABLE police_requests
ADD COLUMN category VARCHAR(100);
```

```sql id="39aj8v"
ALTER TABLE police_requests
ADD COLUMN request_type VARCHAR(100);
```

```sql id="39aj8v"
CREATE TABLE crime_assignments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    police_request_id INT,

    officer_id INT,

    assigned_by_authority_id INT,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (police_request_id)
    REFERENCES police_requests(id)
    ON DELETE CASCADE,

    FOREIGN KEY (officer_id)
    REFERENCES officers(id)
    ON DELETE CASCADE
);
```

```sql id="39aj8v"
ALTER TABLE crime_assignments
CHANGE request_id police_request_id INT;

ALTER TABLE crime_assignments
ADD COLUMN assigned_by_authority_id INT NULL;

ALTER TABLE crime_assignments
ADD CONSTRAINT fk_police_request
FOREIGN KEY (police_request_id)
REFERENCES police_requests(id)
ON DELETE CASCADE;

ALTER TABLE crime_assignments
ADD CONSTRAINT fk_officer
FOREIGN KEY (officer_id)
REFERENCES officers(id)
ON DELETE CASCADE;
```

```sql id="39aj8v"
ALTER TABLE case_updates
CHANGE request_id police_request_id INT;

ALTER TABLE case_updates
CHANGE note update_message TEXT;

ALTER TABLE case_updates
CHANGE status case_status VARCHAR(100);

ALTER TABLE case_updates
ADD COLUMN officer_id INT;

ALTER TABLE case_updates
ADD CONSTRAINT fk_case_updates_request
FOREIGN KEY (police_request_id)
REFERENCES police_requests(id)
ON DELETE CASCADE;

ALTER TABLE case_updates
ADD CONSTRAINT fk_case_updates_officer
FOREIGN KEY (officer_id)
REFERENCES officers(id)
ON DELETE CASCADE;
```
```sql id="39aj8v"
ALTER TABLE case_documents
CHANGE request_id police_request_id INT;

ALTER TABLE case_documents
CHANGE file_url file_path VARCHAR(500);

ALTER TABLE case_documents
ADD COLUMN officer_id INT;

ALTER TABLE case_documents
ADD COLUMN file_name VARCHAR(255);

ALTER TABLE case_documents
ADD CONSTRAINT fk_case_documents_request
FOREIGN KEY (police_request_id)
REFERENCES police_requests(id)
ON DELETE CASCADE;

ALTER TABLE case_documents
ADD CONSTRAINT fk_case_documents_officer
FOREIGN KEY (officer_id)
REFERENCES officers(id)
ON DELETE CASCADE;
```