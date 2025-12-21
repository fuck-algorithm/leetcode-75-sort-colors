import { useEffect, useState, useCallback, useRef } from 'react';
import { getSpeed, saveSpeed } from '../utils/indexedDB';
import '../styles/ControlPanel.css';

interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function ControlPanel({
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onReset,
  onSeek,
  onSpeedChange,
}: ControlPanelProps) {
  const [speed, setSpeed] = useState(1);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    getSpeed().then((s) => {
      setSpeed(s);
      onSpeedChange(s);
    });
  }, [onSpeedChange]);

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    saveSpeed(newSpeed);
    onSpeedChange(newSpeed);
  }, [onSpeedChange]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onPlay, onPause, onPrev, onNext, onReset]);

  // 进度条拖拽
  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const step = Math.round(percent * (totalSteps - 1));
    onSeek(Math.max(0, Math.min(totalSteps - 1, step)));
  }, [totalSteps, onSeek]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressClick(e);
  }, [handleProgressClick]);

  const handleProgressMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleProgressClick(e);
    }
  }, [isDragging, handleProgressClick]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="control-panel">
      <div className="control-buttons">
        <button
          className="control-btn"
          onClick={onPrev}
          disabled={currentStep === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
          上一步
          <span className="shortcut-hint">←</span>
        </button>

        <button
          className="control-btn primary"
          onClick={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              暂停
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              播放
            </>
          )}
          <span className="shortcut-hint">空格</span>
        </button>

        <button
          className="control-btn"
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
        >
          下一步
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
          <span className="shortcut-hint">→</span>
        </button>

        <button className="control-btn" onClick={onReset}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          重置
          <span className="shortcut-hint">R</span>
        </button>
      </div>

      <div className="speed-control">
        <span className="speed-label">播放速度：</span>
        <div className="speed-slider-container">
          <input
            type="range"
            className="speed-slider"
            min="0.25"
            max="3"
            step="0.25"
            value={speed}
            onChange={handleSpeedChange}
          />
          <span className="speed-value">{speed}x</span>
        </div>
      </div>

      <div
        ref={progressRef}
        className="progress-container"
        onMouseDown={handleProgressMouseDown}
        onMouseMove={handleProgressMouseMove}
        onMouseUp={handleProgressMouseUp}
      >
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <div
          className="progress-handle"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="progress-info">
        <span>步骤 {currentStep + 1} / {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
