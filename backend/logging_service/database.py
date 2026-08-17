import sqlite3
from datetime import datetime

DB_PATH = "moderation.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_type TEXT,
            content TEXT,
            details TEXT,
            verdict TEXT,
            reasons TEXT,
            confidence REAL,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

def insert_log(content_type, content, details, verdict, reasons, confidence):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO logs (content_type, content, details, verdict, reasons, confidence, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (content_type, content, str(details), verdict, str(reasons), confidence, datetime.now().isoformat())
    )
    conn.commit()
    log_id = cursor.lastrowid
    conn.close()
    return log_id

def get_all_logs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows

def get_log_by_id(log_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs WHERE id = ?", (log_id,))
    row = cursor.fetchone()
    conn.close()
    return row

def get_statistics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM logs")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE verdict = 'ALLOWED'")
    allowed = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE verdict = 'BLOCKED'")
    blocked = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE content_type = 'text'")
    text_checks = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE content_type = 'image'")
    image_checks = cursor.fetchone()[0]

    conn.close()
    return {
        "total_checks": total,
        "allowed": allowed,
        "blocked": blocked,
        "text_checks": text_checks,
        "image_checks": image_checks
    }