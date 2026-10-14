import { useNavigate } from 'react-router-dom';
import type { EligibilityResult } from '../../types';
import StatCard from '../../components/StatCard/StatCard';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import './QuizResult.css';

interface QuizResultProps {
  eligibilityResult: EligibilityResult | null;
}

export default function QuizResult({ eligibilityResult }: QuizResultProps) {
  const navigate = useNavigate();

  if (!eligibilityResult) {
    return (
      <div className="screen quiz-result-screen">
        <div className="screen-header">
          <h1>No Result</h1>
          <p>Please complete the eligibility quiz first.</p>
        </div>
        <PrimaryButton onClick={() => navigate('/quiz')}>Take the quiz</PrimaryButton>
      </div>
    );
  }

  const { status, title, penalty, deadline, explanation } = eligibilityResult;
  const statusIcon = status === 'required' ? '⚠️' : status === 'exempt' ? '✅' : 'ℹ️';

  return (
    <div className="screen quiz-result-screen">
      <div className="screen-header">
        <h1>Your Compliance Result</h1>
        <p>Based on your answers, here's what you need to know</p>
      </div>

      <div className="screen-content">
        <div className={`result-status result-status--${status}`}>
          <div className="result-status__icon">{statusIcon}</div>
          <div className="result-status__title">{title}</div>
          <div className="result-status__subtitle">
            {status === 'required' ? 'Action required for compliance' : status === 'exempt' ? 'No immediate action needed' : 'Further assessment recommended'}
          </div>
        </div>

        <div className="result-details">
          {penalty && <StatCard label="Penalty for non-compliance" value={penalty} variant="warning" sub="If you fail to comply with e-invoice regulations" />}
          {deadline && <StatCard label="Registration deadline" value={deadline} variant="neutral" sub="Register before this date to avoid penalties" />}
        </div>

        <div className="result-explanation">{explanation}</div>
      </div>

      <div className="result-footer">
        <PrimaryButton onClick={() => navigate('/invoice/new')}>Register & Create Invoice</PrimaryButton>
        <div className="result-footer__secondary">
          <button onClick={() => navigate('/quiz')}>Retake the quiz</button>
        </div>
      </div>
    </div>
  );
}