// Single source of truth for contact details and opening hours.
// Update the hours and notice here; every page, the open-now badge and the
// structured data read from this file.

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Session {
  open: string; // "HH:MM", 24-hour, UK time
  close: string;
}

export interface Day {
  key: DayKey;
  name: string;
  sessions: Session[];
  note?: string;
}

export const business = {
  name: "Excel Computer Solutions",
  shortName: "ECS",
  owner: "Simon",
  tagline: "Honest computer and laptop repairs in Ossett",
  email: "simon@excelcomputersolutions.co.uk",
  phones: [
    { label: "Shop", display: "07449 032744", href: "tel:+447449032744" },
    { label: "Mobile", display: "07856 624207", href: "tel:+447856624207" },
  ],
  address: {
    building: "Dickinson House",
    street: "Bank Street",
    town: "Ossett",
    region: "West Yorkshire",
    postcode: "WF5 8NW",
    country: "GB",
  },
  geo: { lat: 53.6787649, lng: -1.5809596 },
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Excel+Computer+Solutions,+Dickinson+House,+Bank+St,+Ossett+WF5+8NW",
  reviewsUrl:
    "https://www.google.com/maps/place/Excel+Computer+Solutions/@53.6787649,-1.5809596,17z/data=!4m8!3m7!1s0x487966db809e4ddb:0xf10b3ec1afe499dc!8m2!3d53.6787649!4d-1.5809596!9m1!1b1",
  social: [{ label: "Facebook", href: "https://www.facebook.com/ExelComputerSolutions/" }],
} as const;

export const notice = {
  active: true,
  title: "Reduced opening hours",
  body: "We're open shorter hours for the time being and will be back to normal as soon as possible. Thanks for your patience.",
} as const;

export const week: Day[] = [
  { key: "mon", name: "Monday", sessions: [], note: "Closed until further notice" },
  { key: "tue", name: "Tuesday", sessions: [{ open: "09:00", close: "12:30" }] },
  { key: "wed", name: "Wednesday", sessions: [] },
  { key: "thu", name: "Thursday", sessions: [{ open: "09:00", close: "12:30" }] },
  { key: "fri", name: "Friday", sessions: [{ open: "09:00", close: "12:30" }] },
  { key: "sat", name: "Saturday", sessions: [] },
  { key: "sun", name: "Sunday", sessions: [] },
];

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}.${String(m).padStart(2, "0")}${suffix}`;
}

export function formatSessions(day: Day): string {
  if (day.sessions.length === 0) return "Closed";
  return day.sessions.map((s) => `${formatTime(s.open)} – ${formatTime(s.close)}`).join(", ");
}

export const fullAddress = [
  business.address.building,
  business.address.street,
  business.address.town,
  business.address.postcode,
].join(", ");
