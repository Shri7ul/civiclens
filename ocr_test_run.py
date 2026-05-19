import sys
import re
import traceback
from PIL import Image

try:
    import easyocr
except Exception:
    easyocr = None


def resize_if_needed(path, max_dim=1600):
    try:
        img = Image.open(path)
    except Exception as e:
        print(f"Could not open image: {e}")
        return False
    max_side = max(img.size)
    if max_side > max_dim:
        scale = max_dim / float(max_side)
        new_size = (int(img.size[0]*scale), int(img.size[1]*scale))
        img = img.resize(new_size, Image.LANCZOS)
        img.save(path)
        print(f"Resized image to {new_size}")
    img.close()
    return True


# initialize reader globally to mimic server behavior
reader = None
if easyocr is not None:
    try:
        # use conservative settings where possible
        reader = easyocr.Reader(["bn", "en"], gpu=False)
    except Exception as e:
        print("Failed to initialize EasyOCR reader:", e)
        reader = None


def extract_text(path):
    if reader is None:
        raise RuntimeError("easyocr reader not available")
    # reduce canvas_size and mag_ratio to lower memory use
    result = reader.readtext(path, detail=0, canvas_size=800, mag_ratio=1.0)
    text = " ".join(result)
    return text


def parse_nid_fields(text):
    nid = None
    dob = None
    name = None

    nid_m = re.search(r"\b\d{8,17}\b", text)
    if nid_m:
        nid = nid_m.group()

    dob_patterns = [r"\d{2}[-/]\d{2}[-/]\d{4}", r"\d{4}[-/]\d{2}[-/]\d{2}", r"\d{2}\s[A-Za-z]{3}\s\d{4}", r"\d{2}\s[A-Za-z]{4,}\s\d{4}"]
    for p in dob_patterns:
        m = re.search(p, text)
        if m:
            dob = m.group()
            break

    name_m = re.search(r'নাম[:ঃ]?\s*([^\n]+)', text)
    if not name_m:
        name_m = re.search(r'Name[:\s]\s*([^\n]+)', text)
    if name_m:
        name = name_m.group(1).strip()

    return {"nid": nid, "dob": dob, "name": name}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ocr_test_run.py <image-path>")
        sys.exit(1)
    path = sys.argv[1]
    print(f"Testing OCR on: {path}")
    try:
        ok = resize_if_needed(path)
        if not ok:
            sys.exit(1)
        print("Running OCR...")
        text = extract_text(path)
        print("\n--- OCR TEXT (first 2000 chars) ---\n")
        print(text[:2000])
        fields = parse_nid_fields(text)
        print("\n--- Extracted Fields ---\n")
        print(fields)
    except Exception as e:
        print("OCR test failed:")
        traceback.print_exc()
        sys.exit(1)
