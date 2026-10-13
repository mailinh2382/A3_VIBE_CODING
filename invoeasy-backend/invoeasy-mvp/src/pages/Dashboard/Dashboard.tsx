import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Invoice, ChecklistItem } from '../../types';
import StatCard from '../../components/StatCard/StatCard';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { fetchInvoices } from '../../lib/api';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const MOCK_CHECKLIST: ChecklistItem[] = [
  {
    id: '1',
    text: 'Submit quarterly tax report',
    urgency: 'high',
    dueText: 'Due in 5 days',
  },
  {
    id: '2',
    text: 'Renew e-invoice certificate',
    urgency: 'high',
    dueText: 'Expires soon',
  },
  {
    id: '3',
    text: 'Update business registration info',
    urgency: 'medium',
    dueText: 'Due in 2 weeks',
  },
  {
    id: '4',
    text: 'Verify buyer tax codes',
    urgency: 'low',
    dueText: 'No deadline',
  },
];

export default function Dashboard({
  user,
  onLogout,
}: DashboardProps) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchInvoices()
      .then((data) => {
        if (!cancelled) {
          setInvoices(data);
          setInvoiceError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setInvoiceError(err instanceof Error ? err.message : 'Failed to load invoices');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingInvoices(false);
      });
    return () => { cancelled = true; };
  }, []);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const currentMonth = new Date().toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const recentInvoices = invoices.slice(-3).reverse();

  return (
    <div className="screen dashboard-screen">
      <div className="dashboard-header fade-in">
        <div className="dashboard-greeting">
          <div className="dashboard-greeting__hello">Hello,</div>
          <div className="dashboard-greeting__name">{user.name}</div>
          <div className="dashboard-greeting__business">{user.businessName}</div>
        </div>
        <button className="dashboard-logout" onClick={onLogout}>
          Log out
        </button>
      </div>

      <div className="dashboard-stats fade-in">
        <StatCard
          label="Invoices this month"
          value={String(invoices.length)}
          variant="success"
          sub={currentMonth}
        />
        <StatCard
          label="Next Deadline"
          value="5 days"
          variant="warning"
          sub="Quarterly tax report"
        />
      </div>

      <div className="dashboard-section fade-in">
        <div className="dashboard-section__title">
          📋 Compliance Checklist
        </div>
        <div className="checklist">
          {MOCK_CHECKLIST.map((item) => (
            <div key={item.id} className="checklist-item">
              <div className={`checklist-dot checklist-dot--${item.urgency}`} />
              <div className="checklist-item__content">
                <div className="checklist-item__text">{item.text}</div>
                <div
                  className={`checklist-item__due${
                    item.urgency === 'high'
                      ? ' checklist-item__due--urgent'
                      : ''
                  }`}
                >
                  {item.dueText}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loadingInvoices && (
        <div className="dashboard-section fade-in" style={{ textAlign: 'center', color: '#888' }}>
          Loading invoices…
        </div>
      )}
      {invoiceError && (
        <div className="dashboard-section fade-in" style={{ color: '#c0392b', background: '#fdecea', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}>
          {invoiceError}
        </div>
      )}
      {recentInvoices.length > 0 && (
        <div className="dashboard-section fade-in">
          <div className="dashboard-section__title">
            🧾 Recent Invoices
          </div>
          <div className="recent-invoices">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="recent-invoice">
                <div className="recent-invoice__info">
                  <span className="recent-invoice__number">
                    #{inv.invoiceNumber}
                  </span>
                  <span className="recent-invoice__buyer">
                    {inv.buyerName} · {inv.issuedDate}
                  </span>
                </div>
                <span className="recent-invoice__amount">
                  {formatVND(inv.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-fab">
        <PrimaryButton onClick={() => navigate('/invoice/new')}>
          + Issue New Invoice
        </PrimaryButton>
      </div>
    </div>
  );
}
