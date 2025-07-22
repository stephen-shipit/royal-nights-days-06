-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-uploads', 'admin-uploads', true);

-- Create storage policies for admin uploads
CREATE POLICY "Admins can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'admin-uploads' AND 
  is_admin(auth.uid())
);

CREATE POLICY "Admins can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'admin-uploads' AND 
  is_admin(auth.uid())
);

CREATE POLICY "Admins can update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'admin-uploads' AND 
  is_admin(auth.uid())
);

CREATE POLICY "Admins can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'admin-uploads' AND 
  is_admin(auth.uid())
);

-- Allow public access to view uploaded images
CREATE POLICY "Public can view admin uploaded images" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-uploads');