import * as XLSX from 'xlsx';
import { Plot, Customer, Transaction, Booking, Project } from '../types';
import { formatDate } from './utils';

export function exportPlotsToExcel(plots: Plot[], project?: Project) {
  const rows = plots.map((p) => ({
    'Plot Number': p.plotNumber,
    'Block': p.blockNumber,
    'Plot Size': p.plotSize,
    'Dimensions': p.dimensions,
    'Category': p.category.toUpperCase(),
    'Status': p.status.toUpperCase(),
    'Price (PKR)': p.totalPlotPrice,
    'Rate Per Sq. Unit': p.pricePerSqUnit,
    'Notes': p.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plots');

  const filename = `${project?.name || 'Al-Basit-Residency'}-Plots-Report.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function exportFinancialTransactionsToExcel(transactions: Transaction[], customers: Customer[], plots: Plot[]) {
  const rows = transactions.map((t) => {
    const cust = customers.find((c) => c.id === t.customerId);
    const plot = plots.find((p) => p.id === t.plotId);
    return {
      'Receipt #': t.receiptNumber,
      'Date': formatDate(t.paymentDate),
      'Customer Name': cust?.fullName || 'N/A',
      'CNIC': cust?.cnic || 'N/A',
      'Plot': plot ? `${plot.plotNumber} (${plot.blockNumber})` : 'N/A',
      'Amount Received (PKR)': t.amountReceived,
      'Previous Balance (PKR)': t.previousBalance,
      'Remaining Balance (PKR)': t.remainingBalance,
      'Payment Method': t.paymentMethod.replace('_', ' ').toUpperCase(),
      'Reference / Cheque #': t.referenceNumber || '',
      'Received By': t.receivedBy,
      'Remarks': t.remarks || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, 'Al-Basit-Financial-Collections-Report.xlsx');
}

export function exportCustomerLedgerToExcel(customers: Customer[], bookings: Booking[]) {
  const rows = customers.map((c) => {
    const custBookings = bookings.filter((b) => b.customerId === c.id);
    const totalPurchased = custBookings.reduce((sum, b) => sum + b.totalPlotPrice, 0);
    const totalPaid = custBookings.reduce((sum, b) => sum + b.totalReceived, 0);
    const balance = custBookings.reduce((sum, b) => sum + b.remainingBalance, 0);

    return {
      'Customer ID': c.id,
      'Full Name': c.fullName,
      "Father's Name": c.fatherName,
      'CNIC': c.cnic,
      'Phone': c.phone,
      'WhatsApp': c.whatsapp,
      'Address': c.address,
      'Plots Owned': custBookings.length,
      'Total Value (PKR)': totalPurchased,
      'Total Paid (PKR)': totalPaid,
      'Outstanding Balance (PKR)': balance,
      'Registration Date': formatDate(c.registrationDate),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Ledger');
  XLSX.writeFile(workbook, 'Al-Basit-Customers-Ledger.xlsx');
}
