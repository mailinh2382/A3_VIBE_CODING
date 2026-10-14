import { useNavigate } from 'react-router-dom';
import type { Invoice } from '../../types';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import './InvoiceIssued.css';

interface InvoiceIssuedProps {
  currentInvoice: Invoice | null;
}

export default function InvoiceIssued({ currentInvoice }: InvoiceIssuedProps) {
  const navigate = useNavigate();

  if (!currentInvoice) {
    return (
      <div className="screen issued-screen">
        <div className="screen-header">
          <h1>No Invoice</h1>
          <p>Please create an invoice first.</p>
        </div>
        <PrimaryButton onClick={() => navigate('/invoice/new')}>Create invoice</PrimaryButton>
      </div>
    );
  }

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + ' VND';

  return (
    <div className="screen issued-screen">
      <div className="issued-success">
        <div className="issued-checkmark">✓</div>
        <h2 className="issued-title">Invoice Issued!</h2>
        <p className="issued-subtitle">Successfully declared & authorized by tax authorities.</p>
      </div>

      <div className="issued-details">
        <div className="issued-details__row">
          <span className="issued-details__label">Invoice Number</span>
          <span className="issued-details__value">#{currentInvoice.invoiceNumber}</span>
        </div>
        <div className="issued-details__row">
          <span className="issued-details__label">Date</span>
          <span className="issued-details__value">{currentInvoice.issuedDate}</span>
        </div>
        <div className="issued-details__row">
          <span className="issued-details__label">Product / Service</span>
          <span className="issued-details__value">{currentInvoice.productName}</span>
        </div>
        <div className="issued-details__row">
          <span className="issued-details__label">Buyer</span>
          <span className="issued-details__value">{currentInvoice.buyerName}</span>
        </div>
        <div className="issued-details__row">
          <span className="issued-details__label">VAT Rate</span>
          <span className="issued-details__value">{currentInvoice.vatRate}%</span>
        </div>
        <div className="issued-details__row">
          <span className="issued-details__label">Total Amount</span>
          <span className="issued-details__value issued-details__value--highlight">{formatVND(currentInvoice.totalAmount)}</span>
        </div>
      </div>

      <div className="issued-footer">
        <PrimaryButton onClick={() => navigate('/dashboard')}>Return to dashboard</PrimaryButton>
      </div>
    </div>
  );
}