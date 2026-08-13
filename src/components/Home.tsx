import React from 'react';
import { useGame } from '../context/GameContext';
import { BookOpen, Trophy, Sparkles, BookMarked } from 'lucide-react';
import './Home.css';

interface HomeProps {
  onSelectMode: (mode: 'learn' | 'quiz' | 'sticker' | 'note') => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectMode }) => {
  const { stickers, incorrectNotes, stickerList } = useGame();
  
  // Calculate sticker progress
  const totalStickers = stickerList.length;
  const earnedStickersCount = Object.keys(stickers).filter(dan => stickers[Number(dan)]).length;
  const progressPercent = (earnedStickersCount / totalStickers) * 100;

  return (
    <div className="home-container pop-in">
      <div className="home-header">
        <h1 className="home-title">구구단 우주 탐험대</h1>
        <p className="home-subtitle">귀여운 외계인 친구들과 함께 구구단을 마스터하자!</p>
      </div>

      <div className="mascot-container">
        <div className="mascot float-animation">🚀</div>
      </div>

      <div className="progress-banner">
        <div className="progress-info">
          <span className="progress-title">
            <Sparkles size={20} color="var(--accent)" />
            나의 우주 스티커 획득 현황
          </span>
          <span className="progress-value font-numeric">
            {earnedStickersCount} / {totalStickers}
          </span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="menu-grid">
        <div 
          className="menu-card learn" 
          onClick={() => onSelectMode('learn')}
        >
          <div className="menu-icon-wrapper" style={{ color: 'var(--primary-light)' }}>
            <BookOpen size={36} />
          </div>
          <div className="menu-info">
            <span className="menu-title">구구단 탐험</span>
            <span className="menu-desc">2단부터 9단까지 곱셈 원리를 공부해요</span>
          </div>
        </div>

        <div 
          className="menu-card quiz" 
          onClick={() => onSelectMode('quiz')}
        >
          <div className="menu-icon-wrapper" style={{ color: 'var(--secondary)' }}>
            <Sparkles size={36} />
          </div>
          <div className="menu-info">
            <span className="menu-title">도전! 구구단 퀴즈</span>
            <span className="menu-desc">번개 퀴즈를 풀고 스티커를 획득해요</span>
          </div>
        </div>

        <div 
          className="menu-card sticker" 
          onClick={() => onSelectMode('sticker')}
        >
          <div className="menu-icon-wrapper" style={{ color: 'var(--accent)' }}>
            <Trophy size={36} />
          </div>
          <div className="menu-info">
            <span className="menu-title">우주 스티커 북</span>
            <span className="menu-desc">내가 모은 귀여운 행성 배지들을 보아요</span>
          </div>
          {earnedStickersCount > 0 && (
            <span className="badge-count font-numeric">{earnedStickersCount}</span>
          )}
        </div>

        <div 
          className="menu-card note" 
          onClick={() => onSelectMode('note')}
        >
          <div className="menu-icon-wrapper" style={{ color: 'var(--success)' }}>
            <BookMarked size={36} />
          </div>
          <div className="menu-info">
            <span className="menu-title">별자리 복습 노트</span>
            <span className="menu-desc">틀렸던 문제를 다시 확인하고 연습해요</span>
          </div>
          {incorrectNotes.length > 0 && (
            <span className="badge-count font-numeric" style={{ backgroundColor: 'var(--success)' }}>
              {incorrectNotes.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;
