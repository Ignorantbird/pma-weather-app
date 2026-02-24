import { useEffect, useState } from "react";
import { getRecords, createRecord, deleteRecord, updateRecord } from "../api/weatherApi";
import toast from "react-hot-toast";
import { fmtT } from "../utils/temperature";


//helper function format date range as deafault label 
function dateLabel(r) {
  return r.start_date === r.end_date ? r.start_date : `${r.start_date} to ${r.end_date}`;
}

//helper function to group records by location
function groupByLocation(records) {
  const map = {};
  for (const r of records) {
    if (!map[r.location]) map[r.location] = { location: r.location, searches: [] };
    map[r.location].searches.push(r);
  }
  const groups = Object.values(map);
  groups.forEach((g) => g.searches.sort((a, b) => b.id - a.id));
  groups.sort((a, b) => b.searches[0].id - a.searches[0].id);
  return groups;
}

//state variables
export default function WeatherRecords({ onDayClick, refreshKey, unit = "C" }) {
  const [records, setRecords]           = useState([]);
  const [expandedLocs, setExpandedLocs] = useState({});
  const [expandedSearches, setExpandedSearches] = useState({});

  // Filters + sort
  const [filter, setFilter]         = useState("");
  const [favOnly, setFavOnly]       = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy]         = useState("newest");

  // Inline note editing
  const [noteEditId, setNoteEditId] = useState(null);
  const [noteText, setNoteText]     = useState("");

  // Inline label / rename editing
  const [labelEditId, setLabelEditId] = useState(null);
  const [labelText, setLabelText]     = useState("");

  // Full record edit (location + dates — existing)
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState({ location: "", start_date: "", end_date: "" });
  const [editLoading, setEditLoading] = useState(false);

  //load function
  const load = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data);
    } catch {
      toast.error("Failed to load history");
    }
  };

  useEffect(() => { load(); }, [refreshKey]);

  const toggleLoc    = (loc) => setExpandedLocs((p) => ({ ...p, [loc]: !p[loc] }));
  const toggleSearch = (id)  => setExpandedSearches((p) => ({ ...p, [id]: !p[id] }));

  //Favorite
  const toggleFavorite = async (r) => {
    const next = !r.is_favorite;
    setRecords((p) => p.map((x) => x.id === r.id ? { ...x, is_favorite: next } : x));
    try {
      await updateRecord(r.id, { is_favorite: next });
    } catch {
      setRecords((p) => p.map((x) => x.id === r.id ? { ...x, is_favorite: !next } : x));
      toast.error("Failed to update favorite");
    }
  };

  //Note
  const startNote = (r) => { setNoteEditId(r.id); setNoteText(r.note || ""); setLabelEditId(null); };

  const saveNote = async (r) => {
    try {
      await updateRecord(r.id, { note: noteText.trim() });
      setRecords((p) => p.map((x) => x.id === r.id ? { ...x, note: noteText.trim() } : x));
      setNoteEditId(null);
    } catch { toast.error("Failed to save note"); }
  };

  //rename
  const startLabel = (r) => { setLabelEditId(r.id); setLabelText(r.label || ""); setNoteEditId(null); };

  const saveLabel = async (r) => {
    try {
      await updateRecord(r.id, { label: labelText.trim() });
      setRecords((p) => p.map((x) => x.id === r.id ? { ...x, label: labelText.trim() } : x));
      setLabelEditId(null);
    } catch { toast.error("Failed to save label"); }
  };

  // Archive 
  const handleArchive = async (r) => {
    try {
      await updateRecord(r.id, { is_archived: true });
      setRecords((p) => p.map((x) => x.id === r.id ? { ...x, is_archived: true } : x));
      toast.success("Archived");
    } catch { toast.error("Failed to archive"); }
  };


  //restore
  const handleRestore = async (r) => {
    try {
      await updateRecord(r.id, { is_archived: false });
      setRecords((p) => p.map((x) => x.id === r.id ? { ...x, is_archived: false } : x));
      toast.success("Restored to history");
    } catch { toast.error("Failed to restore"); }
  };

  //delete
  const handleDelete = async (id) => {
    try {
      await deleteRecord(id);
      setRecords((p) => p.filter((x) => x.id !== id));
      toast.success("Permanently deleted");
    } catch { toast.error("Failed to delete"); }
  };

  //history edit 
  const startEdit  = (r) => { setEditId(r.id); setEditForm({ location: r.location, start_date: r.start_date, end_date: r.end_date }); };
  const cancelEdit = ()  => { setEditId(null); setEditForm({ location: "", start_date: "", end_date: "" }); };

  const handleEditSubmit = async (e, r) => {
    e.preventDefault();
    const loc = editForm.location.trim();
    if (loc.length < 2)               { toast.error("Location must be at least 2 characters"); return; }
    if (!/[a-zA-Z0-9]/.test(loc))     { toast.error("Location must contain at least one letter or number"); return; }
    if (!editForm.start_date || !editForm.end_date) { toast.error("Both dates are required"); return; }
    if (editForm.end_date < editForm.start_date)    { toast.error("End date must be on or after start date"); return; }

    setEditLoading(true);
    try {
      const res = await createRecord({ location: loc, start_date: editForm.start_date, end_date: editForm.end_date });
      await deleteRecord(r.id);
      toast.success(`Updated to ${res.data.location || loc}`);
      cancelEdit();
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : detail || "Update failed";
      toast.error(msg);
    } finally { setEditLoading(false); }
  };

  //Filter
  const q = filter.trim().toLowerCase();
  const visible = records.filter((r) => {
    if (showArchived ? !r.is_archived : r.is_archived) return false;
    if (favOnly && !r.is_favorite) return false;
    if (q && !r.location.toLowerCase().includes(q) && !(r.label || "").toLowerCase().includes(q)) return false;
    return true;
  });

  //sort
  const rawGroups = groupByLocation(visible);
  const groups = [...rawGroups].sort((a, b) => {
    if (sortBy === "oldest") return a.searches[a.searches.length - 1].id - b.searches[b.searches.length - 1].id;
    if (sortBy === "az")     return a.location.localeCompare(b.location);
    if (sortBy === "za")     return b.location.localeCompare(a.location);
    return 0; 
  });

  return (
    <div className="w-full">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {showArchived ? "Archived Records" : "Search History"}
        </p>
        <button
          onClick={() => { setShowArchived((s) => !s); setFavOnly(false); setFilter(""); }}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
            showArchived ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {showArchived ? "Back to history" : "Archived"}
        </button>
      </div>

      {/* ── Filter + Sort + Favorites bar (active history only) ── */}
      {!showArchived && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by city or label..."
            className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shrink-0 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A &rarr; Z</option>
            <option value="za">Z &rarr; A</option>
          </select>
          <button
            onClick={() => setFavOnly((f) => !f)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold shrink-0 transition ${
              favOnly
                ? "bg-amber-400 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-500"
            }`}
            title="Show favorites only"
          >
            &#9733; Favorites
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-8 text-center">
          <p className="text-slate-400 text-sm">
            {showArchived
              ? "No archived records."
              : favOnly
              ? "No favorites yet — click the star on a record to bookmark it."
              : filter
              ? `No results for "${filter}".`
              : "No history yet — search a location above to get started."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => {
            const hasFav = g.searches.some((r) => r.is_favorite);
            return (
              <div
                key={g.location}
                className={`bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden border-l-4 ${
                  showArchived ? "border-l-slate-300" : hasFav ? "border-l-amber-400" : "border-l-blue-500"
                }`}
              >
                {/* Location header */}
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => toggleLoc(g.location)}
                >
                  <div className="flex items-center gap-2">
                    {hasFav && !showArchived && (
                      <span className="text-amber-400 text-sm leading-none">&#9733;</span>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 text-base">{g.location}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {g.searches.length} search{g.searches.length !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-300 text-sm select-none ml-4 font-light">
                    {expandedLocs[g.location] ? "▲" : "▼"}
                  </span>
                </div>

                {/* Search records */}
                {expandedLocs[g.location] && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {g.searches.map((r) => {
                      const days = [...(r.daily_data || [])].sort((a, b) => a.date > b.date ? 1 : -1);

                      // ── Full edit form ──────────────────────────────────────
                      if (editId === r.id) {
                        return (
                          <form key={r.id} onSubmit={(e) => handleEditSubmit(e, r)}
                            className="px-5 py-4 flex flex-col gap-3 bg-blue-50">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-700">Edit search record</p>
                              <button type="button" onClick={cancelEdit}
                                className="text-xs text-slate-400 hover:text-slate-600 font-medium">Cancel</button>
                            </div>
                            <input type="text" value={editForm.location}
                              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                              placeholder="Location" minLength={2} required
                              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                            <div className="flex gap-2">
                              <div className="flex-1 flex flex-col gap-1">
                                <label className="text-xs text-slate-500 font-medium">Start date</label>
                                <input type="date" value={editForm.start_date}
                                  onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                                  required className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                              </div>
                              <div className="flex-1 flex flex-col gap-1">
                                <label className="text-xs text-slate-500 font-medium">End date</label>
                                <input type="date" value={editForm.end_date} min={editForm.start_date}
                                  onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                                  required className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400">Saving re-fetches weather for the updated location and dates.</p>
                            <button type="submit" disabled={editLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                              {editLoading ? "Saving..." : "Save Changes"}
                            </button>
                          </form>
                        );
                      }

                      // ── Normal search row ───────────────────────────────────
                      return (
                        <div key={r.id} className={showArchived ? "opacity-60" : ""}>

                          {/* Row: star + label + actions */}
                          <div className="px-4 py-3 flex items-center gap-2 hover:bg-slate-50/80 transition">

                            {/* Favorite star */}
                            {!showArchived && (
                              <button
                                type="button"
                                onClick={() => toggleFavorite(r)}
                                title={r.is_favorite ? "Remove from favorites" : "Mark as favorite"}
                                className={`text-lg leading-none shrink-0 transition ${
                                  r.is_favorite ? "text-amber-400" : "text-slate-200 hover:text-amber-300"
                                }`}
                              >
                                &#9733;
                              </button>
                            )}

                            {/* Label — click row to expand, click text to rename */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleSearch(r.id)}>
                              {labelEditId === r.id ? (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    autoFocus
                                    type="text"
                                    value={labelText}
                                    onChange={(e) => setLabelText(e.target.value)}
                                    placeholder={dateLabel(r)}
                                    onKeyDown={(e) => { if (e.key === "Enter") saveLabel(r); if (e.key === "Escape") setLabelEditId(null); }}
                                    className="px-2 py-0.5 border border-blue-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                                  />
                                  <button onClick={() => saveLabel(r)}
                                    className="text-xs text-blue-600 font-semibold hover:text-blue-800">Save</button>
                                  <button onClick={() => setLabelEditId(null)}
                                    className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                                </div>
                              ) : (
                                <p className="text-sm font-semibold text-slate-700 truncate">
                                  {r.label || dateLabel(r)}
                                  {r.label && (
                                    <span className="ml-1.5 text-xs text-slate-400 font-normal">({dateLabel(r)})</span>
                                  )}
                                  <span className="ml-2 text-xs text-blue-500 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-full">
                                    {days.length} day{days.length !== 1 ? "s" : ""}
                                  </span>
                                </p>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {showArchived ? (
                                <>
                                  <button type="button" onClick={() => handleRestore(r)}
                                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition">
                                    Restore
                                  </button>
                                  <button type="button" onClick={() => handleDelete(r.id)}
                                    className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition">
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button type="button" onClick={() => startLabel(r)}
                                    className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold transition"
                                    title="Give this search a custom name">
                                    Rename
                                  </button>
                                  <button type="button" onClick={() => startNote(r)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                      r.note ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                    title="Add or edit note">
                                    {r.note ? "Note ●" : "Note"}
                                  </button>
                                  <button type="button" onClick={() => startEdit(r)}
                                    className="px-2.5 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-semibold transition">
                                    Edit
                                  </button>
                                  <button type="button" onClick={() => handleArchive(r)}
                                    className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                                    title="Archive (hide but keep)">
                                    Archive
                                  </button>
                                </>
                              )}
                              <span className="text-slate-300 cursor-pointer select-none text-sm ml-0.5"
                                onClick={() => toggleSearch(r.id)}>
                                {expandedSearches[r.id] ? "▲" : "▼"}
                              </span>
                            </div>
                          </div>

                          {/* Note edit / display */}
                          {!showArchived && noteEditId === r.id ? (
                            <div className="px-5 pb-3 flex flex-col gap-2">
                              <textarea
                                autoFocus
                                rows={2}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder='e.g. "Planning trip here", "Client visit"'
                                className="w-full px-3 py-2 border border-blue-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-slate-700 placeholder-slate-400"
                              />
                              <div className="flex gap-2">
                                <button type="button" onClick={() => saveNote(r)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
                                  Save note
                                </button>
                                <button type="button" onClick={() => setNoteEditId(null)}
                                  className="px-3 py-1 text-slate-400 hover:text-slate-600 text-xs font-medium transition">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            !showArchived && r.note && (
                              <div className="px-5 pb-2.5 cursor-pointer group" onClick={() => startNote(r)}>
                                <p className="text-xs text-indigo-500 italic group-hover:text-indigo-700 transition">
                                  &ldquo;{r.note}&rdquo;
                                </p>
                              </div>
                            )
                          )}

                          {/* Day rows */}
                          {expandedSearches[r.id] && (
                            <div className="border-t border-slate-100 divide-y divide-slate-100">
                              {days.length === 0 ? (
                                <p className="pl-8 pr-5 py-2.5 text-xs text-slate-400">No daily data.</p>
                              ) : (
                                days.map((day) => (
                                  <div
                                    key={day.date}
                                    className="pl-8 pr-5 py-2.5 flex items-center hover:bg-blue-50 transition cursor-pointer group"
                                    onClick={() => !showArchived && onDayClick && onDayClick({
                                      id: r.id, location: r.location, query_date: day.date,
                                      temperature: day.temperature, description: day.description,
                                      lat: r.lat, lon: r.lon,
                                    })}
                                  >
                                    <div className="flex-1">
                                      <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-800">{day.date}</span>
                                      <span className="text-sm text-slate-500 ml-3">{fmtT(day.temperature, unit)} &mdash; {day.description}</span>
                                    </div>
                                    {!showArchived && (
                                      <span className="text-xs text-slate-300 group-hover:text-blue-500 shrink-0 ml-3 font-medium transition">
                                        Details &rarr;
                                      </span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
