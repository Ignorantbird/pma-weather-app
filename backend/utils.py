import os
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

OWM_KEY = os.getenv("OPENWEATHER_API_KEY")


async def geocode(location: str) -> tuple[float, float, str]:
    parts = location.split(",")
    if len(parts) == 2:
        try:
            lat, lon = float(parts[0].strip()), float(parts[1].strip())
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                async with httpx.AsyncClient() as client:
                    r = await client.get(
                        "http://api.openweathermap.org/geo/1.0/reverse",
                        params={"lat": lat, "lon": lon, "limit": 1, "appid": OWM_KEY},
                    )
                    data = r.json()
                    name = data[0]["name"] if data else location
                return lat, lon, name
        except ValueError:
            pass

    async with httpx.AsyncClient() as client:
        r = await client.get(
            "http://api.openweathermap.org/geo/1.0/direct",
            params={"q": location, "limit": 1, "appid": OWM_KEY},
        )
        data = r.json()
        if data:
            return data[0]["lat"], data[0]["lon"], data[0]["name"]

        r2 = await client.get(
            "http://api.openweathermap.org/geo/1.0/zip",
            params={"zip": location, "appid": OWM_KEY},
        )
        if r2.status_code == 200:
            d = r2.json()
            if "lat" in d:
                return d["lat"], d["lon"], d["name"]

        digits = location.replace(" ", "")
        if digits.isdigit() and len(digits) == 6:
            r3 = await client.get(
                "http://api.openweathermap.org/geo/1.0/zip",
                params={"zip": f"{digits},IN", "appid": OWM_KEY},
            )
            if r3.status_code == 200:
                d = r3.json()
                if "lat" in d:
                    return d["lat"], d["lon"], d["name"]

    raise HTTPException(status_code=404, detail=f"Location '{location}' not found")
