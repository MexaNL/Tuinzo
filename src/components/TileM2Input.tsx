import { Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { useTileM2, JOINT_OPTIONS, WASTE_OPTIONS } from "@/hooks/useTileM2";

interface Props {
  variant?: "sticky" | "inline";
  className?: string;
}

type Mode = "m2" | "lxb";

export const TileM2Input = ({ variant = "inline", className = "" }: Props) => {
  const { m2, joint, waste, setM2, setJoint, setWaste } = useTileM2();
  const [mode, setMode] = useState<Mode>("m2");
  const [length, setLength] = useState<number>(() => Math.max(1, Math.round(Math.sqrt(m2) * 10) / 10));
  const [width, setWidth] = useState<number>(() => Math.max(1, Math.round(Math.sqrt(m2) * 10) / 10));

  useEffect(() => {
    if (mode !== "lxb") return;
    const l = Number(length);
    const b = Number(width);
    if (Number.isFinite(l) && Number.isFinite(b) && l > 0 && b > 0) {
      const computed = Math.round(l * b * 100) / 100;
      if (computed !== m2) setM2(computed);
    }
  }, [mode, length, width, m2, setM2]);

  const wrapperCls =
    variant === "sticky"
      ? "sticky top-14 z-30 -mx-4 mb-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:top-16 md:mx-0 md:rounded-lg md:border md:shadow-soft"
      : "rounded-lg border border-border bg-card p-4 shadow-soft";

  const tabBtn = (active: boolean) =>
    `px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
    }`;

  const dimInput =
    "w-16 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary";

  const selectCls =
    "rounded-md border border-input bg-background px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className={`${wrapperCls} ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Ruler className="h-4 w-4 text-primary" />
          <span>Bereken voor jouw oppervlakte</span>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <button type="button" onClick={() => setMode("m2")} className={tabBtn(mode === "m2")}>
            m²
          </button>
          <button type="button" onClick={() => setMode("lxb")} className={tabBtn(mode === "lxb")}>
            L × B
          </button>
        </div>

        {mode === "m2" ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              step={0.5}
              value={m2}
              onChange={(e) => setM2(Number(e.target.value))}
              className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Aantal m² nodig"
            />
            <span className="text-sm font-medium text-foreground">m²</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className={dimInput}
              aria-label="Lengte in meter"
            />
            <span className="text-sm font-medium text-foreground">m ×</span>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className={dimInput}
              aria-label="Breedte in meter"
            />
            <span className="text-sm font-medium text-foreground">m</span>
            <span className="ml-1 text-xs font-semibold text-primary">= {m2} m²</span>
          </div>
        )}

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Voeg
          <select
            value={joint}
            onChange={(e) => setJoint(Number(e.target.value))}
            className={selectCls}
            aria-label="Voegafstand in mm"
          >
            {JOINT_OPTIONS.map((v) => (
              <option key={v} value={v}>{v} mm</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Snijverlies
          <select
            value={waste}
            onChange={(e) => setWaste(Number(e.target.value))}
            className={selectCls}
            aria-label="Snijverlies in procent"
          >
            {WASTE_OPTIONS.map((v) => (
              <option key={v} value={v}>+{v}%</option>
            ))}
          </select>
        </label>

        <p className="w-full text-xs text-muted-foreground sm:w-auto">Prijzen worden direct herberekend.</p>
      </div>
    </div>
  );
};
