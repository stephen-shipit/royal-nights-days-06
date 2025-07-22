-- Add CRUD policies for admin users on all tables

-- Menu Items CRUD policies for admins
CREATE POLICY "Admins can insert menu items" 
ON public.menu_items 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update menu items" 
ON public.menu_items 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete menu items" 
ON public.menu_items 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Events CRUD policies for admins
CREATE POLICY "Admins can insert events" 
ON public.events 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update events" 
ON public.events 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete events" 
ON public.events 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Gallery Items CRUD policies for admins
CREATE POLICY "Admins can insert gallery items" 
ON public.gallery_items 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update gallery items" 
ON public.gallery_items 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete gallery items" 
ON public.gallery_items 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Venue Tables CRUD policies for admins
CREATE POLICY "Admins can insert venue tables" 
ON public.venue_tables 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update venue tables" 
ON public.venue_tables 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete venue tables" 
ON public.venue_tables 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Table Reservations CRUD policies for admins
CREATE POLICY "Admins can update table reservations" 
ON public.table_reservations 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete table reservations" 
ON public.table_reservations 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));