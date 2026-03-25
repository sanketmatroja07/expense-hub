import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ExpenseHub",
    short_name: "ExpenseHub",
    description:
      "Track personal spending, split group costs, and settle balances faster.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#5c7cfa",
    icons: [],
  };
}
