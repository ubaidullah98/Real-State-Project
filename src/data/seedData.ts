import { Project, Plot, Customer, Booking, Installment, Transaction, ActivityLog } from '../types';

export const INITIAL_PROJECT: Project = {
  id: 'project-al-basit-residency',
  name: 'Al-Basit Residency',
  code: 'ABR-01',
  description: 'Premier master-planned gated housing community by Al-Basit Builders featuring modern infrastructure, 60ft wide boulevards, solar street lighting, underground utilities, lush parks, and community center.',
  location: 'Main Super Highway (M-9), Scheme 45, Karachi, Pakistan',
  totalPlots: 48,
  plotSizes: '120 Sq. Yds, 200 Sq. Yds, 400 Sq. Yds',
  launchDate: '2026-01-15',
  status: 'active',
  masterPlanPdfName: 'Al-Basit-Residency-MasterPlan-Phase1.pdf',
  createdAt: '2026-01-15T09:00:00Z',
  updatedAt: '2026-01-15T09:00:00Z',
  isDemo: true,
};

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    fullName: 'Muhammad Bilal Khan',
    fatherName: 'Late Abdul Ghafoor Khan',
    cnic: '42101-3849201-3',
    phone: '+92 300 8291044',
    whatsapp: '+92 300 8291044',
    address: 'House 42, Street 7, Block 4, Gulshan-e-Iqbal, Karachi',
    email: 'bilal.khan@example.com',
    registrationDate: '2026-01-20',
    assignedProjectIds: ['project-al-basit-residency'],
    assignedPlotIds: ['plot-a-01', 'plot-b-05'],
    isDemo: true,
    createdAt: '2026-01-20T10:30:00Z',
    updatedAt: '2026-01-20T10:30:00Z',
  },
  {
    id: 'cust-02',
    fullName: 'Tariq Mehmood Siddiqui',
    fatherName: 'Mehmood-ul-Hassan Siddiqui',
    cnic: '35202-9182741-5',
    phone: '+92 321 4455667',
    whatsapp: '+92 321 4455667',
    address: 'Bungalow 18-A, Phase 5, DHA, Lahore',
    email: 'tariq.siddiqui@example.com',
    registrationDate: '2026-01-25',
    assignedProjectIds: ['project-al-basit-residency'],
    assignedPlotIds: ['plot-a-05'],
    isDemo: true,
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-01-25T11:00:00Z',
  },
  {
    id: 'cust-03',
    fullName: 'Dr. Ayesha Farooq',
    fatherName: 'Farooq Ahmed Malik',
    cnic: '61101-1192834-2',
    phone: '+92 333 5512345',
    whatsapp: '+92 333 5512345',
    address: 'Apartment 402, Royal Residency, F-10/2, Islamabad',
    email: 'dr.ayesha@example.com',
    registrationDate: '2026-02-01',
    assignedProjectIds: ['project-al-basit-residency'],
    assignedPlotIds: ['plot-c-02'],
    isDemo: true,
    createdAt: '2026-02-01T14:15:00Z',
    updatedAt: '2026-02-01T14:15:00Z',
  },
  {
    id: 'cust-04',
    fullName: 'Kamran Ahmed Sheikh',
    fatherName: 'Bashir Ahmed Sheikh',
    cnic: '42201-7654321-9',
    phone: '+92 345 2211990',
    whatsapp: '+92 345 2211990',
    address: 'Plot B-14, Block J, North Nazimabad, Karachi',
    email: 'kamran.sheikh@example.com',
    registrationDate: '2026-02-10',
    assignedProjectIds: ['project-al-basit-residency'],
    assignedPlotIds: ['plot-b-02'],
    isDemo: true,
    createdAt: '2026-02-10T16:00:00Z',
    updatedAt: '2026-02-10T16:00:00Z',
  },
];

