const numberWords = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
];

export const formatNumber = (value: number) => value.toLocaleString("en-US");

/** Caps are often undated — the year is only printed when there is one. */
export const formatYear = (year: number | null) => (year === null ? "Undated" : String(year));

/** "1970s", or "Undated" when the cap carries no year. */
export const decadeOf = (year: number | null) =>
  year === null ? "Undated" : `${Math.floor(year / 10) * 10}s`;

/** Years collected since `startYear`, spelled out for the hero headline. */
export function yearsWord(startYear: number) {
  const years = new Date().getFullYear() - startYear;
  return numberWords[years] ?? String(years);
}

export const formatDate = (value: Date) =>
  value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
