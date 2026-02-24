export default function YoutubeVideos({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
        Videos About This Location
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {videos.map((v) => (
          <a
            key={v.video_id}
            href={"https://www.youtube.com/watch?v=" + v.video_id}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="relative overflow-hidden">
              <img
                src={v.thumbnail}
                alt={v.title}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
            </div>
            <p className="text-sm text-slate-700 font-medium p-3 line-clamp-2 leading-snug">
              {v.title}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
