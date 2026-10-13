"""
main.py — FastAPI application for InvoEasy.

Provides REST API endpoints for the InvoEasy e-invoice system.
Database tables, RLS policies, and triggers are initialized on startup.
"""

from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from auth import get_current_user
from database import get_connection, init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run database initialization when the server starts."""
    init_database()
    yield


load_dotenv()

app = FastAPI(
    title="InvoEasy API",
    description="Backend API for Vietnamese household e-invoice management",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Pydantic models ----------

class InvoiceCreate(BaseModel):
    product_name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    vat_rate: float = Field(..., ge=0, le=100)
    buyer_name: str = Field(..., min_length=1)
    buyer_tax_code: str = ""
    total: float = Field(..., ge=0)


class InvoiceResponse(BaseModel):
    id: str
    user_id: str
    product_name: str
    price: float
    vat_rate: float
    buyer_name: str
    buyer_tax_code: str
    total: float
    invoice_number: Optional[str] = None
    created_at: str


# ---------- Routes ----------

@app.get("/")
def root():
    """Root endpoint — confirms the API is running."""
    return {
        "app": "InvoEasy",
        "message": "Welcome to the InvoEasy API",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Health check endpoint — returns service status."""
    return {"status": "ok"}


@app.post("/invoices", response_model=InvoiceResponse)
def create_invoice(
    invoice: InvoiceCreate,
    user_id: str = Depends(get_current_user),
):
    """Create a new invoice for the authenticated user."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.invoices
                    (user_id, product_name, price, vat_rate,
                     buyer_name, buyer_tax_code, total)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, user_id, product_name, price, vat_rate,
                          buyer_name, buyer_tax_code, total,
                          invoice_number, created_at;
                """,
                (
                    user_id,
                    invoice.product_name,
                    invoice.price,
                    invoice.vat_rate,
                    invoice.buyer_name,
                    invoice.buyer_tax_code,
                    invoice.total,
                ),
            )
            row = cur.fetchone()
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create invoice: {e}")
    finally:
        conn.close()

    return _row_to_invoice(row)


@app.get("/invoices", response_model=list[InvoiceResponse])
def list_invoices(user_id: str = Depends(get_current_user)):
    """Return all invoices for the authenticated user, newest first."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, product_name, price, vat_rate,
                       buyer_name, buyer_tax_code, total,
                       invoice_number, created_at
                FROM public.invoices
                WHERE user_id = %s
                ORDER BY created_at DESC;
                """,
                (user_id,),
            )
            rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch invoices: {e}")
    finally:
        conn.close()

    return [_row_to_invoice(r) for r in rows]


# ---------- Helper ----------

def _row_to_invoice(row) -> dict:
    return {
        "id": str(row[0]),
        "user_id": str(row[1]),
        "product_name": row[2],
        "price": float(row[3]),
        "vat_rate": float(row[4]),
        "buyer_name": row[5],
        "buyer_tax_code": row[6],
        "total": float(row[7]),
        "invoice_number": row[8],
        "created_at": row[9].isoformat() if row[9] else "",
    }