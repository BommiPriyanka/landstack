import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.core.database import Base


# ── ENUMS ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    OFFICER = "OFFICER"
    ADMIN = "ADMIN"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    FLAGGED = "FLAGGED"
    CONFLICT = "CONFLICT"


class RequestStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    DEPARTMENT_VERIFICATION = "DEPARTMENT_VERIFICATION"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"


# ── 1. USERS & DEPARTMENTS ──────────────────────────────────────────────────

class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    department_code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="department")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("departments.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="users")
    service_requests: Mapped[List["ServiceRequest"]] = relationship("ServiceRequest", back_populates="citizen", foreign_keys="ServiceRequest.citizen_id")
    assigned_requests: Mapped[List["ServiceRequest"]] = relationship("ServiceRequest", back_populates="assigned_officer_rel", foreign_keys="ServiceRequest.assigned_officer")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user")


# ── 2. PARCELS (CENTRAL DPI ENTITY) ──────────────────────────────────────────

class Parcel(Base):
    __tablename__ = "parcels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    survey_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    subdivision_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    village_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    village_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    taluk: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), default="Tamil Nadu", nullable=False)
    area: Mapped[float] = mapped_column(Float, nullable=False, comment="Area in acres")
    land_use: Mapped[str] = mapped_column(String(50), nullable=False, default="Residential")
    
    # PostGIS Spatial Polygon geometry (EPSG:4326 - WGS84)
    geometry = mapped_column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)

    verification_status: Mapped[VerificationStatus] = mapped_column(
        SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships linked via ULPIN
    ror_records: Mapped[List["RecordOfRights"]] = relationship("RecordOfRights", back_populates="parcel")
    registrations: Mapped[List["Registration"]] = relationship("Registration", back_populates="parcel")
    tax_records: Mapped[List["PropertyTax"]] = relationship("PropertyTax", back_populates="parcel")
    building_permissions: Mapped[List["BuildingPermission"]] = relationship("BuildingPermission", back_populates="parcel")
    land_use_records: Mapped[List["LandUse"]] = relationship("LandUse", back_populates="parcel")
    encumbrances: Mapped[List["Encumbrance"]] = relationship("Encumbrance", back_populates="parcel")
    disputes: Mapped[List["Dispute"]] = relationship("Dispute", back_populates="parcel")
    restrictions: Mapped[List["Restriction"]] = relationship("Restriction", back_populates="parcel")
    service_requests: Mapped[List["ServiceRequest"]] = relationship("ServiceRequest", back_populates="parcel")


# ── 3. OWNERS & RECORD OF RIGHTS (REVENUE DEPT) ──────────────────────────────

class Owner(Base):
    __tablename__ = "owners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_reference: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    masked_identifier: Mapped[str] = mapped_column(String(50), nullable=False, comment="Masked Aadhaar/PAN e.g. XXXX-XXXX-1234")
    ownership_type: Mapped[str] = mapped_column(String(50), default="Individual", nullable=False)

    # Relationships
    ror_entries: Mapped[List["RecordOfRights"]] = relationship("RecordOfRights", back_populates="owner")


class RecordOfRights(Base):
    __tablename__ = "ror"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("owners.id"), nullable=False, index=True)
    ownership_type: Mapped[str] = mapped_column(String(50), default="Single Owner", nullable=False)
    share_percentage: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    record_status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="ror_records")
    owner: Mapped["Owner"] = relationship("Owner", back_populates="ror_entries")


# ── 4. REGISTRATIONS & DEEDS ─────────────────────────────────────────────────

class Registration(Base):
    __tablename__ = "registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    registration_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False, default="Sale Deed")
    transaction_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="REGISTERED", nullable=False)
    department_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="registrations")


# ── 5. PROPERTY TAX (MUNICIPAL / ULB) ────────────────────────────────────────

class PropertyTax(Base):
    __tablename__ = "property_tax"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    assessment_number: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    financial_year: Mapped[str] = mapped_column(String(20), nullable=False)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    paid_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    due_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PAID", nullable=False)

    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="tax_records")


# ── 6. BUILDING PERMISSIONS ──────────────────────────────────────────────────

class BuildingPermission(Base):
    __tablename__ = "building_permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    approval_number: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    building_type: Mapped[str] = mapped_column(String(50), default="Residential", nullable=False)
    number_of_floors: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    approval_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="APPROVED", nullable=False)

    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="building_permissions")


# ── 7. LAND USE & ZONING ─────────────────────────────────────────────────────

class LandUse(Base):
    __tablename__ = "land_use"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    zoning: Mapped[str] = mapped_column(String(100), default="Primary Residential", nullable=False)
    permitted_use: Mapped[str] = mapped_column(String(150), default="Residential Housing", nullable=False)
    restriction: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    effective_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="land_use_records")


# ── 8. ENCUMBRANCES (MORTGAGES / LIENS) ──────────────────────────────────────

class Encumbrance(Base):
    __tablename__ = "encumbrances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), default="Bank Mortgage", nullable=False)
    institution: Mapped[str] = mapped_column(String(150), nullable=False)
    amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)

    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="encumbrances")


# ── 9. DISPUTES (LEGAL / COURT CASES) ────────────────────────────────────────

class Dispute(Base):
    __tablename__ = "disputes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    case_number: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    dispute_type: Mapped[str] = mapped_column(String(100), default="Boundary Dispute", nullable=False)
    filing_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)

    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="disputes")


# ── 10. RESTRICTIONS (CRZ, BUFFER, FOREST) ───────────────────────────────────

class Restriction(Base):
    __tablename__ = "restrictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    restriction_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)

    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="restrictions")


# ── 11. SERVICE REQUESTS & WORKFLOW EVENTS ───────────────────────────────────

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ulpin: Mapped[str] = mapped_column(String(50), ForeignKey("parcels.ulpin", ondelete="CASCADE"), nullable=False, index=True)
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    service_type: Mapped[str] = mapped_column(String(100), nullable=False, default="Verification Request")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[RequestStatus] = mapped_column(SQLEnum(RequestStatus), default=RequestStatus.SUBMITTED, nullable=False)
    assigned_department: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    assigned_officer: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parcel: Mapped["Parcel"] = relationship("Parcel", back_populates="service_requests")
    citizen: Mapped["User"] = relationship("User", back_populates="service_requests", foreign_keys=[citizen_id])
    assigned_officer_rel: Mapped[Optional["User"]] = relationship("User", back_populates="assigned_requests", foreign_keys=[assigned_officer])
    workflow_events: Mapped[List["WorkflowEvent"]] = relationship("WorkflowEvent", back_populates="service_request", cascade="all, delete-orphan")


class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    service_request_id: Mapped[int] = mapped_column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(50), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    performed_by: Mapped[str] = mapped_column(String(100), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    service_request: Mapped["ServiceRequest"] = relationship("ServiceRequest", back_populates="workflow_events")


# ── 12. AUDIT LOGS ───────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    old_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    ip_reference: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")
