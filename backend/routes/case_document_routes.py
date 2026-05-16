import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from utils.db import get_db

from models.case_document_model import (
    CaseDocument
)

from schemas.case_document_schema import (
    CaseDocumentOut
)

router = APIRouter()

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "case_documents")
# ensure upload dir exists on import
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-case-document")
async def upload_case_document(
    police_request_id: int = Form(...),
    officer_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # validate police request existence
    from models.police_model import PoliceRequest

    pr = db.query(PoliceRequest).filter(PoliceRequest.id == police_request_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Police request not found")

    # generate unique filename preserving extension
    orig_name = file.filename or "upload"
    _, ext = os.path.splitext(orig_name)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_name)

    contents = await file.read()
    try:
        with open(dest_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # store DB record (store relative path)
    rel_path = os.path.relpath(dest_path, os.getcwd())

    new_doc = CaseDocument(
        police_request_id=police_request_id,
        officer_id=officer_id,
        file_name=orig_name,
        file_path=rel_path
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {"message": "File uploaded successfully", "document_id": new_doc.id}


@router.get("/case-documents/{police_request_id}")
def get_case_documents(
    police_request_id: int,
    db: Session = Depends(get_db)
):

    docs = db.query(CaseDocument).filter(
        CaseDocument.police_request_id == police_request_id
    ).order_by(
        CaseDocument.uploaded_at.desc()
    ).all()

    out = []
    for d in docs:
        out.append({
            "id": d.id,
            "police_request_id": d.police_request_id,
            "officer_id": d.officer_id,
            "file_name": d.file_name,
            "file_path": d.file_path,
            "uploaded_at": getattr(d, 'uploaded_at', None)
        })

    return out
