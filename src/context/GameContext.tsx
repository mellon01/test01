import React, { createContext, useContext, useState, useEffect } from 'react';

export interface IncorrectNote {
  id: string;
  dan: number;
  num: number;
  createdAt: number;
}

export interface Sticker {
  dan: number;
  name: string;
  emoji: string;
  color: string;
}

interface GameContextType {
  stickers: { [dan: number]: boolean };
  incorrectNotes: IncorrectNote[];
  addSticker: (dan: number) => void;
  addIncorrectNote: (dan: number, num: number) => void;
  removeIncorrectNote: (id: string) => void;
  resetAllData: () => void;
  stickerList: Sticker[];
}

const stickerInfo: Sticker[] = [
  { dan: 2, name: '우주 토끼', emoji: '🐰', color: '#ff7675' },
  { dan: 3, name: '불꽃 여우', emoji: '🦊', color: '#ff9f43' },
  { dan: 4, name: '우주 고양이', emoji: '🐱', color: '#feca57' },
  { dan: 5, name: '지구 판다', emoji: '🐼', color: '#1dd1a1' },
  { dan: 6, name: '젤리 외계인', emoji: '👽', color: '#00d2d3' },
  { dan: 7, name: '로봇 곰돌이', emoji: '🐻', color: '#54a0ff' },
  { dan: 8, name: '레이저 공룡', emoji: '🦖', color: '#5f27cd' },
  { dan: 9, name: '은하 유니콘', emoji: '🦄', color: '#db00ff' },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from LocalStorage
  const [stickers, setStickers] = useState<{ [dan: number]: boolean }>(() => {
    const saved = localStorage.getItem('gugudan_stickers');
    return saved ? JSON.parse(saved) : {};
  });

  const [incorrectNotes, setIncorrectNotes] = useState<IncorrectNote[]>(() => {
    const saved = localStorage.getItem('gugudan_incorrect_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to LocalStorage when states change
  useEffect(() => {
    localStorage.setItem('gugudan_stickers', JSON.stringify(stickers));
  }, [stickers]);

  useEffect(() => {
    localStorage.setItem('gugudan_incorrect_notes', JSON.stringify(incorrectNotes));
  }, [incorrectNotes]);

  const addSticker = (dan: number) => {
    setStickers((prev) => ({
      ...prev,
      [dan]: true,
    }));
  };

  const addIncorrectNote = (dan: number, num: number) => {
    setIncorrectNotes((prev) => {
      // Avoid duplicate incorrect notes for the same dan * num
      const exists = prev.some((note) => note.dan === dan && note.num === num);
      if (exists) return prev;
      
      const newNote: IncorrectNote = {
        id: `${dan}-${num}-${Date.now()}`,
        dan,
        num,
        createdAt: Date.now(),
      };
      return [...prev, newNote];
    });
  };

  const removeIncorrectNote = (id: string) => {
    setIncorrectNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const resetAllData = () => {
    if (window.confirm('정말 모든 모험 기록(스티커와 오답노트)을 초기화할까요?')) {
      setStickers({});
      setIncorrectNotes([]);
    }
  };

  return (
    <GameContext.Provider
      value={{
        stickers,
        incorrectNotes,
        addSticker,
        addIncorrectNote,
        removeIncorrectNote,
        resetAllData,
        stickerList: stickerInfo,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
