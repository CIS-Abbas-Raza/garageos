export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  avatar?: string;
}

export interface Job {
  id: string;
  customerId: string;
  vehicleId: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  createdAt: Date;
  dueAt?: Date;
  completedAt?: Date;
  mechanic?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: number;
  lastServiceDate?: Date;
  nextServiceDue?: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  vehicles: Vehicle[];
  totalJobs: number;
  totalSpent: number;
}

export interface Mechanic {
  id: string;
  name: string;
  email: string;
  specialization: string;
  availability: "available" | "busy" | "off-duty";
  activeJobs: number;
  rating: number;
}

export interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  revenueMTD: number;
  revenueVsLastMonth: number;
  activeJobs: number;
  activeJobsVsLastMonth: number;
  pendingJobs: number;
  pendingJobsVsLastMonth: number;
  completedToday: number;
  completedTodayVsLastMonth: number;
  vehiclesToday: number;
  vehiclesTodayVsLastMonth: number;
  totalCustomers: number;
  totalCustomersVsLastMonth: number;
  mechanicsOnDuty: number;
  lowStockItems: number;
}

export interface Notification {
  id: string;
  type: "job" | "payment" | "alert" | "message";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
