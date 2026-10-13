import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Invoice } from '../../types';
import FormField from '../../components/FormField/FormField';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { createInvoice } from '../../lib/api';
import './NewInvoice.css';

interface NewInvoiceProps {
  onInvoiceIssue: (invoice: Invoice) => void;
}

interface FormErrors {
  productName?: string;
  price?: string;
  buyerName?: string;
  general?: string;
}

const VAT_OPTIONS = [
  { value: '5', label: '5%' },
  { value: '8', label: '8%' },
  { value: '10', label: '10%' },
  { value: '0', label: '0% (Exempt)' },
];

export default function NewInvoice({
  onInvoiceIssue,
}: NewInvoiceProps) {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [vatRate, setVatRate] = useState('8');
  const [buyerName, setBuyerName] = useState('');
  const [buyerTaxCode, setBuyerTaxCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const totalAmount = useMemo(() => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) return 0;
    const vat = parseInt(vatRate, 10);
    return Math.round(numPrice * (1 + vat / 100));
  }, [price, vatRate]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!productName.trim()) {
      newErrors.productName = 'Product or service name is required';
    }
    const numPrice = parseFloat(price);
    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!buyerName.trim()) {
      newErrors.buyerName = 'Buyer name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleIssue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const invoice = await createInvoice({
        productName: productName.trim(),
        price: parseFloat(price),
        vatRate: parseInt(vatRate, 10),
        buyerName: buyerName.trim(),
        buyerTaxCode: buyerTaxCode.trim(),
        totalAmount: totalAmount,
      });
      onInvoiceIssue(invoice);
      navigate('/invoice/issued');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to issue invoice';
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen new-invoice-screen">
      <div className="screen-header">
        <h1>New E-Invoice</h1>
        <p>Fill in the details below to issue a compliant invoice</p>
      </div>

      <div className="screen-content">
        {errors.general && (
          <div style={{ color: '#c0392b', background: '#fdecea', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 12 }}>
            {errors.general}
          </div>
        )}
        <div className="invoice-form">
          <div className="invoice-form__section">
            <div className="invoice-form__section-title">Product / Service</div>
            <FormField
              label="Product or Service Name"
              placeholder="e.g. Fresh vegetables, Haircut service"
              value={productName}
              onChange={(v) => { setProductName(v); clearError('productName'); }}
              error={errors.productName}
              required
              name="productName"
            />
            <div style={{ height: 12 }} />
            <FormField
              label="Price (VND)"
              type="number"
              placeholder="e.g. 500000"
              value={price}
              onChange={(v) => { setPrice(v); clearError('price'); }}
              error={errors.price}
              required
              name="price"
            />
            <div style={{ height: 12 }} />
            <FormField
              label="VAT Rate"
              type="select"
              value={vatRate}
              onChange={setVatRate}
              name="vatRate"
              options={VAT_OPTIONS}
            />
          </div>

          <div className="invoice-form__section">
            <div className="invoice-form__section-title">Buyer Information</div>
            <FormField
              label="Buyer Name / Business"
              placeholder="e.g. Nguyen Van A or ABC Company"
              value={buyerName}
              onChange={(v) => { setBuyerName(v); clearError('buyerName'); }}
              error={errors.buyerName}
              required
              name="buyerName"
            />
            <div style={{ height: 12 }} />
            <FormField
              label="Buyer Tax Code"
              placeholder="Optional – e.g. 0123456789"
              value={buyerTaxCode}
              onChange={setBuyerTaxCode}
              name="buyerTaxCode"
            />
          </div>

          {totalAmount > 0 && (
            <div className="invoice-total fade-in">
              <span className="invoice-total__label">Total Amount</span>
              <span className="invoice-total__value">{formatVND(totalAmount)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="invoice-footer">
        <PrimaryButton onClick={handleIssue} loading={loading}>
          Issue invoice
        </PrimaryButton>
      </div>
    </div>
  );
}
