
-- Claim a referral code: rewards inviter and invitee, prevents self-referral and duplicates.
CREATE OR REPLACE FUNCTION public.claim_referral(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_referrer uuid;
  v_already uuid;
  v_inviter_reward_coins int := 50;
  v_inviter_reward_xp int := 30;
  v_new_user_reward_coins int := 25;
  v_new_user_reward_xp int := 15;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;

  SELECT id INTO v_referrer FROM public.profiles
  WHERE referral_code = upper(trim(p_code))
  LIMIT 1;

  IF v_referrer IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'code_not_found');
  END IF;
  IF v_referrer = v_user THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self_referral');
  END IF;

  -- Already redeemed any referral?
  SELECT referred_by INTO v_already FROM public.profiles WHERE id = v_user;
  IF v_already IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_redeemed');
  END IF;

  -- Insert referral row (unique on referrer+referred prevents dupes).
  INSERT INTO public.referrals (code, referrer_id, referred_id, rewarded)
  VALUES (upper(trim(p_code)), v_referrer, v_user, true)
  ON CONFLICT (referrer_id, referred_id) DO NOTHING;

  -- Mark invitee profile & reward.
  UPDATE public.profiles
  SET referred_by = v_referrer,
      coins = COALESCE(coins, 0) + v_new_user_reward_coins,
      xp = COALESCE(xp, 0) + v_new_user_reward_xp
  WHERE id = v_user;

  -- Reward inviter.
  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + v_inviter_reward_coins,
      xp = COALESCE(xp, 0) + v_inviter_reward_xp
  WHERE id = v_referrer;

  RETURN jsonb_build_object(
    'ok', true,
    'inviter_coins', v_inviter_reward_coins,
    'inviter_xp', v_inviter_reward_xp,
    'new_user_coins', v_new_user_reward_coins,
    'new_user_xp', v_new_user_reward_xp
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_referral(text) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;

-- Lightweight code-existence check (no profile data leaked).
CREATE OR REPLACE FUNCTION public.referral_code_exists(p_code text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE referral_code = upper(trim(p_code))
  );
$$;

REVOKE ALL ON FUNCTION public.referral_code_exists(text) FROM public;
GRANT EXECUTE ON FUNCTION public.referral_code_exists(text) TO anon, authenticated;