// Generate structured 3D coordinates for plots in 3 blocks
export function generateDemoPlots(projectId: string): Plot[] {
  const plots: Plot[] = [];

  // Block A: 16 Plots (120 Sq. Yds) - Coordinates around central road
  for (let i = 1; i <= 16; i++) {
    const isNorth = i <= 8;
    const col = isNorth ? i - 1 : i - 9;
    const x = (col - 3.5) * 16;
    const z = isNorth ? -35 : -15;

    let status: Plot['status'] = 'available';
    let customerId: string | undefined = undefined;
    let category: Plot['category'] = 'residential';

    if (i === 1) {
      status = 'sold';
      customerId = 'cust-01';
      category = 'corner';
    } else if (i === 3) {
      status = 'reserved';
      category = 'park_facing';
    } else if (i === 5) {
      status = 'installments_in_progress';
      customerId = 'cust-02';
    } else if (i === 8) {
      status = 'overdue';
      customerId = 'cust-04';
      category = 'corner';
    } else if (i === 11) {
      status = 'installments_in_progress';
      customerId = 'cust-01';
    } else if (i === 14) {
      status = 'reserved';
    }

    const plotNum = `A-${String(i).padStart(2, '0')}`;
    plots.push({
      id: `plot-a-${String(i).padStart(2, '0')}`,
      plotNumber: plotNum,
      blockNumber: 'Block A',
      projectId,
      plotSize: '120 Sq. Yds',
      dimensions: '30 ft x 36 ft',
      pricePerSqUnit: 18000,
      totalPlotPrice: 2160000,
      status,
      category,
      customerId,
      bookingDate: customerId ? '2026-01-22' : undefined,
      notes: category === 'corner' ? 'Prime corner plot near Main Boulevard' : 'Standard residential plot',
      coordinates: {
        x,
        y: 0,
        z,
        width: 13,
        depth: 14,
      },
      isDemo: true,
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-15T09:00:00Z',
    });
  }

  // Block B: 16 Plots (200 Sq. Yds) - Coordinates around mid avenue
  for (let i = 1; i <= 16; i++) {
    const isNorth = i <= 8;
    const col = isNorth ? i - 1 : i - 9;
    const x = (col - 3.5) * 20;
    const z = isNorth ? 15 : 38;

    let status: Plot['status'] = 'available';
    let customerId: string | undefined = undefined;
    let category: Plot['category'] = 'residential';

    if (i === 2) {
      status = 'installments_in_progress';
      customerId = 'cust-04';
    } else if (i === 5) {
      status = 'sold';
      customerId = 'cust-01';
      category = 'park_facing';
    } else if (i === 7) {
      status = 'overdue';
      customerId = 'cust-02';
    } else if (i === 9) {
      status = 'reserved';
      category = 'corner';
    } else if (i === 12) {
      status = 'sold';
      customerId = 'cust-03';
    }

    const plotNum = `B-${String(i).padStart(2, '0')}`;
    plots.push({
      id: `plot-b-${String(i).padStart(2, '0')}`,
      plotNumber: plotNum,
      blockNumber: 'Block B',
      projectId,
      plotSize: '200 Sq. Yds',
      dimensions: '35 ft x 51 ft',
      pricePerSqUnit: 17500,
      totalPlotPrice: 3500000,
      status,
      category,
      customerId,
      bookingDate: customerId ? '2026-02-05' : undefined,
      notes: category === 'park_facing' ? 'Direct view of Society Central Park' : 'Luxury residential plot',
      coordinates: {
        x,
        y: 0,
        z,
        width: 17,
        depth: 18,
      },
      isDemo: true,
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-15T09:00:00Z',
    });
  }

  // Block C: 16 Plots (400 Sq. Yds / 1 Kanal Executive)
  for (let i = 1; i <= 16; i++) {
    const isNorth = i <= 8;
    const col = isNorth ? i - 1 : i - 9;
    const x = (col - 3.5) * 26;
    const z = isNorth ? 65 : 95;

    let status: Plot['status'] = 'available';
    let customerId: string | undefined = undefined;
    let category: Plot['category'] = 'boulevard';

    if (i === 2) {
      status = 'sold';
      customerId = 'cust-03';
      category = 'boulevard';
    } else if (i === 4) {
      status = 'installments_in_progress';
      customerId = 'cust-01';
    } else if (i === 6) {
      status = 'reserved';
    } else if (i === 10) {
      status = 'overdue';
      customerId = 'cust-04';
    }

    const plotNum = `C-${String(i).padStart(2, '0')}`;
    plots.push({
      id: `plot-c-${String(i).padStart(2, '0')}`,
      plotNumber: plotNum,
      blockNumber: 'Block C (Executive)',
      projectId,
      plotSize: '400 Sq. Yds',
      dimensions: '50 ft x 72 ft',
      pricePerSqUnit: 17000,
      totalPlotPrice: 6800000,
      status,
      category,
      customerId,
      bookingDate: customerId ? '2026-02-12' : undefined,
      notes: 'Executive Boulevard luxury villa plot',
      coordinates: {
        x,
        y: 0,
        z,
        width: 22,
        depth: 24,
      },
      isDemo: true,
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-15T09:00:00Z',
    });
  }

  return plots;
}

