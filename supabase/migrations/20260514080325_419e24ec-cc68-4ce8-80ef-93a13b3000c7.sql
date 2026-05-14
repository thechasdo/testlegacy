
revoke execute on function public.has_active_subscription(uuid, text) from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
