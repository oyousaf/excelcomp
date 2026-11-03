import { formatTime, week, type Day, type DayKey } from "@/data/business";

export interface OpenStatus {
  open: boolean;
  text: string;
  detail: string;
  today: Day;
}

const keys: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  return h * 60 + m;
};

function londonNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { dayIndex, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function getStatus(date?: Date): OpenStatus {
  const { dayIndex, minutes } = londonNow(date);
  const today = week.find((d) => d.key === keys[dayIndex])!;

  const current = today.sessions.find((s) => minutes >= toMinutes(s.open) && minutes < toMinutes(s.close));
  if (current) return { open: true, text: "Open now", detail: `Closes at ${formatTime(current.close)} today`, today };

  const later = today.sessions.find((s) => minutes < toMinutes(s.open));
  if (later) return { open: false, text: "Closed right now", detail: `Opens at ${formatTime(later.open)} today`, today };

  for (let i = 1; i <= 7; i++) {
    const day = week.find((d) => d.key === keys[(dayIndex + i) % 7])!;
    const first = day.sessions[0];
    if (first) {
      const when = i === 1 ? "tomorrow" : day.name;
      return { open: false, text: "Closed right now", detail: `Opens ${when} at ${formatTime(first.open)}`, today };
    }
  }
  return { open: false, text: "Closed", detail: "Please call before visiting", today };
}

/** Fills every [data-status-*] hook on the page and marks today's rows. */
export function bindStatus(): OpenStatus {
  const s = getStatus();
  const root = document.documentElement;
  root.dataset.open = String(s.open);
  document.querySelectorAll("[data-status-text]").forEach((el) => (el.textContent = s.text));
  document.querySelectorAll("[data-status-detail]").forEach((el) => (el.textContent = s.detail));
  document.querySelectorAll("[data-status-lead]").forEach((el) => (el.textContent = s.open ? "Come in, we're" : "Sorry, we're"));
  document.querySelectorAll("[data-status-short]").forEach((el) => (el.textContent = s.open ? "Open" : "Closed"));
  document.querySelectorAll(`[data-day="${s.today.key}"]`).forEach((row) => {
    row.setAttribute("data-today", "");
    row.setAttribute("aria-current", "date");
  });
  return s;
}
