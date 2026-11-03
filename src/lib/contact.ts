// Shared between the browser and the /api/contact endpoint so both
// validate the same way.

export const TOPICS = [
  "Computer or laptop repair",
  "Virus removal or antivirus",
  "Servicing or upgrades",
  "Data recovery",
  "Printer inks or blank media",
  "Something else",
] as const;

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}

export type ContactResponse =
  | { ok: true; message: string }
  | { ok: false; message: string; errors?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s-]{7,30}$/;

export function validate(raw: Record<string, unknown>): { data: ContactInput; errors: Record<string, string> } {
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const data: ContactInput = {
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    topic: TOPICS.includes(str("topic") as (typeof TOPICS)[number]) ? str("topic") : "Something else",
    message: str("message"),
  };

  const errors: Record<string, string> = {};
  if (!data.name) errors.name = "Please tell us your name.";
  else if (data.name.length > 100) errors.name = "Please shorten your name to 100 characters.";
  if (!data.email) errors.email = "Please enter your email address so we can reply.";
  else if (!EMAIL.test(data.email) || data.email.length > 200)
    errors.email = "Please enter an email address like name@example.com.";
  if (data.phone && !PHONE.test(data.phone)) errors.phone = "Please enter a phone number using digits only.";
  if (data.message.length < 10) errors.message = "Please describe the problem in a little more detail.";
  else if (data.message.length > 3000) errors.message = "Please keep your message under 3,000 characters.";

  return { data, errors };
}
