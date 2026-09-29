const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const DATE_PATTERN = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

export function formatDate(value: string): string {
  if (value === "present") return "Present";
  if (!DATE_PATTERN.test(value)) throw new Error(`Invalid date: ${value}`);
  const [year, month] = value.split("-");
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

export function formatRange(start: string, end?: string): string {
  if (start === "present") throw new Error("Invalid date: start cannot be present");
  const from = formatDate(start);
  return end === undefined ? from : `${from} – ${formatDate(end)}`;
}

/** Sortable key: "present" sorts after everything. */
export function dateKey(value: string): string {
  return value === "present" ? "9999-99" : value.length === 4 ? `${value}-00` : value;
}
