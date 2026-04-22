import { DashboardPlaceholderPage } from '@/components/dashboard-placeholder-page';

export default function BooksExpensesPage() {
  return (
    <DashboardPlaceholderPage
      title="Expenses"
      description="Placeholder expense ledger with summary cards, filters, and approval actions."
      stats={[
        { value: '₹1.8L', label: 'This month spend' },
        { value: '₹42K', label: 'Pending approvals' },
        { value: '28', label: 'Transactions' },
        { value: '--', label: 'Chart binding' }
      ]}
      columns={['Date', 'Category', 'Amount', 'Action']}
      rows={[
        ['22 Apr 2026', 'Travel', '₹12,000', 'Approve'],
        ['21 Apr 2026', 'Software', '₹8,500', 'Review'],
        ['20 Apr 2026', 'Ops', '₹3,200', 'View']
      ]}
    />
  );
}