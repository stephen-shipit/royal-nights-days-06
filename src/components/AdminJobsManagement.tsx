import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Download, ExternalLink, Briefcase, FileText } from "lucide-react";
import { format } from "date-fns";

type EmploymentType = "full-time" | "part-time" | "gig" | "contractor";
type JobStatus = "active" | "archived";
type ApplicationStatus = "new" | "reviewing" | "interview" | "rejected" | "hired";

interface Job {
  id: string;
  title: string;
  short_description: string;
  full_description: string;
  requirements: string;
  employment_type: EmploymentType;
  compensation: string | null;
  location: string;
  status: JobStatus;
  created_at: string;
}

interface JobApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  city_state: string;
  resume_url: string | null;
  cover_letter_url: string | null;
  experience_summary: string;
  availability: string;
  late_night_ok: boolean;
  start_date: string;
  status: ApplicationStatus;
  created_at: string;
  jobs?: Job;
}

const AdminJobsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [filterJobId, setFilterJobId] = useState<string>("all");

  // Form state for jobs
  const [jobForm, setJobForm] = useState({
    title: "",
    short_description: "",
    full_description: "",
    requirements: "",
    employment_type: "full-time" as EmploymentType,
    compensation: "",
    location: "Addison, TX",
    status: "active" as JobStatus,
  });

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
  });

  // Fetch applications
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*, jobs(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobApplication[];
    },
  });

  // Create/Update job mutation
  const jobMutation = useMutation({
    mutationFn: async (data: typeof jobForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("jobs")
          .update({
            title: data.title,
            short_description: data.short_description,
            full_description: data.full_description,
            requirements: data.requirements,
            employment_type: data.employment_type,
            compensation: data.compensation || null,
            location: data.location,
            status: data.status,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("jobs").insert({
          title: data.title,
          short_description: data.short_description,
          full_description: data.full_description,
          requirements: data.requirements,
          employment_type: data.employment_type,
          compensation: data.compensation || null,
          location: data.location,
          status: data.status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      setJobDialogOpen(false);
      resetJobForm();
      toast({
        title: editingJob ? "Job Updated" : "Job Created",
        description: editingJob ? "The job has been updated successfully." : "The job has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Deleted",
        description: "The job has been deleted successfully.",
      });
    },
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({
        title: "Status Updated",
        description: "Application status has been updated.",
      });
    },
  });

  const resetJobForm = () => {
    setJobForm({
      title: "",
      short_description: "",
      full_description: "",
      requirements: "",
      employment_type: "full-time",
      compensation: "",
      location: "Addison, TX",
      status: "active",
    });
    setEditingJob(null);
  };

  const openEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      short_description: job.short_description,
      full_description: job.full_description,
      requirements: job.requirements,
      employment_type: job.employment_type,
      compensation: job.compensation || "",
      location: job.location,
      status: job.status,
    });
    setJobDialogOpen(true);
  };

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    jobMutation.mutate(editingJob ? { ...jobForm, id: editingJob.id } : jobForm);
  };

  const filteredApplications = applications?.filter(
    (app) => filterJobId === "all" || app.job_id === filterJobId
  );

  const exportToCSV = () => {
    if (!filteredApplications) return;

    const headers = [
      "Name",
      "Email",
      "Phone",
      "City/State",
      "Position",
      "Status",
      "Availability",
      "Late Night OK",
      "Start Date",
      "Applied On",
    ];

    const rows = filteredApplications.map((app) => [
      app.full_name,
      app.email,
      app.phone,
      app.city_state,
      app.jobs?.title || "Unknown",
      app.status,
      app.availability,
      app.late_night_ok ? "Yes" : "No",
      app.start_date,
      format(new Date(app.created_at), "yyyy-MM-dd"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    const variants: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      reviewing: "secondary",
      interview: "outline",
      rejected: "destructive",
      hired: "default",
    };
    return variants[status];
  };

  const formatEmploymentType = (type: EmploymentType) => {
    const types: Record<EmploymentType, string> = {
      "full-time": "Full-Time",
      "part-time": "Part-Time",
      "gig": "Gig",
      "contractor": "Contractor",
    };
    return types[type];
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
              {applications && applications.filter((a) => a.status === "new").length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {applications.filter((a) => a.status === "new").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === "jobs" && (
            <Dialog open={jobDialogOpen} onOpenChange={(open) => {
              setJobDialogOpen(open);
              if (!open) resetJobForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingJob ? "Edit Job" : "Create New Job"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJobSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short Description *</Label>
                    <Textarea
                      id="short_description"
                      value={jobForm.short_description}
                      onChange={(e) => setJobForm({ ...jobForm, short_description: e.target.value })}
                      required
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="full_description">Full Description *</Label>
                    <Textarea
                      id="full_description"
                      value={jobForm.full_description}
                      onChange={(e) => setJobForm({ ...jobForm, full_description: e.target.value })}
                      required
                      rows={5}
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements *</Label>
                    <Textarea
                      id="requirements"
                      value={jobForm.requirements}
                      onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                      required
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employment_type">Employment Type *</Label>
                      <Select
                        value={jobForm.employment_type}
                        onValueChange={(value: EmploymentType) => setJobForm({ ...jobForm, employment_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-Time</SelectItem>
                          <SelectItem value="part-time">Part-Time</SelectItem>
                          <SelectItem value="gig">Gig</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={jobForm.status}
                        onValueChange={(value: JobStatus) => setJobForm({ ...jobForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="compensation">Compensation Range</Label>
                      <Input
                        id="compensation"
                        value={jobForm.compensation}
                        onChange={(e) => setJobForm({ ...jobForm, compensation: e.target.value })}
                        placeholder="e.g., $15-20/hr"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setJobDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={jobMutation.isPending}>
                      {jobMutation.isPending ? "Saving..." : editingJob ? "Update Job" : "Create Job"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "applications" && (
            <div className="flex gap-4">
              <Select value={filterJobId} onValueChange={setFilterJobId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs?.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )}
        </div>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <p className="text-muted-foreground">Loading jobs...</p>
              ) : jobs && jobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{formatEmploymentType(job.employment_type)}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>
                          <Badge variant={job.status === "active" ? "default" : "secondary"}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(job.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditJob(job)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this job?")) {
                                  deleteJobMutation.mutate(job.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No jobs created yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <p className="text-muted-foreground">Loading applications...</p>
              ) : filteredApplications && filteredApplications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.full_name}</TableCell>
                        <TableCell>{app.jobs?.title || "Unknown"}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>
                          <Select
                            value={app.status}
                            onValueChange={(value: ApplicationStatus) =>
                              updateApplicationMutation.mutate({ id: app.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge variant={getStatusBadgeVariant(app.status)}>
                                {app.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedApplication(app);
                              setApplicationDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No applications received yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-foreground">{selectedApplication.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-foreground">{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-foreground">{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">City & State</p>
                  <p className="text-foreground">{selectedApplication.city_state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Position Applied</p>
                  <p className="text-foreground">{selectedApplication.jobs?.title || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Earliest Start Date</p>
                  <p className="text-foreground">{selectedApplication.start_date}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Availability</p>
                <p className="text-foreground">{selectedApplication.availability}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Late Night Shifts</p>
                <p className="text-foreground">{selectedApplication.late_night_ok ? "Yes" : "No"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Experience Summary</p>
                <p className="text-foreground whitespace-pre-wrap">{selectedApplication.experience_summary}</p>
              </div>

              <div className="flex gap-4">
                {selectedApplication.resume_url && (
                  <a href={selectedApplication.resume_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Resume
                    </Button>
                  </a>
                )}
                {selectedApplication.cover_letter_url && (
                  <a href={selectedApplication.cover_letter_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Cover Letter
                    </Button>
                  </a>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Update Status</p>
                <Select
                  value={selectedApplication.status}
                  onValueChange={(value: ApplicationStatus) => {
                    updateApplicationMutation.mutate({ id: selectedApplication.id, status: value });
                    setSelectedApplication({ ...selectedApplication, status: value });
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobsManagement;
