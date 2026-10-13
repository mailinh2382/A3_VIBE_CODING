"""
check_tables.py — Verify that the invoices table and triggers exist.

Queries the PostgreSQL information schema and pg_trigger catalog to
confirm the setup is correct.
"""

import os
import sys

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def check_table_exists():
    """Check that public.invoices table exists in the database."""
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL is not set. Check your .env file.")
        sys.exit(1)

    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        with conn.cursor() as cur:
            # Check table exists
            cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'invoices';
                """
            )
            row = cur.fetchone()
            if row:
                print(f"Table found: public.{row[0]}")
            else:
                print("ERROR: Table 'public.invoices' not found.")
                sys.exit(1)

            # Check triggers exist
            cur.execute(
                """
                SELECT trigger_name
                FROM information_schema.triggers
                WHERE event_object_table = 'invoices'
                  AND event_object_schema = 'public';
                """
            )
            triggers = cur.fetchall()
            if triggers:
                for (t_name,) in triggers:
                    print(f"Trigger found: {t_name}")
            else:
                print("WARNING: No triggers found on public.invoices.")

            # Check RLS is enabled
            cur.execute(
                """
                SELECT relrowsecurity
                FROM pg_class
                WHERE relname = 'invoices'
                  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
                """
            )
            rls_row = cur.fetchone()
            if rls_row and rls_row[0]:
                print("Row Level Security: ENABLED")
            else:
                print("WARNING: Row Level Security is NOT enabled.")

    except Exception as e:
        print(f"Check failed: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    check_table_exists()