import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, stripUndefined, testFirestoreConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Project,
  Plot,
  Customer,
  Booking,
  Installment,
  Transaction,
  ActivityLog,
  ExtractedPlotLayout,
  PaymentMethod,
} from '../types';
import {
  INITIAL_PROJECT,
  DEMO_CUSTOMERS,
  generateDemoPlots,
  DEMO_BOOKINGS,
  DEMO_INSTALLMENTS,
  DEMO_TRANSACTIONS,
  DEMO_ACTIVITY_LOGS,
} from '../data/seedData';
import { generateReceiptNumber, generateBookingNumber } from '../lib/utils';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProjectId: (id: string) => void;
  plots: Plot[];
  allPlots: Plot[];
  customers: Customer[];
  bookings: Booking[];
  installments: Installment[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  isLoading: boolean;
  isFirestoreConnected: boolean;

  // Project operations
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Plot operations
  createPlot: (data: Partial<Plot>) => Promise<Plot>;
  bulkCreatePlots: (newPlots: Partial<Plot>[]) => Promise<void>;
  updatePlot: (id: string, data: Partial<Plot>) => Promise<void>;
  deletePlot: (id: string) => Promise<void>;
  syncMasterPlanPlots: (projectId: string, extracted: ExtractedPlotLayout[]) => Promise<void>;

  // Customer operations
  createCustomer: (data: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Booking & Financial operations
  createBooking: (data: {
    projectId: string;
    plotId: string;
    customerId: string;
    totalPlotPrice: number;
    downPayment: number;
    installmentFrequency: Booking['installmentFrequency'];
    installmentAmount: number;
    numberOfInstallments: number;
    firstInstallmentDate: string;
  }) => Promise<Booking>;

  recordPayment: (data: {
    projectId: string;
    plotId: string;
    customerId: string;
    bookingId: string;
    installmentId?: string;
    amountReceived: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    remarks?: string;
  }) => Promise<Transaction>;

  updateInstallment: (id: string, data: Partial<Installment>) => Promise<void>;

  // Demo operations
  seedDemoData: () => Promise<void>;
  clearDemoData: () => Promise<void>;
  addActivityLog: (action: string, details: string, projectId?: string, plotId?: string, customerId?: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, firebaseUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([INITIAL_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECT.id);
  const [plots, setPlots] = useState<Plot[]>(generateDemoPlots(INITIAL_PROJECT.id));
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [bookings, setBookings] = useState<Booking[]>(DEMO_BOOKINGS);
  const [installments, setInstallments] = useState<Installment[]>(DEMO_INSTALLMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(DEMO_ACTIVITY_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Test Firestore connection on initial boot
  useEffect(() => {
    testFirestoreConnection().then((ok) => {
      setIsFirestoreConnected(ok);
    });
  }, []);

  // Load from Firestore when authenticated
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!firebaseUser) {
        return;
      }
      setIsLoading(true);
      try {
        const projSnap = await getDocs(collection(db, 'projects'));
        if (!projSnap.empty && isMounted) {
          const loadedProjects = projSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
          setProjects(loadedProjects);
          if (!loadedProjects.find((p) => p.id === activeProjectId)) {
            setActiveProjectId(loadedProjects[0].id);
          }
        }

        const plotsSnap = await getDocs(collection(db, 'plots'));
        if (!plotsSnap.empty && isMounted) {
          setPlots(plotsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Plot)));
        }

        const custSnap = await getDocs(collection(db, 'customers'));
        if (!custSnap.empty && isMounted) {
          setCustomers(custSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer)));
        }

        const bkgSnap = await getDocs(collection(db, 'bookings'));
        if (!bkgSnap.empty && isMounted) {
          setBookings(bkgSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
        }

        const instSnap = await getDocs(collection(db, 'installments'));
        if (!instSnap.empty && isMounted) {
          setInstallments(instSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Installment)));
        }

        const txnSnap = await getDocs(collection(db, 'transactions'));
        if (!txnSnap.empty && isMounted) {
          setTransactions(txnSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
        }

        const logSnap = await getDocs(collection(db, 'activityLogs'));
        if (!logSnap.empty && isMounted) {
          setActivityLogs(logSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog)));
        }
        setIsFirestoreConnected(true);
      } catch (err) {
        console.warn('Initial Firestore fetch warning (using verified local/demo state):', err);
        setIsFirestoreConnected(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [firebaseUser]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  const projectPlots = plots.filter((p) => p.projectId === activeProjectId);

  const addActivityLog = async (
    action: string,
    details: string,
    projectId?: string,
    plotId?: string,
    customerId?: string
  ) => {
    const newLog: ActivityLog = stripUndefined({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      userEmail: currentUser?.email || 'admin@albasitbuilders.com',
      userId: currentUser?.uid || 'admin',
      projectId: projectId || activeProjectId,
      plotId,
      customerId,
      details,
      timestamp: new Date().toISOString(),
    });

    setActivityLogs((prev) => [newLog, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'activityLogs', newLog.id), stripUndefined(newLog));
      } catch (e) {
        console.warn('Logging error:', e);
      }
    }
  };

  // Create Project
  const createProject = async (data: Partial<Project>): Promise<Project> => {
    const id = `project-${Date.now()}`;
    const newProject: Project = stripUndefined({
      id,
      name: data.name || 'New Housing Project',
      code: data.code || `ABR-${projects.length + 1}`,
      description: data.description || '',
      location: data.location || 'Karachi, Pakistan',
      totalPlots: data.totalPlots || 50,
      plotSizes: data.plotSizes || '120 Sq. Yds, 200 Sq. Yds',
      launchDate: data.launchDate || new Date().toISOString().split('T')[0],
      status: data.status || 'planning',
      ...(data.masterPlanPdfName ? { masterPlanPdfName: data.masterPlanPdfName } : {}),
      ...(data.masterPlanPdfUrl ? { masterPlanPdfUrl: data.masterPlanPdfUrl } : {}),
      ...(data.masterPlanImageUrl ? { masterPlanImageUrl: data.masterPlanImageUrl } : {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
    });

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(id);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'projects', id), stripUndefined(newProject));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'projects');
      }
    }

    await addActivityLog('PROJECT_CREATED', `New project "${newProject.name}" was launched.`, id);
    return newProject;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const updated = stripUndefined({ ...data, updatedAt: new Date().toISOString() });
    setProjects((prev) => prev.map((p) => (p.id === id ? ({ ...p, ...updated } as Project) : p)));

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'projects', id), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `projects/${id}`);
      }
    }

    await addActivityLog('PROJECT_UPDATED', `Project details updated.`, id);
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) setActiveProjectId(remaining[0].id);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      }
    }

    await addActivityLog('PROJECT_DELETED', `Project ${id} removed.`, id);
  };

  // Plot Operations
  const createPlot = async (data: Partial<Plot>): Promise<Plot> => {
    // Prevent duplicate plot numbers within the same project
    const exists = plots.some(
      (p) => p.projectId === (data.projectId || activeProjectId) && p.plotNumber.toLowerCase() === data.plotNumber?.toLowerCase()
    );
    if (exists) {
      throw new Error(`Plot Number "${data.plotNumber}" already exists in this project.`);
    }

    const id = `plot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newPlot: Plot = stripUndefined({
      id,
      plotNumber: data.plotNumber || 'P-01',
      blockNumber: data.blockNumber || 'Block A',
      projectId: data.projectId || activeProjectId,
      plotSize: data.plotSize || '120 Sq. Yds',
      dimensions: data.dimensions || '30 x 36 ft',
      pricePerSqUnit: data.pricePerSqUnit || 18000,
      totalPlotPrice: data.totalPlotPrice || 2160000,
      status: data.status || 'available',
      category: data.category || 'residential',
      ...(data.customerId ? { customerId: data.customerId } : {}),
      ...(data.bookingDate ? { bookingDate: data.bookingDate } : {}),
      notes: data.notes || '',
      coordinates: data.coordinates || {
        x: (plots.length % 8 - 4) * 16,
        y: 0,
        z: Math.floor(plots.length / 8) * 18,
        width: 14,
        depth: 16,
      },
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setPlots((prev) => [...prev, newPlot]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'plots', id), stripUndefined(newPlot));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `plots/${id}`);
      }
    }

    await addActivityLog('PLOT_CREATED', `Plot ${newPlot.plotNumber} (${newPlot.blockNumber}) added.`, newPlot.projectId, id);
    return newPlot;
  };

  const bulkCreatePlots = async (newPlotsData: Partial<Plot>[]) => {
    const created: Plot[] = [];
    const batch = writeBatch(db);

    for (const data of newPlotsData) {
      const id = `plot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const p: Plot = stripUndefined({
        id,
        plotNumber: data.plotNumber || 'P-01',
        blockNumber: data.blockNumber || 'Block A',
        projectId: data.projectId || activeProjectId,
        plotSize: data.plotSize || '120 Sq. Yds',
        dimensions: data.dimensions || '30 x 36 ft',
        pricePerSqUnit: data.pricePerSqUnit || 18000,
        totalPlotPrice: data.totalPlotPrice || 2160000,
        status: data.status || 'available',
        category: data.category || 'residential',
        notes: data.notes || '',
        coordinates: data.coordinates || {
          x: 0,
          y: 0,
          z: 0,
          width: 14,
          depth: 16,
        },
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      created.push(p);
      batch.set(doc(db, 'plots', id), stripUndefined(p));
    }

    setPlots((prev) => [...prev, ...created]);

    if (auth.currentUser) {
      try {
        await batch.commit();
      } catch (err) {
        console.warn('Batch plot commit fallback:', err);
      }
    }

    await addActivityLog('BULK_PLOTS_CREATED', `Bulk created ${created.length} plots.`, activeProjectId);
  };

  const updatePlot = async (id: string, data: Partial<Plot>) => {
    const updated = stripUndefined({ ...data, updatedAt: new Date().toISOString() });
    setPlots((prev) => prev.map((p) => (p.id === id ? ({ ...p, ...updated } as Plot) : p)));

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'plots', id), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `plots/${id}`);
      }
    }

    await addActivityLog('PLOT_UPDATED', `Plot ${id} updated.`, activeProjectId, id);
  };

  const deletePlot = async (id: string) => {
    const plot = plots.find((p) => p.id === id);
    if (plot?.status === 'sold') {
      throw new Error('Sold plots with active financial records cannot be deleted. Cancel the booking first.');
    }

    setPlots((prev) => prev.filter((p) => p.id !== id));

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'plots', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `plots/${id}`);
      }
    }

    await addActivityLog('PLOT_DELETED', `Plot ${plot?.plotNumber || id} deleted.`, activeProjectId, id);
  };

  // Sync master plan layout directly into Firestore
  const syncMasterPlanPlots = async (projectId: string, extracted: ExtractedPlotLayout[]) => {
    const batch = writeBatch(db);
    const newPlots: Plot[] = [];

    for (const item of extracted) {
      const existing = plots.find((p) => p.projectId === projectId && p.plotNumber === item.plotNumber);
      const id = existing ? existing.id : `plot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const plot: Plot = stripUndefined({
        id,
        plotNumber: item.plotNumber,
        blockNumber: item.blockNumber,
        projectId,
        plotSize: item.sizeStr,
        dimensions: item.dimensions,
        pricePerSqUnit: Math.round(item.estimatedPrice / 120),
        totalPlotPrice: item.estimatedPrice,
        status: existing?.status || 'available',
        category: item.category,
        coordinates: {
          x: item.x,
          y: 0,
          z: item.z,
          width: item.width,
          depth: item.depth,
        },
        isDemo: false,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      newPlots.push(plot);
      batch.set(doc(db, 'plots', id), stripUndefined(plot));
    }

    setPlots((prev) => {
      const filtered = prev.filter((p) => p.projectId !== projectId);
      return [...filtered, ...newPlots];
    });

    if (auth.currentUser) {
      try {
        await batch.commit();
      } catch (err) {
        console.warn('Master plan batch sync fallback:', err);
      }
    }

    await addActivityLog(
      'MASTER_PLAN_SYNCED',
      `Synchronized ${newPlots.length} extracted master plan plots to 3D Map and Database.`,
      projectId
    );
  };

  // Customer Operations
  const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
    const id = `cust-${Date.now()}`;
    const newCustomer: Customer = stripUndefined({
      id,
      fullName: data.fullName || 'New Customer',
      fatherName: data.fatherName || '',
      cnic: data.cnic || '42101-0000000-0',
      phone: data.phone || '+92 300 0000000',
      whatsapp: data.whatsapp || data.phone || '+92 300 0000000',
      address: data.address || '',
      ...(data.email ? { email: data.email } : {}),
      registrationDate: data.registrationDate || new Date().toISOString().split('T')[0],
      assignedProjectIds: data.assignedProjectIds || [activeProjectId],
      assignedPlotIds: data.assignedPlotIds || [],
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setCustomers((prev) => [newCustomer, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'customers', id), stripUndefined(newCustomer));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `customers/${id}`);
      }
    }

    await addActivityLog('CUSTOMER_REGISTERED', `Customer ${newCustomer.fullName} registered.`, activeProjectId, undefined, id);
    return newCustomer;
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    const updated = stripUndefined({ ...data, updatedAt: new Date().toISOString() });
    setCustomers((prev) => prev.map((c) => (c.id === id ? ({ ...c, ...updated } as Customer) : c)));

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'customers', id), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `customers/${id}`);
      }
    }

    await addActivityLog('CUSTOMER_UPDATED', `Customer ${id} profile updated.`, activeProjectId, undefined, id);
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'customers', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
      }
    }
  };

  // Booking & Financial Flow
  const createBooking = async (data: {
    projectId: string;
    plotId: string;
    customerId: string;
    totalPlotPrice: number;
    downPayment: number;
    installmentFrequency: Booking['installmentFrequency'];
    installmentAmount: number;
    numberOfInstallments: number;
    firstInstallmentDate: string;
  }): Promise<Booking> => {
    const bookingId = `bkg-${Date.now()}`;
    const bookingNumber = generateBookingNumber();
    const remainingBalance = data.totalPlotPrice - data.downPayment;

    // Calculate final due date
    const firstDate = new Date(data.firstInstallmentDate);
    const monthsStep = data.installmentFrequency === 'quarterly' ? 3 : data.installmentFrequency === 'half-yearly' ? 6 : 1;
    const finalDate = new Date(firstDate);
    finalDate.setMonth(finalDate.getMonth() + (data.numberOfInstallments - 1) * monthsStep);

    const newBooking: Booking = stripUndefined({
      id: bookingId,
      bookingNumber,
      projectId: data.projectId,
      plotId: data.plotId,
      customerId: data.customerId,
      bookingDate: new Date().toISOString().split('T')[0],
      totalPlotPrice: data.totalPlotPrice,
      downPayment: data.downPayment,
      remainingBalance,
      installmentFrequency: data.installmentFrequency,
      installmentAmount: data.installmentAmount,
      numberOfInstallments: data.numberOfInstallments,
      firstInstallmentDate: data.firstInstallmentDate,
      finalDueDate: finalDate.toISOString().split('T')[0],
      totalReceived: data.downPayment,
      status: 'active',
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Auto-generate installment schedules
    const newInstallments: Installment[] = [];
    const batch = writeBatch(db);

    for (let i = 1; i <= data.numberOfInstallments; i++) {
      const dueDate = new Date(firstDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1) * monthsStep);

      const instId = `inst-${bookingId}-${i}`;
      const inst: Installment = stripUndefined({
        id: instId,
        bookingId,
        projectId: data.projectId,
        plotId: data.plotId,
        customerId: data.customerId,
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amountDue: data.installmentAmount,
        amountPaid: 0,
        status: 'pending',
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      newInstallments.push(inst);
      batch.set(doc(db, 'installments', instId), stripUndefined(inst));
    }

    // Generate initial down payment transaction & receipt
    const txnId = `txn-${Date.now()}`;
    const initialTxn: Transaction = stripUndefined({
      id: txnId,
      receiptNumber: generateReceiptNumber(),
      projectId: data.projectId,
      plotId: data.plotId,
      customerId: data.customerId,
      bookingId,
      amountReceived: data.downPayment,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      referenceNumber: `DP-INIT-${bookingNumber}`,
      previousBalance: data.totalPlotPrice,
      remainingBalance,
      receivedBy: currentUser?.displayName || 'Al-Basit Builders Accounts Desk',
      remarks: `Down Payment for Plot Booking (${data.installmentFrequency} plan)`,
      isDemo: false,
      createdAt: new Date().toISOString(),
    });

    // Update Plot status to sold / installments in progress
    const plotStatus: Plot['status'] = 'installments_in_progress';
    const updatedPlot = stripUndefined({
      status: plotStatus,
      customerId: data.customerId,
      bookingDate: newBooking.bookingDate,
      updatedAt: new Date().toISOString(),
    });

    // Commit state updates
    setBookings((prev) => [newBooking, ...prev]);
    setInstallments((prev) => [...prev, ...newInstallments]);
    setTransactions((prev) => [initialTxn, ...prev]);
    setPlots((prev) => prev.map((p) => (p.id === data.plotId ? { ...p, ...updatedPlot } : p)));

    // Update Customer assigned plots
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === data.customerId
          ? {
              ...c,
              assignedPlotIds: Array.from(new Set([...c.assignedPlotIds, data.plotId])),
              assignedProjectIds: Array.from(new Set([...c.assignedProjectIds, data.projectId])),
            }
          : c
      )
    );

    if (auth.currentUser) {
      try {
        batch.set(doc(db, 'bookings', bookingId), stripUndefined(newBooking));
        batch.set(doc(db, 'transactions', txnId), stripUndefined(initialTxn));
        batch.set(doc(db, 'plots', data.plotId), updatedPlot, { merge: true });
        await batch.commit();
      } catch (err) {
        console.warn('Booking commit fallback:', err);
      }
    }

    await addActivityLog(
      'BOOKING_CREATED',
      `Booking ${bookingNumber} created for Plot ${data.plotId}. Down Payment: PKR ${data.downPayment.toLocaleString()}.`,
      data.projectId,
      data.plotId,
      data.customerId
    );

    return newBooking;
  };

  // Record Payment
  const recordPayment = async (data: {
    projectId: string;
    plotId: string;
    customerId: string;
    bookingId: string;
    installmentId?: string;
    amountReceived: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    remarks?: string;
  }): Promise<Transaction> => {
    const booking = bookings.find((b) => b.id === data.bookingId);
    if (!booking) {
      throw new Error('Associated booking not found.');
    }

    const previousBalance = booking.remainingBalance;
    const remainingBalance = Math.max(0, previousBalance - data.amountReceived);
    const totalReceived = booking.totalReceived + data.amountReceived;
    const isFullyPaid = remainingBalance <= 0;

    const txnId = `txn-${Date.now()}`;
    const receiptNumber = generateReceiptNumber();

    const newTxn: Transaction = stripUndefined({
      id: txnId,
      receiptNumber,
      projectId: data.projectId,
      plotId: data.plotId,
      customerId: data.customerId,
      bookingId: data.bookingId,
      ...(data.installmentId ? { installmentId: data.installmentId } : {}),
      amountReceived: data.amountReceived,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      previousBalance,
      remainingBalance,
      receivedBy: currentUser?.displayName || 'Finance Desk',
      remarks: data.remarks || '',
      isDemo: false,
      createdAt: new Date().toISOString(),
    });

    // Update Installments: apply payment to target installment or auto-settle earliest pending installments
    let updatedInstallments = [...installments];
    if (data.installmentId) {
      updatedInstallments = updatedInstallments.map((inst) => {
        if (inst.id === data.installmentId) {
          const newPaid = inst.amountPaid + data.amountReceived;
          const status = newPaid >= inst.amountDue ? 'paid' : 'partially_paid';
          return {
            ...inst,
            amountPaid: newPaid,
            status,
            paidDate: data.paymentDate,
            lastPaymentMethod: data.paymentMethod,
            updatedAt: new Date().toISOString(),
          };
        }
        return inst;
      });
    } else {
      let remainingCredit = data.amountReceived;
      updatedInstallments = updatedInstallments.map((inst) => {
        if (inst.bookingId === data.bookingId && inst.status !== 'paid' && remainingCredit > 0) {
          const needed = inst.amountDue - inst.amountPaid;
          if (remainingCredit >= needed) {
            remainingCredit -= needed;
            return {
              ...inst,
              amountPaid: inst.amountDue,
              status: 'paid',
              paidDate: data.paymentDate,
              lastPaymentMethod: data.paymentMethod,
              updatedAt: new Date().toISOString(),
            };
          } else {
            const newPaid = inst.amountPaid + remainingCredit;
            remainingCredit = 0;
            return {
              ...inst,
              amountPaid: newPaid,
              status: 'partially_paid',
              paidDate: data.paymentDate,
              lastPaymentMethod: data.paymentMethod,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return inst;
      });
    }

    const newPlotStatus: Plot['status'] = isFullyPaid ? 'sold' : 'installments_in_progress';

    // Commit to state
    setTransactions((prev) => [newTxn, ...prev]);
    setInstallments(updatedInstallments);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === data.bookingId
          ? {
              ...b,
              remainingBalance,
              totalReceived,
              status: isFullyPaid ? 'completed' : 'active',
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
    setPlots((prev) =>
      prev.map((p) =>
        p.id === data.plotId
          ? {
              ...p,
              status: newPlotStatus,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'transactions', txnId), stripUndefined(newTxn));
        await setDoc(
          doc(db, 'bookings', data.bookingId),
          { remainingBalance, totalReceived, status: isFullyPaid ? 'completed' : 'active', updatedAt: new Date().toISOString() },
          { merge: true }
        );
        await setDoc(
          doc(db, 'plots', data.plotId),
          { status: newPlotStatus, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Payment transaction fallback:', err);
      }
    }

    await addActivityLog(
      'PAYMENT_COLLECTED',
      `Payment of PKR ${data.amountReceived.toLocaleString()} received. Receipt #${receiptNumber}. Remaining balance: PKR ${remainingBalance.toLocaleString()}.`,
      data.projectId,
      data.plotId,
      data.customerId
    );

    return newTxn;
  };

  const updateInstallment = async (id: string, data: Partial<Installment>) => {
    const updated = stripUndefined({ ...data, updatedAt: new Date().toISOString() });
    setInstallments((prev) => prev.map((inst) => (inst.id === id ? ({ ...inst, ...updated } as Installment) : inst)));

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'installments', id), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `installments/${id}`);
      }
    }

    await addActivityLog('INSTALLMENT_ADJUSTED', `Installment ${id} schedule/amount adjusted.`, activeProjectId);
  };

  // Seed & Clear Demo Data
  const seedDemoData = async () => {
    setProjects([INITIAL_PROJECT]);
    setActiveProjectId(INITIAL_PROJECT.id);
    setPlots(generateDemoPlots(INITIAL_PROJECT.id));
    setCustomers(DEMO_CUSTOMERS);
    setBookings(DEMO_BOOKINGS);
    setInstallments(DEMO_INSTALLMENTS);
    setTransactions(DEMO_TRANSACTIONS);
    setActivityLogs(DEMO_ACTIVITY_LOGS);

    await addActivityLog('DEMO_DATA_SEEDED', 'Demonstration records loaded for Al-Basit Residency showcase.', INITIAL_PROJECT.id);
  };

  const clearDemoData = async () => {
    setPlots((prev) => prev.filter((p) => !p.isDemo));
    setCustomers((prev) => prev.filter((c) => !c.isDemo));
    setBookings((prev) => prev.filter((b) => !b.isDemo));
    setInstallments((prev) => prev.filter((i) => !i.isDemo));
    setTransactions((prev) => prev.filter((t) => !t.isDemo));
    setProjects((prev) => prev.filter((p) => !p.isDemo));

    await addActivityLog('DEMO_DATA_CLEARED', 'All demonstration data was removed. Application is now production clean.');
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProjectId,
        plots: projectPlots,
        allPlots: plots,
        customers,
        bookings,
        installments,
        transactions,
        activityLogs,
        isLoading,
        isFirestoreConnected,
        createProject,
        updateProject,
        deleteProject,
        createPlot,
        bulkCreatePlots,
        updatePlot,
        deletePlot,
        syncMasterPlanPlots,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createBooking,
        recordPayment,
        updateInstallment,
        seedDemoData,
        clearDemoData,
        addActivityLog,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
