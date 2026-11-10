# WMO weather interpretation codes (Open-Meteo)
CODES = {
    0: ("Clear", "صاف"),
    1: ("Mainly clear", "عمدتاً صاف"),
    2: ("Partly cloudy", "نیمه‌ابری"),
    3: ("Overcast", "ابری"),
    45: ("Fog", "مه"),
    48: ("Depositing rime fog", "مه یخ‌زده"),
    51: ("Light drizzle", "نم‌نم باران"),
    53: ("Drizzle", "باران ریز"),
    55: ("Dense drizzle", "باران ریز شدید"),
    56: ("Light freezing drizzle", "نم‌نم یخ‌زده"),
    57: ("Dense freezing drizzle", "نم‌نم یخ‌زده شدید"),
    61: ("Slight rain", "باران خفیف"),
    63: ("Rain", "باران"),
    65: ("Heavy rain", "باران شدید"),
    66: ("Light freezing rain", "باران یخ‌زده خفیف"),
    67: ("Heavy freezing rain", "باران یخ‌زده شدید"),
    71: ("Slight snow", "برف خفیف"),
    73: ("Snow", "برف"),
    75: ("Heavy snow", "برف شدید"),
    77: ("Snow grains", "دانه برف"),
    80: ("Slight showers", "رگبار خفیف"),
    81: ("Showers", "رگبار"),
    82: ("Violent showers", "رگبار شدید"),
    85: ("Slight snow showers", "رگبار برف خفیف"),
    86: ("Heavy snow showers", "رگبار برف شدید"),
    95: ("Thunderstorm", "رعدوبرق"),
    96: ("Thunderstorm with hail", "رعدوبرق با تگرگ"),
    99: ("Thunderstorm with heavy hail", "رعدوبرق با تگرگ شدید"),
}


def label(code: int | None, lang: str = "en") -> str:
    if code is None:
        return "—"
    pair = CODES.get(int(code), ("Unknown", "نامشخص"))
    return pair[0] if lang == "en" else pair[1]