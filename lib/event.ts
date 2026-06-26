export const eventVenueName = "Maison Grande";

export const eventVenueAddress =
  "Setra Duta Grande Raya No.33, Sariwangi, Parongpong, West Bandung Regency, West Java 40559.";

export const eventTime = "12 Juli 2026, 07.00-14.00 WIB";

export const eventDateLabel = "12 Juli 2026";

export const eventStartsAt = "2026-07-12T07:00:00+07:00";

export function getEventCountdownLabel(now = new Date()) {
  const eventDate = new Date(eventStartsAt);
  const diff = eventDate.getTime() - now.getTime();

  if (diff <= 0) {
    return "Acara sedang berlangsung";
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} hari menuju acara`;
}
