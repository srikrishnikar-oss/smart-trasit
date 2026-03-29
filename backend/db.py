from contextlib import contextmanager
from typing import Iterator

import oracledb

from settings import settings


pool: oracledb.ConnectionPool | None = None


def init_pool() -> None:
    global pool
    if pool is None:
        pool = oracledb.create_pool(
            user=settings.oracle_user,
            password=settings.oracle_password,
            dsn=settings.oracle_dsn,
            min=1,
            max=4,
            increment=1,
        )


def close_pool() -> None:
    global pool
    if pool is not None:
        pool.close()
        pool = None


@contextmanager
def get_connection() -> Iterator[oracledb.Connection]:
    if pool is None:
        init_pool()

    assert pool is not None
    connection = pool.acquire()
    try:
        yield connection
    finally:
        pool.release(connection)
