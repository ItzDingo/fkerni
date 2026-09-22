-- =======================================================================
-- FKERNI - TABLE DES CITATIONS ET PHRASES DRÔLES (funny_quotes)
-- =======================================================================
-- Exécute ce script dans ton tableau de bord Supabase :
-- SQL Editor -> Nouveau Script -> Run
-- =======================================================================

CREATE TABLE IF NOT EXISTS public.funny_quotes (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    emoji TEXT DEFAULT '🔥',
    is_active BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE, -- Si mis à TRUE, cette phrase s'affichera À CHAQUE FOIS à l'ouverture !
    priority INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de la sécurité RLS
ALTER TABLE public.funny_quotes ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture publique (anon)
DROP POLICY IF EXISTS "Allow public read funny_quotes" ON public.funny_quotes;
CREATE POLICY "Allow public read funny_quotes" 
ON public.funny_quotes FOR SELECT USING (true);

-- Autoriser l'écriture publique (anon)
DROP POLICY IF EXISTS "Allow public insert funny_quotes" ON public.funny_quotes;
CREATE POLICY "Allow public insert funny_quotes" 
ON public.funny_quotes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update funny_quotes" ON public.funny_quotes;
CREATE POLICY "Allow public update funny_quotes" 
ON public.funny_quotes FOR UPDATE USING (true);

-- Activer les notifications Realtime pour funny_quotes
ALTER PUBLICATION supabase_realtime ADD TABLE public.funny_quotes;

-- Insérer tes phrases drôles par défaut :
INSERT INTO public.funny_quotes (text, emoji, is_active, is_pinned) VALUES
('m3ndkch etude taw ? myselch 9oum we a9ra chwaya fel dar', '⏰', true, false),
('Sa7tek aham men ay 7aja o5ra dima tfaker okk ?', '💗', true, false),
('El 9raya 3morha makent b7r9an l3sab mrigl ?', '📔', true, false),
('w9t t7es ro7k t3ebt a3ml pause s8yra makench rani chn5othk', '😠', true, false),
('Aya el 7amdelah 3lik ki tfakert w7dek w 7allit', '🎉', true, false),
('Chouf chkoun jeeeeee hani seket ena wakahw', '🥱', true, false),
('9otli mela 5ayfa mel bac ? hhhhh ena n2kdlk eli houwa el 3ks', '😁', true, false),
('Jme3t el Bac sience wouuh wouuuh ', '😩', true, false),
('Temchich tnsa el w9t ranii walllllh', '🔪', true, false),
('N7ebk tbiba 3ad maw ? allh 8aleb n7eb ndewi blech', '😛', true, false),
('Taw enti tkrahni 9adech men 1 l 10 ?', '🙂', true, false),
('Chah Chah toul 3lina akther 3ad Netw7ch rani', '🥺', true, false),
('mar7be beli takrahni', '🙋‍♂️', true, false)
ON CONFLICT DO NOTHING;
