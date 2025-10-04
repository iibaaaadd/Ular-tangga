import React from 'react';
import OverviewTab from '../tabs/OverviewTab';
import RoomsTab from '../tabs/RoomsTab';
import GamesTab from '../tabs/GamesTab';

const TabContent = ({ 
  activeTab,
  setActiveTab
}) => {
  // Default mock data jika tidak ada data yang dikirim
  const defaultRooms = [
    { id: 1, name: 'Kelas 7A', code: 'K7A001', students: 25, status: 'active', createdAt: '2024-01-15', gameType: 'Quiz Battle' },
    { id: 2, name: 'Kelas 7B', code: 'K7B002', students: 23, status: 'active', createdAt: '2024-01-20', gameType: 'Ular Tangga' },
    { id: 3, name: 'Kelas 8A', code: 'K8A003', students: 27, status: 'inactive', createdAt: '2024-02-01', gameType: 'Quiz Battle' }
  ];

  const defaultRecentGames = [
    { id: 1, roomName: 'Kelas 7A', gameType: 'Ular Tangga', players: 4, duration: '15 min', completedAt: '2024-01-22 10:30', winner: 'Ahmad' },
    { id: 2, roomName: 'Kelas 7B', gameType: 'Quiz Battle', players: 2, duration: '12 min', completedAt: '2024-01-22 11:15', winner: 'Siti' },
    { id: 3, roomName: 'Kelas 8A', gameType: 'Ular Tangga', players: 3, duration: '18 min', completedAt: '2024-01-22 14:20', winner: 'Budi' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            setActiveTab={setActiveTab}
            rooms={defaultRooms}
            recentGames={defaultRecentGames}
          />
        );
      case 'rooms':
        return (
          <RoomsTab />
        );
      case 'games':
        return <GamesTab recentGames={defaultRecentGames} />;
      default:
        return (
          <OverviewTab 
            setActiveTab={setActiveTab}
            rooms={defaultRooms}
            recentGames={defaultRecentGames}
          />
        );
    }
  };

  return renderTabContent();
};

export default TabContent;