import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import heroGarden from "@/assets/hero-garden.jpg";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

const Index = () => {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id,slug,name,description").order("sort_order")
      .then(({ data }) => data && setCategories(data as Category[]));
    supabase.from("products")
      .select("id,slug,title,short_description,usp,image_url,affiliate_url,price_label,rating,is_best_choice,retailer")
      .order("is_best_choice", { ascending: false })
      .order("sort_order")
      .limit(12)
      .then(({ data }) => data && setProducts(data as ProductCardData[]));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Gardino — Alles voor jouw tuin, eerlijk vergeleken"
        description="Vergelijk loungesets, BBQ's, tuinstoelen, tegels, schuttingen en elektrisch gereedschap. Eerlijke selectie en directe links naar de beste shops."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Gardino",
          url: typeof window !== "undefined" ? window.location.origin : "https://gardino.nl",
        }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroGarden}
          alt="Zonnige tuin met moderne loungeset, olijfboom en frisse beplanting"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-primary/10" />
        <div className="relative">
          <div className="container flex min-h-[420px] flex-col justify-end pb-8 pt-32 sm:min-h-[480px] md:min-h-[560px] md:pb-12">
            <div className="max-w-xl text-primary-foreground animate-fade-up">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                <Leaf className="h-3 w-3" /> Maak het buiten af
              </span>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] drop-shadow-md sm:text-5xl md:text-6xl">
                Alles voor jouw tuin.
              </h1>
              <p className="mt-3 max-w-md text-base text-primary-foreground/90 drop-shadow sm:text-lg">
                Loungesets, BBQ's, tegels, schuttingen en gereedschap — eerlijk vergeleken en met één klik bij de beste shop.
              </p>
              <div className="mt-5 flex flex-row flex-wrap gap-2">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-cta">
                  <Link to="/categorie/loungesets">Shop loungesets <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/70 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/categorie/bbq">Bekijk BBQ's</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — horizontale scroll-snap met echte beelden */}
      <section className="py-8 md:py-12">
        <div className="container mb-4">
          <h2 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">Shop per categorie</h2>
          <p className="text-sm text-muted-foreground">Swipe door onze collecties — van loungeset tot heggenschaar.</p>
        </div>
        <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pl-6 pr-6 scroll-pl-6 md:pl-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] md:pr-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] md:scroll-pl-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/categorie/${c.slug}`}
              className="group flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5 sm:w-52 md:w-60"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={CATEGORY_IMAGES[c.slug] ?? heroGarden}
                  alt={c.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-3">
                <h3 className="font-display text-sm font-bold text-foreground sm:text-base line-clamp-1">{c.name}</h3>
                <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container pb-16">
        <div className="mb-5">
          <h2 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">Onze favorieten</h2>
          <p className="text-sm text-muted-foreground">Onze redactie selecteerde de beste deals van dit moment.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
