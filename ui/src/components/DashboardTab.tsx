import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Activity,
  Eye,
  Clock,
  Zap
} from "lucide-react";


export function DashboardTab() {
  const riskDistribution = [
    { label: "High Risk", value: 12, color: "bg-risk-high", percentage: 8 },
    { label: "Medium Risk", value: 45, color: "bg-risk-medium", percentage: 30 },
    { label: "Low Risk", value: 93, color: "bg-risk-low", percentage: 62 },
  ];

  const recentAlerts = [
    { id: 1, entity: "user-john-doe", risk: 47, time: "2 min ago", type: "Suspicious Login" },
    { id: 2, entity: "device-laptop-45", risk: 43, time: "15 min ago", type: "Unusual File Access" },
    { id: 3, entity: "user-sarah-admin", risk: 39, time: "1 hour ago", type: "After Hours Activity" },
    { id: 4, entity: "server-db-01", risk: 32, time: "2 hours ago", type: "Multiple Failed Attempts" },
  ];

  const topThreats = [
    { threat: "Privilege Escalation", count: 23, trend: "+15%" },
    { threat: "Data Exfiltration", count: 18, trend: "+8%" },
    { threat: "Unauthorized Access", count: 12, trend: "-5%" },
    { threat: "Malware Detection", count: 9, trend: "+22%" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Entities"
          value="1,247"
          icon={Users}
          change="+12%"
          changeType="positive"
          description="Users, devices, servers"
        />
        <StatCard
          title="High Risk Entities"
          value="12"
          icon={AlertTriangle}
          change="+3"
          changeType="negative"
          description="Risk score > 40"
          className="border-destructive/20"
        />
        <StatCard
          title="Threats Detected"
          value="62"
          icon={Shield}
          change="+8%"
          changeType="negative"
          description="Last 24 hours"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Distribution */}
        <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Risk Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskDistribution.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent High-Risk Alerts */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Recent High-Risk Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.risk >= 40 ? 'bg-risk-high' : 
                      alert.risk >= 25 ? 'bg-risk-medium' : 'bg-risk-low'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{alert.entity}</p>
                      <p className="text-xs text-muted-foreground">{alert.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.risk >= 40 ? "destructive" : alert.risk >= 25 ? "default" : "secondary"}>
                      Risk: {alert.risk}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Threat Categories */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Top Threat Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topThreats.map((threat, index) => (
                <div key={threat.threat} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{threat.threat}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{threat.count}</span>
                    <Badge variant={threat.trend.startsWith('+') ? "destructive" : "secondary"} className="ml-2 text-xs">
                      {threat.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Performance Trends */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Model Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Current Accuracy</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">False Positive Rate</span>
                <span className="text-sm font-medium">3.1%</span>
              </div>
              <Progress value={96.9} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Detection Speed</span>
                <span className="text-sm font-medium">98.7%</span>
              </div>
              <Progress value={98.7} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}