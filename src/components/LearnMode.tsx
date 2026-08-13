import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, Volume2 } from 'lucide-react';
import './LearnMode.css';

interface LearnModeProps {
  onBack: () => void;
}

export const LearnMode: React.FC<LearnModeProps> = ({ onBack }) => {
  const { stickers, stickerList } = useGame();
  const [selectedDan, setSelectedDan] = useState<number>(2);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);

  // Auto-speak when equation changes
  useEffect(() => {
    speakEquation(selectedDan, activeMultiplier);
  }, [selectedDan, activeMultiplier]);

  // Find current active sticker configuration
  const currentSticker = stickerList.find(s => s.dan === selectedDan) || {
    emoji: '⭐',
    color: '#ff7675',
    name: '별'
  };

  const speakEquation = (dan: number, mult: number) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const text = `${dan} 곱하기 ${mult}은 ${dan * mult}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9; // Slightly slower for kids
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDanChange = (dan: number) => {
    setSelectedDan(dan);
    setActiveMultiplier(1);
  };

  // Generate numbers from 1 to 9
  const multipliers = Array.from({ length: 9 }, (_, i) => i + 1);

  // Translate multiplier numbers to Korean for visual description
  const numberToKoreanWord = (num: number): string => {
    const words = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
    return words[num] || '';
  };

  return (
    <div className="learn-container pop-in">
      <div className="learn-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          돌아가기
        </button>
        <h2 className="learn-title">🛰️ 구구단 탐험관</h2>
        <div style={{ width: '90px' }} /> {/* Spacer to center title */}
      </div>

      {/* Dan Tabs Selector */}
      <div className="dan-selector">
        {stickerList.map((st) => {
          const isMastered = stickers[st.dan];
          return (
            <button
              key={st.dan}
              className={`dan-tab ${selectedDan === st.dan ? 'active' : ''}`}
              onClick={() => handleDanChange(st.dan)}
              style={{
                borderColor: selectedDan === st.dan ? st.color : 'var(--border-glass)'
              }}
            >
              <span className="font-numeric">{st.dan}단</span>
              {isMastered && (
                <span className="dan-tab-sticker">{st.emoji}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="learn-content">
        {/* Left: Equation Cards List */}
        <div className="equations-list">
          {multipliers.map((mult) => {
            const isActive = activeMultiplier === mult;
            return (
              <div
                key={mult}
                className={`equation-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveMultiplier(mult)}
              >
                <div className="eq-left">
                  <span className="font-numeric">{selectedDan}</span>
                  <span>×</span>
                  <span className="font-numeric">{mult}</span>
                  <span>=</span>
                </div>
                <div className="eq-right font-numeric">
                  {selectedDan * mult}
                </div>
                <button 
                  className="speaker-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakEquation(selectedDan, mult);
                  }}
                  title="소리내어 읽기"
                >
                  <Volume2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: Bundles Visualizer */}
        <div className="visualizer-panel">
          <div className="visualizer-title">
            <div>
              <span className="font-numeric">{selectedDan}</span> 곱하기{' '}
              <span className="font-numeric">{activeMultiplier}</span>은(는)
            </div>
            <div style={{ color: currentSticker.color, fontSize: '1.8rem', marginTop: '5px' }}>
              {currentSticker.emoji} {selectedDan * activeMultiplier}개!
            </div>
          </div>

          <div className="visualizer-desc">
            {currentSticker.emoji} {currentSticker.name}이가 {selectedDan}개씩 {numberToKoreanWord(activeMultiplier)} 묶음 있어요.
          </div>

          {/* Visualizing Bundles Grid */}
          <div className="visualizer-grid">
            {Array.from({ length: activeMultiplier }).map((_, rIndex) => (
              <div 
                key={rIndex} 
                className="bundle-row"
                data-bundle-index={`${rIndex + 1}번째 묶음`}
              >
                {Array.from({ length: selectedDan }).map((_, cIndex) => (
                  <span 
                    key={cIndex} 
                    className="item-dot float-animation"
                    style={{ 
                      animationDelay: `${(rIndex * selectedDan + cIndex) * 0.05}s`,
                      filter: `drop-shadow(0 0 5px ${currentSticker.color})`
                    }}
                  >
                    {currentSticker.emoji}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* TTS trigger bar at bottom */}
          <div 
            className="tts-bar" 
            onClick={() => speakEquation(selectedDan, activeMultiplier)}
          >
            <Volume2 size={20} color="var(--accent)" />
            <span className="tts-text">소리로 같이 따라 읽기</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LearnMode;
