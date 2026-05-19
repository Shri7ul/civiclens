from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.db import get_db

from models.police_model import PoliceRequest
from models.public_case_model import PublicCase
from models.officer_model import Officer
from models.user_model import User
from models.audit_log_model import AuditLog
from utils.admin_utils import resolve_admin_id

from datetime import datetime

router = APIRouter()


@router.get("/public-dashboard")
def public_dashboard(db: Session = Depends(get_db)):
    areas = ["Dhaka", "Chittagong", "Khulna", "Sylhet", "Rajshahi"]
    pending_statuses = ['Pending', 'Under Investigation', 'Evidence Collected', 'Suspect Identified']
    resolved_statuses = ['Solved', 'Closed']

    out = []
    for a in areas:
        total = db.query(PoliceRequest).filter(PoliceRequest.area == a).count()
        pending = db.query(PoliceRequest).filter(PoliceRequest.area == a, PoliceRequest.status.in_(pending_statuses), PoliceRequest.is_archived == False).count()
        resolved = db.query(PoliceRequest).filter(PoliceRequest.area == a, ((PoliceRequest.status.in_(resolved_statuses)) | (PoliceRequest.is_archived == True))).count()
        out.append({
            'area': a,
            'total_complaints': total,
            'pending_cases': pending,
            'resolved_cases': resolved
        })

    return out


@router.get("/public-cases")
def public_cases(db: Session = Depends(get_db)):
    # return featured first, then others
    featured = db.query(PublicCase).filter(PublicCase.is_featured == True).order_by(PublicCase.updated_at.desc()).all()
    others = db.query(PublicCase).filter(PublicCase.is_featured == False).order_by(PublicCase.updated_at.desc()).all()

    def serialize(pc: PublicCase):
        assigned_officer = None
        if pc.assigned_officer_id:
            off = db.query(Officer).filter(Officer.id == pc.assigned_officer_id).first()
            user = db.query(User).filter(User.id == off.user_id).first() if off else None
            assigned_officer = {'id': off.id, 'name': user.name if user else None} if off else None

        return {
            'id': pc.id,
            'title': pc.title,
            'description': pc.description,
            'area': pc.area,
            'status': pc.status,
            'source_name': pc.source_name,
            'source_url': pc.source_url,
            'assigned_officer': assigned_officer,
            'is_featured': pc.is_featured,
            'created_at': pc.created_at,
            'updated_at': pc.updated_at
        }

    results = [serialize(p) for p in featured] + [serialize(p) for p in others]
    return results


# Admin CRUD
@router.post("/admin/public-case")
def create_public_case(payload: dict, db: Session = Depends(get_db)):
    admin_ref = payload.get('admin_id')
    if not admin_ref:
        raise HTTPException(status_code=400, detail="admin_id required")
    admin_id = resolve_admin_id(db, admin_ref)
    if not admin_id:
        raise HTTPException(status_code=403, detail="Admin not found")

    pc = PublicCase(
        title=payload.get('title'),
        description=payload.get('description'),
        area=payload.get('area'),
        status=payload.get('status'),
        source_name=payload.get('source_name'),
        source_url=payload.get('source_url'),
        assigned_officer_id=payload.get('assigned_officer_id'),
        created_by_admin_id=admin_id,
        is_featured=payload.get('is_featured', False)
    )
    db.add(pc)
    db.add(AuditLog(user_id=admin_id, action=f"Created public case: {pc.title}"))
    db.commit()
    return {"message": "Public case created", "id": pc.id}


@router.put("/admin/public-case/{case_id}")
def update_public_case(case_id: int, payload: dict, db: Session = Depends(get_db)):
    admin_ref = payload.get('admin_id')
    if not admin_ref:
        raise HTTPException(status_code=400, detail="admin_id required")
    admin_id = resolve_admin_id(db, admin_ref)
    if not admin_id:
        raise HTTPException(status_code=403, detail="Admin not found")

    pc = db.query(PublicCase).filter(PublicCase.id == case_id).first()
    if not pc:
        raise HTTPException(status_code=404, detail="Public case not found")

    for k in ['title','description','area','status','source_name','source_url','assigned_officer_id','is_featured']:
        if k in payload:
            setattr(pc, k, payload.get(k))

    db.add(pc)
    db.add(AuditLog(user_id=admin_id, action=f"Updated public case: {pc.title}"))
    db.commit()
    return {"message": "Public case updated"}


@router.delete("/admin/public-case/{case_id}")
def delete_public_case(case_id: int, payload: dict, db: Session = Depends(get_db)):
    admin_ref = payload.get('admin_id')
    if not admin_ref:
        raise HTTPException(status_code=400, detail="admin_id required")
    admin_id = resolve_admin_id(db, admin_ref)
    if not admin_id:
        raise HTTPException(status_code=403, detail="Admin not found")

    pc = db.query(PublicCase).filter(PublicCase.id == case_id).first()
    if not pc:
        raise HTTPException(status_code=404, detail="Public case not found")

    db.delete(pc)
    db.add(AuditLog(user_id=admin_id, action=f"Deleted public case: {case_id}"))
    db.commit()
    return {"message": "Deleted"}
