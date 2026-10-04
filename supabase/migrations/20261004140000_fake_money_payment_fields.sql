alter table public.donations
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists idempotency_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'donations_payment_provider_check'
      and conrelid = 'public.donations'::regclass
  ) then
    alter table public.donations
      add constraint donations_payment_provider_check
      check (payment_provider is null or payment_provider in ('fake_money', 'stripe'));
  end if;
end
$$;

create unique index if not exists donations_provider_reference_uidx
  on public.donations (payment_provider, payment_reference)
  where payment_reference is not null;

create unique index if not exists donations_idempotency_key_uidx
  on public.donations (idempotency_key)
  where idempotency_key is not null;