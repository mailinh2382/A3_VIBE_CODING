import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizAnswers } from '../../types';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import RadioCardGroup from '../../components/RadioCardGroup/RadioCardGroup';
import './EligibilityQuiz.css';

interface EligibilityQuizProps {
  quizAnswers: QuizAnswers;
  onQuizComplete: (answers: QuizAnswers) => void;
}

const STEPS = [
  {
    key: 'revenue' as const,
    question: 'What is your estimated yearly revenue?',
    options: [
      { value: 'under_100m', title: 'Under 100M VND', desc: 'Exempt from regular e-invoice mandate' },
      { value: '100m_1b', title: '100M – 1B VND', desc: 'Mandatory for wholesale & services' },
      { value: 'over_1b', title: 'Over 1B VND', desc: 'Mandatory for all business sectors' },
    ],
  },
  {
    key: 'sector' as const,
    question: 'What type of business do you operate?',
    options: [
      { value: 'retail', title: 'Retail / Small shop', desc: 'Selling goods directly to consumers' },
      { value: 'services', title: 'Services', desc: 'Providing services to customers' },
      { value: 'wholesale', title: 'Wholesale / Distribution', desc: 'Selling goods to other businesses' },
      { value: 'mixed', title: 'Mixed / Online seller', desc: 'Combination of goods and services' },
    ],
  },
  {
    key: 'registration' as const,
    question: 'Are you currently registered for e-invoicing?',
    options: [
      { value: 'no', title: 'No, not yet', desc: 'I haven\'t started the registration process' },
      { value: 'planning', title: 'Planning to register', desc: 'I\'m looking into how to get started' },
      { value: 'yes', title: 'Yes, already registered', desc: 'I have an active e-invoice account' },
    ],
  },
];

export default function EligibilityQuiz({ quizAnswers, onQuizComplete }: EligibilityQuizProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(quizAnswers);

  const step = STEPS[currentStep];
  const selectedValue = answers[step.key];
  const isLastStep = currentStep === STEPS.length - 1;
  const canProceed = !!selectedValue;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.key]: value }));
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (isLastStep) {
      onQuizComplete(answers);
      navigate('/quiz/result');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="screen quiz-screen">
      <div className="quiz-progress">
        <div className="quiz-progress__bar">
          <div className="quiz-progress__fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="quiz-progress__text">Step {currentStep + 1} of {STEPS.length}</div>
      </div>

      <div className="quiz-step" key={currentStep}>
        <h2 className="quiz-step__question">{step.question}</h2>
        <RadioCardGroup options={step.options} value={selectedValue ?? undefined} onValueChange={handleSelect} name={step.key} />
      </div>

      <div className="quiz-footer">
        <PrimaryButton onClick={handleNext} disabled={!canProceed}>
          {isLastStep ? 'See my result' : 'Next question'}
        </PrimaryButton>
        {currentStep > 0 && (
          <div className="quiz-footer__back">
            <button onClick={handleBack}>← Back to previous question</button>
          </div>
        )}
      </div>
    </div>
  );
}