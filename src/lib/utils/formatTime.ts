export function formatTime(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else {
    const parsed = new Date(String(value));
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    } else {
      return String(value).toLowerCase();
    }
  }

  const hours24 = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours24 >= 12 ? "p.m." : "a.m.";
  const hours12 = hours24 % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : String(minutes);

  return `${hours12}:${minutesStr} ${ampm}`;
}
