import React, { useState } from 'react';
import { Home } from './components/Home';
import { LearnMode } from './components/LearnMode';
import { QuizMode } from './components/QuizMode';
import { StickerBook } from './components/StickerBook';
import { IncorrectNotes } from './components/IncorrectNotes';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'home' | 'learn' | 'quiz' | 'sticker' | 'note'>('home');

  const renderContent = () => {
    switch (activeMode) {
      case 'learn':
        return <LearnMode onBack={() => setActiveMode('home')} />;
      case 'quiz':
        return <QuizMode onBack={() => setActiveMode('home')} />;
      case 'sticker':
        return <StickerBook onBack={() => setActiveMode('home')} />;
      case 'note':
        return <IncorrectNotes onBack={() => setActiveMode('home')} />;
      case 'home':
      default:
        return <Home onSelectMode={(mode) => setActiveMode(mode)} />;
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {renderContent()}
    </div>
  );
};

export default App;
