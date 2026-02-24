import io
import json
import pandas as pd
from datetime import date as date_type
from fpdf import FPDF
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from database import supabase

router = APIRouter()

# PDF layout
# One row per day, with the parent search's ID/location/date-range repeated.
# Landscape A4 usable width

PDF_COLUMNS = [
    "search_id", "location",   "date_range", "date",
    "temp",      "feels_like", "humidity",   "description",
    "lat",       "lon",
]
PDF_LABELS = [
    "Search ID", "Location", "Date Range",  "Date",
    "Temp (°C)", "Feels Like (°C)", "Humidity (%)", "Description",
    "Lat",       "Lon",
]
PDF_WIDTHS = [
    14,   44,   38,   26,
    20,   24,   22,   50,
    18,   18,
]
# Total = 274 mm — fits in landscape A4

_CENTRE = {"search_id", "date_range", "date", "temp", "feels_like", "humidity", "lat", "lon"}


def _fetch_records() -> list:
    result = supabase.table("weather_records").select("*").order("id", desc=True).execute()
    if result.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch records from Supabase")
    return result.data


def _is_past_or_present(date_str: str) -> bool:
    today = str(date_type.today())
    return date_str <= today


def _fmt_date_range(r: dict) -> str:
    s, e = r.get("start_date", ""), r.get("end_date", "")
    return s if s == e else f"{s} -> {e}"


def _expand_rows(records: list[dict]) -> list[dict]:
    """Flatten each search group into one row per day for CSV / PDF."""
    rows = []
    for r in records:
        daily = r.get("daily_data") or []
        date_range = _fmt_date_range(r)
        if not daily:
            rows.append({
                "search_id":   r.get("id"),
                "location":    r.get("location"),
                "date_range":  date_range,
                "date":        r.get("start_date"),
                "temperature": None,
                "feels_like":  None,
                "humidity":    None,
                "description": None,
                "lat":         r.get("lat"),
                "lon":         r.get("lon"),
            })
        else:
            for day in sorted(daily, key=lambda d: d.get("date", "")):
                rows.append({
                    "search_id":   r.get("id"),
                    "location":    r.get("location"),
                    "date_range":  date_range,
                    "date":        day.get("date"),
                    "temperature": day.get("temperature"),
                    "feels_like":  day.get("feels_like") if _is_past_or_present(day.get("date", "")) else None,
                    "humidity":    day.get("humidity")   if _is_past_or_present(day.get("date", "")) else None,
                    "description": day.get("description"),
                    "lat":         r.get("lat"),
                    "lon":         r.get("lon"),
                })
    return rows


# JSON

@router.get("/json")
async def export_json():
    records = _fetch_records()
    body = json.dumps(records, indent=2, default=str)
    return StreamingResponse(
        iter([body]),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=weather_records.json"},
    )


# CSV

@router.get("/csv")
async def export_csv():
    records = _fetch_records()
    if not records:
        raise HTTPException(status_code=400, detail="No records to export")

    rows = _expand_rows(records)
    df = pd.DataFrame(rows)

    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=weather_records.csv"},
    )


# PDF 

def _fmt(val, suffix="", decimals=1):
    if val is None or val == "":
        return "N/A"
    try:
        return f"{float(val):.{decimals}f}{suffix}"
    except (ValueError, TypeError):
        return str(val)


def _draw_header(pdf):
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_fill_color(44, 62, 80)
    pdf.set_text_color(255, 255, 255)
    for label, w in zip(PDF_LABELS, PDF_WIDTHS):
        pdf.cell(w, 8, label, border=1, align="C", fill=True)
    pdf.ln()
    pdf.set_text_color(30, 30, 30)


def _build_pdf(records: list) -> bytes:
    rows = _expand_rows(records)

    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=12)
    pdf.set_margins(10, 10, 10)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 15)
    pdf.cell(0, 11, "Weather Records Report", border=0, align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "I", 7)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 5,
             "Feels Like and Humidity shown only for past/present dates.",
             align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(30, 30, 30)
    pdf.ln(2)

    _draw_header(pdf)

    prev_search_id = None
    for i, row in enumerate(rows):
        # New search group light separator shading
        if row["search_id"] != prev_search_id:
            prev_search_id = row["search_id"]
            group_start = True
        else:
            group_start = False

        if i % 2 == 0:
            pdf.set_fill_color(236, 240, 241)
        else:
            pdf.set_fill_color(255, 255, 255)

        if pdf.get_y() + 7 > pdf.page_break_trigger:
            pdf.add_page()
            _draw_header(pdf)

        cell_values = {
            "search_id":   str(row.get("search_id", "")),
            "location":    str(row.get("location", "")),
            "date_range":  str(row.get("date_range", "")),
            "date":        str(row.get("date", "")),
            "temp":        _fmt(row.get("temperature"), "°C"),
            "feels_like":  _fmt(row.get("feels_like"),  "°C"),
            "humidity":    _fmt(row.get("humidity"),     "%", decimals=0),
            "description": str(row.get("description") or ""),
            "lat":         _fmt(row.get("lat"),  "", decimals=4),
            "lon":         _fmt(row.get("lon"),  "", decimals=4),
        }

        pdf.set_font("Helvetica", "B" if group_start else "", 7)
        for col, w in zip(PDF_COLUMNS, PDF_WIDTHS):
            val = cell_values[col]
            if len(val) > 28:
                val = val[:26] + ".."
            align = "C" if col in _CENTRE else "L"
            pdf.cell(w, 7, val, border=1, align=align, fill=True)
        pdf.ln()

        # Reset font after bold group-start row
        if group_start:
            pdf.set_font("Helvetica", "", 7)

    # Footer
    pdf.set_y(-10)
    pdf.set_font("Helvetica", "I", 7)
    pdf.set_text_color(120, 120, 120)
    total_searches = len(records)
    total_days = len(rows)
    pdf.cell(0, 5,
             f"{total_searches} search record{'s' if total_searches != 1 else ''}  ·  {total_days} day{'s' if total_days != 1 else ''}",
             align="R")

    pdf_output = pdf.output()
    if pdf_output is None:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
    return bytes(pdf_output)


@router.get("/pdf")
async def export_pdf():
    records = _fetch_records()
    if not records:
        raise HTTPException(status_code=400, detail="No records to export")

    pdf_bytes = _build_pdf(records)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=weather_records.pdf"},
    )
