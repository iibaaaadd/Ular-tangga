import React from 'react';
import OverviewTab from '../tabs/OverviewTab';
import UsersTab from '../tabs/UsersTab';
import MaterialsTab from '../tabs/MaterialsTab';
import QuestionsTab from '../tabs/QuestionsTab';
import AnalyticsTab from '../tabs/AnalyticsTab';
import { ToastProvider } from '../../../components/ui/ToastProvider';

const TabContent = ({ activeTab, totalUsers }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab totalUsers={totalUsers} />;
      case 'users':
        return (
          <ToastProvider>
            <UsersTab />
          </ToastProvider>
        );
      case 'materials':
        return (
          <ToastProvider>
            <MaterialsTab />
          </ToastProvider>
        );
      case 'questions':
        return <QuestionsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <OverviewTab totalUsers={totalUsers} />;
    }
  };

  return renderTabContent();
};

export default TabContent;