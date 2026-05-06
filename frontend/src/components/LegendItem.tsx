import type { LegendItemProps } from "../types/movie.type";

export const LegendItem = ({ color, label }: LegendItemProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
};
