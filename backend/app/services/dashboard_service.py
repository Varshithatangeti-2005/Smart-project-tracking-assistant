from datetime import datetime


def get_dashboard_summary(db):
    db["cursor"].execute("SELECT COUNT(*) AS total FROM tasks")
    total = db["cursor"].fetchone()["total"]

    db["cursor"].execute("SELECT COUNT(*) AS completed FROM tasks WHERE status = 'completed'")
    completed = db["cursor"].fetchone()["completed"]

    db["cursor"].execute("SELECT COUNT(*) AS pending FROM tasks WHERE status = 'pending'")
    pending = db["cursor"].fetchone()["pending"]

    db["cursor"].execute("SELECT COUNT(*) AS in_progress FROM tasks WHERE status = 'in_progress'")
    in_progress = db["cursor"].fetchone()["in_progress"]

    completion_percentage = int((completed / total) * 100) if total else 0
    return {
        "total_tasks": total,
        "completed": completed,
        "pending": pending,
        "in_progress": in_progress,
        "completion_percentage": completion_percentage,
        "last_updated": datetime.utcnow().isoformat() + "Z",
    }
