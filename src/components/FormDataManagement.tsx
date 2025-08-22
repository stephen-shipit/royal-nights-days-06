import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, FileText, Filter, Download } from "lucide-react";

interface FormSubmission {
  id: string;
  form_type: string;
  form_data: Record<string, any>;
  email: string;
  full_name: string;
  submission_date: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const FormDataManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState<'new' | 'reviewed' | 'contacted' | 'archived'>('new');

  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ["form-submissions", statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("form_data")
        .select("*")
        .order("submission_date", { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('form_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FormSubmission[];
    },
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<FormSubmission> }) => {
      const { data, error } = await supabase
        .from("form_data")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Submission updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["form-submissions"] });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating submission", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteSubmissionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("form_data").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Submission deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["form-submissions"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting submission", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleView = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setIsViewModalOpen(true);
  };

  const handleEdit = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setEditingNotes(submission.admin_notes || '');
    setEditingStatus(submission.status);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      deleteSubmissionMutation.mutate(id);
    }
  };

  const handleSaveEdit = () => {
    if (!selectedSubmission) return;
    
    updateSubmissionMutation.mutate({
      id: selectedSubmission.id,
      updates: {
        admin_notes: editingNotes,
        status: editingStatus
      }
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'reviewed': return 'secondary';
      case 'contacted': return 'default';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getFormTypeDisplayName = (type: string) => {
    switch (type) {
      case 'royal_mic_registration':
        return 'Royal Mic Registration';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatFormData = (data: Record<string, any>) => {
    return Object.entries(data).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      if (typeof value === 'boolean') {
        return { label, value: value ? 'Yes' : 'No' };
      }
      return { label, value: value || 'Not provided' };
    });
  };

  const exportToCSV = () => {
    if (!submissions || submissions.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const csvHeaders = ['Date', 'Form Type', 'Name', 'Email', 'Status', 'Admin Notes'];
    const csvRows = submissions.map(sub => [
      new Date(sub.submission_date).toLocaleDateString(),
      getFormTypeDisplayName(sub.form_type),
      sub.full_name,
      sub.email,
      sub.status,
      sub.admin_notes || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <div>Loading form submissions...</div>;

  const uniqueFormTypes = Array.from(new Set(submissions?.map(s => s.form_type) || []));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Form Data Management</h2>
          <p className="text-muted-foreground">
            Manage all form submissions from landing pages and contact forms
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Submissions</p>
                <p className="text-2xl font-bold">{submissions?.filter(s => s.status === 'new').length || 0}</p>
              </div>
              <Badge variant="destructive" className="h-8 w-8 p-0 flex items-center justify-center">!</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contacted</p>
                <p className="text-2xl font-bold">{submissions?.filter(s => s.status === 'contacted').length || 0}</p>
              </div>
              <Badge variant="default" className="h-8 w-8 p-0 flex items-center justify-center">✓</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold">{submissions?.filter(s => s.status === 'archived').length || 0}</p>
              </div>
              <Badge variant="outline" className="h-8 w-8 p-0 flex items-center justify-center">📁</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Form Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Form Types</SelectItem>
                  {uniqueFormTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getFormTypeDisplayName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Form Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    {new Date(submission.submission_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getFormTypeDisplayName(submission.form_type)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.full_name}
                  </TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(submission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(submission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(submission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No form submissions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && `Submitted on ${new Date(selectedSubmission.submission_date).toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Form Type</Label>
                  <p>{getFormTypeDisplayName(selectedSubmission.form_type)}</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Submission Data</Label>
                <div className="mt-2 space-y-2">
                  {formatFormData(selectedSubmission.form_data).map(({ label, value }, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{label}:</span>
                      <span className="text-muted-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedSubmission.admin_notes && (
                <div>
                  <Label className="font-medium">Admin Notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedSubmission.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>
              Update the status and add admin notes for this submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={editingStatus} onValueChange={(value: any) => setEditingStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Add notes about this submission..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormDataManagement;