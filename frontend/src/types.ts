export interface User {
  id: string;
  name: string;
  email: string;
  businessName: string;
}

export interface QuizAnswers {
  revenue: string | null;
  sector: string | null;
  registration: string | null;
}

export interface EligibilityResult {
  status: 'required' | 'exempt' | 'unclear';
  title: string;
  penalty?: string;
  deadline?: string;
  explanation: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  productName: string;
  price: number;
  vatRate: number;
  buyerName: string;
  buyerTaxCode: string;
  totalAmount: number;
  issuedDate: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  urgency: 'high' | 'medium' | 'low';
  dueText: string;
}