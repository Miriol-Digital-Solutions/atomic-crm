-- Fix security_invoker setting for init_state view
-- This view checks if the database has been initialized with data
-- Using security_invoker=on is more secure and allows RLS policies to apply

drop view if exists "public"."init_state";

create view "public"."init_state"
  with (security_invoker=on)
as
select count(id) as is_initialized
from (
  select id
  from public.sales
  limit 1
) as sub;
