import { jsPDF } from 'jspdf';
import { Transaction, Customer, Plot, Project, Booking } from '../types';
import { formatPKR, formatDate } from './utils';

export function exportPaymentReceiptPdf(
  transaction: Transaction,
  customer: Customer | undefined,
  plot: Plot | undefined,
  project: Project | undefined
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // A5 receipt format
  });

  const primaryColor = [11, 25, 44]; // Deep Navy #0B192C
  const goldColor = [197, 168, 90]; // Luxury Gold #C5A85A
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];

  // Header Background Accent Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 148, 28, 'F');

  // Gold separator line
  doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.rect(0, 28, 148, 2, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AL-BASIT BUILDERS', 74, 11, { align: 'center' });

  // Project Name & Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.text(project?.name?.toUpperCase() || 'AL-BASIT RESIDENCY', 74, 17, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('OFFICIAL PAYMENT RECEIPT & ACKNOWLEDGEMENT', 74, 23, { align: 'center' });

  // Receipt Meta Grid
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', 12, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.receiptNumber, 36, 38);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 95, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(transaction.paymentDate), 110, 38);

  // Border frame for details
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(10, 44, 128, 64, 2, 2, 'D');

  // Customer Information Section
  doc.setFillColor(248, 250, 252);
  doc.rect(10.5, 44.5, 127, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CUSTOMER & PROPERTY DETAILS', 14, 49.5);

  let y = 57;
  const lineH = 6;

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Customer Name:', 14, y);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(customer?.fullName || 'N/A', 46, y);

  y += lineH;
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text("Father's Name:", 14, y);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(customer?.fatherName || '-', 46, y);

  y += lineH;
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('CNIC No:', 14, y);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(customer?.cnic || '-', 46, y);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Phone:', 80, y);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(customer?.phone || '-', 95, y);

  y += lineH + 1;
  doc.setDrawColor(241, 245, 249);
  doc.line(14, y - 2, 134, y - 2);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Plot Number:', 14, y);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(plot ? `${plot.plotNumber} (${plot.blockNumber})` : 'N/A', 46, y);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Plot Size:', 80, y);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(plot?.plotSize || '-', 98, y);

  y += lineH;
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Payment Mode:', 14, y);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(transaction.paymentMethod.replace('_', ' ').toUpperCase(), 46, y);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Ref / Cheque:', 80, y);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(transaction.referenceNumber || 'Cash Desk', 102, y);

  // Big Amount Box
  const amountBoxY = 114;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(10, amountBoxY, 128, 22, 2, 2, 'F');

  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AMOUNT RECEIVED', 74, amountBoxY + 6.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(transaction.amountReceived), 74, amountBoxY + 15, { align: 'center' });

  // Balance breakdown box
  const balY = 141;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, balY, 128, 16, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, balY, 128, 16, 1.5, 1.5, 'D');

  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Previous Balance:', 14, balY + 6);
  doc.text('This Payment:', 58, balY + 6);
  doc.text('Remaining Balance:', 96, balY + 6);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(transaction.previousBalance), 14, balY + 12);
  doc.setTextColor(16, 185, 129); // green
  doc.text(formatPKR(transaction.amountReceived), 58, balY + 12);
  doc.setTextColor(225, 29, 72); // red
  doc.text(formatPKR(transaction.remainingBalance), 96, balY + 12);

  // Signature Block
  const sigY = 172;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Received By: ${transaction.receivedBy || 'Authorized Officer'}`, 14, sigY);

  doc.setDrawColor(148, 163, 184);
  doc.line(95, sigY + 6, 134, sigY + 6);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFontSize(7);
  doc.text('Authorized Signature', 114, sigY + 10, { align: 'center' });

  // Footer Note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated official receipt issued by Al-Basit Builders.', 74, 196, { align: 'center' });
  doc.text('Subject to realization of bank instruments. Preserved in immutable transaction ledger.', 74, 200, { align: 'center' });

  doc.save(`${transaction.receiptNumber}.pdf`);
}

export function exportCustomerStatementPdf(
  customer: Customer,
  plots: Plot[],
  bookings: Booking[],
  transactions: Transaction[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [11, 25, 44];
  const goldColor = [197, 168, 90];

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.rect(0, 32, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AL-BASIT BUILDERS', 105, 13, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.text('CUSTOMER ACCOUNT & FINANCIAL STATEMENT', 105, 21, { align: 'center' });

  // Customer Summary
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Name:', 14, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.fullName, 46, 44);

  doc.setFont('helvetica', 'bold');
  doc.text("Father's Name:", 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.fatherName || '-', 46, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('CNIC:', 120, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.cnic, 135, 44);

  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', 120, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.phone, 135, 50);

  // Financial Ledger Table
  let y = 62;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Date', 18, y + 5.5);
  doc.text('Receipt #', 42, y + 5.5);
  doc.text('Plot', 80, y + 5.5);
  doc.text('Method', 105, y + 5.5);
  doc.text('Amount Received', 135, y + 5.5);
  doc.text('Balance Remaining', 165, y + 5.5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  let totalReceived = 0;
  transactions.forEach((txn) => {
    totalReceived += txn.amountReceived;
    const plot = plots.find((p) => p.id === txn.plotId);
    doc.text(formatDate(txn.paymentDate), 18, y);
    doc.text(txn.receiptNumber, 42, y);
    doc.text(plot ? `${plot.plotNumber} (${plot.blockNumber})` : 'Plot', 80, y);
    doc.text(txn.paymentMethod.replace('_', ' ').toUpperCase(), 105, y);
    doc.text(formatPKR(txn.amountReceived), 135, y);
    doc.text(formatPKR(txn.remainingBalance), 165, y);
    y += 6;
  });

  // Summary box
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, y, 76, 20, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(120, y, 76, 20, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.text('Total Payments Received:', 124, y + 8);
  doc.setTextColor(16, 185, 129);
  doc.text(formatPKR(totalReceived), 164, y + 8);

  const totalOutstanding = bookings.reduce((sum, b) => sum + b.remainingBalance, 0);
  doc.setTextColor(30, 41, 59);
  doc.text('Total Balance Due:', 124, y + 15);
  doc.setTextColor(225, 29, 72);
  doc.text(formatPKR(totalOutstanding), 164, y + 15);

  doc.save(`Statement-${customer.fullName.replace(/\s+/g, '_')}.pdf`);
}
