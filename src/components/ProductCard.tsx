import { Link } from "react-router-dom";
import { Award, ArrowUpRight, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useTileM2, calcTilePrice, formatEuro } from "@/hooks/useTileM2";

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  usp: string | null;
  image_url: string;
  affiliate_url: string;
  price_label: string | null;
  rating: number | null;
  is_best_choice: boolean;
  retailer: string | null;
  tile_size_m2?: number | null;
  price_per_unit?: number | null;
}

export const ProductCard = ({ product }: { product: ProductCardData }) => {
  const internalHref = `/product/${product.slug}`;
  const { has, toggle } = useFavorites();
  const fav = has(product.slug);
  const { m2, joint, waste } = useTileM2();
  const tile = calcTilePrice(product.price_per_unit, product.tile_size_m2, m2, { jointMm: joint, wastePct: waste });

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all hover:shadow-card">
      <Link to={internalHref} className="relative block aspect-square overflow-hidden bg-muted">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.is_best_choice && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            <Award className="h-2.5 w-2.5" /> Beste keuze
          </span>
        )}
        <button
          type="button"
          aria-label={fav ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.slug); }}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft backdrop-blur-sm transition-colors hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-accent text-accent" : ""}`} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.retailer && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{product.retailer}</p>
        )}
        <Link
          to={internalHref}
          className="font-display text-sm font-semibold leading-tight text-foreground transition-colors hover:text-primary line-clamp-2 sm:text-base"
        >
          {product.title}
        </Link>
        {product.usp && (
          <p className="text-xs text-muted-foreground line-clamp-1">{product.usp}</p>
        )}

        {tile ? (
          <div className="mt-1 rounded-md bg-primary/5 px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Voor {m2} m²</p>
            <p className="font-display text-base font-extrabold text-primary leading-tight">{formatEuro(tile.total)}</p>
            <p className="text-[10px] text-muted-foreground">{tile.tilesNeeded} tegels · {formatEuro(product.price_per_unit!)}/stuk</p>
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between pt-2">
          {!tile && product.price_label ? (
            <span className="font-display text-lg font-extrabold text-primary leading-none">{product.price_label}</span>
          ) : <span />}
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Bekijk <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
};
