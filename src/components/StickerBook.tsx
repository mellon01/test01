import React, { useState } from 'react';
import { useGame, type Sticker } from '../context/GameContext';
import { ArrowLeft, Lock } from 'lucide-react';
import './StickerBook.css';

interface StickerBookProps {
  onBack: () => void;
}

export const StickerBook: React.FC<StickerBookProps> = ({ onBack }) => {
  const { stickers, stickerList, resetAllData } = useGame();
  const [activeSpeech, setActiveSpeech] = useState<{ sticker: Sticker; text: string } | null>(null);

  const earnedCount = Object.keys(stickers).filter((dan) => stickers[Number(dan)]).length;
  const totalCount = stickerList.length;

  // Speeches dictionary based on dan
  const characterSpeeches: { [dan: number]: string } = {
    2: '안녕 친구! 나랑 같이 깡충깡충 2단을 완벽하게 공부했구나! 다음 탐험지도 같이 가보자! 🐰🪐',
    3: '정말 불타오르는 열정이야! 3단 정복을 완료하다니, 너는 이미 훌륭한 우주 탐험가야! 🦊🔥',
    4: '야옹~! 4단은 은근히 헷갈렸을 텐데 백 점을 맞다니! 정말 똑똑한 지구인이구나! 🐱🛸',
    5: '오단오단~! 5단은 리드미컬해서 재밌었지? 나 판다랑 같이 우주 평화를 지키자! 🐼🌳',
    6: '말랑말랑 젤리 외계인 등장! 6단 클리어를 환영해! 포기하지 않고 끝까지 달려가자! 👽🛰️',
    7: '위이잉- 7단 정복 완료! 톱니바퀴처럼 완벽하게 계산해내다니, 넌 최고의 연산 로봇이야! 🐻🤖',
    8: '크오오오! 무시무시한 레이저 공룡의 8단을 용감하게 정복했구나! 정말 장하다! 🦖⚡',
    9: '은하수 너머 마지막 9단 정복을 축하해! 반짝반짝 빛나는 꿈을 향해 더 높이 날아가자! 🦄🌌',
  };

  const handleCardClick = (st: Sticker) => {
    if (stickers[st.dan]) {
      const speechText = characterSpeeches[st.dan] || '구구단 탐험을 축하해!';
      setActiveSpeech({ sticker: st, text: speechText });
    }
  };

  return (
    <div className="sticker-container">
      <div className="sticker-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          돌아가기
        </button>
        <h2 className="sticker-title">🏆 나의 우주 스티커 북</h2>
        <div style={{ width: '90px' }} />
      </div>

      <div className="progress-summary font-numeric">
        스티커 수집 완료: {earnedCount} / {totalCount}
      </div>

      <div className="sticker-grid">
        {stickerList.map((st) => {
          const isEarned = stickers[st.dan];
          return (
            <div
              key={st.dan}
              className={`sticker-card ${isEarned ? 'earned' : 'locked'}`}
              onClick={() => handleCardClick(st)}
              style={{
                borderColor: isEarned ? st.color : 'var(--border-glass)',
              }}
            >
              <div className="sticker-emoji-wrapper">
                {isEarned ? (
                  <span className="float-animation">{st.emoji}</span>
                ) : (
                  <span>?</span>
                )}
                {!isEarned && (
                  <div className="lock-overlay">
                    <Lock size={14} />
                  </div>
                )}
              </div>

              <div className="sticker-info">
                <span 
                  className="sticker-dan-tag font-numeric"
                  style={{ backgroundColor: isEarned ? st.color : 'rgba(255,255,255,0.1)' }}
                >
                  {st.dan}단 마스터
                </span>
                <div className="sticker-name">{isEarned ? st.name : '미지의 친구'}</div>
                <div className="sticker-desc">
                  {isEarned ? '스티커 획득 완료!' : `${st.dan}단 퀴즈 100점 도전!`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speech bubble popup */}
      {activeSpeech && (
        <div className="speech-bubble-overlay" onClick={() => setActiveSpeech(null)}>
          <div className="speech-modal" onClick={(e) => e.stopPropagation()}>
            <span className="speech-emoji">{activeSpeech.sticker.emoji}</span>
            <h4 className="speech-char-name" style={{ color: activeSpeech.sticker.color }}>
              {activeSpeech.sticker.name}
            </h4>
            <div className="speech-text-box">
              "{activeSpeech.text}"
            </div>
            <button className="action-btn" onClick={() => setActiveSpeech(null)} style={{ background: activeSpeech.sticker.color }}>
              고마워!
            </button>
          </div>
        </div>
      )}

      {/* Data Reset Option */}
      <div className="reset-container">
        <button className="reset-btn" onClick={resetAllData}>
          모험 기록 초기화하기
        </button>
      </div>
    </div>
  );
};
export default StickerBook;
