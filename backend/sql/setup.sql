-- ============================================================
-- InvoEasy Database Setup
-- ============================================================

-- 1. Create the invoices table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL,
    product_name  TEXT NOT NULL,
    price         NUMERIC(15, 2) NOT NULL,
    vat_rate      NUMERIC(5, 2) NOT NULL,
    buyer_name    TEXT NOT NULL,
    buyer_tax_code TEXT NOT NULL,
    total         NUMERIC(15, 2) NOT NULL,
    invoice_number TEXT UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — users can only access their own invoices
-- ============================================================

-- Policy: Users can SELECT their own invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
    ON public.invoices
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can INSERT invoices for themselves
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
CREATE POLICY "Users can insert own invoices"
    ON public.invoices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own invoices
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
CREATE POLICY "Users can update own invoices"
    ON public.invoices
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own invoices
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
CREATE POLICY "Users can delete own invoices"
    ON public.invoices
    FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Trigger function: auto-set user_id to auth.uid() on INSERT
--    Only sets user_id when it is NULL (so backend can pass explicit user_id)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_invoice_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger: before INSERT, set user_id automatically
-- ============================================================
DROP TRIGGER IF EXISTS before_insert_invoice ON public.invoices;
CREATE TRIGGER before_insert_invoice
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.set_invoice_user_id();

-- 6. Trigger function: auto-generate sequential invoice number
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices;

    NEW.invoice_number := 'INV-' || LPAD(next_number::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger: before INSERT, generate invoice number automatically
-- ============================================================
DROP TRIGGER IF EXISTS before_insert_invoice_number ON public.invoices;
CREATE TRIGGER before_insert_invoice_number
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION public.generate_invoice_number();