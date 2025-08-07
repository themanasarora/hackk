import React, { useEffect, useState } from "react";

const ConfigurationPage: React.FC = () => {
  const [systemStats, setSystemStats] = useState({
    totalSystems: 45,
    activeSystems: 38,
    flaggedSystems: 2,
    inactiveSystems: 5,
  });

  const [userStats, setUserStats] = useState({
    totalUsers: 120,
    activeUsers: 98,
    flaggedUsers: 3,
    inactiveUsers: 19,
  });

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto bg-white text-black min-h-screen">

         <section className="border p-6 rounded-2xl shadow bg-white">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">🛠 Configuration Panel</h2>
        <p className="text-gray-600">This section will allow administrators to configure monitoring parameters, risk rule management, and alert preferences in future updates.</p>
      </section>
      {/* Configuration Summary Section */}
      <section className="border p-6 rounded-2xl shadow bg-white">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">⚙ Configuration Summary</h2>

        {/* Systems Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">🖥 Monitored Systems</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Total Systems</p>
              <p className="text-2xl font-bold text-blue-800">{systemStats.totalSystems}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Active Systems</p>
              <p className="text-2xl font-bold text-green-700">{systemStats.activeSystems}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Flagged Systems</p>
              <p className="text-2xl font-bold text-yellow-700">{systemStats.flaggedSystems}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Inactive Systems</p>
              <p className="text-2xl font-bold text-red-700">{systemStats.inactiveSystems}</p>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-blue-700">👥 User Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-blue-800">{userStats.totalUsers}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-green-700">{userStats.activeUsers}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Flagged Users</p>
              <p className="text-2xl font-bold text-yellow-700">{userStats.flaggedUsers}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Inactive Users</p>
              <p className="text-2xl font-bold text-red-700">{userStats.inactiveUsers}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Placeholder */}
     
    </div>
  );
};

export default ConfigurationPage;