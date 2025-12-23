-- Migration: Fix SECURITY DEFINER functions to set search_path
-- Story: 11-2 CHAIN-1 Production Testing (Code Review Fix)
-- Addresses: Supabase security advisor warning "function_search_path_mutable"
--
-- Problem: SECURITY DEFINER functions without search_path can be exploited
--          by creating objects in a user-controlled schema that shadows
--          the intended objects.
--
-- Solution: Set search_path = public for all SECURITY DEFINER functions.

-- Fix select_offer function
CREATE OR REPLACE FUNCTION select_offer(
  p_offer_id UUID,
  p_request_id UUID
) RETURNS JSON AS $$
DECLARE
  v_provider_id UUID;
  v_delivery_start TIMESTAMPTZ;
  v_delivery_end TIMESTAMPTZ;
  v_offer_status TEXT;
  v_request_status TEXT;
  v_cancelled_count INT;
  v_delivery_window TEXT;
BEGIN
  -- AC10.2.4: Verify offer exists, is active, AND belongs to the specified request
  SELECT provider_id, delivery_window_start, delivery_window_end, status
  INTO v_provider_id, v_delivery_start, v_delivery_end, v_offer_status
  FROM offers
  WHERE id = p_offer_id
    AND request_id = p_request_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Oferta no encontrada'
    );
  END IF;

  IF v_offer_status != 'active' THEN
    RETURN json_build_object(
      'success', false,
      'error', CASE
        WHEN v_offer_status = 'accepted' THEN 'Esta oferta ya fue aceptada'
        WHEN v_offer_status = 'expired' THEN 'Esta oferta ha expirado'
        ELSE 'Esta oferta ya no está disponible'
      END
    );
  END IF;

  SELECT status INTO v_request_status
  FROM water_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solicitud no encontrada'
    );
  END IF;

  IF v_request_status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Esta solicitud ya no está disponible para aceptar ofertas'
    );
  END IF;

  UPDATE offers
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = p_offer_id
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Error al aceptar la oferta. Por favor, intenta de nuevo.'
    );
  END IF;

  UPDATE offers
  SET status = 'request_filled'
  WHERE request_id = p_request_id
    AND id != p_offer_id
    AND status = 'active';

  GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;

  v_delivery_window := TO_CHAR(v_delivery_start AT TIME ZONE 'America/Santiago', 'HH24:MI') ||
                       ' - ' ||
                       TO_CHAR(v_delivery_end AT TIME ZONE 'America/Santiago', 'HH24:MI');

  UPDATE water_requests
  SET
    status = 'accepted',
    supplier_id = v_provider_id,
    delivery_window = v_delivery_window,
    accepted_at = NOW()
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    UPDATE offers SET status = 'active', accepted_at = NULL WHERE id = p_offer_id;
    UPDATE offers SET status = 'active' WHERE request_id = p_request_id AND status = 'request_filled';

    RETURN json_build_object(
      'success', false,
      'error', 'Error al actualizar la solicitud. Por favor, intenta de nuevo.'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'provider_id', v_provider_id,
    'cancelled_offers', v_cancelled_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION select_offer IS 'Atomically selects a provider offer. search_path fixed for security.';
COMMENT ON FUNCTION update_updated_at_column IS 'Trigger to auto-update updated_at. search_path fixed for security.';
