-- Add company type and client type fields for MiriolMarketing customization
-- Created: 2025-11-16

-- Add type field to companies table
alter table "public"."companies" add column "type" text;

-- Add client_type field to companies table (only applicable when type='Client')
alter table "public"."companies" add column "client_type" text;

-- Add comments for documentation
comment on column "public"."companies"."type" is 'Company type: Client, Partner, Supplier, or Business Division';
comment on column "public"."companies"."client_type" is 'Client type (only when type=Client): Agency, Advertiser, or Publisher';

-- Recreate the companies_summary view to include new fields
drop view if exists "public"."companies_summary";

create view "public"."companies_summary"
    with (security_invoker=on)
    as
select
    c.*,
    count(distinct d.id) as nb_deals,
    count(distinct co.id) as nb_contacts
from
    "public"."companies" c
left join
    "public"."deals" d on c.id = d.company_id
left join
    "public"."contacts" co on c.id = co.company_id
group by
    c.id;
