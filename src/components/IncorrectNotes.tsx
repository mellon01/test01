import React, { useState } from 'react';
import { useGame, type IncorrectNote } from '../context/GameContext';
import { ArrowLeft, Trash2, X } from 'lucide-react';
import './IncorrectNotes.css';

interface IncorrectNotesProps {
  onBack: () => void;
}

export const IncorrectNotes: React.FC<IncorrectNotesProps> = ({ onBack }) => {
  const { incorrectNotes, removeIncorrectNote } = useGame();
  
  // States for reviewing
  const [activeSingleSolve, setActiveSingleSolve] = useState<IncorrectNote | null>(null);
  const [singleAnswer, setSingleAnswer] = useState<string>('');
  const [singleFeedback, setSingleFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // States for Batch Reviewing
  const [isBatchReview, setIsBatchReview] = useState<boolean>(false);
  const [batchIndex, setBatchIndex] = useState<number>(0);
  const [batchAnswer, setBatchAnswer] = useState<string>('');
  const [batchFeedback, setBatchFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Sounds
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150.00, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Audio block", e);
    }
  };

  const handleSingleSolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSingleSolve || !singleAnswer) return;

    const numericAns = parseInt(singleAnswer, 10);
    const correctAns = activeSingleSolve.dan * activeSingleSolve.num;

    if (numericAns === correctAns) {
      playBeep('correct');
      setSingleFeedback('correct');
      setTimeout(() => {
        removeIncorrectNote(activeSingleSolve.id);
        setActiveSingleSolve(null);
        setSingleAnswer('');
        setSingleFeedback(null);
      }, 1200);
    } else {
      playBeep('incorrect');
      setSingleFeedback('incorrect');
      setTimeout(() => {
        setSingleFeedback(null);
        setSingleAnswer('');
      }, 1500);
    }
  };

  const handleBatchSolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBatchReview || !batchAnswer) return;

    const currentNote = incorrectNotes[batchIndex];
    const numericAns = parseInt(batchAnswer, 10);
    const correctAns = currentNote.dan * currentNote.num;

    if (numericAns === correctAns) {
      playBeep('correct');
      setBatchFeedback('correct');
      setTimeout(() => {
        removeIncorrectNote(currentNote.id);
        setBatchFeedback(null);
        setBatchAnswer('');
        
        // Move next
        if (batchIndex < incorrectNotes.length - 1) {
          // If we delete the current element, the next element shifts to current index.
          // React state update is async, so we remain at same index or shift based on array length.
          // Since removeIncorrectNote is called, the array size decreases.
          // So we don't necessarily increment index if we just deleted the current item, 
          // because the next item becomes the current index.
          if (batchIndex >= incorrectNotes.length - 1) {
            // Reached end
            setIsBatchReview(false);
            setBatchIndex(0);
          }
        } else {
          setIsBatchReview(false);
          setBatchIndex(0);
        }
      }, 1200);
    } else {
      playBeep('incorrect');
      setBatchFeedback('incorrect');
      setTimeout(() => {
        setBatchFeedback(null);
        setBatchAnswer('');
        // Shift to next even if wrong
        if (batchIndex < incorrectNotes.length - 1) {
          setBatchIndex(prev => prev + 1);
        } else {
          setIsBatchReview(false);
          setBatchIndex(0);
        }
      }, 1500);
    }
  };

  const startBatchReview = () => {
    if (incorrectNotes.length > 0) {
      setIsBatchReview(true);
      setBatchIndex(0);
      setBatchAnswer('');
      setBatchFeedback(null);
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          돌아가기
        </button>
        <h2 className="notes-title">✍️ 별자리 복습 노트</h2>
        <div style={{ width: '90px' }} />
      </div>

      {incorrectNotes.length === 0 ? (
        <div className="empty-notes pop-in">
          <span className="empty-icon">🌟</span>
          <h3 className="empty-title">참 잘했어요! 오답노트가 깨끗해요!</h3>
          <p className="empty-desc">
            틀린 구구단 문제가 하나도 없어요. <br />
            구구단 퀴즈 경기장에서 백 점 스티커에 계속 도전해 보세요!
          </p>
        </div>
      ) : (
        <>
          {/* Batch review banner */}
          <div className="review-all-banner">
            <div className="review-info">
              <div className="review-title-text">별자리 총복습하기</div>
              <div className="review-desc-text">오답 노트에 저장된 {incorrectNotes.length}문제를 퀴즈처럼 순서대로 풀어보아요.</div>
            </div>
            <button className="start-review-btn" onClick={startBatchReview}>
              복습 시작 🎯
            </button>
          </div>

          {/* Individual Equations Grid */}
          <div className="notes-grid">
            {incorrectNotes.map((note) => (
              <div key={note.id} className="note-item-card pop-in">
                <div className="note-formula">
                  {note.dan} × {note.num}
                </div>
                <div className="note-actions">
                  <button 
                    className="note-btn solve-btn"
                    onClick={() => {
                      setActiveSingleSolve(note);
                      setSingleAnswer('');
                      setSingleFeedback(null);
                    }}
                  >
                    풀어보기
                  </button>
                  <button 
                    className="note-btn delete-btn"
                    onClick={() => removeIncorrectNote(note.id)}
                    title="삭제하기"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SINGLE SOLVE MODAL */}
      {activeSingleSolve && (
        <div className="review-modal-overlay">
          <form className="review-modal" onSubmit={handleSingleSolveSubmit}>
            <button 
              type="button" 
              className="close-modal-btn" 
              onClick={() => setActiveSingleSolve(null)}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px', color: 'var(--success)' }}>스스로 다시 풀기</h3>
            
            <div className="review-formula">
              {activeSingleSolve.dan} × {activeSingleSolve.num} = ?
            </div>

            <div className="review-input-group">
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                className="review-input"
                value={singleAnswer}
                onChange={(e) => setSingleAnswer(e.target.value)}
                autoFocus
                disabled={singleFeedback !== null}
              />
              <button 
                type="submit" 
                className="review-submit-btn"
                disabled={singleFeedback !== null}
              >
                확인
              </button>
            </div>

            {singleFeedback === 'correct' && (
              <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
                딩동댕! 오답노트에서 통과! 🎉
              </div>
            )}
            {singleFeedback === 'incorrect' && (
              <div style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
                다시 한 번 고민해 보세요! 😿
              </div>
            )}
          </form>
        </div>
      )}

      {/* BATCH REVIEW SESSION MODAL */}
      {isBatchReview && incorrectNotes.length > 0 && (
        <div className="review-modal-overlay">
          <form className="review-modal" onSubmit={handleBatchSolveSubmit}>
            <button 
              type="button" 
              className="close-modal-btn" 
              onClick={() => setIsBatchReview(false)}
            >
              <X size={20} />
            </button>
            <div className="review-progress font-numeric">
              남은 오답: {incorrectNotes.length}문제
            </div>
            
            <div className="review-formula">
              {incorrectNotes[batchIndex].dan} × {incorrectNotes[batchIndex].num} = ?
            </div>

            <div className="review-input-group">
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                className="review-input"
                value={batchAnswer}
                onChange={(e) => setBatchAnswer(e.target.value)}
                autoFocus
                disabled={batchFeedback !== null}
              />
              <button 
                type="submit" 
                className="review-submit-btn"
                disabled={batchFeedback !== null}
              >
                확인
              </button>
            </div>

            {batchFeedback === 'correct' && (
              <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
                딩동댕! 다음 문제로! 🌟
              </div>
            )}
            {batchFeedback === 'incorrect' && (
              <div style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
                틀렸어요! 정답은 {incorrectNotes[batchIndex].dan * incorrectNotes[batchIndex].num}입니다. 😿
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
export default IncorrectNotes;