export const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'bkg-01',
    bookingNumber: 'ABR-BKG-2026-0001',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-01',
    customerId: 'cust-01',
    bookingDate: '2026-01-22',
    totalPlotPrice: 2160000,
    downPayment: 540000,
    remainingBalance: 0,
    installmentFrequency: 'monthly',
    installmentAmount: 54000,
    numberOfInstallments: 30,
    firstInstallmentDate: '2026-02-22',
    finalDueDate: '2028-07-22',
    totalReceived: 2160000,
    status: 'completed',
    isDemo: true,
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'bkg-02',
    bookingNumber: 'ABR-BKG-2026-0002',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    bookingDate: '2026-01-26',
    totalPlotPrice: 2160000,
    downPayment: 540000,
    remainingBalance: 1404000,
    installmentFrequency: 'monthly',
    installmentAmount: 54000,
    numberOfInstallments: 30,
    firstInstallmentDate: '2026-02-26',
    finalDueDate: '2028-07-26',
    totalReceived: 756000,
    status: 'active',
    isDemo: true,
    createdAt: '2026-01-26T14:30:00Z',
    updatedAt: '2026-01-26T14:30:00Z',
  },
  {
    id: 'bkg-03',
    bookingNumber: 'ABR-BKG-2026-0003',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-b-02',
    customerId: 'cust-04',
    bookingDate: '2026-02-10',
    totalPlotPrice: 3500000,
    downPayment: 700000,
    remainingBalance: 2520000,
    installmentFrequency: 'monthly',
    installmentAmount: 70000,
    numberOfInstallments: 40,
    firstInstallmentDate: '2026-03-10',
    finalDueDate: '2029-06-10',
    totalReceived: 980000,
    status: 'active',
    isDemo: true,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'bkg-04',
    bookingNumber: 'ABR-BKG-2026-0004',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-08',
    customerId: 'cust-04',
    bookingDate: '2026-01-28',
    totalPlotPrice: 2160000,
    downPayment: 540000,
    remainingBalance: 1620000,
    installmentFrequency: 'monthly',
    installmentAmount: 54000,
    numberOfInstallments: 30,
    firstInstallmentDate: '2026-02-28',
    finalDueDate: '2028-07-28',
    totalReceived: 540000,
    status: 'active',
    isDemo: true,
    createdAt: '2026-01-28T16:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
  },
];

