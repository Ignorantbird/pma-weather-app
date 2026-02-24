from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import weather, crud, export

app = FastAPI(title="PMA Weather App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(crud.router, prefix="/api/records", tags=["records"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.get("/")
def root():
    return {"message": "PMA Weather App API", "author": "Sarmistha Debnath"}
