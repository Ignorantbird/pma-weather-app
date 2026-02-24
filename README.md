# pma-weather-app
A Weather App, Built by Sarmistha Debnath || PMA Technical Assessment Full Stack (Assesment 1 + Assesment 2)
Product Manager Accelerator is designed to support PM professionals through every stage of their careers, from entry-level jobs to Director looking to take on a leadership role. Our program has helped hundreds of students fulfill their career aspirations.

# what this app does

Hero Section: When you first open the app, it requests access to your GPS location. Based on your current location's live weather, the Hero section dynamically changes its design theme like sunny visuals for clear skies, cloudy/dark themes for overcast or rainy conditions. This also updates in real time whenever you search a new location. For example, if you're in Gurgaon (sunny) but search Germany (cloudy), the Hero design instantly switches to reflect Germany's current weather. In case, no location detected or GPS location is not accsessed - a generic weather design theme will reflect.

Weather Search Bar with Optional Date Range Search: Enter any location, city name, zip or postal code, GPS coordinates, or a landmark and Get instant results such as Temperature, Feels Like, Humidity, Wind Speed, Google Map of the location, and YouTube videos from that location. Also, you can use GPS to auto detct your location. Optionally select a start and end date to search weather across a date range. Note: For Present and Past dates full details like Temperature, Humidity, Feels like, Wind and for Future dates Temperature forcasting is shown. 

Every Search includes 5-days weather Foecasting. 

# Search History and CRUD Operations
All searches automatically saves into the Database. The Search History Section supports and cover all CRUD operations. Such as:

CREATE: Every new search creates location, date, temperature and Weather Data with proper input validation ('location not found' error when input location is wrong or invalid).

READ: You can view all searches with expandable Weather and Temperature detail in the history.

UPDATE: Edit any saved record like changing search date ramge, location etc. 

DELETE: Archiving any record (soft- delete).

# Additional Features
Any record from Search history can be added to Favourite for quick reference.
You can Edit any record and add short note to any record from History.
Reanme any search with a custom nickname.
Search history can be filtered using city name or label.
You can also sort the Search history record by date.
A Dark/Light Mode toggle button.
Also, temperature unit can be toggled by °C / °F 

# Data Export
Searched data can be customized and exported in JSON, CSV, PDF Format.

# Tech Stack
Frontend: React(Vite)
Backend: Python, FastAPI
Database: Supabase(PostgreSQL)
Weather API: OpenWeather Map API
Maps API: Google Maps Embed API
Videos API: YouTube Data API 

# How to run locally
Step 1: Clone the repository 
Step 2: Setup Backend.
    Navigate to the backend folder.
    Install Python dependancies with the requirements.txt
    Create a .env in backend and add your credentials:
        OPENWEATHER_API_KEY
        YOUTUBE_API_KEY
        GOOGLE_MAPS_API_KEY
        SUPABASE_URL
        SUPABASE_KEY        
    Start the FastAPI server using uvicorn main:app --reload
    The backend will run at http://localhost:8000
Step 3: Setup Frontend
    Navigate to the Frontend Folder.
    Install Node Dependencies.
    Create .env files 
    Start the React Development Server using npm run dev 
    The frontend will run at http://localhost:5173
Step 4: Go to http://localhost:5173 to open the App and allow location access when asked to enable the Dynamic Hero Section.