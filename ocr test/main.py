import easyocr
import re

reader = easyocr.Reader(['bn', 'en'])

result = reader.readtext('nid.jpg', detail=0)

text = " ".join(result)

print("FULL TEXT:\n")
print(text)

# =========================
# NAME
# =========================

name_match = re.search(r'নাম[:ঃ]?\s*([^\n]+?)\s*Name', text)

# =========================
# DOB
# =========================

dob_match = re.search(r'\d{2}\s[A-Za-z]{3}\s\d{4}', text)

# =========================
# NID
# =========================

nid_match = re.search(r'\b\d{8,17}\b', text)

print("\nEXTRACTED DATA:\n")

if name_match:
    print("Name:", name_match.group(1).strip())

if dob_match:
    print("DOB:", dob_match.group())

if nid_match:
    print("NID:", nid_match.group())