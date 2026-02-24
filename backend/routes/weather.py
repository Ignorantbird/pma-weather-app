import os
import httpx
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from utils import geocode

load_dotenv()
router = APIRouter()

OWM_KEY  = os.getenv("OPENWEATHER_API_KEY")
YT_KEY   = os.getenv("YOUTUBE_API_KEY")
MAPS_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

#endpoints 1 for fetching current weather
@router.get("/current")
async def get_current_weather(location: str):
    lat, lon, name = await geocode(location)
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OWM_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
    #error handling for failed API call
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data")
    data = r.json()
    return {
        "location": name,
        "lat": lat,
        "lon": lon,
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"],
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
    }

#endpoint 2 for fetching 5days forecast
@router.get("/forecast")
async def get_forecast(location: str):
    lat, lon, name = await geocode(location)
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OWM_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
    #error handling for failed API call
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch forecast data")
    data = r.json()
    daily = {}
    for item in data["list"]:
        day = item["dt_txt"].split(" ")[0]
        if day not in daily:
            daily[day] = {
                "date": day,
                "temp": item["main"]["temp"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"],
            }
    return {"location": name, "forecast": list(daily.values())[:5]}

#endpoint 3 for fetching youtube videos
@router.get("/youtube")
async def get_youtube_videos(location: str):
    _, _, name = await geocode(location)
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": f"{name} travel guide",
        "type": "video",
        "maxResults": 6,
        "key": YT_KEY,
        "relevanceLanguage": "en",
        "order": "relevance",
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params)
    #error handling for failed API call
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch YouTube data")
    items = r.json().get("items", [])
    return [
        {
            "title": v["snippet"]["title"],
            "video_id": v["id"]["videoId"],
            "thumbnail": v["snippet"]["thumbnails"]["medium"]["url"],
        }
        for v in items
    ]

#endpoint 4 for fetching google maps
@router.get("/maps-key")
async def get_maps_key():
    return {"key": MAPS_KEY}
