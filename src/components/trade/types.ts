/**
 * The offered cap, described the same way the admin cap form describes one, so
 * accepting a request can write a Cap row without Filip retyping anything.
 * Kept as strings because they come straight from form inputs; the server
 * narrows them.
 */
export type OfferedCap = {
  name: string;
  brewery: string;
  country: string;
  liner: string;
  year: string;
  product: string;
  capType: string;
  factorySigns: string;
};

/** The offer made for one marked cap. */
export type Offer = OfferedCap & {
  /** a wishlist cap id, "other", or "" when nothing is chosen yet */
  target: string;
  /** anything else worth knowing; becomes the cap's notes */
  note: string;
  fileName: string;
  /** object URL for the photo preview */
  preview: string;
  /** the picked file itself, sent with the form */
  file: File | null;
};

/** The fields asked for when "Other" is chosen, in the order they are shown. */
export const offeredCapFields: Array<{
  key: keyof OfferedCap;
  label: string;
  placeholder: string;
  /** a Cap row cannot be written without these */
  required?: boolean;
  type?: "number";
}> = [
  { key: "name", label: "Name", placeholder: "Bintang Pilsener", required: true },
  { key: "country", label: "Country", placeholder: "Indonesia", required: true },
  { key: "brewery", label: "Product / brewery", placeholder: "PT Multi Bintang" },
  { key: "liner", label: "Liner type", placeholder: "Cork / PVC / Metal" },
  { key: "year", label: "Year", placeholder: "Undated", type: "number" },
  { key: "product", label: "What was bottled", placeholder: "Beer / Soda / Water" },
  { key: "capType", label: "Cap type", placeholder: "Bottle closure" },
  { key: "factorySigns", label: "Factory signs", placeholder: "Marks on the skirt" },
];

export const emptyOffer: Offer = {
  target: "",
  name: "",
  brewery: "",
  country: "",
  liner: "",
  year: "",
  product: "",
  capType: "",
  factorySigns: "",
  note: "",
  fileName: "",
  preview: "",
  file: null,
};
