import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Users, 
  Monitor, 
  Server,
  AlertTriangle,
  Activity,
  Clock,
  Shield,
  Eye,
  TrendingUp,
  MapPin,
  Building
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { useEffect } from "react";

interface Entity {
  id: string;
  name: string;
  type: "user" | "device" | "server";
  score: number;
  department: string;
  location: string;
  role: string;
  lastActive: string;
  rulesTriggered: string[];
  trend: "up" | "down" | "stable";
  status: "online" | "offline" | "suspicious";
}








export function EntityManagement() {
  const [entities, setEntities] = useState<Entity[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);




  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

const filteredEntities = entities.filter((entity) => {
  const matchesSearch =
    !searchTerm ||
    (entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     entity.id?.toLowerCase().includes(searchTerm.toLowerCase()));

  const matchesType =
    selectedType === "all" || entity.type === selectedType;

  const matchesDepartment =
    selectedDepartment === "all" || entity.department === selectedDepartment;

  const matchesRiskLevel =
    selectedRiskLevel === "all" ||
    (selectedRiskLevel === "high" && entity.score >= 40) ||
    (selectedRiskLevel === "medium" && entity.score >= 25 && entity.score < 40) ||
    (selectedRiskLevel === "low" && entity.score < 25);

  return matchesSearch && matchesType && matchesDepartment && matchesRiskLevel;
});


  const getRiskBadgeVariant = (score: number) => {
    if (score >= 40) return "destructive";
    if (score >= 25) return "default";
    return "secondary";
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "user": return Users;
      case "device": return Monitor;
      case "server": return Server;
      default: return Users;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "📈";
      case "down": return "📉";
      case "stable": return "➡️";
      default: return "➡️";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-status-online";
      case "offline": return "bg-muted-foreground";
      case "suspicious": return "bg-status-critical";
      default: return "bg-muted-foreground";
    }
  };

useEffect(() => {
  console.log("Fetching entities...");

  axios
    .get("http://127.0.0.1:8000/entities")
    .then((res) => {
      console.log("Response received:", res.data);

      // Defensive: If data is not array, fallback to empty array
      const rawEntities = res.data.entities || [];



     setEntities(res.data.entities);

      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching entities:", err);
      setError("Failed to load entities");
      setLoading(false);
    });
}, []);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Entity Management</h2>
          <p className="text-muted-foreground">Monitor and manage all users, devices, and servers</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredEntities.length} entities
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="device">Devices</SelectItem>
                  <SelectItem value="server">Servers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Level</label>
              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High Risk (40+)</SelectItem>
                  <SelectItem value="medium">Medium Risk (25-39)</SelectItem>
                  <SelectItem value="low">Low Risk (&lt;25)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity List */}
      <div className="grid gap-4">
        {filteredEntities.map((entity) => {


          const Icon = getEntityIcon(entity.type);
          return (
            <Card key={entity.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(entity.name)}`} />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{entity.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {entity.id}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{entity.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{entity.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{entity.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRiskBadgeVariant(entity.score)}>
                          Risk: {entity.score}
                        </Badge>
                        <span className="text-sm">{getTrendIcon(entity.trend)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entity.name} rules triggered
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedEntity(entity)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Icon className="h-5 w-5" />
                            <span>{entity.name} Details</span>
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedEntity && (
                          <div className="space-y-6 p-4">
                            {/* Basic Info */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Entity ID:</span>
                                    <span className="font-medium">{selectedEntity.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="outline">{selectedEntity.name}</Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Department:</span>
                                    <span className="font-medium">{selectedEntity.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="font-medium">{selectedEntity.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Role:</span>
                                    <span className="font-medium">{selectedEntity.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedEntity.name)}`} />
                                      <span className="font-medium capitalize">{selectedEntity.status}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Risk Assessment</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Current Risk Score:</span>
                                      <Badge variant={getRiskBadgeVariant(selectedEntity.score)} className="text-lg px-3 py-1">
                                        {selectedEntity.score}
                                      </Badge>
                                    </div>
                                    <Progress value={selectedEntity.score} className="h-3" />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <span className="text-sm font-medium">Triggered Rules:</span>
                                    {/* <div className="space-y-1">
                                      {selectedEntity.name.length > 0 ? (
                                        selectedEntity.rulesTriggered.map((rule, index) => (
                                          <Badge key={index} variant="destructive" className="mr-2 mb-1">
                                            {rule}
                                          </Badge>
                                        ))
                                      ) : (
                                        <span className="text-muted-foreground text-sm">No rules triggered</span>
                                      )}
                                    </div> */}
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Risk Trend:</span>
                                    <div className="flex items-center space-x-2">
                                      <span>{getTrendIcon(selectedEntity.name)}</span>
                                      <span className="font-medium capitalize">{selectedEntity.name}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Behavior Chart */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <Activity className="h-5 w-5" />
                                  <span>Behavior Trend (Last 7 Days)</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                                  <span className="text-muted-foreground">Risk Score Timeline Chart</span>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <Clock className="h-5 w-5" />
                                  <span>Recent Activity</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                                    <div className="w-3 h-3 bg-status-critical rounded-full" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">Suspicious login attempt detected</p>
                                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                                    <div className="w-3 h-3 bg-status-warning rounded-full" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">Accessed confidential files</p>
                                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                                    <div className="w-3 h-3 bg-status-online rounded-full" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">Normal system access</p>
                                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                                    </div>
                                  </div>
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

      {filteredEntities.length === 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No entities found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}