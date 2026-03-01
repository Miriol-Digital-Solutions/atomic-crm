-- Fix security_invoker setting for contacts_summary view
-- This ensures the view executes with the permissions of the calling user,
-- not the view creator (more secure)

drop view if exists "public"."contacts_summary";

create view "public"."contacts_summary"
    with (security_invoker=on)
as
select
    co.*,
    c.name as company_name,
    count(distinct t.id) as nb_tasks
from
    "public"."contacts" co
left join
    "public"."tasks" t on co.id = t.contact_id
left join
    "public"."companies" c on co.company_id = c.id
group by
    co.id, c.name;
