"""
test_database_connection.py — Verify that the database connection works.

Connects to Supabase PostgreSQL and prints success/failure.
Does NOT print the connection URL or password for security.
"""

import os
import sys
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def test_connection():
    """Attempt to connect to the database and print the result."""
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL is not set. Check your .env file.")
        sys.exit(1)

    # Show the host (safe to print) without exposing the password
    parsed = urlparse(DATABASE_URL)
    print(f"Connecting to host: {parsed.hostname}:{parsed.port}/{parsed.path.lstrip('/')}")

    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        print("Database connection successful")
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    test_connection()