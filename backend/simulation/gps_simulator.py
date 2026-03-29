from random import randint, uniform
from time import sleep

import oracledb


DSN = "localhost/XEPDB1"
USER = "smart_transit"
PASSWORD = "change_me"


def simulate() -> None:
    connection = oracledb.connect(user=USER, password=PASSWORD, dsn=DSN)

    while True:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE live_tracking
                SET latitude = latitude + :lat_shift,
                    longitude = longitude + :lng_shift,
                    speed_kmph = :speed_kmph,
                    delay_minutes = :delay_minutes,
                    seats_available = :seats_available,
                    last_reported_at = CURRENT_TIMESTAMP
                WHERE vehicle_id = :vehicle_id
                """,
                {
                    "lat_shift": round(uniform(-0.0009, 0.0009), 6),
                    "lng_shift": round(uniform(-0.0009, 0.0009), 6),
                    "speed_kmph": randint(18, 60),
                    "delay_minutes": randint(0, 12),
                    "seats_available": randint(4, 50),
                    "vehicle_id": 1,
                },
            )
            connection.commit()

        print("Updated live_tracking for vehicle 1")
        sleep(30)


if __name__ == "__main__":
    simulate()
