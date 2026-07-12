const Row = ({ label, value, mono }) =>
    value ? (
      <div className="flex items-baseline gap-5 justify-between py-1 border-b border-green-100 last:border-0">
        <span className="text-[11.5px] text-green-700/70 font-medium">{label}</span>
        <span className={`text-[12.5px] text-slate-800 font-semibold text-right ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
      </div>
    ) : null;
    
export default function BookingCard({ booking }) {
  // Based on the real createBooking response shape observed in production.
  // Falls back across a couple of likely key variants without assuming one
  // that doesn't exist — anything missing is simply omitted from the card.
  const reservationId = booking.reservation_id || booking.reservationId || booking.id;
  const guestId = booking.guest_id || booking.guestId || booking.guest?.guest_id || booking.guest?.id;
  const arrival = booking.arrival || booking.check_in;
  const departure = booking.departure || booking.check_out;
  const roomType = booking.room_type || booking.roomType || booking.unit_group?.name;
  const amount = booking.total_amount?.amount ?? booking.amount;
  const currency = booking.total_amount?.currency ?? booking.currency;
  // const guestName =
  //   booking.guest_name ||
  //   booking.guestName ||
  //   [booking.guest?.first_name, booking.guest?.last_name].filter(Boolean).join(" ");
  // const guestEmail = booking.guest?.email || booking.guest_email;
  // const guestPhone = booking.guest?.phone || booking.guest_phone;

  

    
  return (
    <div className="border border-green-200 bg-gradient-to-b from-green-50 to-white rounded-xl overflow-hidden shadow-sm">
      <div className="bg-green-600 px-3.5 py-2.5 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <p className="text-[13px] font-semibold text-white">Booking Confirmed</p>
      </div>

      <div className="px-3.5 py-2.5">
        <Row label="Reservation ID" value={reservationId} mono />
        {guestId && <Row label="Guest ID" value={guestId} mono />}
        {arrival && departure && <Row label="Dates" value={`${arrival} – ${departure}`} />}
        {roomType && <Row label="Room" value={roomType} />}
        {amount != null && <Row label="Total" value={`${amount} ${currency || ""}`.trim()} />}
        {/* {guestName && <Row label="Guest" value={guestName} />}
        {guestEmail && <Row label="Email" value={guestEmail} />}
        {guestPhone && <Row label="Phone" value={guestPhone} mono />} */}
      </div>
    </div>
  );
}