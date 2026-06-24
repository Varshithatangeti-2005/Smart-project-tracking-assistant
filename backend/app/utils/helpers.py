from fastapi import HTTPException


def get_or_404(db, query: str, params: tuple, model_name: str):
    db["cursor"].execute(query, params)
    item = db["cursor"].fetchone()
    if item is None:
        raise HTTPException(status_code=404, detail=f"{model_name} not found")
    return item
