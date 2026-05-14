-- Shareable links for souls (legacies)
CREATE TABLE public.legacy_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id uuid NOT NULL REFERENCES public.legacies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  label text,
  expires_at timestamptz,
  revoked_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_shares_legacy_id ON public.legacy_shares(legacy_id);
CREATE INDEX idx_legacy_shares_token ON public.legacy_shares(token);

ALTER TABLE public.legacy_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners can read shares"
  ON public.legacy_shares FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owners can insert shares"
  ON public.legacy_shares FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners can update shares"
  ON public.legacy_shares FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owners can delete shares"
  ON public.legacy_shares FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_legacy_shares_updated_at
  BEFORE UPDATE ON public.legacy_shares
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();