import { useEffect, useState, useCallback } from "react";

const KEY = "gardino:favorites";

const read = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
};

export const useFavorites = () => {
  const [ids, setIds] = useState<string[]>(() => (typeof window !== "undefined" ? read() : []));

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setIds(read()); };
    const onCustom = () => setIds(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("gardino:favorites", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("gardino:favorites", onCustom);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const cur = read();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    setIds(next);
    window.dispatchEvent(new Event("gardino:favorites"));
  }, []);

  const has = useCallback((slug: string) => ids.includes(slug), [ids]);

  return { ids, count: ids.length, toggle, has };
};
