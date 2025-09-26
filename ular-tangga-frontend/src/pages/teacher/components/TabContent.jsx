import React from 'react';
import OverviewTab from '../tabs/OverviewTab';
import RoomsTab from '../tabs/RoomsTab';
import QuestionsTab from '../tabs/QuestionsTab';
import GamesTab from '../tabs/GamesTab';

const TabContent = ({ 
  activeTab,
  setActiveTab,
  setIsModalOpen,
  setModalType,
  rooms = [],
  myQuestions = [],
  recentGames = []
}) => {
  // Default mock data jika tidak ada data yang dikirim
  const defaultRooms = [
    { id: 1, name: 'Kelas 7A', code: 'K7A001', students: 25, status: 'active', createdAt: '2024-01-15', gameType: 'Quiz Battle' },
    { id: 2, name: 'Kelas 7B', code: 'K7B002', students: 23, status: 'active', createdAt: '2024-01-20', gameType: 'Ular Tangga' },
    { id: 3, name: 'Kelas 8A', code: 'K8A003', students: 27, status: 'inactive', createdAt: '2024-02-01', gameType: 'Quiz Battle' }
  ];

  const defaultQuestions = [
    { id: 1, question: 'Apa rumus luas lingkaran?', type: 'multiple_choice', category: 'Mathematics', usedInRooms: 3, correctRate: 75 },
    { id: 2, question: 'Jelaskan proses fotosintesis', type: 'essay', category: 'Biology', usedInRooms: 2, correctRate: 68 },
    { id: 3, question: 'Jakarta adalah ibu kota Indonesia', type: 'true_false', category: 'Geography', usedInRooms: 5, correctRate: 92 }
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
            setIsModalOpen={setIsModalOpen}
            setModalType={setModalType}
            rooms={rooms.length > 0 ? rooms : defaultRooms}
            recentGames={recentGames.length > 0 ? recentGames : defaultRecentGames}
          />
        );
      case 'rooms':
        return (
          <RoomsTab 
            rooms={rooms.length > 0 ? rooms : defaultRooms}
            setIsModalOpen={setIsModalOpen}
            setModalType={setModalType}
          />
        );
      case 'questions':
        return (
          <QuestionsTab 
            myQuestions={myQuestions.length > 0 ? myQuestions : defaultQuestions}
            setIsModalOpen={setIsModalOpen}
            setModalType={setModalType}
          />
        );
      case 'games':
        return <GamesTab recentGames={recentGames.length > 0 ? recentGames : defaultRecentGames} />;
      default:
        return (
          <OverviewTab 
            setActiveTab={setActiveTab}
            setIsModalOpen={setIsModalOpen}
            setModalType={setModalType}
            rooms={rooms.length > 0 ? rooms : defaultRooms}
            recentGames={recentGames.length > 0 ? recentGames : defaultRecentGames}
          />
        );
    }
  };

  return renderTabContent();
};

export default TabContent;