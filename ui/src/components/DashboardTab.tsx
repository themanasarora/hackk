import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users, AlertTriangle, Shield, TrendingUp, Activity, Eye, Loader2
} from "lucide-react";

interface Alert {
  id: string;
  name: string;
  score: number;
  timestamp: string;
}

interface Threat {
  id: string;
  threatType: string;
  count: number;
  trend: string;
  severity: "High" | "Medium" | "Low";
  lastDetected: string;
  Total: number;
}

const mapAlert = (data: any): Alert => ({
  id: String(data.id),
  name: data.name || "Unknown Entity",
  score: data.score || data.riskScore || 0,
  timestamp: data.timestamp || data.lastActive || new Date().toISOString(),
});

export function DashboardTab() {
  const [topThreats, setTopThreats] = useState<Threat[]>([]);
  const [threatsLoading, setThreatsLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threatData, setThreatData] = useState<Threat | null>(null);
  const [totalThreats, setTotalThreats] = useState<number | null>(null);
  const [highRiskCount, setHighRiskCount] = useState<number | null>(null);

  // Replace the hardcoded version with this dynamic one:
const mediumRiskCount = 45;
const lowRiskCount = 93;

const totalCount = (highRiskCount ?? 0) + mediumRiskCount + lowRiskCount;

const riskDistribution = [
  {
    label: "High Risk",
    value: highRiskCount ?? 0,
    color: "bg-risk-high",
    percentage: totalCount ? Math.round(((highRiskCount ?? 0) / totalCount) * 100) : 0,
  },
  {
    label: "Medium Risk",
    value: mediumRiskCount,
    color: "bg-risk-medium",
    percentage: totalCount ? Math.round((mediumRiskCount / totalCount) * 100) : 0,
  },
  {
    label: "Low Risk",
    value: lowRiskCount,
    color: "bg-risk-low",
    percentage: totalCount ? Math.round((lowRiskCount / totalCount) * 100) : 0,
  },
];


  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/entities");
        const rawData = response.data;
        let alertsData: Alert[] = [];

        if (Array.isArray(rawData)) {
          alertsData = rawData.map(mapAlert);
        } else if (Array.isArray(rawData?.alerts) || Array.isArray(rawData?.entities)) {
          alertsData = (rawData.alerts || rawData.entities).map(mapAlert);
        } else if (typeof rawData === "object" && rawData !== null) {
          alertsData = [mapAlert(rawData)];
        } else {
          throw new Error("Unexpected response format from server");
        }

        setRecentAlerts(alertsData);
      } catch (err) {
        setError(
          `Failed to load alerts: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setRecentAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  useEffect(() => {
    const fetchTopThreats = async () => {
      try {
        setThreatsLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/threats");
        setTopThreats(response.data);
      } catch (err) {
        console.error("Error fetching threats:", err);
        setError("Failed to load threat data");
      } finally {
        setThreatsLoading(false);
      }
    };

    fetchTopThreats();
  }, []);

  // POLL Stat Cards (highRiskCount, totalThreats, threatData) every 10 seconds
  useEffect(() => {
    let isMounted = true; // avoid race if unmount happens between fetch and setState
    let interval: ReturnType<typeof setInterval>;

    const fetchThreatData = async () => {
      try {
        setThreatsLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/threat");
        const data = response.data;

        if (!isMounted) return;

        setThreatData(data);
        setHighRiskCount(data.count);
        setTotalThreats(data.Total);

        // Optionally: update topThreats if you rely on "threat" endpoint for StatCards,
        // but if you want Top Threats to be updated only on page load, remove next lines.
        setTopThreats([
          {
            id: "1",
            threatType: data.threatType,
            count: data.count,
            trend: data.trend,
            severity: data.severity,
            lastDetected: data.lastDetected,
            Total: data.Total,
          },
        ]);
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching threat data:", err);
          setError("Failed to load threat data");
        }
      } finally {
        if (isMounted) setThreatsLoading(false);
      }
    };

    fetchThreatData(); // Initial fetch immediately

    interval = setInterval(fetchThreatData, 10000); // Every 10s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Entities"
          value="20"
          icon={Users}
          change="+12%"
          changeType="positive"
          description="Users, devices, servers"
        />

        <StatCard
          title="High Risk Entities"
          value={
            highRiskCount !== null ? highRiskCount.toString() : "Loading..."
          }
          icon={AlertTriangle}
          change={threatData?.trend || "0%"}
          changeType={
            threatData?.trend?.startsWith("+") ? "negative" : "positive"
          }
          description="Risk score > 40"
          className="border-destructive/20"
        />

        <StatCard
          title="Threats Detected"
          value={totalThreats !== null ? totalThreats.toString() : "Loading..."}
          icon={Shield}
          change={threatData?.trend || "0%"}
          changeType={
            threatData?.trend?.startsWith("+") ? "negative" : "positive"
          }
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
            <CardTitle>Recent High-Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
              {recentAlerts
                .filter((alert) => alert.score >= 25)
                .sort((a, b) => b.score - a.score)
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          alert.score >= 40
                            ? "bg-risk-high"
                            : alert.score >= 25
                            ? "bg-risk-medium"
                            : "bg-risk-low"
                        }`}
                      />
                      <p className="font-medium text-sm">{alert.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          alert.score >= 40
                            ? "destructive"
                            : alert.score >= 25
                            ? "default"
                            : "secondary"
                        }
                      >
                        Risk: {alert.score}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
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
                  <div
                    key={threat.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{threat.threatType}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{threat.count}</span>
                      <Badge
                        variant={
                          threat.trend.startsWith("+")
                            ? "destructive"
                            : threat.trend.startsWith("-")
                            ? "secondary"
                            : "default"
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
                <span className="text-sm">Detection </span>
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
