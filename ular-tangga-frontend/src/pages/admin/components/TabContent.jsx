import React from 'react';
import OverviewTab from '../tabs/OverviewTab';
import UsersTab from '../tabs/UsersTab';
import QuestionsTab from '../tabs/QuestionsTab';
import AnalyticsTab from '../tabs/AnalyticsTab';

const TabContent = ({ activeTab, totalUsers }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab totalUsers={totalUsers} />;
      case 'users':
        return <UsersTab />;
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