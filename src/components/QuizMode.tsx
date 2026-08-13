import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, RotateCcw, Home as HomeIcon } from 'lucide-react';
import './QuizMode.css';

interface QuizModeProps {
  onBack: () => void;
}

interface Question {
  dan: number;
  num: number;
  answer: number;
  options: number[];
}

interface Sparkle {
  id: number;
  emoji: string;
  left: string;
  delay: string;
  color: string;
}

export const QuizMode: React.FC<QuizModeProps> = ({ onBack }) => {
  const { addSticker, addIncorrectNote, stickerList } = useGame();
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [quizDan, setQuizDan] = useState<number | 'mix'>(2);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [incorrectList, setIncorrectList] = useState<{ dan: number; num: number }[]>([]);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(10); // 10 seconds
  const timerRef = useRef<any>(null);
  
  // Feedback overlay
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'timeout' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Sparkles
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  // Sound synthesis helpers
  const playBeep = (type: 'correct' | 'incorrect') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'correct') {
        // High double beep
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        // Low buzzer sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150.00, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("AudioContext block", e);
    }
  };

  const playFanfare = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    try {
      const ctx = new AudioContext();
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Do-Mi-Sol-Do-Mi-Sol-Do
      notes.forEach((freq, index) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }, index * 120);
      });
    } catch (e) {
      console.warn("AudioContext block", e);
    }
  };

  // Generate unique sparkles
  const triggerSparkles = () => {
    const newSparkles: Sparkle[] = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: ['⭐', '✨', '🎈', '🎉', '☄️'][Math.floor(Math.random() * 5)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`
    }));
    setSparkles(newSparkles);
  };

  // Timer Tick Logic
  useEffect(() => {
    if (gameState === 'playing' && feedback === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current!);
            handleTimeout();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, feedback]);

  const generateQuiz = () => {
    const list: Question[] = [];
    const numQuestions = 10;
    
    for (let i = 0; i < numQuestions; i++) {
      // 1. Pick Dan
      let dan = 2;
      if (quizDan === 'mix') {
        dan = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
      } else {
        dan = quizDan;
      }
      
      // 2. Pick Multiplier
      const num = Math.floor(Math.random() * 9) + 1; // 1 ~ 9
      const answer = dan * num;
      
      // 3. Generate Options
      const optionsSet = new Set<number>();
      optionsSet.add(answer);
      
      // Add plausible wrong answers
      while (optionsSet.size < 4) {
        // Try creating wrong answers by mutating dan or num, or random nearby values
        const seed = Math.random();
        let wrong = answer;
        if (seed < 0.3) {
          wrong = dan * (num + (Math.random() > 0.5 ? 1 : -1));
        } else if (seed < 0.6) {
          wrong = (dan + (Math.random() > 0.5 ? 1 : -1)) * num;
        } else {
          wrong = answer + (Math.floor(Math.random() * 7) - 3) * 2;
        }
        
        // Ensure values are positive, not equal to correct answer, and logical
        if (wrong > 0 && wrong !== answer && wrong <= 90) {
          optionsSet.add(wrong);
        }
      }
      
      // Shuffle options
      const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
      
      list.push({ dan, num, answer, options });
    }
    
    setQuestions(list);
    setCurrentIndex(0);
    setScore(0);
    setIncorrectList([]);
    setFeedback(null);
    setSelectedOption(null);
    setTimeLeft(10);
    setGameState('playing');
  };

  const handleTimeout = () => {
    playBeep('incorrect');
    setFeedback('timeout');
    const currentQ = questions[currentIndex];
    addIncorrectNote(currentQ.dan, currentQ.num);
    setIncorrectList(prev => [...prev, { dan: currentQ.dan, num: currentQ.num }]);
    
    setTimeout(() => {
      goToNextQuestion();
    }, 1800);
  };

  const handleAnswer = (option: number) => {
    if (feedback !== null) return; // Ignore multiple clicks
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(option);
    
    const currentQ = questions[currentIndex];
    if (option === currentQ.answer) {
      playBeep('correct');
      setFeedback('correct');
      setScore(prev => prev + 10);
    } else {
      playBeep('incorrect');
      setFeedback('incorrect');
      addIncorrectNote(currentQ.dan, currentQ.num);
      setIncorrectList(prev => [...prev, { dan: currentQ.dan, num: currentQ.num }]);
    }

    setTimeout(() => {
      goToNextQuestion();
    }, 1800);
  };

  const goToNextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setTimeLeft(10);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Game Over
      setGameState('result');
      // If 100 points and not mixed, award sticker
      const finalScore = score + (feedback === 'correct' ? 10 : 0); // Include latest score if correct
      if (finalScore === 100 && quizDan !== 'mix') {
        addSticker(quizDan);
        triggerSparkles();
        playFanfare();
      }
    }
  };

  const restartQuiz = () => {
    generateQuiz();
  };

  // Get sticker metadata for display
  const currentSticker = quizDan !== 'mix' ? stickerList.find(s => s.dan === quizDan) : null;

  return (
    <div className="quiz-container">
      {/* HUD Star shower */}
      {sparkles.length > 0 && (
        <div className="star-shower-container">
          {sparkles.map((sp) => (
            <span
              key={sp.id}
              className="sparkle-star"
              style={{
                left: sp.left,
                animationDelay: sp.delay,
                color: sp.color
              }}
            >
              {sp.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          돌아가기
        </button>
        <h2 className="quiz-title">🚀 구구단 퀴즈 경기장</h2>
        <div style={{ width: '90px' }} />
      </div>

      {/* 1. SETUP GAME */}
      {gameState === 'setup' && (
        <div className="quiz-setup">
          <h3 className="setup-title">도전할 단을 선택해 주세요!</h3>
          <div className="setup-grid">
            {stickerList.map((st) => (
              <button
                key={st.dan}
                className={`setup-btn ${quizDan === st.dan ? 'active' : ''}`}
                onClick={() => setQuizDan(st.dan)}
              >
                {st.dan}단 {st.emoji}
              </button>
            ))}
            <button
              className={`setup-btn mix-btn ${quizDan === 'mix' ? 'active' : ''}`}
              onClick={() => setQuizDan('mix')}
            >
              ⭐ 섞어서 종합 도전! (모든 단 랜덤) ⭐
            </button>
          </div>
          <button className="action-btn restart-btn" onClick={generateQuiz} style={{ maxWidth: '300px', width: '100%', fontSize: '1.25rem' }}>
            우주선 출발! 🚀
          </button>
        </div>
      )}

      {/* 2. PLAYING GAME */}
      {gameState === 'playing' && questions.length > 0 && (
        <div className="quiz-play-area">
          {/* Feedback overlays */}
          {feedback === 'correct' && (
            <div className="feedback-overlay correct">
              <div className="feedback-text">
                <span>정답! 🎉</span>
                <span className="feedback-sub">참 잘했어요! 👏👏</span>
              </div>
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="feedback-overlay incorrect">
              <div className="feedback-text">
                <span>아쉬워요! 😢</span>
                <span className="feedback-sub">정답은 {questions[currentIndex].answer}입니다. (오답노트에 추가!)</span>
              </div>
            </div>
          )}
          {feedback === 'timeout' && (
            <div className="feedback-overlay incorrect">
              <div className="feedback-text">
                <span>시간 초과! ⏰</span>
                <span className="feedback-sub">더 신속하게 고민해 보아요! (정답: {questions[currentIndex].answer})</span>
              </div>
            </div>
          )}

          {/* Hud */}
          <div className="quiz-hud">
            <div className="hud-item font-numeric">
              문제 {currentIndex + 1} / 10
            </div>
            <div className="hud-item score-item font-numeric">
              점수: {score}점
            </div>
          </div>

          {/* Progress Bar (Timer) */}
          <div className="timer-container">
            <div
              className={`timer-fill ${timeLeft <= 3 ? 'warning' : ''}`}
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="question-box">
            <div className="question-text">
              {questions[currentIndex].dan} × {questions[currentIndex].num} = ?
            </div>
          </div>

          {/* Multiple choice options */}
          <div className="options-grid">
            {questions[currentIndex].options.map((option, index) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={index}
                  className="option-card"
                  onClick={() => handleAnswer(option)}
                  disabled={feedback !== null}
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : '',
                    borderColor: isSelected ? 'var(--accent)' : ''
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. RESULT PAGE */}
      {gameState === 'result' && (
        <div className="quiz-result">
          {score === 100 ? (
            <div className="result-badge-anim">
              {currentSticker ? currentSticker.emoji : '🏆'}
            </div>
          ) : (
            <div className="result-badge-anim">🎖️</div>
          )}
          
          <h3 className="result-score-title">퀴즈 완료 결과!</h3>
          <div className="result-score">{score}점</div>
          
          <div className="result-message">
            {score === 100 ? (
              quizDan === 'mix' ? (
                <span>대단해요! 종합 구구단 퀴즈를 만점 받았어요! <br />우주 최강 구구단 달인입니다! 🛸✨</span>
              ) : (
                <span>축하합니다! 100점입니다! <br /><strong>{quizDan}단 마스터!</strong> <br /><strong>[{currentSticker?.name} 스티커]</strong>를 수집했어요! 💖🐰</span>
              )
            ) : score >= 80 ? (
              <span>조금만 더 노력하면 만점이에요! <br />틀린 문제는 별자리 오답노트에서 확인하고 다시 도전해 봐요! 🚀</span>
            ) : (
              <span>구구단 탐험관에서 원리 공부를 다시 해보는 건 어떨까요?<br /> 포기하지 말고 별자리 복습 노트를 잘 활용해 보세요! 💪</span>
            )}
          </div>

          {/* Correct/Incorrect Stats summary */}
          {incorrectList.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '15px', padding: '15px', marginBottom: '25px', fontSize: '0.95rem' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>틀렸던 문제 복습 목록:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {incorrectList.map((item, idx) => (
                  <span key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '10px', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>
                    {item.dan} × {item.num}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="result-actions">
            <button className="action-btn restart-btn" onClick={restartQuiz}>
              <RotateCcw size={18} />
              다시 도전
            </button>
            <button className="action-btn" onClick={() => setGameState('setup')}>
              다른 단 도전
            </button>
            <button className="action-btn" onClick={onBack}>
              <HomeIcon size={18} />
              메인 홈으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuizMode;
