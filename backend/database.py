"""
database.py — Database connection and initialization for InvoEasy.

Connects to Supabase PostgreSQL using psycopg2 and runs the SQL setup
script (sql/setup.sql) to create tables, RLS policies, and triggers.
"""

import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """Return a new psycopg2 connection to the Supabase PostgreSQL database."""
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set. Check your .env file.")
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def init_database():
    """
    Read and execute the SQL setup file to initialize the database.

    Creates the invoices table, enables RLS, creates policies and triggers.
    """
    sql_file = Path(__file__).parent / "sql" / "setup.sql"
    if not sql_file.exists():
        print(f"ERROR: SQL file not found at {sql_file}")
        sys.exit(1)

    sql = sql_file.read_text(encoding="utf-8")

    conn = None
    try:
        conn = get_connection()
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(sql)
        print("Database initialization completed successfully")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    init_database()