ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tile_size_m2 numeric,
  ADD COLUMN IF NOT EXISTS price_per_unit numeric;