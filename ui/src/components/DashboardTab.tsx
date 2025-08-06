import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Zap,
  Loader2
} from "lucide-react";

interface Alert {
  id: string;
  name: string;
  score: number;
  timestamp: string;
}

interface Threat {
  id: string;
  name: string;
  count: number;
  trend: string;
  severity?: 'High' | 'Medium' | 'Low';
}

const mapAlert = (data: any): Alert => ({
  id: String(data.id),
  name: data.name || 'Unknown Entity',
  score: data.score || data.riskScore || 0,
  timestamp: data.timestamp || data.lastActive || new Date().toISOString()
});

export function DashboardTab() {
  const [topThreats, setTopThreats] = useState<Threat[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [highRiskCount, setHighRiskCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [threatsLoading, setThreatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const processAlertsData = useCallback((rawData: any): Alert[] => {
    let alertsData: Alert[] = [];
    if (Array.isArray(rawData)) {
      alertsData = rawData.map(mapAlert);
    } else if (Array.isArray(rawData?.alerts) || Array.isArray(rawData?.entities)) {
      alertsData = (rawData.alerts || rawData.entities).map(mapAlert);
    } else if (typeof rawData === 'object' && rawData !== null) {
      alertsData = [mapAlert(rawData)];
    }
    return alertsData;
  }, []);

  const processThreatsData = useCallback((rawData: any): Threat[] => {
    let threatsData: Threat[] = [];
    if (Array.isArray(rawData)) {
      threatsData = rawData.map((threat: any) => ({
        id: String(threat.id),
        name: threat.name || 'Unknown Threat',
        count: threat.count || 0,
        trend: threat.trend || '0%',
        severity: threat.severity || 'Medium'
      }));
    }
    return threatsData;
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setThreatsLoading(true);
      
      const [alertsResponse, threatsResponse, highRiskResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/entities"),
        axios.get("http://127.0.0.1:8000/threats"),
        axios.get("http://localhost:8000/threat")
      ]);

      setRecentAlerts(processAlertsData(alertsResponse.data));
      setTopThreats(processThreatsData(threatsResponse.data));
      setHighRiskCount(highRiskResponse.data.count);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setThreatsLoading(false);
    }
  }, [processAlertsData, processThreatsData]);

  useEffect(() => {
    // Initial fetch
    fetchAllData();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchAllData, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchAllData]);

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds/60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds/3600)} hours ago`;
    return `${Math.floor(seconds/86400)} days ago`;
  };

  // Calculate risk distribution from actual data
  const riskDistribution = [
    { 
      label: "High Risk", 
      value: recentAlerts.filter(a => a.score >= 40).length, 
      color: "bg-risk-high", 
      percentage: Math.round((recentAlerts.filter(a => a.score >= 40).length / (recentAlerts.length || 1)) * 100)
    },
    { 
      label: "Medium Risk", 
      value: recentAlerts.filter(a => a.score >= 25 && a.score < 40).length, 
      color: "bg-risk-medium", 
      percentage: Math.round((recentAlerts.filter(a => a.score >= 25 && a.score < 40).length / (recentAlerts.length || 1)) * 100)
    },
    { 
      label: "Low Risk", 
      value: recentAlerts.filter(a => a.score < 25).length, 
      color: "bg-risk-low", 
      percentage: Math.round((recentAlerts.filter(a => a.score < 25).length / (recentAlerts.length || 1)) * 100)
    },
  ];

  const totalThreats = topThreats.reduce((sum, threat) => sum + (threat.count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-end text-sm text-muted-foreground">
        Last updated: {lastUpdated || 'Never'}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Entities"
          value={recentAlerts.length.toString()}
          icon={Users}
          change="+12%" // You can make this dynamic with historical data
          changeType="positive"
          description="Users, devices, servers"
        />
        <StatCard
          title="High Risk Entities"
          value={highRiskCount !== null ? highRiskCount.toString() : "..."}
          icon={AlertTriangle}
          change="+3" // You can make this dynamic with historical data
          changeType="negative"
          description="Risk score > 40"
          className="border-destructive/20"
        />
        <StatCard
          title="Threats Detected"
          value={totalThreats.toString()}
          icon={Shield}
          change="+8%" // You can make this dynamic with historical data
          changeType="negative"
          description="Last 24 hours"
        />
      </div>

      {/* Rest of your dashboard components remain the same */}
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
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-6 text-destructive">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-10 w-10 mx-auto mb-2" />
                <p>No recent alerts found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        alert.score >= 40 ? 'bg-risk-high' : 
                        alert.score >= 25 ? 'bg-risk-medium' : 'bg-risk-low'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{alert.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        alert.score >= 40 ? "destructive" : 
                        alert.score >= 25 ? "default" : "secondary"
                      }>
                        Risk: {alert.score}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {threatsLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : topThreats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-10 w-10 mx-auto mb-2" />
                <p>No threat data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topThreats.map((threat, index) => (
                  <div key={threat.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{threat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{threat.count}</span>
                      <Badge 
                        variant={
                          threat.trend.startsWith('+') ? "destructive" : 
                          threat.trend.startsWith('-') ? "secondary" : "default"
                        } 
                        className="ml-2 text-xs"
                      >
                        {threat.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
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