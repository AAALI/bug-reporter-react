-- ============================================================
-- Vault helper functions for reading/writing encrypted secrets
-- ============================================================

-- Enable the vault extension (if not already enabled via dashboard)
-- CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- Helper: create a secret and return its ID
CREATE OR REPLACE FUNCTION public.create_secret(secret_value TEXT, secret_name TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO vault.secrets (secret, name)
  VALUES (secret_value, secret_name)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Helper: read a decrypted secret by ID
CREATE OR REPLACE FUNCTION public.read_secret(secret_id UUID)
RETURNS TABLE(decrypted_secret TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
BEGIN
  RETURN QUERY
  SELECT ds.decrypted_secret
  FROM vault.decrypted_secrets ds
  WHERE ds.id = secret_id;
END;
$$;

-- Helper: update an existing secret
CREATE OR REPLACE FUNCTION public.update_secret(secret_id UUID, new_value TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
BEGIN
  UPDATE vault.secrets
  SET secret = new_value, updated_at = now()
  WHERE id = secret_id;
END;
$$;

-- Helper: delete a secret
CREATE OR REPLACE FUNCTION public.delete_secret(secret_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
BEGIN
  DELETE FROM vault.secrets WHERE id = secret_id;
END;
$$;
