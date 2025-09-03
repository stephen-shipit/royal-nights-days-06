-- Grant table-level permissions to anon role for table reservations
GRANT INSERT ON public.table_reservations TO anon;
GRANT SELECT ON public.table_reservations TO anon;

-- Also grant to authenticated role for consistency
GRANT INSERT ON public.table_reservations TO authenticated;
GRANT SELECT ON public.table_reservations TO authenticated;