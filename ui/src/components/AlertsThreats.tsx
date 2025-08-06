import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, 
  Bell, 
  Mail, 
  MessageSquare, 
  Shield,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Settings,
  Users,
  Server,
  Monitor
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  entity: {
    id: string;
    name: string;
    type: "user" | "device" | "server";
  };
  timestamp: string;
  status: "new" | "acknowledged" | "investigating" | "resolved";
  riskScore: number;
  assignedTo?: string;
  evidence: string[];
  actions: string[];
}

interface NotificationRule {
  id: string;
  name: string;
  trigger: string;
  channels: string[];
  enabled: boolean;
  conditions: string[];
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    title: "Suspicious Login Activity",
    description: "Multiple failed login attempts from unusual location",
    severity: "critical",
    type: "Authentication",
    entity: { id: "USR-001", name: "John Doe", type: "user" },
    timestamp: "2 min ago",
    status: "new",
    riskScore: 47,
    evidence: ["5 failed attempts", "Login from new IP: 192.168.1.100", "Outside business hours"],
    actions: ["Block IP temporarily", "Send notification to security team", "Require 2FA verification"]
  },
  {
    id: "ALT-002",
    title: "Unauthorized File Access",
    description: "Access to confidential files outside normal pattern",
    severity: "high",
    type: "Data Access",
    entity: { id: "DEV-045", name: "Laptop-Finance-45", type: "device" },
    timestamp: "15 min ago",
    status: "acknowledged",
    riskScore: 43,
    assignedTo: "Security Team",
    evidence: ["Accessed 12 confidential files", "Downloads detected", "Outside user's department"],
    actions: ["Monitor file access", "Alert data owner", "Review permissions"]
  },
  {
    id: "ALT-003",
    title: "Privilege Escalation Attempt",
    description: "User attempting to gain administrative privileges",
    severity: "critical",
    type: "Authorization",
    entity: { id: "USR-023", name: "Sarah Admin", type: "user" },
    timestamp: "1 hour ago",
    status: "investigating",
    riskScore: 39,
    assignedTo: "Admin Team",
    evidence: ["Permission change request", "Elevated access attempt", "System admin commands"],
    actions: ["Block escalation", "Review user permissions", "Immediate investigation"]
  },
  {
    id: "ALT-004",
    title: "Database Connection Anomaly",
    description: "Unusual database connection patterns detected",
    severity: "medium",
    type: "System",
    entity: { id: "SRV-001", name: "Database-Server-01", type: "server" },
    timestamp: "2 hours ago",
    status: "resolved",
    riskScore: 32,
    assignedTo: "Database Team",
    evidence: ["Multiple connection attempts", "Query pattern analysis", "Performance impact"],
    actions: ["Connection monitoring", "Query optimization", "Security review"]
  }
];

const mockNotificationRules: NotificationRule[] = [
  {
    id: "NR-001",
    name: "Critical Alerts",
    trigger: "Severity = Critical",
    channels: ["email", "sms", "slack"],
    enabled: true,
    conditions: ["Risk score >= 40", "Status = New"]
  },
  {
    id: "NR-002",
    name: "High Risk Entities",
    trigger: "Risk Score > 40",
    channels: ["email", "in-app"],
    enabled: true,
    conditions: ["Entity type = User", "Multiple rules triggered"]
  },
  {
    id: "NR-003",
    name: "After Hours Activity",
    trigger: "Time-based Rule",
    channels: ["email"],
    enabled: false,
    conditions: ["Time outside 9-5", "Access to sensitive data"]
  }
];

export function AlertsThreats() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(mockNotificationRules);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.entity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || alert.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "destructive";
      case "acknowledged": return "default";
      case "investigating": return "default";
      case "resolved": return "secondary";
      default: return "outline";
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "user": return Users;
      case "device": return Monitor;
      case "server": return Server;
      default: return Users;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: "acknowledged" as const, assignedTo: "Current User" } : alert
    ));
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been marked as acknowledged.",
    });
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: "resolved" as const } : alert
    ));
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved.",
    });
  };

  const toggleNotificationRule = (ruleId: string) => {
    setNotificationRules(notificationRules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast({
      title: "Notification Rule Updated",
      description: "Notification preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alerts & Threats</h2>
          <p className="text-muted-foreground">Monitor and manage security alerts and threats</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="destructive" className="text-sm">
            {alerts.filter(a => a.status === 'new').length} new alerts
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Notification Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                {notificationRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant="outline" className="text-xs">{rule.id}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.trigger}</p>
                          <div className="flex items-center space-x-2">
                            {rule.channels.map((channel) => (
                              <Badge key={channel} variant="secondary" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleNotificationRule(rule.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{alerts.filter(a => a.severity === 'critical').length}</p>
              </div>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Alerts</p>
                <p className="text-2xl font-bold text-status-warning">{alerts.filter(a => a.status === 'new').length}</p>
              </div>
              <Bell className="h-8 w-8 text-status-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-status-online">{alerts.filter(a => a.status === 'resolved').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-online" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const EntityIcon = getEntityIcon(alert.entity.type);
          return (
            <Card key={alert.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <Badge variant={getSeverityColor(alert.severity)} className="capitalize">
                        {alert.severity}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {alert.id}
                        </Badge>
                        <Badge variant={getStatusColor(alert.status)} className="capitalize">
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <EntityIcon className="h-3 w-3" />
                          <span>{alert.entity.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{alert.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>Risk: {alert.riskScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {alert.status === "new" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                    
                    {alert.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Alert Details: {alert.title}</span>
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedAlert && (
                          <div className="space-y-6 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Alert Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Alert ID:</span>
                                    <span className="font-medium">{selectedAlert.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="outline">{selectedAlert.type}</Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Severity:</span>
                                    <Badge variant={getSeverityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={getStatusColor(selectedAlert.status)}>{selectedAlert.status}</Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Risk Score:</span>
                                    <span className="font-medium">{selectedAlert.riskScore}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Assigned To:</span>
                                    <span className="font-medium">{selectedAlert.assignedTo || "Unassigned"}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Affected Entity</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Entity ID:</span>
                                    <span className="font-medium">{selectedAlert.entity.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="font-medium">{selectedAlert.entity.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="outline">{selectedAlert.entity.type}</Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Evidence</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {selectedAlert.evidence.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted/20 rounded">
                                      <Shield className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Recommended Actions</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {selectedAlert.actions.map((action, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted/20 rounded">
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                      <span className="text-sm">{action}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No alerts found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}