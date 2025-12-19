-- Migration: Add select_offer database function
-- Story: 10-2 Select Provider Offer
-- AC: 10.2.4, 10.2.5, 10.2.6 - Atomic offer selection transaction

-- Create the select_offer function for atomic offer selection
-- This function is called by the selectOffer server action to:
-- 1. Accept the selected offer
-- 2. Cancel all other active offers on the same request
-- 3. Update the request with provider assignment and delivery window

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
BEGIN
  -- AC10.2.4: Verify offer exists, is active, AND belongs to the specified request
  -- Security: Validate offer-request relationship to prevent cross-request attacks
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

  -- Verify request is still pending
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

  -- AC10.2.4: Update selected offer to 'accepted' with accepted_at timestamp
  UPDATE offers
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = p_offer_id
    AND status = 'active';

  IF NOT FOUND THEN
    -- Race condition: offer was modified between check and update
    RETURN json_build_object(
      'success', false,
      'error', 'Error al aceptar la oferta. Por favor, intenta de nuevo.'
    );
  END IF;

  -- AC10.2.6: Cancel all other active offers on this request
  UPDATE offers
  SET status = 'request_filled'
  WHERE request_id = p_request_id
    AND id != p_offer_id
    AND status = 'active';

  GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;

  -- AC10.2.5: Update request with provider_id and delivery window
  UPDATE water_requests
  SET
    status = 'accepted',
    supplier_id = v_provider_id,
    delivery_window_start = v_delivery_start,
    delivery_window_end = v_delivery_end,
    accepted_at = NOW()
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    -- Race condition: request was modified between check and update
    -- Rollback the offer changes
    UPDATE offers SET status = 'active', accepted_at = NULL WHERE id = p_offer_id;
    UPDATE offers SET status = 'active' WHERE request_id = p_request_id AND status = 'request_filled';

    RETURN json_build_object(
      'success', false,
      'error', 'Error al actualizar la solicitud. Por favor, intenta de nuevo.'
    );
  END IF;

  -- Success
  RETURN json_build_object(
    'success', true,
    'provider_id', v_provider_id,
    'cancelled_offers', v_cancelled_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
-- (actual authorization is handled by the function checking request ownership)
GRANT EXECUTE ON FUNCTION select_offer(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION select_offer(UUID, UUID) TO service_role;

COMMENT ON FUNCTION select_offer IS 'Atomically selects a provider offer for a water request. Updates offer status, cancels other offers, and assigns provider to request.';
