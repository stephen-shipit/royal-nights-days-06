const AdminFooter = () => {
  return (
    <footer className="bg-white border-t border-border mt-8">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 Royal Palace Restaurant & Lounge - Admin Panel
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;