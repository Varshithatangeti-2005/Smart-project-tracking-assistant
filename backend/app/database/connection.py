import mysql.connector
from app.config import settings

CREATE_TABLES = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        is_superuser TINYINT(1) DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id INT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'medium',
        due_date DATETIME,
        project_id INT NOT NULL,
        assignee_id INT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS sprints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATETIME,
        end_date DATETIME,
        project_id INT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS risks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(50) DEFAULT 'medium',
        project_id INT NOT NULL
    )
    """,
]


def init_db():
    connection = mysql.connector.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        charset="utf8mb4",
        use_pure=True,
    )
    try:
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.db_name}` DEFAULT CHARACTER SET utf8mb4")
        cursor.execute(f"USE `{settings.db_name}`")
        for statement in CREATE_TABLES:
            cursor.execute(statement)
        connection.commit()
    finally:
        cursor.close()
        connection.close()


def get_db():
    connection = mysql.connector.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        charset="utf8mb4",
        use_pure=True,
    )
    cursor = connection.cursor(dictionary=True)
    try:
        yield {"conn": connection, "cursor": cursor}
    finally:
        cursor.close()
        connection.close()
