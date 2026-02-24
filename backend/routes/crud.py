from fastapi import APIRouter, HTTPException
from database import supabase
from models import WeatherQuery, RecordUpdate
from utils import geocode
import httpx
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

OWM_KEY = os.getenv("OPENWEATHER_API_KEY")
router = APIRouter()

#Helper function 1 to fetch 5days forecast
async def fetch_forecast_map(lat: float, lon: float):
    url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lon}&appid={OWM_KEY}&units=metric"
    )
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
    daily = {}
    for item in r.json().get("list", []):
        day = item["dt_txt"].split(" ")[0]
        if day not in daily:
            daily[day] = {
                "temp":        item["main"]["temp"],
                "feels_like":  item["main"]["feels_like"],
                "humidity":    item["main"]["humidity"],
                "description": item["weather"][0]["description"],
            }
    return daily

#helper function 2 to fecth current weather
async def fetch_current(lat: float, lon: float):
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={OWM_KEY}&units=metric"
    )
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
    d = r.json()
    return (
        d["main"]["temp"],
        d["weather"][0]["description"],
        d["main"]["feels_like"],
        d["main"]["humidity"],
    )

#CRUD endpoint 1 for creating a new record in database or search history
@router.post("/")
async def create_record(query: WeatherQuery):
    #convert location to coordinates
    lat, lon, name = await geocode(query.location)
    forecast_map = await fetch_forecast_map(lat, lon)
    current_temp, current_desc, current_feels, current_humidity = await fetch_current(lat, lon)

    daily_data = []

    current_date = query.start_date
    while current_date <= query.end_date:
        date_str = str(current_date)
        if date_str in forecast_map:
            #use forcast data
            day = forecast_map[date_str]
            temp       = day["temp"]
            desc       = day["description"]
            feels_like = day["feels_like"]
            humidity   = day["humidity"]
        else:
            #use curent weather as fallback 
            temp       = current_temp
            desc       = current_desc
            feels_like = current_feels
            humidity   = current_humidity

        daily_data.append({
            "date":        date_str,
            "temperature": round(temp, 1),
            "feels_like":  round(feels_like, 1),
            "humidity":    humidity,
            "description": desc,
        })
        current_date += timedelta(days=1)

    record = {
        "location":   name,
        "start_date": str(query.start_date),
        "end_date":   str(query.end_date),
        "lat":        lat,
        "lon":        lon,
        "daily_data": daily_data,
    }
    result = supabase.table("weather_records").insert(record).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save record")
    return result.data[0]


#CRUD endpoint 2 for fetching all saved records or search history
@router.get("/")
async def read_records():
    result = supabase.table("weather_records").select("*").order("id", desc=True).execute()
    return result.data

#CRUD endpoint 3 for updating a record
@router.patch("/{record_id}")
async def update_record(record_id: int, updates: RecordUpdate):
    payload = {k: str(v) if hasattr(v, 'isoformat') else v
               for k, v in updates.model_dump(exclude_none=True).items()}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    result = supabase.table("weather_records").update(payload).eq("id", record_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Record not found")
    return result.data[0]

#CRUD endpoint 4 for deleting a record from archived 
@router.delete("/{record_id}")
async def delete_record(record_id: int):
    supabase.table("weather_records").delete().eq("id", record_id).execute()
    return {"message": f"Record {record_id} deleted"}
