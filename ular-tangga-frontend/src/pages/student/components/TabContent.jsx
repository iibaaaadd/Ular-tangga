import React from 'react';
import OverviewTab from '../tabs/OverviewTab';
import RoomsTab from '../tabs/RoomsTab';
import GamesTab from '../tabs/GamesTab';
import LeaderboardTab from '../tabs/LeaderboardTab';
import AchievementsTab from '../tabs/AchievementsTab';

const TabContent = ({ 
  activeTab, 
  setActiveTab, 
  setIsModalOpen, 
  setModalType,
  joinedRooms = [],
  gameHistory = [],
  leaderboard = [],
  achievements = []
}) => {
  // Mock data sebagai fallback
  const defaultJoinedRooms = [
    { id: 1, name: 'Kelas 7A - Matematika', teacher: 'Bu Sari', code: 'K7A001', status: 'active', lastActivity: '2 jam lalu' },
    { id: 2, name: 'Kelas 7A - IPA', teacher: 'Pak Budi', code: 'K7A002', status: 'active', lastActivity: '1 hari lalu' },
    { id: 3, name: 'Kelas 7A - Bahasa', teacher: 'Bu Ani', code: 'K7A003', status: 'completed', lastActivity: '3 hari lalu' }
  ];

  const defaultGameHistory = [
    { id: 1, roomName: 'Kelas 7A - Matematika', gameType: 'Ular Tangga', score: 85, rank: 2, totalPlayers: 4, completedAt: '2024-01-22 10:30', status: 'completed' },
    { id: 2, roomName: 'Kelas 7A - IPA', gameType: 'Quiz Battle', score: 92, rank: 1, totalPlayers: 3, completedAt: '2024-01-21 14:15', status: 'completed' },
    { id: 3, roomName: 'Kelas 7A - Bahasa', gameType: 'Ular Tangga', score: 76, rank: 3, totalPlayers: 4, completedAt: '2024-01-20 09:45', status: 'completed' }
  ];

  const defaultLeaderboard = [
    { rank: 1, name: 'Ahmad Ridwan', totalScore: 2450, gamesPlayed: 18, avatar: '🏆' },
    { rank: 2, name: 'Siti Nurhaliza', totalScore: 2380, gamesPlayed: 16, avatar: '🥈' },
    { rank: 3, name: 'Budi Santoso', totalScore: 2290, gamesPlayed: 15, avatar: '🥉' },
    { rank: 4, name: 'Anda', totalScore: 2180, gamesPlayed: 14, avatar: '👨‍🎓', isCurrentUser: true },
    { rank: 5, name: 'Lisa Permata', totalScore: 2150, gamesPlayed: 13, avatar: '📚' }
  ];

  const defaultAchievements = [
    { id: 1, title: 'First Winner', description: 'Menang untuk pertama kali', icon: '🏆', earned: true, earnedAt: '2024-01-15' },
    { id: 2, title: 'Speed Demon', description: 'Selesaikan game dalam < 10 menit', icon: '⚡', earned: true, earnedAt: '2024-01-18' },
    { id: 3, title: 'Perfect Score', description: 'Dapatkan skor 100', icon: '💯', earned: false },
    { id: 4, title: 'Consistent Player', description: 'Main 10 game berturut-turut', icon: '🎯', earned: true, earnedAt: '2024-01-20' },
    { id: 5, title: 'Helper', description: 'Bantu teman menyelesaikan soal', icon: '🤝', earned: false },
    { id: 6, title: 'Marathon Player', description: 'Main selama 2 jam non-stop', icon: '🏃', earned: false }
  ];
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            setActiveTab={setActiveTab}
            setIsModalOpen={setIsModalOpen}
            setModalType={setModalType}
            achievements={achievements.length > 0 ? achievements : defaultAchievements}
          />
        );
      case 'rooms':
        return (
          <RoomsTab 
            joinedRooms={joinedRooms.length > 0 ? joinedRooms : defaultJoinedRooms}
            setIsModalOpen={setIsModalOpen}
            setModalType={setModalType}
          />
        );
      case 'games':
        return <GamesTab gameHistory={gameHistory.length > 0 ? gameHistory : defaultGameHistory} />;
      case 'leaderboard':
        return <LeaderboardTab leaderboard={leaderboard.length > 0 ? leaderboard : defaultLeaderboard} />;
      case 'achievements':
        return <AchievementsTab achievements={achievements.length > 0 ? achievements : defaultAchievements} />;
      default:
        return (
          <OverviewTab 
            setActiveTab={setActiveTab}
            setIsModalOpen={setIsModalOpen}
            setModalType={setModalType}
            achievements={achievements.length > 0 ? achievements : defaultAchievements}
          />
        );
    }
  };

  return renderTabContent();
};

export default TabContent;