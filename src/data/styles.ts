import type { StyleId } from "@/lib/types";

export const styleOptions: Array<{
  id: StyleId;
  /** the number shown in the switcher */
  number: string;
  label: string;
  note: string;
}> = [
  { id: "verdigris", number: "01", label: "Verdigris", note: "Teal on warm paper" },
  { id: "plate", number: "02", label: "Plate", note: "Copper on dark ink" },
  { id: "industry", number: "03", label: "Industry", note: "Steel blue wireframe" },
];

export const defaultStyle: StyleId = "verdigris";

export const styleIds = styleOptions.map((option) => option.id);

/** Cap disc palette per style — [fill colour, ink colour]. */
export const capPalettes: Record<StyleId, Array<[string, string]>> = {
  verdigris: [
    ["#1f9c96", "#ffffff"],
    ["#0d5754", "#ffffff"],
    ["#6fc9c1", "#0a3a38"],
    ["#d8c58a", "#14201f"],
    ["#14201f", "#effaf8"],
    ["#a8562f", "#ffffff"],
    ["#eeece7", "#14201f"],
    ["#38aca4", "#0a3a38"],
  ],
  plate: [
    ["#c0713c", "#14110e"],
    ["#7e8a6d", "#14110e"],
    ["#8f2f2a", "#efe7d8"],
    ["#d8c58a", "#14110e"],
    ["#2f4f52", "#efe7d8"],
    ["#b9432f", "#efe7d8"],
    ["#efe7d8", "#14110e"],
    ["#3b3a36", "#efe7d8"],
  ],
  industry: [
    ["#5980a6", "#ffffff"],
    ["#416180", "#ffffff"],
    ["#2c455d", "#ffffff"],
    ["#749dc4", "#1d2d3d"],
    ["#627d98", "#ffffff"],
    ["#1d2d3d", "#eef6ff"],
    ["#94bce3", "#1d2d3d"],
    ["#2b2b2d", "#eef6ff"],
  ],
};