export const DEMO_INSTALLMENTS: Installment[] = [
  // bkg-02 installments
  {
    id: 'inst-02-01',
    bookingId: 'bkg-02',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    installmentNumber: 1,
    dueDate: '2026-02-26',
    amountDue: 54000,
    amountPaid: 54000,
    status: 'paid',
    paidDate: '2026-02-25',
    lastPaymentMethod: 'bank_transfer',
    isDemo: true,
    createdAt: '2026-01-26T14:30:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'inst-02-02',
    bookingId: 'bkg-02',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    installmentNumber: 2,
    dueDate: '2026-03-26',
    amountDue: 54000,
    amountPaid: 54000,
    status: 'paid',
    paidDate: '2026-03-24',
    lastPaymentMethod: 'online',
    isDemo: true,
    createdAt: '2026-01-26T14:30:00Z',
    updatedAt: '2026-03-24T12:00:00Z',
  },
  {
    id: 'inst-02-03',
    bookingId: 'bkg-02',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    installmentNumber: 3,
    dueDate: '2026-04-26',
    amountDue: 54000,
    amountPaid: 54000,
    status: 'paid',
    paidDate: '2026-04-26',
    lastPaymentMethod: 'cash',
    isDemo: true,
    createdAt: '2026-01-26T14:30:00Z',
    updatedAt: '2026-04-26T15:00:00Z',
  },
  {
    id: 'inst-02-04',
    bookingId: 'bkg-02',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    installmentNumber: 4,
    dueDate: '2026-05-26',
    amountDue: 54000,
    amountPaid: 54000,
    status: 'paid',
    paidDate: '2026-05-25',
    lastPaymentMethod: 'bank_transfer',
    isDemo: true,
    createdAt: '2026-01-26T14:30:00Z',
    updatedAt: '2026-05-25T11:00:00Z',
  },
  {
    id: 'inst-02-05',
    bookingId: 'bkg-02',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    installmentNumber: 5,
    dueDate: '2026-11-20',
    amountDue: 54000,
    amountPaid: 0,
    status: 'pending',
    isDemo: true,
    createdAt: '2026-01-26T14:30:00Z',
    updatedAt: '2026-01-26T14:30:00Z',
  },
  // bkg-04 overdue installment
  {
    id: 'inst-04-01',
    bookingId: 'bkg-04',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-08',
    customerId: 'cust-04',
    installmentNumber: 1,
    dueDate: '2026-02-28',
    amountDue: 54000,
    amountPaid: 0,
    status: 'overdue',
    isDemo: true,
    createdAt: '2026-01-28T16:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
  },
  {
    id: 'inst-04-02',
    bookingId: 'bkg-04',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-08',
    customerId: 'cust-04',
    installmentNumber: 2,
    dueDate: '2026-03-28',
    amountDue: 54000,
    amountPaid: 0,
    status: 'overdue',
    isDemo: true,
    createdAt: '2026-01-28T16:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-01',
    receiptNumber: 'ABR-REC-2026-0001',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-01',
    customerId: 'cust-01',
    bookingId: 'bkg-01',
    amountReceived: 540000,
    paymentDate: '2026-01-22',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'HBL-FT-9918231',
    previousBalance: 2160000,
    remainingBalance: 1620000,
    receivedBy: 'Al-Basit Builders Accounts Desk',
    remarks: 'Booking Down Payment 25% for Plot A-01',
    isDemo: true,
    createdAt: '2026-01-22T10:05:00Z',
  },
  {
    id: 'txn-02',
    receiptNumber: 'ABR-REC-2026-0002',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    bookingId: 'bkg-02',
    amountReceived: 540000,
    paymentDate: '2026-01-26',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'UBL-OL-7729104',
    previousBalance: 2160000,
    remainingBalance: 1620000,
    receivedBy: 'Al-Basit Builders Accounts Desk',
    remarks: 'Down Payment for Plot A-05',
    isDemo: true,
    createdAt: '2026-01-26T14:40:00Z',
  },
  {
    id: 'txn-03',
    receiptNumber: 'ABR-REC-2026-0003',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    bookingId: 'bkg-02',
    installmentId: 'inst-02-01',
    amountReceived: 54000,
    paymentDate: '2026-02-25',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'MCB-PK-1029481',
    previousBalance: 1620000,
    remainingBalance: 1566000,
    receivedBy: 'Al-Basit Finance Manager',
    remarks: 'Installment #1 paid in full',
    isDemo: true,
    createdAt: '2026-02-25T10:05:00Z',
  },
  {
    id: 'txn-04',
    receiptNumber: 'ABR-REC-2026-0004',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-b-02',
    customerId: 'cust-04',
    bookingId: 'bkg-03',
    amountReceived: 700000,
    paymentDate: '2026-02-10',
    paymentMethod: 'cash',
    referenceNumber: 'CSH-RECEIPT-401',
    previousBalance: 3500000,
    remainingBalance: 2800000,
    receivedBy: 'Al-Basit Head Office Cashier',
    remarks: 'Token & Down Payment for 200 Sq. Yds Plot B-02',
    isDemo: true,
    createdAt: '2026-02-10T11:15:00Z',
  },
];

export const DEMO_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    action: 'PROJECT_CREATED',
    userEmail: 'ubaidullahbhutto1998@gmail.com',
    userId: 'admin-01',
    projectId: 'project-al-basit-residency',
    details: 'Initial flagship project "Al-Basit Residency" created with 48 planned residential and executive plots.',
    timestamp: '2026-01-15T09:00:00Z',
  },
  {
    id: 'log-02',
    action: 'PLOT_BOOKED',
    userEmail: 'ubaidullahbhutto1998@gmail.com',
    userId: 'admin-01',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-01',
    customerId: 'cust-01',
    details: 'Plot A-01 booked by Muhammad Bilal Khan. Down payment of PKR 540,000 received.',
    timestamp: '2026-01-22T10:05:00Z',
  },
  {
    id: 'log-03',
    action: 'PAYMENT_RECEIVED',
    userEmail: 'ubaidullahbhutto1998@gmail.com',
    userId: 'admin-01',
    projectId: 'project-al-basit-residency',
    plotId: 'plot-a-05',
    customerId: 'cust-02',
    details: 'Installment #1 of PKR 54,000 received via Bank Transfer. Receipt #ABR-REC-2026-0003 generated.',
    timestamp: '2026-02-25T10:05:00Z',
  },
];
