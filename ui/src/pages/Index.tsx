import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardTab } from "@/components/DashboardTab";
import { EntityManagement } from "@/components/EntityManagement";
import { RiskRulesEngine } from "@/components/RiskRulesEngine";
import { AlertsThreats } from "@/components/AlertsThreats";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "entities":
        return <EntityManagement />;
      case "rules":
        return <RiskRulesEngine />;
      case "alerts":
        return <AlertsThreats />;
      case "config":
        return <div className="p-8 text-center text-muted-foreground">Configuration panel coming soon...</div>;
      case "insights":
        return <div className="p-8 text-center text-muted-foreground">AI Insights panel coming soon...</div>;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;
