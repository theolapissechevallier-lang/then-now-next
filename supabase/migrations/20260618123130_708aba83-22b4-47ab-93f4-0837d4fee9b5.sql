REVOKE EXECUTE ON FUNCTION public.claim_referral(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.referral_code_exists(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.referral_code_exists(text) TO authenticated;