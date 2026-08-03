// Company & Organization
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  active: boolean;
  createdAt: Date;
}

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  active: boolean;
  createdAt: Date;
}

export interface Role {
  id: string;
  companyId: string;
  name: string;
  permissions: string[];
  createdAt: Date;
}

// Customers & Vehicles
export interface Customer {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  notes?: string;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  companyId: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  mileage: number;
  color?: string;
  image?: string;
  createdAt: Date;
}

export interface VehicleInspection {
  id: string;
  vehicleId: string;
  mileage: number;
  inspectionDate: Date;
  checklist: Record<string, boolean>;
  notes?: string;
  createdAt: Date;
}

// Estimations & Job Cards
export interface LineItem {
  id: string;
  type: "labour" | "parts";
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Estimation {
  id: string;
  companyId: string;
  vehicleId: string;
  customerId: string;
  description: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  createdAt: Date;
}

export interface JobCard {
  id: string;
  companyId: string;
  estimationId?: string;
  vehicleId: string;
  customerId: string;
  mechanicId: string;
  title: string;
  description: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  photos: string[];
  createdAt: Date;
}

// Appointments
export interface Appointment {
  id: string;
  companyId: string;
  customerId: string;
  vehicleId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: Date;
}

// Mechanics
export interface Mechanic {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: string[];
  available: boolean;
  createdAt: Date;
}

// Inventory
export interface Part {
  id: string;
  companyId: string;
  supplierId?: string;
  partNumber: string;
  name: string;
  description?: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  category: string;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  partId: string;
  type: "in" | "out";
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  contactPerson?: string;
  createdAt: Date;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  supplierId: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "received" | "cancelled";
  dueDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdAt: Date;
}

// Invoicing & Payments
export interface Invoice {
  id: string;
  companyId: string;
  jobCardId?: string;
  customerId: string;
  vehicleId?: string;
  invoiceNumber: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  status: "draft" | "sent" | "paid" | "partially-paid" | "overdue" | "cancelled";
  dueDate: Date;
  issuedDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "cash" | "card" | "check" | "transfer";
  reference?: string;
  notes?: string;
  createdAt: Date;
}

// Notifications
export interface Notification {
  id: string;
  companyId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Settings
export interface TaxRate {
  id: string;
  companyId: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

export interface GarageSettings {
  companyId: string;
  logoUrl?: string;
  primaryColor: string;
  phoneNumber: string;
  email: string;
  address: string;
  taxRates: TaxRate[];
  businessHours?: {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
}
