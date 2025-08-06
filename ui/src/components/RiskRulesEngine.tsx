import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Shield,
  Activity,
  Settings,
  TrendingUp
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RiskRule {
  id: string;
  name: string;
  description: string;
  category: string;
  weightage: number;
  enabled: boolean;
  trigger: string;
  severity: "low" | "medium" | "high";
  conditions: string[];
  actions: string[];
}

const mockRules: RiskRule[] = [
  {
    id: "RULE-001",
    name: "After Hours Access",
    description: "Detects access to systems outside normal business hours",
    category: "Time-based",
    weightage: 15,
    enabled: true,
    trigger: "time_based",
    severity: "medium",
    conditions: ["Time < 06:00 OR Time > 22:00", "User role != Security"],
    actions: ["Increase risk score by 15", "Send notification to admin"]
  },
  {
    id: "RULE-002", 
    name: "Multiple Failed Logins",
    description: "Detects multiple consecutive failed login attempts",
    category: "Authentication",
    weightage: 25,
    enabled: true,
    trigger: "authentication",
    severity: "high",
    conditions: ["Failed attempts >= 5", "Time window <= 10 minutes"],
    actions: ["Increase risk score by 25", "Lock account temporarily", "Alert security team"]
  },
  {
    id: "RULE-003",
    name: "Unusual File Access",
    description: "Detects access to files outside user's normal pattern",
    category: "Data Access",
    weightage: 20,
    enabled: true,
    trigger: "file_access",
    severity: "high",
    conditions: ["File classification = Confidential", "Access from new location"],
    actions: ["Increase risk score by 20", "Log detailed access"]
  },
  {
    id: "RULE-004",
    name: "Privilege Escalation",
    description: "Detects attempts to gain higher privileges",
    category: "Authorization",
    weightage: 30,
    enabled: true,
    trigger: "privilege_change",
    severity: "high",
    conditions: ["Permission change detected", "User role elevation"],
    actions: ["Increase risk score by 30", "Immediate admin alert", "Block escalation"]
  },
  {
    id: "RULE-005",
    name: "External USB Detection",
    description: "Detects connection of external storage devices",
    category: "Device",
    weightage: 10,
    enabled: false,
    trigger: "device_connection",
    severity: "low",
    conditions: ["USB device connected", "Device not whitelisted"],
    actions: ["Increase risk score by 10", "Log device details"]
  }
];

export function RiskRulesEngine() {
  const [rules, setRules] = useState<RiskRule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<RiskRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<RiskRule>>({
    name: "",
    description: "",
    category: "",
    weightage: 10,
    enabled: true,
    severity: "medium",
    conditions: [""],
    actions: [""]
  });

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast({
      title: "Rule Updated",
      description: "Rule status has been changed successfully.",
    });
  };

  const updateWeightage = (ruleId: string, newWeightage: number) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, weightage: newWeightage } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule Deleted",
      description: "Rule has been removed successfully.",
      variant: "destructive"
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Authentication": return Shield;
      case "Authorization": return AlertTriangle;
      case "Time-based": return Activity;
      case "Data Access": return Brain;
      case "Device": return Settings;
      default: return Activity;
    }
  };

  const createRule = () => {
    const rule: RiskRule = {
      id: `RULE-${String(rules.length + 1).padStart(3, '0')}`,
      name: newRule.name || "",
      description: newRule.description || "",
      category: newRule.category || "",
      weightage: newRule.weightage || 10,
      enabled: newRule.enabled || true,
      trigger: newRule.name?.toLowerCase().replace(/\s+/g, '_') || "",
      severity: newRule.severity || "medium",
      conditions: newRule.conditions || [""],
      actions: newRule.actions || [""]
    };
    
    setRules([...rules, rule]);
    setIsCreateDialogOpen(false);
    setNewRule({
      name: "",
      description: "",
      category: "",
      weightage: 10,
      enabled: true,
      severity: "medium",
      conditions: [""],
      actions: [""]
    });
    
    toast({
      title: "Rule Created",
      description: "New risk scoring rule has been added successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Scoring Rules Engine</h2>
          <p className="text-muted-foreground">Configure and manage risk scoring rules</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {rules.filter(r => r.enabled).length} active rules
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Risk Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newRule.category} onValueChange={(value) => setNewRule({...newRule, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Authentication">Authentication</SelectItem>
                        <SelectItem value="Authorization">Authorization</SelectItem>
                        <SelectItem value="Time-based">Time-based</SelectItem>
                        <SelectItem value="Data Access">Data Access</SelectItem>
                        <SelectItem value="Device">Device</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newRule.description}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                    placeholder="Describe what this rule detects"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={newRule.severity} onValueChange={(value: any) => setNewRule({...newRule, severity: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Score Weightage: {newRule.weightage}</Label>
                    <Slider
                      value={[newRule.weightage || 10]}
                      onValueChange={(value) => setNewRule({...newRule, weightage: value[0]})}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRule}>
                    Create Rule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rules Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{rules.length}</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold text-status-online">{rules.filter(r => r.enabled).length}</p>
              </div>
              <Shield className="h-8 w-8 text-status-online" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Severity</p>
                <p className="text-2xl font-bold text-destructive">{rules.filter(r => r.severity === 'high').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Weight</p>
                <p className="text-2xl font-bold">{Math.round(rules.reduce((acc, r) => acc + r.weightage, 0) / rules.length)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const CategoryIcon = getCategoryIcon(rule.category);
          return (
            <Card key={rule.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {rule.id}
                        </Badge>
                        <Badge variant={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Category: {rule.category}</span>
                        <span>Weight: {rule.weightage}</span>
                        <span>{rule.conditions.length} conditions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <Label htmlFor={`rule-${rule.id}`} className="text-sm">
                        Weight: {rule.weightage}
                      </Label>
                      <Slider
                        value={[rule.weightage]}
                        onValueChange={(value) => updateWeightage(rule.id, value[0])}
                        max={50}
                        min={1}
                        step={1}
                        className="w-32"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`rule-${rule.id}`}
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Label htmlFor={`rule-${rule.id}`} className="text-sm">
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRule(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Rule Details: {rule.name}</DialogTitle>
                          </DialogHeader>
                          
                          {selectedRule && (
                            <div className="space-y-6 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Rule Configuration</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Rule ID:</span>
                                      <span className="font-medium">{selectedRule.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Category:</span>
                                      <Badge variant="outline">{selectedRule.category}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Severity:</span>
                                      <Badge variant={getSeverityColor(selectedRule.severity)}>{selectedRule.severity}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Weight:</span>
                                      <span className="font-medium">{selectedRule.weightage}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status:</span>
                                      <Badge variant={selectedRule.enabled ? "default" : "secondary"}>
                                        {selectedRule.enabled ? "Enabled" : "Disabled"}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Conditions</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      {selectedRule.conditions.map((condition, index) => (
                                        <div key={index} className="p-2 bg-muted/20 rounded text-sm font-mono">
                                          {condition}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedRule.actions.map((action, index) => (
                                      <div key={index} className="flex items-center space-x-2 p-2 bg-muted/20 rounded">
                                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
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

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}