"""Initial Land Stack schema with 15 core tables and PostGIS geometry

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-25 22:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import geoalchemy2

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Departments ────────────────────────────────────────────────────────
    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("department_code", sa.String(length=20), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_departments_department_code"), "departments", ["department_code"], unique=True)
    op.create_index(op.f("ix_departments_id"), "departments", ["id"], unique=False)

    # ── 2. Users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("CITIZEN", "OFFICER", "ADMIN", name="userrole"), nullable=False),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    # ── 3. Parcels (Central Entity with PostGIS Geometry) ─────────────────────
    op.create_table(
        "parcels",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("survey_number", sa.String(length=50), nullable=False),
        sa.Column("subdivision_number", sa.String(length=50), nullable=True),
        sa.Column("village_code", sa.String(length=50), nullable=False),
        sa.Column("village_name", sa.String(length=100), nullable=False),
        sa.Column("taluk", sa.String(length=100), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("area", sa.Float(), nullable=False, comment="Area in acres"),
        sa.Column("land_use", sa.String(length=50), nullable=False),
        sa.Column("geometry", geoalchemy2.types.Geometry(geometry_type="POLYGON", srid=4326, from_text="ST_GeomFromEWKT", name="geometry"), nullable=True),
        sa.Column("verification_status", sa.Enum("UNVERIFIED", "PENDING", "VERIFIED", "FLAGGED", "CONFLICT", name="verificationstatus"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_parcels_district"), "parcels", ["district"], unique=False)
    op.create_index(op.f("ix_parcels_id"), "parcels", ["id"], unique=False)
    op.create_index(op.f("ix_parcels_survey_number"), "parcels", ["survey_number"], unique=False)
    op.create_index(op.f("ix_parcels_taluk"), "parcels", ["taluk"], unique=False)
    op.create_index(op.f("ix_parcels_ulpin"), "parcels", ["ulpin"], unique=True)
    op.create_index(op.f("ix_parcels_village_code"), "parcels", ["village_code"], unique=False)
    op.create_index(op.f("ix_parcels_village_name"), "parcels", ["village_name"], unique=False)

    # ── 4. Owners ─────────────────────────────────────────────────────────────
    op.create_table(
        "owners",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("owner_reference", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("masked_identifier", sa.String(length=50), nullable=False, comment="Masked Aadhaar/PAN"),
        sa.Column("ownership_type", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_owners_id"), "owners", ["id"], unique=False)
    op.create_index(op.f("ix_owners_owner_reference"), "owners", ["owner_reference"], unique=True)

    # ── 5. Record of Rights (RoR) ─────────────────────────────────────────────
    op.create_table(
        "ror",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("ownership_type", sa.String(length=50), nullable=False),
        sa.Column("share_percentage", sa.Float(), nullable=False),
        sa.Column("record_status", sa.String(length=50), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["owners.id"], ),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ror_id"), "ror", ["id"], unique=False)
    op.create_index(op.f("ix_ror_owner_id"), "ror", ["owner_id"], unique=False)
    op.create_index(op.f("ix_ror_ulpin"), "ror", ["ulpin"], unique=False)

    # ── 6. Registrations ──────────────────────────────────────────────────────
    op.create_table(
        "registrations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("registration_number", sa.String(length=100), nullable=False),
        sa.Column("transaction_type", sa.String(length=50), nullable=False),
        sa.Column("transaction_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("department_reference", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_registrations_id"), "registrations", ["id"], unique=False)
    op.create_index(op.f("ix_registrations_registration_number"), "registrations", ["registration_number"], unique=True)
    op.create_index(op.f("ix_registrations_ulpin"), "registrations", ["ulpin"], unique=False)

    # ── 7. Property Tax ───────────────────────────────────────────────────────
    op.create_table(
        "property_tax",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("assessment_number", sa.String(length=100), nullable=False),
        sa.Column("financial_year", sa.String(length=20), nullable=False),
        sa.Column("tax_amount", sa.Float(), nullable=False),
        sa.Column("paid_amount", sa.Float(), nullable=False),
        sa.Column("due_amount", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_property_tax_assessment_number"), "property_tax", ["assessment_number"], unique=False)
    op.create_index(op.f("ix_property_tax_id"), "property_tax", ["id"], unique=False)
    op.create_index(op.f("ix_property_tax_ulpin"), "property_tax", ["ulpin"], unique=False)

    # ── 8. Building Permissions ───────────────────────────────────────────────
    op.create_table(
        "building_permissions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("approval_number", sa.String(length=100), nullable=False),
        sa.Column("building_type", sa.String(length=50), nullable=False),
        sa.Column("number_of_floors", sa.Integer(), nullable=False),
        sa.Column("approval_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_building_permissions_approval_number"), "building_permissions", ["approval_number"], unique=False)
    op.create_index(op.f("ix_building_permissions_id"), "building_permissions", ["id"], unique=False)
    op.create_index(op.f("ix_building_permissions_ulpin"), "building_permissions", ["ulpin"], unique=False)

    # ── 9. Land Use ───────────────────────────────────────────────────────────
    op.create_table(
        "land_use",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("zoning", sa.String(length=100), nullable=False),
        sa.Column("permitted_use", sa.String(length=150), nullable=False),
        sa.Column("restriction", sa.Text(), nullable=True),
        sa.Column("effective_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_land_use_id"), "land_use", ["id"], unique=False)
    op.create_index(op.f("ix_land_use_ulpin"), "land_use", ["ulpin"], unique=False)

    # ── 10. Encumbrances ──────────────────────────────────────────────────────
    op.create_table(
        "encumbrances",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("institution", sa.String(length=150), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_encumbrances_id"), "encumbrances", ["id"], unique=False)
    op.create_index(op.f("ix_encumbrances_ulpin"), "encumbrances", ["ulpin"], unique=False)

    # ── 11. Disputes ──────────────────────────────────────────────────────────
    op.create_table(
        "disputes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("case_number", sa.String(length=100), nullable=False),
        sa.Column("dispute_type", sa.String(length=100), nullable=False),
        sa.Column("filing_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_disputes_case_number"), "disputes", ["case_number"], unique=False)
    op.create_index(op.f("ix_disputes_id"), "disputes", ["id"], unique=False)
    op.create_index(op.f("ix_disputes_ulpin"), "disputes", ["ulpin"], unique=False)

    # ── 12. Restrictions ──────────────────────────────────────────────────────
    op.create_table(
        "restrictions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("restriction_type", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_restrictions_id"), "restrictions", ["id"], unique=False)
    op.create_index(op.f("ix_restrictions_ulpin"), "restrictions", ["ulpin"], unique=False)

    # ── 13. Service Requests ──────────────────────────────────────────────────
    op.create_table(
        "service_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ulpin", sa.String(length=50), nullable=False),
        sa.Column("citizen_id", sa.Integer(), nullable=False),
        sa.Column("service_type", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("SUBMITTED", "UNDER_REVIEW", "DEPARTMENT_VERIFICATION", "APPROVED", "REJECTED", "COMPLETED", name="requeststatus"), nullable=False),
        sa.Column("assigned_department", sa.String(length=50), nullable=True),
        sa.Column("assigned_officer", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["assigned_officer"], ["users.id"], ),
        sa.ForeignKeyConstraint(["citizen_id"], ["users.id"], ),
        sa.ForeignKeyConstraint(["ulpin"], ["parcels.ulpin"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_service_requests_citizen_id"), "service_requests", ["citizen_id"], unique=False)
    op.create_index(op.f("ix_service_requests_id"), "service_requests", ["id"], unique=False)
    op.create_index(op.f("ix_service_requests_ulpin"), "service_requests", ["ulpin"], unique=False)

    # ── 14. Workflow Events ───────────────────────────────────────────────────
    op.create_table(
        "workflow_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("service_request_id", sa.Integer(), nullable=False),
        sa.Column("department", sa.String(length=50), nullable=False),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("performed_by", sa.String(length=100), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["service_request_id"], ["service_requests.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_workflow_events_id"), "workflow_events", ["id"], unique=False)
    op.create_index(op.f("ix_workflow_events_service_request_id"), "workflow_events", ["service_request_id"], unique=False)

    # ── 15. Audit Logs ────────────────────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", sa.String(length=100), nullable=False),
        sa.Column("old_value", sa.Text(), nullable=True),
        sa.Column("new_value", sa.Text(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("ip_reference", sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_id"), "audit_logs", ["id"], unique=False)
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("workflow_events")
    op.drop_table("service_requests")
    op.drop_table("restrictions")
    op.drop_table("disputes")
    op.drop_table("encumbrances")
    op.drop_table("land_use")
    op.drop_table("building_permissions")
    op.drop_table("property_tax")
    op.drop_table("registrations")
    op.drop_table("ror")
    op.drop_table("owners")
    op.drop_table("parcels")
    op.drop_table("users")
    op.drop_table("departments")
    op.execute("DROP TYPE IF EXISTS requeststatus")
    op.execute("DROP TYPE IF EXISTS verificationstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
