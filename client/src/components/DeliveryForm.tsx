import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import type { Location, InsertDelivery } from "@shared/schema";

export default function DeliveryForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<InsertDelivery>({
    name: "",
    location: "",
    timeWindow: { start: 9, end: 17 },
    priority: "Normal",
    load: 0,
    profit: 0
  });

  // Fetch locations for the dropdown
  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async (delivery: InsertDelivery) => {
      const response = await apiRequest("POST", "/api/deliveries", delivery);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Delivery Added",
        description: "New delivery point has been added successfully.",
      });
      setOpen(false);
      setFormData({
        name: "",
        location: "",
        timeWindow: { start: 9, end: 17 },
        priority: "Normal",
        load: 0,
        profit: 0
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add delivery. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || formData.load <= 0 || formData.profit <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    if (formData.timeWindow.start >= formData.timeWindow.end) {
      toast({
        title: "Invalid Time Window",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    createDeliveryMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-secondary hover:bg-secondary/90">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Delivery</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.filter(loc => loc.type === 'delivery' || loc.type === 'hub').map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="number"
                min="0"
                max="23"
                value={formData.timeWindow.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  timeWindow: { ...prev.timeWindow, start: Number(e.target.value) }
                }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="number"
                min="0"
                max="23"
                value={formData.timeWindow.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  timeWindow: { ...prev.timeWindow, end: Number(e.target.value) }
                }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="load">Load (kg)</Label>
              <Input
                id="load"
                type="number"
                min="0"
                value={formData.load}
                onChange={(e) => setFormData(prev => ({ ...prev, load: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="profit">Profit ($)</Label>
              <Input
                id="profit"
                type="number"
                min="0"
                value={formData.profit}
                onChange={(e) => setFormData(prev => ({ ...prev, profit: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createDeliveryMutation.isPending}
              className="bg-secondary hover:bg-secondary/90"
            >
              {createDeliveryMutation.isPending ? "Adding..." : "Add Delivery"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
