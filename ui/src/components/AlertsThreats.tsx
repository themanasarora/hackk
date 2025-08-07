import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  AlertTriangle, Bell, CheckCircle, Clock, Eye, Search, Server, 
  Settings, Shield, Users, Monitor, XCircle 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
  

// Interfaces
interface ApiAlert {
  alert_id: string;
  risk_score: number;
  severity: "high" | "moderate" | "normal";
}

interface EnhancedAlert {
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

// Constants
const ALERT_METADATA = {
  "al01": {
    title: "Suspicious Login Activity",
    description: "Multiple failed login attempts from unusual location",
    type: "Authentication",
    entity: { id: "USR-001", name: "John Doe", type: "user" },
    evidence: ["5 failed attempts", "Login from new IP: 192.168.1.100", "Outside business hours"],
    actions: ["Block IP temporarily", "Send notification to security team", "Require 2FA verification"]
  },
  "al02": {
    title: "Unauthorized File Access",
    description: "Access to confidential files outside normal pattern",
    type: "Data Access",
    entity: { id: "DEV-045", name: "Laptop-Finance-45", type: "device" },
    evidence: ["Accessed 12 confidential files", "Downloads detected", "Outside user's department"],
    actions: ["Monitor file access", "Alert data owner", "Review permissions"]
  },
  "al03": {
    title: "Privilege Escalation Attempt",
    description: "User attempting to gain administrative privileges",
    type: "Authorization",
    entity: { id: "USR-023", name: "Sarah Admin", type: "user" },
    evidence: ["Permission change request", "Elevated access attempt", "System admin commands"],
    actions: ["Block escalation", "Review user permissions", "Immediate investigation"]
  },
  "al04": {
    title: "Database Connection Anomaly",
    description: "Unusual database connection patterns detected",
    type: "System",
    entity: { id: "SRV-001", name: "Database-Server-01", type: "server" },
    evidence: ["Multiple connection attempts", "Query pattern analysis", "Performance impact"],
    actions: ["Connection monitoring", "Query optimization", "Security review"]
  }
} as const;

const MOCK_NOTIFICATION_RULES: NotificationRule[] = [
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

// Helper functions
const mapSeverityToUI = (severity: "high" | "moderate" | "normal") => {
  const severityMap = {
    high: "critical",
    moderate: "high",
    normal: "medium"
  } as const;
  return severityMap[severity] || "medium";
};

const getSeverityColor = (severity: string) => {
  const colorMap = {
    critical: "destructive",
    high: "destructive",
    medium: "default",
    low: "secondary"
  } as const;
  return colorMap[severity as keyof typeof colorMap] || "outline";
};

const getStatusColor = (status: string) => {
  const colorMap = {
    new: "destructive",
    acknowledged: "default",
    investigating: "default",
    resolved: "secondary"
  } as const;
  return colorMap[status as keyof typeof colorMap] || "outline";
};

const getEntityIcon = (type: string) => {
  const iconMap = {
    user: Users,
    device: Monitor,
    server: Server
  } as const;
  return iconMap[type as keyof typeof iconMap] || Users;
};

export function AlertsThreats() {
  // -----------------------------------
  // For filter URL query, DO NOT REDIRECT! Just update using replaceState.
  // -----------------------------------
  // For server components or SSR, you may not want to use window, but on client it's fine.

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : undefined;

  // State with URL persistence (but don't redirect or reload)
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || "");
  const [selectedSeverity, setSelectedSeverity] = useState(searchParams?.get('severity') || "all");
  const [selectedStatus, setSelectedStatus] = useState(searchParams?.get('status') || "all");

  const [alerts, setAlerts] = useState<EnhancedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationRules] = useState<NotificationRule[]>(MOCK_NOTIFICATION_RULES);
  const [selectedAlert, setSelectedAlert] = useState<EnhancedAlert | null>(null);

