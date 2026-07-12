export default function OfferCards({ offers, onPick, theme }) {
  const accent = theme?.primaryColor || "#2563eb";
  const single = offers.length === 1;

  return (
    <div className="w-full px-3 py-1">
      <style>{`
        .offer-scroll::-webkit-scrollbar { display: none; }
        .offer-card { width: clamp(168px, 78%, 240px); }
      `}</style>
      <div
        className="offer-scroll flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {offers.map((offer, i) => {
          const number = i + 1;
          const roomName = offer.roomName;
          const title = offer.name || `Offer ${number}`;

          return (
            <button
              key={offer.ratePlanId}
              onClick={() => onPick(number)}
              className={`offer-card group text-left overflow-hidden shrink-0 snap-start bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
                single ? "mx-auto" : ""
              }`}
            >
              <div className="relative h-28">
                {offer.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.image}
                    alt={roomName || title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <span
                  className="absolute top-2 left-2 w-6 h-6 rounded-full text-white text-[12px] font-bold flex items-center justify-center shadow"
                  style={{ backgroundColor: accent }}
                >
                  {number}
                </span>
                {!single && (
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none">
                    {number}/{offers.length}
                  </span>
                )}
              </div>

              <div className="p-3">
                <div className="min-w-0">
                  {roomName && (
                    <p
                      className="text-[10.5px] font-semibold uppercase tracking-wide mb-0.5 truncate"
                      style={{ color: accent }}
                    >
                      {roomName}
                    </p>
                  )}
                  <p className="text-[13px] font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.2em]">
                    {title}
                  </p>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[55%]">
                    {offer.ratePlanId}
                  </span>
                  <p className="leading-none text-right shrink-0">
                    <span className="text-[15px] font-bold text-slate-900">{offer.amount}</span>
                    <span className="text-[10px] font-medium text-slate-400 ml-1">{offer.currency}</span>
                  </p>
                </div>

                <div
                  className="mt-2.5 text-center text-[12px] font-semibold py-2 rounded-xl text-white transition-opacity group-hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  Select this offer
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}