/**
 * Maps category label text to a small Lucide icon for filter chips.
 */
import type { ReactNode } from "react";
import {
  Briefcase,
  Camera,
  LayoutGrid,
  Music,
  Package,
  Tent,
  Wrench,
} from "lucide-react";

export function CategoryChipIcon({
  category,
}: {
  category: string;
}): ReactNode {
  if (category === "All") {
    return <LayoutGrid className="shrink-0" size={16} aria-hidden />;
  }
  const n = category.toLowerCase();
  if (n.includes("tent") || n.includes("camp")) {
    return <Tent className="shrink-0" size={16} aria-hidden />;
  }
  if (
    n.includes("camera") ||
    n.includes("photo") ||
    n.includes("lens") ||
    n.includes("drone")
  ) {
    return <Camera className="shrink-0" size={16} aria-hidden />;
  }
  if (
    n.includes("audio") ||
    n.includes("sound") ||
    n.includes("mic") ||
    n.includes("speaker")
  ) {
    return <Music className="shrink-0" size={16} aria-hidden />;
  }
  if (n.includes("bag") || n.includes("case") || n.includes("pack")) {
    return <Briefcase className="shrink-0" size={16} aria-hidden />;
  }
  if (n.includes("tool") || n.includes("power")) {
    return <Wrench className="shrink-0" size={16} aria-hidden />;
  }
  return <Package className="shrink-0" size={16} aria-hidden />;
}
