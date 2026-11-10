from app.db import get_db

# Important Iran cities with WGS84 coords
CITIES = [
    ("tehran", "Tehran", 35.6892, 51.3890),
    ("mashhad", "Mashhad", 36.2605, 59.6168),
    ("isfahan", "Isfahan", 32.6546, 51.6680),
    ("shiraz", "Shiraz", 29.5918, 52.5837),
    ("tabriz", "Tabriz", 38.0962, 46.2738),
    ("ahvaz", "Ahvaz", 31.3183, 48.6706),
    ("karaj", "Karaj", 35.8400, 50.9391),
    ("qom", "Qom", 34.6416, 50.8746),
    ("kermanshah", "Kermanshah", 34.3142, 47.0650),
    ("rasht", "Rasht", 37.2808, 49.5832),
    ("zahedan", "Zahedan", 29.4963, 60.8629),
    ("yazd", "Yazd", 31.8974, 54.3569),
    ("kerman", "Kerman", 30.2832, 57.0788),
    ("urmia", "Urmia", 37.5527, 45.0761),
    ("bandar-abbas", "Bandar Abbas", 27.1832, 56.2666),
    ("bushehr", "Bushehr", 28.9234, 50.8203),
    ("arak", "Arak", 34.0917, 49.6892),
    ("hamadan", "Hamadan", 34.7983, 48.5146),
]


def seed_cities() -> None:
    with get_db() as conn:
        for slug, name_en, lat, lon in CITIES:
            conn.execute(
                """
                INSERT INTO cities (slug, name_en, lat, lon, important)
                VALUES (?, ?, ?, ?, 1)
                ON CONFLICT(slug) DO UPDATE SET
                  name_en=excluded.name_en,
                  lat=excluded.lat,
                  lon=excluded.lon,
                  important=1
                """,
                (slug, name_en, lat, lon),
            )
