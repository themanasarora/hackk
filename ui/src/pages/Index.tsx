import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardTab } from "@/components/DashboardTab";
import { EntityManagement } from "@/components/EntityManagement";
import { RiskRulesEngine } from "@/components/RiskRulesEngine";
import { AlertsThreats } from "@/components/AlertsThreats";
import ConfigurationPage from "@/components/configration";

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
        return <ConfigurationPage/>;
      
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
