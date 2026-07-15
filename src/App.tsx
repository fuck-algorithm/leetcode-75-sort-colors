import { useState, useCallback, useEffect, useRef } from 'react';
import { Color, AlgorithmType, AlgorithmStep } from './types';
import { algorithms, generateSteps, algorithmExplanations } from './algorithms';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { AlgorithmTabs } from './components/AlgorithmTabs';
import { Canvas } from './components/Canvas';
import { CodePanel } from './components/CodePanel';
import { ControlPanel } from './components/ControlPanel';
import { Modal } from './components/Modal';
import { FloatingBall } from './components/FloatingBall';
import './styles/App.css';

const DEFAULT_DATA: Color[] = [2, 0, 2, 1, 1, 0];

function App() {
  const [inputData, setInputData] = useState<Color[]>(DEFAULT_DATA);
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('single-pointer');
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  
  const playIntervalRef = useRef<number | null>(null);

  // 生成步骤
  useEffect(() => {
    const newSteps = generateSteps(algorithmType, inputData);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [inputData, algorithmType]);

  // 播放控制
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, speed, steps.length]);

  const handleApplyData = useCallback((data: Color[]) => {
    setInputData(data);
  }, []);

  const handleAlgorithmChange = useCallback((type: AlgorithmType) => {
    setAlgorithmType(type);
  }, []);

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, steps.length]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePrev = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const handleSeek = useCallback((step: number) => {
    setIsPlaying(false);
    setCurrentStep(step);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  const currentStepData = steps[currentStep] || steps[0];
  const algorithmInfo = algorithms[algorithmType];

  if (!currentStepData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <Header onShowAlgorithmInfo={() => setShowAlgorithmInfo(true)} />
      <InputPanel onApply={handleApplyData} currentData={inputData} />
      <AlgorithmTabs
        activeAlgorithm={algorithmType}
        onAlgorithmChange={handleAlgorithmChange}
      />

      <div className="main-content">
        <div className="visualization-area">
          <Canvas step={currentStepData} algorithmType={algorithmType} />
          <ControlPanel
            currentStep={currentStep}
            totalSteps={steps.length}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onPrev={handlePrev}
            onNext={handleNext}
            onReset={handleReset}
            onSeek={handleSeek}
            onSpeedChange={handleSpeedChange}
          />
        </div>
        <CodePanel algorithmInfo={algorithmInfo} step={currentStepData} />
      </div>

      <FloatingBall />

      <Modal
        isOpen={showAlgorithmInfo}
        onClose={() => setShowAlgorithmInfo(false)}
        title="算法思路"
      >
        <div
          dangerouslySetInnerHTML={{
            __html: algorithmExplanations[algorithmType]
              .replace(/## /g, '<h2>')
              .replace(/### /g, '<h3>')
              .replace(/\n- /g, '<br>• ')
              .replace(/\n\n/g, '</p><p>')
              .replace(/`([^`]+)`/g, '<code>$1</code>'),
          }}
        />
      </Modal>
    </div>
  );
}

export default App;
