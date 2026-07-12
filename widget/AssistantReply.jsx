import AssistantMessage from "./AssistantMessage";
import OfferCards from "./OfferCards";
import BookingCard from "./BookingCard";

export default function AssistantReply({ reply, onOfferPick, onHotelPick, theme }) {
  switch (reply.type) {
    case "offers":
      return (
        <div>
          {reply.text && (
            <div className="inline-block max-w-[85%]  border border-slate-200 rounded-2xl rounded-bl-none shadow-sm px-3.5 py-2.5 mb-2.5">
              <AssistantMessage content={reply.text} />
            </div>
          )}
          <OfferCards offers={reply.data} onPick={onOfferPick} theme={theme} />
        </div>
      );

    case "booking_confirmed":
      return (
        <div>
          <BookingCard booking={reply.data} />
          {reply.text && (
            <div className="inline-block border border-slate-200 rounded-2xl rounded-bl-none shadow-sm px-3.5 py-2.5 mt-2.5">
              <AssistantMessage content={reply.text} />
            </div>
          )}
        </div>
      );

    case "ask_hotel":
      return (
        <div>
          <AssistantMessage content={reply.text} />
          <div className="flex flex-col gap-1.5 mt-2">
            {reply.data.properties.map((p) => (
              <button
                key={p.propertyId}
                onClick={() => onHotelPick(p.name)}
                className="text-left text-[13px] px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      );

    // ChatWidget opens the modal itself in response to this type — the bubble
    // just needs a short line, not the raw (empty) text field.
    case "reopen_modal":
      return <AssistantMessage content="Sure — let's find you a stay." />;

    // "welcome" is rendered by ChatWidget itself (needs the two action buttons
    // wired to openModal/sendAction, which live at the widget level).
    case "welcome":
    case "text":
    default:
      return <AssistantMessage content={reply.text} />;
  }
}