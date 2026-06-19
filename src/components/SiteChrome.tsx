import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Leaf, ChevronRight, Truck, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";
import { useFavorites } from "@/hooks/useFavorites";

interface SearchHit { slug: string; title: string; image_url: string; price_label: string | null }
interface CategoryItem { id: string; slug: string; name: string }

const PROMO = [
  { icon: Truck, text: "Direct geleverd door onze partners" },
  { icon: ShieldCheck, text: "Onafhankelijk vergeleken" },
  { icon: Sparkles, text: "Wekelijks verse tuindeals" },
];

export const PromoBar = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % PROMO.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-brand-promo-soft">
      <div className="container relative flex h-9 items-center justify-center overflow-hidden text-xs font-medium text-foreground">
        {PROMO.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              aria-hidden={idx !== i}
              className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-500 ${
                idx === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span>{p.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SiteHeader = () => {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const { count: favCount } = useFavorites();

  useEffect(() => {
    supabase.from("categories").select("id,slug,name").order("sort_order")
      .then(({ data }) => data && setCategories(data as CategoryItem[]));
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("slug,title,image_url,price_label")
        .ilike("title", `%${q}%`)
        .limit(6);
      setHits((data ?? []) as SearchHit[]);
      setOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <>
      <PromoBar />
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 md:h-16 md:gap-3">
          {/* Left: hamburger (mobile) + desktop search */}
          <div className="flex items-center justify-self-start gap-2">
            <button
              aria-label="Menu"
              className="lg:hidden -ml-2 inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <span className="block h-0.5 w-6 bg-foreground" />
              <span className="block h-0.5 w-6 bg-foreground" />
            </button>

            {/* Desktop search */}
            <div ref={boxRef} className="relative hidden lg:block w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => hits.length && setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && hits[0]) {
                    navigate(`/product/${hits[0].slug}`); setOpen(false); setQ("");
                  }
                }}
                placeholder="Zoek loungesets, BBQ, tegels…"
                className="h-10 pl-10 text-sm"
              />
              {open && hits.length > 0 && (
                <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-md border border-border bg-popover shadow-card">
                  {hits.map((h) => (
                    <Link
                      key={h.slug}
                      to={`/product/${h.slug}`}
                      onClick={() => { setOpen(false); setQ(""); }}
                      className="flex items-center gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0 hover:bg-muted"
                    >
                      <img src={h.image_url} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded object-cover bg-muted" />
                      <span className="line-clamp-1 flex-1 text-foreground">{h.title}</span>
                      {h.price_label && <span className="font-display text-sm font-bold text-primary shrink-0">{h.price_label}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex shrink-0 items-center gap-1.5 justify-self-center font-display text-2xl font-extrabold tracking-tight text-primary sm:text-[28px]">
            <Leaf className="h-5 w-5 text-brand-leaf" />
            <span>Gardino</span>
          </Link>

          {/* Right: favorites */}
          <div className="flex items-center justify-self-end">
            <Link
              to="/favorieten"
              aria-label={`Favorieten (${favCount})`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Heart className="h-5 w-5" />
              {favCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground">
                  {favCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div ref={boxRef} className="relative lg:hidden">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => hits.length && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && hits[0]) {
                navigate(`/product/${hits[0].slug}`); setOpen(false); setQ("");
              }
            }}
            placeholder="Zoek loungesets, BBQ, tegels…"
            className="h-11 w-full rounded-none border-x-0 border-y border-border bg-background pl-6 pr-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Search className="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground" />
          {open && hits.length > 0 && (
            <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden border-b border-border bg-popover shadow-card">
              {hits.map((h) => (
                <Link
                  key={h.slug}
                  to={`/product/${h.slug}`}
                  onClick={() => { setOpen(false); setQ(""); }}
                  className="flex items-center gap-3 border-b border-border py-2 pl-6 pr-6 text-sm last:border-b-0 hover:bg-muted"
                >
                  <img src={h.image_url} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded object-cover bg-muted" />
                  <span className="line-clamp-1 flex-1 text-foreground">{h.title}</span>
                  {h.price_label && <span className="font-display text-sm font-bold text-primary shrink-0">{h.price_label}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Category chips */}
        <div className="border-b border-border">
          <div className="scrollbar-none flex gap-2 overflow-x-auto px-6 py-2 md:px-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]">
            {categories.map((c) => (
              <NavLink
                key={c.slug}
                to={`/categorie/${c.slug}`}
                className={({ isActive }) =>
                  `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`
                }
              >
                {c.name}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
          <div className="container flex h-14 items-center gap-2 border-b border-border">
            <button
              aria-label="Sluiten"
              onClick={() => setMobileOpen(false)}
              className="-ml-2 inline-flex h-10 w-10 items-center justify-center text-foreground"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2.5" />
              </svg>
            </button>
            <span className="flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight text-primary">
              <Leaf className="h-5 w-5 text-brand-leaf" /> Gardino
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pb-8">
            <h2 className="px-6 pt-6 pb-4 font-display text-3xl font-bold text-foreground">Categorieën</h2>
            <ul className="grid grid-cols-2 gap-3 px-6">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/categorie/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all active:scale-[0.98]"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={CATEGORY_IMAGES[c.slug] ?? ""}
                        alt={c.name}
                        loading="lazy"
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1 px-3 py-2.5">
                      <span className="font-display text-sm font-bold text-foreground line-clamp-1">{c.name}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-accent" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-border px-6 pt-4">
              <Link
                to="/favorieten"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-3 text-base font-medium text-foreground"
              >
                <Heart className="h-5 w-5 text-accent" />
                <span className="flex-1">Mijn favorieten</span>
                {favCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground">
                    {favCount}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const SiteFooter = () => (
  <footer className="border-t border-border bg-secondary/50 mt-16">
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-1.5 font-display text-xl font-extrabold text-primary">
            <Leaf className="h-5 w-5 text-brand-leaf" /> Gardino
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Alles voor jouw tuin — eerlijk vergeleken. Wij helpen je de beste loungesets, BBQ's en tuingereedschap te vinden.
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">Categorieën</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li><Link to="/categorie/loungesets" className="hover:text-primary">Loungesets</Link></li>
            <li><Link to="/categorie/bbq" className="hover:text-primary">BBQ & Outdoor Cooking</Link></li>
            <li><Link to="/categorie/tuinstoelen" className="hover:text-primary">Tuinstoelen</Link></li>
            <li><Link to="/categorie/tuintegels" className="hover:text-primary">Tuintegels</Link></li>
            <li><Link to="/categorie/schuttingen" className="hover:text-primary">Schuttingen</Link></li>
            <li><Link to="/categorie/elektrisch-gereedschap" className="hover:text-primary">Elektrisch Gereedschap</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">Over Gardino</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Gardino bevat affiliate-links. Als je via ons koopt, krijgen wij mogelijk een kleine vergoeding — zonder extra kosten voor jou.
          </p>
        </div>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} Gardino. Alle rechten voorbehouden.</p>
    </div>
  </footer>
);
