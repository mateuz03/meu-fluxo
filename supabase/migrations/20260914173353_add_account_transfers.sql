-- Cria ou substitui os dois lados de uma transferência entre contas do mesmo usuário.
-- SECURITY INVOKER mantém as políticas RLS e os privilégios do chamador ativos.
create or replace function public.save_account_transfer(
  p_transfer_group_id uuid,
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount_cents bigint,
  p_occurred_on date,
  p_description text,
  p_notes text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_transfer_group_id uuid := coalesce(p_transfer_group_id, gen_random_uuid());
  v_owned_accounts integer;
  v_existing_rows integer;
  v_description text := coalesce(nullif(btrim(p_description), ''), 'Transferência entre contas');
begin
  if v_user_id is null then
    raise exception 'Sessão inválida.' using errcode = '42501';
  end if;

  if p_from_account_id is null or p_to_account_id is null then
    raise exception 'Informe as contas de origem e destino.' using errcode = '22023';
  end if;

  if p_from_account_id = p_to_account_id then
    raise exception 'As contas de origem e destino devem ser diferentes.' using errcode = '22023';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'O valor da transferência deve ser maior que zero.' using errcode = '22023';
  end if;

  if p_occurred_on is null then
    raise exception 'Informe a data da transferência.' using errcode = '22023';
  end if;

  select count(*)
    into v_owned_accounts
    from public.accounts
   where id in (p_from_account_id, p_to_account_id)
     and user_id = v_user_id;

  if v_owned_accounts <> 2 then
    raise exception 'Conta não encontrada ou sem permissão.' using errcode = '42501';
  end if;

  if p_transfer_group_id is not null then
    perform id
      from public.transactions
     where transfer_group_id = p_transfer_group_id
       and user_id = v_user_id
       and type = 'transferencia'
     for update;

    get diagnostics v_existing_rows = row_count;

    if v_existing_rows <> 2 then
      raise exception 'Transferência não encontrada ou inconsistente.' using errcode = 'P0002';
    end if;

    delete from public.transactions
     where transfer_group_id = p_transfer_group_id
       and user_id = v_user_id
       and type = 'transferencia';
  end if;

  insert into public.transactions (
    user_id,
    description,
    type,
    amount_cents,
    occurred_on,
    status,
    account_id,
    transfer_group_id,
    notes
  )
  values
    (
      v_user_id,
      v_description,
      'transferencia',
      -p_amount_cents,
      p_occurred_on,
      'pago',
      p_from_account_id,
      v_transfer_group_id,
      nullif(btrim(p_notes), '')
    ),
    (
      v_user_id,
      v_description,
      'transferencia',
      p_amount_cents,
      p_occurred_on,
      'pago',
      p_to_account_id,
      v_transfer_group_id,
      nullif(btrim(p_notes), '')
    );

  return v_transfer_group_id;
end;
$$;

-- Cancela os dois lados juntos para preservar o histórico e os saldos.
create or replace function public.cancel_account_transfer(p_transfer_group_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_existing_rows integer;
begin
  if v_user_id is null then
    raise exception 'Sessão inválida.' using errcode = '42501';
  end if;

  perform id
    from public.transactions
   where transfer_group_id = p_transfer_group_id
     and user_id = v_user_id
     and type = 'transferencia'
   for update;

  get diagnostics v_existing_rows = row_count;

  if v_existing_rows <> 2 then
    raise exception 'Transferência não encontrada ou inconsistente.' using errcode = 'P0002';
  end if;

  update public.transactions
     set status = 'cancelado'
   where transfer_group_id = p_transfer_group_id
     and user_id = v_user_id
     and type = 'transferencia';
end;
$$;

revoke all on function public.save_account_transfer(uuid, uuid, uuid, bigint, date, text, text)
  from public, anon;
revoke all on function public.cancel_account_transfer(uuid)
  from public, anon;

grant execute on function public.save_account_transfer(uuid, uuid, uuid, bigint, date, text, text)
  to authenticated;
grant execute on function public.cancel_account_transfer(uuid)
  to authenticated;
