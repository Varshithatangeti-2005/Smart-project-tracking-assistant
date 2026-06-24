from app.schemas.risk import RiskCreate, RiskUpdate


def create_risk(db, risk_in: RiskCreate):
    db["cursor"].execute(
        "INSERT INTO risks (title, description, severity, project_id) VALUES (%s, %s, %s, %s)",
        (
            risk_in.title,
            risk_in.description,
            risk_in.severity,
            risk_in.project_id,
        ),
    )
    db["conn"].commit()
    risk_id = db["cursor"].lastrowid
    return get_risk(db, risk_id)


def get_risks(db):
    db["cursor"].execute("SELECT * FROM risks")
    return db["cursor"].fetchall()


def get_risk(db, risk_id: int):
    db["cursor"].execute("SELECT * FROM risks WHERE id = %s", (risk_id,))
    return db["cursor"].fetchone()


def update_risk(db, risk_id: int, updates: RiskUpdate):
    values = updates.dict(exclude_unset=True)
    if not values:
        return get_risk(db, risk_id)
    set_clause = ", ".join(f"{key} = %s" for key in values)
    db["cursor"].execute(
        f"UPDATE risks SET {set_clause} WHERE id = %s",
        tuple(values.values()) + (risk_id,),
    )
    db["conn"].commit()
    return get_risk(db, risk_id)


def delete_risk(db, risk_id: int):
    db["cursor"].execute("DELETE FROM risks WHERE id = %s", (risk_id,))
    db["conn"].commit()
