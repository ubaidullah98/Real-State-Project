export type UserRole = 'admin' | 'project_manager' | 'accountant' | 'sales_agent';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'completed';

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  location: string;
  totalPlots: number;
  plotSizes: string;
  launchDate: string;
  status: ProjectStatus;
  masterPlanPdfName?: string;
  masterPlanPdfUrl?: string;
  masterPlanImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type PlotStatus = 'available' | 'reserved' | 'sold' | 'installments_in_progress' | 'overdue';
export type PlotCategory = 'residential' | 'commercial' | 'corner' | 'park_facing' | 'boulevard';

export interface PlotCoordinates {
  x: number;
  y: number; // elevation
  z: number;
  width: number;
  depth: number;
  rotation?: number;
}

export interface Plot {
  id: string;
  plotNumber: string;
  blockNumber: string;
  projectId: string;
  plotSize: string; // e.g. "120 Sq. Yds", "5 Marla", "10 Marla", "1 Kanal"
  dimensions: string; // e.g. "30 x 60 ft"
  pricePerSqUnit: number;
  totalPlotPrice: number;
  status: PlotStatus;
  category: PlotCategory;
  customerId?: string;
  bookingDate?: string;
  notes?: string;
  coordinates: PlotCoordinates;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  fatherName: string;
  cnic: string; // e.g. "42101-1234567-1"
  phone: string; // e.g. "+92 300 1234567"
  whatsapp: string;
  address: string;
  email?: string;
  registrationDate: string;
  assignedProjectIds: string[];
  assignedPlotIds: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InstallmentFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'custom';
export type BookingStatus = 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingNumber: string;
  projectId: string;
  plotId: string;
  customerId: string;
  bookingDate: string;
  totalPlotPrice: number;
  downPayment: number;
  remainingBalance: number;
  installmentFrequency: InstallmentFrequency;
  installmentAmount: number;
  numberOfInstallments: number;
  firstInstallmentDate: string;
  finalDueDate: string;
  totalReceived: number;
  status: BookingStatus;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InstallmentStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface Installment {
  id: string;
  bookingId: string;
  projectId: string;
  plotId: string;
  customerId: string;
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: InstallmentStatus;
  paidDate?: string;
  lastPaymentMethod?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'online';

export interface Transaction {
  id: string;
  receiptNumber: string;
  projectId: string;
  plotId: string;
  customerId: string;
  bookingId: string;
  installmentId?: string;
  amountReceived: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  previousBalance: number;
  remainingBalance: number;
  receivedBy: string;
  remarks?: string;
  isReversal?: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  userEmail: string;
  userId: string;
  projectId?: string;
  plotId?: string;
  customerId?: string;
  details: string;
  timestamp: string;
}

export interface ExtractedPlotLayout {
  plotNumber: string;
  blockNumber: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  sizeStr: string;
  dimensions: string;
  category: PlotCategory;
  estimatedPrice: number;
}
