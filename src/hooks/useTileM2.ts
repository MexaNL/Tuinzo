import { useEffect, useState } from "react";

const KEY_M2 = "gardino:tile-m2";
const KEY_JOINT = "gardino:tile-joint";
const KEY_WASTE = "gardino:tile-waste";
const DEFAULT_M2 = 10;
const DEFAULT_JOINT = 3; // mm
const DEFAULT_WASTE = 10; // %

export const JOINT_OPTIONS = [0, 2, 3, 5, 8] as const;
export const WASTE_OPTIONS = [0, 5, 10, 15] as const;

type State = { m2: number; joint: number; waste: number };
const listeners = new Set<(s: State) => void>();

const safeNum = (raw: string | null, fallback: number, allowZero = false) => {
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return fallback;
  if (!allowZero && n <= 0) return fallback;
  if (allowZero && n < 0) return fallback;
  return n;
};

const read = (): State => {
  if (typeof window === "undefined") return { m2: DEFAULT_M2, joint: DEFAULT_JOINT, waste: DEFAULT_WASTE };
  return {
    m2: safeNum(sessionStorage.getItem(KEY_M2), DEFAULT_M2),
    joint: safeNum(sessionStorage.getItem(KEY_JOINT), DEFAULT_JOINT, true),
    waste: safeNum(sessionStorage.getItem(KEY_WASTE), DEFAULT_WASTE, true),
  };
};

const write = (s: State) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY_M2, String(s.m2));
  sessionStorage.setItem(KEY_JOINT, String(s.joint));
  sessionStorage.setItem(KEY_WASTE, String(s.waste));
};

export const useTileM2 = () => {
  const [state, setState] = useState<State>(read);

  useEffect(() => {
    const cb = (s: State) => setState(s);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  const update = (patch: Partial<State>) => {
    const next = { ...read(), ...patch };
    if (!Number.isFinite(next.m2) || next.m2 <= 0) next.m2 = DEFAULT_M2;
    if (!Number.isFinite(next.joint) || next.joint < 0) next.joint = 0;
    if (!Number.isFinite(next.waste) || next.waste < 0) next.waste = 0;
    write(next);
    listeners.forEach((l) => l(next));
  };

  return {
    m2: state.m2,
    joint: state.joint,
    waste: state.waste,
    setM2: (v: number) => update({ m2: v }),
    setJoint: (v: number) => update({ joint: v }),
    setWaste: (v: number) => update({ waste: v }),
  };
};

export interface CalcOptions {
  jointMm?: number; // voegafstand in mm
  wastePct?: number; // snijverlies in %
}

/**
 * Calculate the total price for a given m² requirement, accounting for
 * joint width (mm) and waste percentage. Returns null if data is missing.
 */
export const calcTilePrice = (
  pricePerUnit: number | null | undefined,
  tileSizeM2: number | null | undefined,
  desiredM2: number,
  opts: CalcOptions = {},
) => {
  if (!pricePerUnit || !tileSizeM2 || tileSizeM2 <= 0 || desiredM2 <= 0) return null;
  const waste = Math.max(0, opts.wastePct ?? 0) / 100;
  const jointM = Math.max(0, opts.jointMm ?? 0) / 1000;
  const effectiveArea = desiredM2 * (1 + waste);
  // Approximate tile side from area (assume square)
  const side = Math.sqrt(tileSizeM2);
  const coveragePerTile = (side + jointM) ** 2; // includes its share of joint
  const tilesNeeded = Math.ceil(effectiveArea / coveragePerTile);
  const total = tilesNeeded * pricePerUnit;
  return { tilesNeeded, total, effectiveArea };
};

export const formatEuro = (n: number) =>
  `€ ${n.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
