import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type {
  User,
  QuizAnswers,
  EligibilityResult,
  Invoice,
} from './types';
import Login from './pages/Login/Login';
import EligibilityQuiz from './pages/EligibilityQuiz/EligibilityQuiz';
import QuizResult from './pages/QuizResult/QuizResult';
import NewInvoice from './pages/NewInvoice/NewInvoice';
import InvoiceIssued from './pages/InvoiceIssued/InvoiceIssued';
import Dashboard from './pages/Dashboard/Dashboard';
import { supabase } from './lib/supabase';
import './App.css';

function computeEligibility(answers: QuizAnswers): EligibilityResult {
  const { revenue, sector, registration } = answers;

  // Over 1B VND → always required
  if (revenue === 'over_1b') {
    return {
      status: 'required',
      title: 'E-Invoicing Required',
      penalty: 'Up to 20M VND',
      deadline: 'July 1, 2026',
      explanation:
        'With revenue over 1 billion VND, your business is required to use e-invoices across all sectors. Register with the tax authority as soon as possible to avoid penalties.',
    };
  }

  // 100M–1B VND
  if (revenue === '100m_1b') {
    if (sector === 'wholesale' || sector === 'services') {
      return {
        status: 'required',
        title: 'E-Invoicing Required',
        penalty: 'Up to 20M VND',
        deadline: 'July 1, 2026',
        explanation:
          'Businesses in the wholesale and services sector with revenue between 100M and 1B VND are required to issue e-invoices. You should begin the registration process now.',
      };
    }
    // retail or mixed
    return {
      status: 'unclear',
      title: 'Likely Required Soon',
      penalty: 'Up to 10M VND',
      deadline: 'July 1, 2026',
      explanation:
        'While your sector may not be fully mandated yet, the e-invoice requirement is expanding. We recommend starting the registration process now to be prepared.',
    };
  }

  // Under 100M VND
  if (revenue === 'under_100m') {
    if (registration === 'yes') {
      return {
        status: 'unclear',
        title: 'Voluntary Registration',
        explanation:
          'You are currently below the mandatory threshold, but since you\'re already registered, we recommend continuing to use e-invoices. It builds trust with buyers and prepares you for growth.',
      };
    }
    return {
      status: 'exempt',
      title: 'Likely Exempt',
      explanation:
        'Businesses with annual revenue under 100M VND are generally exempt from the e-invoice mandate under Decree 123. However, you may still voluntarily register to build credibility with customers.',
    };
  }

  // Fallback
  return {
    status: 'unclear',
    title: 'Assessment Incomplete',
    explanation:
      'We need more information to determine your e-invoice obligations. Please retake the quiz with accurate details for the best guidance.',
  };
}

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata ?? {};
        setUser({
          id: session.user.id,
          name: meta.name ?? session.user.email?.split('@')[0] ?? 'User',
          email: session.user.email ?? '',
          businessName: meta.business_name ?? 'My Business',
        });
        setIsAuthenticated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
    revenue: null,
    sector: null,
    registration: null,
  });
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);

  // Invoice state
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Callbacks
  const handleLogin = useCallback((newUser: User) => {
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  const handleQuizComplete = useCallback((answers: QuizAnswers) => {
    setQuizAnswers(answers);
    setEligibilityResult(computeEligibility(answers));
  }, []);

  const handleInvoiceIssue = useCallback((invoice: Invoice) => {
    setCurrentInvoice(invoice);
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/quiz"
            element={
              <EligibilityQuiz
                quizAnswers={quizAnswers}
                onQuizComplete={handleQuizComplete}
              />
            }
          />
          <Route
            path="/quiz/result"
            element={<QuizResult eligibilityResult={eligibilityResult} />}
          />
          <Route
            path="/invoice/new"
            element={
              <NewInvoice
                onInvoiceIssue={handleInvoiceIssue}
              />
            }
          />
          <Route
            path="/invoice/issued"
            element={<InvoiceIssued currentInvoice={currentInvoice} />}
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated && user ? (
                <Dashboard
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

