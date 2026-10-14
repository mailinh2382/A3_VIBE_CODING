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
    return {
      status: 'unclear',
      title: 'Likely Required Soon',
      penalty: 'Up to 10M VND',
      deadline: 'July 1, 2026',
      explanation:
        'While your sector may not be fully mandated yet, the e-invoice requirement is expanding. We recommend starting the registration process now to be prepared.',
    };
  }

  if (revenue === 'under_100m') {
    if (registration === 'yes') {
      return {
        status: 'unclear',
        title: 'Voluntary Registration',
        explanation:
          'You are currently below the mandatory threshold, but since you\'re already registered, we recommend continuing to use e-invoices.',
      };
    }
    return {
      status: 'exempt',
      title: 'Likely Exempt',
      explanation:
        'Businesses with annual revenue under 100M VND are generally exempt from the e-invoice mandate under Decree 123.',
    };
  }

  return {
    status: 'unclear',
    title: 'Assessment Incomplete',
    explanation:
      'We need more information to determine your e-invoice obligations. Please retake the quiz.',
  };
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
    revenue: null,
    sector: null,
    registration: null,
  });
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

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
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/quiz" element={
            <EligibilityQuiz quizAnswers={quizAnswers} onQuizComplete={handleQuizComplete} />
          } />
          <Route path="/quiz/result" element={<QuizResult eligibilityResult={eligibilityResult} />} />
          <Route path="/invoice/new" element={<NewInvoice onInvoiceIssue={handleInvoiceIssue} />} />
          <Route path="/invoice/issued" element={<InvoiceIssued currentInvoice={currentInvoice} />} />
          <Route path="/dashboard" element={
            isAuthenticated && user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}