  // Update URL when filters change, but do NOT reload or redirect!
  useEffect(() => {
    // Only update on client
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedSeverity !== 'all') params.set('severity', selectedSeverity);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const newUrl = `${window.location.pathname}${params.toString() ? ("?" + params.toString()) : ""}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchTerm, selectedSeverity, selectedStatus]);

  // Fetch alerts (your backend should not redirect either!)
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/alert", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.alerts) {
          throw new Error("No alerts found in response");
        }

        const enhancedAlerts: EnhancedAlert[] = data.alerts.map((apiAlert: ApiAlert, index: number) => {
          const metadata = ALERT_METADATA[apiAlert.alert_id as keyof typeof ALERT_METADATA] || {
            title: "Unknown Alert",
            description: "No description available",
            type: "Unknown",
            entity: { id: "UNK-001", name: "Unknown", type: "user" },
            evidence: ["No evidence available"],
            actions: ["Investigate this alert"]
          };

          return {
            ...metadata,
            id: `${apiAlert.alert_id}-${index}`, // id for React list
            alert_id: apiAlert.alert_id,
            severity: mapSeverityToUI(apiAlert.severity),
            riskScore: apiAlert.risk_score,
            timestamp: new Date().toLocaleString(), // you might want to get from backend
            status: "new"
          } as EnhancedAlert;
        });

        setAlerts(enhancedAlerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch alerts");
        toast({
          title: "Error",
          description: "Failed to fetch alerts. Please check console for details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm 
      ? alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.entity.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
      
    const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || alert.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { 
        ...alert, 
        status: "acknowledged",
        assignedTo: "Current User" 
      } : alert
    ));
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been marked as acknowledged.",
    });
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { 
        ...alert, 
        status: "resolved" 
      } : alert
    ));
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved.",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Error loading alerts</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <NotificationSettingsDialog notificationRules={notificationRules} />
        </div>
      </div>

      {/* Filters */}
      <FiltersCard 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Alerts List */}
      <AlertsList 
        alerts={filteredAlerts}
        onAcknowledge={acknowledgeAlert}
        onResolve={resolveAlert}
        onSelectAlert={setSelectedAlert}
      />

      {/* Alert Details Dialog */}
      {selectedAlert && (
        <AlertDetailsDialog 
          alert={selectedAlert} 
          onClose={() => setSelectedAlert(null)} 
        />
      )}

      {/* Empty State */}
      {filteredAlerts.length === 0 && <EmptyAlertsState />}
    </div>
  );
}

// Sub-components

function NotificationSettingsDialog({ notificationRules }: { notificationRules: NotificationRule[] }) {
  const toggleNotificationRule = (ruleId: string) => {
    toast({
      title: "Notification Rule Updated",
      description: "Notification preferences have been updated.",
    });
  };

  return (
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
  );
}

function FiltersCard({
  searchTerm,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSeverity: string;
  onSeverityChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={selectedSeverity} onValueChange={onSeverityChange}>
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
            <Select value={selectedStatus} onValueChange={onStatusChange}>
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
        </div>
      </CardContent>
    </Card>
  );
}

function AlertsList({
  alerts,
  onAcknowledge,
  onResolve,
  onSelectAlert
}: {
  alerts: EnhancedAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onSelectAlert: (alert: EnhancedAlert) => void;
}) {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
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
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                  
                  {alert.status !== "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolve(alert.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectAlert(alert)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AlertDetailsDialog({ alert, onClose }: { alert: EnhancedAlert; onClose: () => void }) {
  const EntityIcon = getEntityIcon(alert.entity.type);
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Alert Details: {alert.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alert ID:</span>
                  <span className="font-medium">{alert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{alert.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity:</span>
                  <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusColor(alert.status)}>{alert.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Score:</span>
                  <span className="font-medium">{alert.riskScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span className="font-medium">{alert.assignedTo || "Unassigned"}</span>
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
                  <span className="font-medium">{alert.entity.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{alert.entity.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <div className="flex items-center space-x-2">
                    <EntityIcon className="h-4 w-4" />
                    <Badge variant="outline">{alert.entity.type}</Badge>
                  </div>
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
                {alert.evidence.map((item, index) => (
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
                {alert.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-muted/20 rounded">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyAlertsState() {
  return (
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
  );
}
