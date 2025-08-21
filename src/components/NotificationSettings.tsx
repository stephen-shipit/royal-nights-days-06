import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationEmail {
  id: string;
  email: string;
  notification_type: string;
  is_active: boolean;
  created_at: string;
}

const NotificationSettings = () => {
  const [newEmail, setNewEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notification settings
  const { data: notificationEmails, isLoading } = useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("notification_type", "reservation_confirmed")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as NotificationEmail[];
    },
  });

  // Add new email mutation
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from("notification_settings")
        .insert([
          {
            email: email.toLowerCase().trim(),
            notification_type: "reservation_confirmed",
            is_active: true,
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      setNewEmail("");
      toast({
        title: "Email Added",
        description: "The email address has been added to the notification list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message.includes("duplicate") 
          ? "This email address is already in the notification list."
          : "Failed to add email address. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove email mutation
  const removeEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase
        .from("notification_settings")
        .delete()
        .eq("id", emailId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      toast({
        title: "Email Removed",
        description: "The email address has been removed from notifications.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove email address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    addEmailMutation.mutate(newEmail);
  };

  const handleRemoveEmail = (emailId: string) => {
    removeEmailMutation.mutate(emailId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notification Settings
          </CardTitle>
          <CardDescription>
            Manage email addresses that will receive notifications when new reservations are confirmed.
            Admin emails will receive detailed reservation information for management purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Email Form */}
          <form onSubmit={handleAddEmail} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="email">Add Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={addEmailMutation.isPending || !newEmail.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Email
              </Button>
            </div>
          </form>

          {/* Email List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Current Notification Emails ({notificationEmails?.length || 0})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading notification settings...
              </div>
            ) : notificationEmails?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notification emails configured</p>
                <p className="text-sm">Add an email address above to start receiving notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificationEmails?.map((emailSetting) => (
                  <div
                    key={emailSetting.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{emailSetting.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(emailSetting.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEmail(emailSetting.id)}
                      disabled={removeEmailMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Currently, notifications are sent for the following events:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Reservation Confirmed</p>
                <p className="text-sm text-muted-foreground">
                  Sent when a guest completes payment and confirms their reservation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;