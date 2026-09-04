"use client";


import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpDown,
  ChevronDown,
  CircleX,
  Eye,
  EyeOff,
  FileImage,
  LayoutGrid,
  List,
  Columns3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ShieldCheck,
  ClipboardList,
  Building2,
  Users,
  UserCog,
  Truck,
  FileText,
  Calendar,
  UserRoundCog,
  CreditCard,
  Package,
  Boxes,
  Bell,
  CalendarCheck,
  Download,
  Image as ImageIcon,
  KeyRound,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGarageStore } from "@/lib/store/garage-store";
import { useBranch } from "@/lib/branch-context";
import { useAuth } from "@/lib/auth-context";
import { getDashboardRole, type DashboardRole } from "@/lib/role-access";
import { ConfirmDeleteModal } from "@/components/common/confirm-delete-modal";
import { Pagination } from "@/components/common/pagination";
import { RecordCountBadges } from "@/components/common/record-count-badges";
import { DateRangeFilter, type DateRangeValue } from "@/components/common/date-range-filter";

/* ────────────────────────────── Types ────────────────────────────── */
type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "datetime-local"
  | "select"
  | "textarea"
  | "checkbox"
  | "toggle"
  | "star"
  | "file"
  | "dynamic-list";
type Field = {
  key: string;
  label: string;
  type?: FieldType;
  /** On update modals, field becomes optional (e.g. password) */
  optionalOnUpdate?: boolean;
  /** Override input type when editing (e.g. registration_no is number on Create, text on Update) */
  updateType?: FieldType;
  options?: { label: string; value: string }[];
  /** Endpoint returning `{ success, data }` records for a select field. */
  optionsEndpoint?: string;
  required?: boolean;
  readOnly?: boolean;
  multiple?: boolean;
  fullWidth?: boolean;
};
type Config = {
  resource: string;
  /** Relative API endpoint for resources that use the live backend. */
  apiEndpoint?: string;
  /** Loads and saves records for the active company only. */
  companyScoped?: boolean;
  /** Sends the logged-in user's ID as `created_by` for newly created records. */
  assignCurrentUserId?: boolean;
  /** Hides the header action for resources created through another workflow. */
  hideCreateButton?: boolean;
  /** Navigates the header create action to a dedicated page, preserving URL filters. */
  createPath?: string;
  /** Hides edit, view, and delete actions for read-only listings. */
  hideRowActions?: boolean;
  /** Hides only the Edit action while retaining the other row actions. */
  hideEditAction?: boolean;
  /** Hides the activate/deactivate action. */
  hideStatusAction?: boolean;
  /** Hides the delete action. */
  hideDeleteAction?: boolean;
  /** Makes row mutation actions unavailable for these roles. */
  readOnlyForRoles?: DashboardRole[];
  /** Enables a date range filter for a record date field. */
  dateRangeField?: string;
  /** Hides the generic active/inactive status filter. */
  hideStatusFilter?: boolean;
  /** Enables an Excel-compatible balance sheet export for ledger records. */
  balanceSheetExport?: boolean;
  /** Limits edit submissions to these fields. */
  updateFields?: string[];
  /** URL prefix for the record's `picture` file, shown in the edit dialog. */
  fileUrlPrefix?: string;
  /** Loads and saves records for the customer identified by `customer_id` in the URL. */
  customerScoped?: boolean;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  fields: Field[];
  columns: string[];
  empty: string;
};
type LineItem = {
  type: string;
  description: string;
  qty: number;
  unit_price?: number;
  task_status?: string;
  discount?: number;
  tax?: number;
  amount?: number;
};

/* ──────────────────────── Icon Map ────────────────────── */
const iconMap: Record<string, any> = {
  "Admin": ShieldCheck,
  "Packages": ClipboardList,
  "Roles": ShieldCheck,
  "Companies": Building2,
  "Company Users": Users,
  "User Role Assignments": UserCog,
  "Customers": Users,
  "Vehicles": Truck,
  "Vehicle Inspections": ClipboardList,
  "Quotations": ClipboardList,
  "Task Cards": FileText,
  "Appointments": Calendar,
  "Mechanics": UserRoundCog,
  "Customer Review": FileText,
  "Invoices": FileText,
  "Invoice Payments": CreditCard,
  "Daily Expenses": CreditCard,
  "Inventory": Package,
  "Suppliers": Truck,
  "Purchase Orders": ClipboardList,
  "SMS Settings": Bell,
  "WhatsApp Settings": Bell,
  "Email Settings": Bell,
  "Users": Users,
  "Role Assignments": UserCog,
  "Demo Bookings": CalendarCheck,
  "Vehicle Maintenance Pictures": ImageIcon,
  "SMS Setting": Bell,
  "WhatsApp Setting": Bell,
  "Email Setting (SendGrid)": Bell,
  "Reviews": Star,
  "Customer Reviews": Star,
};

const options = (values: string[]) =>
  values.map((value) => ({ label: value.replaceAll("_", " "), value }));
const statusField: Field = {
  key: "status",
  label: "Status",
  type: "select",
  required: true,
  options: options(["1", "0"]),
};

const exactFields: Record<string, Field[]> = {
  packages: [
    { key: "name", label: "Name", required: true },
    { key: "monthly", label: "Monthly Price", type: "number", required: true },
    { key: "yearly", label: "Yearly Price", type: "number", required: true },
    {
      key: "information",
      label: "Information",
      type: "dynamic-list",
      required: true,
    },
    statusField,
  ],
  admin: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "password", label: "Password", type: "password", required: true, optionalOnUpdate: true },
    { key: "phone", label: "Phone", required: true },
  ],
  roles: [{ key: "name", label: "Name", required: true }],
  customers: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "address", label: "Address", required: true },
  ],
  // Users module — global system users (no role field; role is Company User specific)
  employees: [
    { key: "profile_photo", label: "Profile Photo", type: "file" },
    { key: "name", label: "Full Name", required: true },
    { key: "country", label: "Country", type: "select", required: true, options: options(["United States"]) },
    { key: "state", label: "State", type: "select", required: true, options: options([
      'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
    ]) },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "address", label: "Address", required: true },
  ],
  // Company Users module — users scoped to a specific company (includes role)
  companyUsers: [
    { key: "profile_photo", label: "Profile Photo", type: "file" },
    { key: "name", label: "Full Name", required: true },
    { key: "country", label: "Country", type: "select", required: true, options: options(["United States"]) },
    { key: "state", label: "State", type: "select", required: true, options: options([
      'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
    ]) },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "address", label: "Address", required: true },
    {
      key: "role_id",
      label: "Role",
      type: "select",
      required: true,
      optionsEndpoint: "/backend-api/roles",
    },
  ],
  // ⚠️ SPEC FLAG: Company spec has no 'name' field — only 'user' (owner dropdown).
  // A 'name' field has been added here for listing display. Confirm with team.
  // ⚠️ SPEC FLAG: registration_no is 'number' on Create but 'text' on Update per spec.
  // This is implemented as specified via updateType — flag as unusual inconsistency.
  companies: [
    { key: "name", label: "Company Name", required: true },
    {
      key: "owner_id",
      label: "Owner",
      type: "select",
      required: true,
      optionsEndpoint: "/backend-api/users",
    },
    { key: "logo", label: "Logo", type: "file" },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "country", label: "Country", type: "select", required: true, options: options(["United States"]) },
    { key: "state", label: "State", type: "select", required: true, options: options([
      'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
    ]) },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "address", label: "Address", required: true },
    {
      key: "registration_no",
      label: "Registration No.",
      type: "number",      // number on Create
      updateType: "text",  // text on Update (spec requirement)
      required: true,
    },
  ],
  // ⚠️ SPEC FLAG: Vehicles has no customer/owner link field — a vehicle with no customer
  // relationship is unusual for a garage system. Confirm with team if this is intentional.
  vehicles: [
    { key: "make", label: "Make", required: true },
    { key: "model", label: "Model", required: true },
    { key: "year", label: "Year", type: "number", required: true },
    { key: "VIN", label: "VIN", type: "text", required: true },
    { key: "license_plate", label: "License plate", required: false },
    // Toggle (pill switch) — Yes = 1, No = 0
    { key: "insured", label: "Insured", type: "toggle", required: true },
    { key: "policy_number", label: "Policy number", required: true },
    { key: "claim_number", label: "Claim number", required: true },
    { key: "insurance_company", label: "Insurance company", required: true },
    {
      key: "insurance_company_phone",
      label: "Insurance company phone/Adjuster",
      type: "text",
      required: true,
    },
  ],
  // ⚠️ SPEC FLAG: Appointments customer/vehicle fields are free-text rather than linked dropdowns.
  // This prevents duplicate/mismatched data. Confirm with team if relational pickers are needed.
  appointments: [
    { key: "customer_name", label: "Customer name", required: true },
    {
      key: "customer_phone",
      label: "Customer phone",
      type: "number",
      required: true,
    },
    { key: "VIN", label: "VIN", type: "number", required: true },
    { key: "license_plate", label: "License plate", required: true },
    {
      key: "reservation_date",
      label: "Reservation date",
      type: "datetime-local",
      required: true,
    },
    {
      key: "status",
      label: "Appointment status",
      type: "select",
      required: true,
      options: options([
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ]),
    },
    { key: "note", label: "Note", type: "textarea", fullWidth: true },
  ],
  // Package Subscriptions: links Company + Package with date range
  packageSubscriptions: [
    {
      key: "company_id",
      label: "Company",
      type: "select",
      required: true,
      optionsEndpoint: "/backend-api/companies",
    },
    {
      key: "package_id",
      label: "Package",
      type: "select",
      required: true,
      optionsEndpoint: "/backend-api/packages",
    },
    { key: "start_date", label: "Start Date", type: "datetime-local", required: true },
    { key: "end_date", label: "End Date", type: "datetime-local", required: true },
  ],
  estimations: [
    { key: "quotation_number", label: "Quotation Number", required: true },
    { key: "mileage", label: "Mileage", type: "number", required: true },
    { key: "note", label: "Note", type: "textarea" },
    {
      key: "quotation_status",
      label: "Quotation Status",
      type: "select",
      required: true,
      options: options([
        "draft",
        "pending",
        "approved",
        "rejected",
        "cancelled",
      ]),
    },
    { key: "subtotal", label: "Subtotal", type: "number", required: true },
    { key: "discount", label: "Discount", type: "number", required: true },
    { key: "tax_amount", label: "Tax Amount", type: "number", required: true },
    {
      key: "tax_percentage",
      label: "Tax Percentage",
      type: "number",
      required: true,
    },
    { key: "total", label: "Total", type: "number", required: true },
    {
      key: "creation_date",
      label: "Creation Date",
      type: "date",
      required: true,
    },
    { key: "document", label: "Document", type: "file" },
    statusField, // present on Create here, unlike every other module
  ],
  taskCards: [
    {
      key: "quotation_number",
      label: "Quotation number",
      required: true,
      readOnly: true,
    },
  ],
  invoices: [
    {
      key: "invoice_status",
      label: "Invoice status",
      type: "select",
      required: true,
      options: options(["draft", "pending", "approved"]),
    },
    {
      key: "payment_status",
      label: "Payment status",
      type: "select",
      required: true,
      options: options(["pending", "completed"]),
    },
    { key: "subtotal", label: "Subtotal", type: "number", required: true },
    { key: "discount", label: "Discount", type: "number", required: true },
    { key: "tax_amount", label: "Tax amount", type: "number", required: true },
    {
      key: "tax_percentage",
      label: "Tax percentage",
      type: "number",
      required: true,
    },
    { key: "total", label: "Total", type: "number", required: true },
    {
      key: "creation_date",
      label: "Creation date",
      type: "date",
      required: true,
    },
  ],
  towingInvoices: [
    {
      key: "invoice_status",
      label: "Invoice status",
      type: "select",
      required: true,
      options: options(["draft", "pending", "approved"]),
    },
    {
      key: "payment_status",
      label: "Payment status",
      type: "select",
      required: true,
      options: options(["pending", "completed"]),
    },
    { key: "subtotal", label: "Subtotal", type: "number", required: true },
    { key: "discount", label: "Discount", type: "number", required: true },
    { key: "tax_amount", label: "Tax amount", type: "number", required: true },
    {
      key: "tax_percentage",
      label: "Tax percentage",
      type: "number",
      required: true,
    },
    { key: "total", label: "Total", type: "number", required: true },
    {
      key: "creation_date",
      label: "Creation date",
      type: "date",
      required: true,
    },
  ],
  invoicePayments: [
    {
      key: "payment_status",
      label: "Payment status",
      type: "select",
      required: true,
      options: options(["pending", "not_verified", "verified", "rejected"]),
    },
  ],
  reviews: [
    { key: "rating", label: "Rating", type: "star", required: true },
    { key: "review", label: "Review", type: "textarea", required: true },
  ],
  demoBookings: [
    { key: "name", label: "Name", required: true },
    { key: "company_name", label: "Company name", required: true },
    { key: "country", label: "Country", required: true, type: "select", options: options(["United States"]) },
    { key: "state", label: "State", type: "select", options: options([
      'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
    ]) },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "email", label: "Email", type: "email", required: true },
  ],
  vehicleMaintenancePictures: [
    {
      key: "before_pictures",
      label: "Before Pictures",
      type: "file",
      required: true,
      multiple: true,
    },
    {
      key: "after_pictures",
      label: "After Pictures",
      type: "file",
      required: true,
      multiple: true,
    },
  ],
  smsSettings: [
    {
      key: "company_id",
      label: "Company",
      type: "select",
      required: true,
      optionsEndpoint: "/backend-api/companies",
    },
    { key: "sms_account_sid", label: "SMS Account SID", required: true },
    {
      key: "sms_auth_token",
      label: "SMS Auth Token",
      type: "password",
      required: true,
    },
    { key: "sms_from_number", label: "SMS From Number", required: true },
    statusField,
  ],
  whatsappSettings: [
    {
      key: "company_id",
      label: "Company",
      type: "select",
      required: true,
      optionsEndpoint: "/backend-api/companies",
    },
    {
      key: "whatsapp_account_sid",
      label: "WhatsApp Account SID",
      required: true,
    },
    {
      key: "whatsapp_auth_token",
      label: "WhatsApp Auth Token",
      type: "password",
      required: true,
    },
    {
      key: "whatsapp_from_number",
      label: "WhatsApp From Number",
      required: true,
    },
    statusField,
  ],
  emailSettings: [
    {
      key: "company_id",
      label: "Company",
      type: "select",
      required: true,
      optionsEndpoint: "/backend-api/companies",
    },
    {
      key: "sendgrid_api_key",
      label: "SendGrid API Key",
      type: "password",
      required: true,
    },
    {
      key: "email",
      label: "Sender Email",
      type: "email",
      required: true,
    },
    statusField,
  ],
};

/* ──────────────────────── Utilities ────────────────────── */
const singularize = (value: string) =>
  value.endsWith("ies")
    ? value.replace(/ies$/, "y")
    : value.endsWith("s")
      ? value.slice(0, -1)
      : value;

const labelize = (value: string) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replaceAll("_", " ")
    .replace(/^./, (v) => v.toUpperCase());

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

/* ──────────────────────── Line Items Sub-component ────────────────────── */
function LineItems({
  resource,
  value,
  onChange,
}: {
  resource: string;
  value: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  const task = resource === "taskCards";
  const create = () =>
    onChange([
      ...value,
      {
        type: "service",
        description: "",
        qty: 1,
        ...(task
          ? { task_status: "pending" }
          : { unit_price: 0, discount: 0, tax: 0, amount: 0 }),
      },
    ]);
  const update = (index: number, patch: Partial<LineItem>) =>
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index
          ? {
            ...item,
            ...patch,
            ...((!task && patch.qty !== undefined) ||
              patch.unit_price !== undefined
              ? {
                amount:
                  Number(patch.qty ?? item.qty) *
                  Number(patch.unit_price ?? item.unit_price),
              }
              : {}),
          }
          : item,
      ),
    );
  return (
    <div className="md:col-span-2 rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <Label>Line items</Label>
        <Button type="button" variant="outline" size="sm" onClick={create}>
          <Plus data-icon="inline-start" />
          Add row
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg bg-muted/40 p-3 md:grid-cols-[130px_1fr_80px_120px_auto]"
          >
            <Select
              value={item.type}
              onValueChange={(v) => update(index, { type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options(["service", "parts"]).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              placeholder="Description"
              value={item.description}
              onChange={(e) => update(index, { description: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Qty"
              value={item.qty}
              onChange={(e) => update(index, { qty: Number(e.target.value) })}
              required
            />
            {task ? (
              <Select
                value={item.task_status}
                onValueChange={(v) => update(index, { task_status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {options([
                      "pending",
                      "inprogress",
                      "completed",
                      "cancelled",
                    ]).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                placeholder="Unit price"
                value={item.unit_price}
                onChange={(e) =>
                  update(index, { unit_price: Number(e.target.value) })
                }
                required
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete line item"
              onClick={() =>
                onChange(value.filter((_, itemIndex) => itemIndex !== index))
              }
            >
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────── Dynamic Repeatable List Sub-component ────────────────────── */
function DynamicListField({
  field,
  form,
}: {
  field: Field;
  form: any;
}) {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.key,
  });

  const handleAdd = () => {
    append({ value: "" });
  };

  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <Label className="text-sm font-semibold text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5"> *</span>}
      </Label>
      <div className="flex flex-col gap-2">
        {fields.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              {...register(`${field.key}.${index}.value` as const, { required: "This field is required" })}
              placeholder={`Enter ${field.label.toLowerCase()} line`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-9 shrink-0"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-fit gap-1.5 mt-1 border-dashed hover:bg-muted"
      >
        <Plus className="size-3.5" />
        Add {field.label}
      </Button>
      {form.formState.errors[field.key] && (
        <p className="text-xs text-destructive">
          {form.formState.errors[field.key]?.message || "At least one entry is required."}
        </p>
      )}
    </div>
  );
}

/* ────────────────────── Form Field Renderer ────────────────────── */
function FormFieldRenderer({
  field,
  form,
  resourceKey,
  isEditing = false,
}: {
  field: Field;
  form: any;
  resourceKey: string;
  isEditing?: boolean;
}) {
  const [showPw, setShowPw] = useState(false);
  const [endpointOptions, setEndpointOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!field.optionsEndpoint) return;

    const loadOptions = async () => {
      try {
        const response = await fetch(field.optionsEndpoint!);
        const body = await response.json();
        if (!response.ok || body.success === false || !Array.isArray(body.data)) return;
        setEndpointOptions(
          body.data.map((record: { id: string | number; name?: string; email?: string }) => ({
            value: String(record.id),
            label: record.name ?? record.email ?? `User ${record.id}`,
          })),
        );
      } catch {
        setEndpointOptions([]);
      }
    };

    void loadOptions();
  }, [field.optionsEndpoint]);

  if (field.type === "dynamic-list") {
    return <DynamicListField field={field} form={form} />;
  }

  // Resolve the actual input type (updateType overrides type when editing)
  const resolvedType = isEditing && field.updateType ? field.updateType : (field.type ?? "text");
  const isOptional = isEditing && field.optionalOnUpdate;
  const selectOptions = field.optionsEndpoint ? endpointOptions : field.options ?? [];
  const selectedOption = selectOptions.find(
    (option) => option.value === String(form.watch(field.key) ?? ""),
  );

  return (
    <div className={`flex flex-col gap-1.5${field.fullWidth ? " md:col-span-2" : ""}`}>
      <Label
        htmlFor={`${resourceKey}-${field.key}`}
        className="text-sm font-semibold text-foreground"
      >
        {field.label}
        {field.required && !isOptional && <span className="text-destructive ml-0.5"> *</span>}
        {isOptional && <span className="ml-1 text-xs font-normal text-muted-foreground">(Optional — leave blank to keep current)</span>}
      </Label>
      {resolvedType === "select" ? (
        <Select
          value={String(form.watch(field.key) ?? "")}
          onValueChange={(value) =>
            form.setValue(field.key, value, { shouldValidate: true })
          }
        >
          <SelectTrigger id={`${resourceKey}-${field.key}`} className="h-10 w-full">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`}>
              {selectedOption?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {selectOptions.map((option: any, idx: number) => {
                const val = typeof option === "string" ? option : (option.value ?? String(option));
                const lbl = typeof option === "string" ? option.replaceAll("_", " ") : (option.label ?? val);
                return (
                  <SelectItem key={val || idx} value={val}>
                    {lbl}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : resolvedType === "textarea" ? (
        <Textarea
          id={`${resourceKey}-${field.key}`}
          {...form.register(field.key)}
          className="min-h-[80px]"
        />
      ) : resolvedType === "checkbox" ? (
        <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
          <input type="checkbox" {...form.register(field.key)} />
          Yes
        </label>
      ) : resolvedType === "file" ? (
        <div className="flex items-center gap-4 mt-1">
          <label className="flex size-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-500 transition-colors shrink-0">
            <div className="relative flex items-center justify-center">
              <ImageIcon className="size-6 text-slate-400" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-slate-200 shadow-sm flex items-center justify-center">
                <Plus className="size-2 text-slate-500" />
              </div>
            </div>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple={field.multiple}
              onChange={(e) =>
                form.setValue(field.key, e.target.files?.[0] ?? "")
              }
            />
          </label>
          <div className="flex flex-col gap-0.5">
            {form.watch(field.key) ? (
              <span className="text-sm text-foreground font-medium truncate max-w-[200px]">
                {form.watch(field.key) instanceof File ? form.watch(field.key).name : form.watch(field.key)}
              </span>
            ) : (
              <span className="text-sm text-slate-500 font-medium">JPEG, PNG, or WebP. Max 5MB.</span>
            )}
            <span className="text-xs text-slate-400">Click to upload or drag & drop</span>
          </div>
        </div>
      ) : resolvedType === "toggle" ? (
        /* ── Toggle / pill-switch for binary Yes/No fields ── */
        <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={form.watch(field.key) === "1" || form.watch(field.key) === true}
            onClick={() => {
              const current = form.watch(field.key);
              form.setValue(field.key, (current === "1" || current === true) ? "0" : "1", { shouldValidate: true });
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${form.watch(field.key) === "1" || form.watch(field.key) === true
                ? "bg-primary"
                : "bg-muted-foreground/30"
              }`}
          >
            <span
              className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${form.watch(field.key) === "1" || form.watch(field.key) === true
                  ? "translate-x-4"
                  : "translate-x-0"
                }`}
            />
          </button>
          <span className="text-sm text-foreground select-none">
            {form.watch(field.key) === "1" || form.watch(field.key) === true ? "Yes" : "No"}
          </span>
        </div>
      ) : field.type === "password" ? (
        /* ── Password field with show/hide toggle ── */
        <div className="relative">
          <Input
            id={`${resourceKey}-${field.key}`}
            type={showPw ? "text" : "password"}
            placeholder={isOptional ? "Leave blank to keep current" : "Enter password"}
            readOnly={field.readOnly}
            {...form.register(field.key)}
            className="h-10 pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      ) : (
        <Input
          id={`${resourceKey}-${field.key}`}
          type={resolvedType}
          readOnly={field.readOnly}
          {...form.register(field.key)}
          className="h-10"
        />
      )}
      {form.formState.errors[field.key] && (
        <p className="text-xs text-destructive">
          {String(form.formState.errors[field.key]?.message)}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*                       MAIN COMPONENT                             */
/* ══════════════════════════════════════════════════════════════════ */
export function EntityCrudPage({ config }: { config: Config }) {
  const router = useRouter();
  const store = useGarageStore();
  const { selectedCompany } = useBranch();
  const { user } = useAuth();
  const dashboardRole = getDashboardRole(user);
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>();

  useEffect(() => {
    const customerId = new URLSearchParams(window.location.search).get("customer_id");
    setSelectedCustomer(customerId ?? undefined);
  }, []);
  const apiEnabled = Boolean(config.apiEndpoint);
  const [apiRows, setApiRows] = useState<Record<string, any>[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [apiStatusCounts, setApiStatusCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const schemaKey =
    config.title === "Admin"
      ? "admin"
      : config.title === "Users" || config.title === "User Management"
        ? "employees"
        : config.title === "Company Employees" || config.title === "Company Users"
          ? "companyUsers"
          : config.title === "Package Subscriptions" || config.resource === "packageSubscriptions"
            ? "packageSubscriptions"
            : config.title === "Task Cards"
              ? "taskCards"
              : config.resource;
  const fields = exactFields[schemaKey] ?? config.fields;
  const isExcluded = ["taskCards", "estimations", "invoices", "invoicePayments"].includes(config.resource);
  const singular = singularize(config.resource);
  const rows = (apiEnabled
    ? apiRows
    : (store as any)[config.resource] ??
      (store as any).crudRecords?.[config.resource] ??
      []) as Record<string, any>[];

  const typedAdd = (store as any)[
    `add${singular.charAt(0).toUpperCase()}${singular.slice(1)}`
  ];
  const add = (record: Record<string, any>) =>
    (typedAdd ?? ((store as any).addCrudRecord.bind(store, config.resource)))(
      record,
    );
  const update = (id: string, record: Record<string, any>) =>
    (store as any).updateCrudRecord(config.resource, id, record);
  const remove = (id: string) =>
    (store as any).deleteCrudRecord(config.resource, id);

  const requestApi = useCallback(async (path = "", init?: RequestInit) => {
    const isFormData = init?.body instanceof FormData;
    const response = await fetch(`${config.apiEndpoint}${path}`, {
      ...init,
      headers: isFormData
        ? init?.headers
        : { "Content-Type": "application/json", ...init?.headers },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success === false) {
      throw new Error(body.message || body.error || "Unable to complete the request.");
    }
    return body;
  }, [config.apiEndpoint]);

  const loadApiRows = useCallback(async () => {
    if (!apiEnabled) return;
    if (config.companyScoped && !selectedCompany) {
      setApiRows([]);
      return;
    }
    if (config.customerScoped && !selectedCustomer) {
      setApiRows([]);
      return;
    }
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(page));
      queryParams.set("limit", String(pageSize));
      if (query.trim()) queryParams.set("search", query.trim());
      if (status !== "all") queryParams.set("status", status);
      queryParams.set("dateField", config.dateRangeField ?? "createdAt");
      if (dateFrom) queryParams.set("startDate", dateFrom);
      if (dateTo) queryParams.set("endDate", dateTo);
      if (config.companyScoped) queryParams.set("company_id", selectedCompany!);
      if (config.customerScoped) queryParams.set("customer_id", selectedCustomer!);
      const requestQuery = queryParams.size ? `?${queryParams.toString()}` : "";
      const responseBody = await requestApi(requestQuery);
      const records = Array.isArray(responseBody.data) ? responseBody.data : [];
      setApiTotal(Number(responseBody.total ?? records.length));
      setApiTotalPages(Number(responseBody.totalPages ?? 1));
      setApiStatusCounts(responseBody.statusCounts ?? {});
      setApiRows(
        ["smsSettings", "whatsappSettings", "emailSettings"].includes(config.resource)
          ? records.map((record) => ({
              ...record,
              company_name: record.company?.name ?? `Company #${record.company_id}`,
            }))
          : config.resource === "companies"
          ? records.map((record) => ({
              ...record,
              owner_name: record.owner?.name ?? `User #${record.owner_id}`,
            }))
          : config.resource === "companyUsers"
          ? records.map((record) => ({
              ...record,
              ...record.user,
              company_user_id: record.id,
              company_id: record.company_id,
              role_id: String(record.role_id ?? record.role?.id ?? ""),
              role: record.role?.name ?? record.role_id,
            }))
          : config.resource === "packages"
          ? records.map((record) => ({
              ...record,
              information:
                record.information ??
                record.packageInfos?.map((item: { information?: string }) => item.information) ??
                [],
            }))
          : config.resource === "invoicePayments"
          ? records.map((record) => ({
              ...record,
              invoice_number: record.invoice?.invoice_number ?? `Invoice #${record.invoice_id}`,
              amount: record.paid_amount,
              date: record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "—",
            }))
          : config.resource === "sales"
          ? records.map((record) => ({
              ...record,
              invoice_number: record.invoice?.invoice_number ?? `Invoice #${record.invoice_id}`,
            }))
          : config.resource === "companyExpenses"
          ? records.map((record) => ({
              ...record,
              created_by_name: record.creator?.name ?? `User #${record.created_by}`,
            }))
          : config.resource === "communicationLogs"
          ? records.map((record) => ({
              ...record,
              user_name: record.user?.name ?? `User #${record.user_id}`,
            }))
          : config.resource === "notifications"
          ? records.map((record) => ({
              ...record,
              user_name: record.user?.name ?? `User #${record.user_id}`,
              read: String(record.read) === "1" || record.read === true ? "Read" : "Unread",
            }))
          : config.resource === "reviews"
          ? records.map((record) => ({
              ...record,
              task_card_number: record.taskCard?.task_cards_number ?? `Task Card #${record.task_card_id}`,
            }))
          : records,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load records.");
    }
  }, [apiEnabled, config.companyScoped, config.customerScoped, config.dateRangeField, config.resource, dateFrom, dateTo, page, pageSize, query, requestApi, selectedCompany, selectedCustomer, status]);

  /* ── State ── */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const editingFileUrl = editing?.picture && config.fileUrlPrefix
    ? `${config.fileUrlPrefix}${encodeURIComponent(String(editing.picture))}`
    : undefined;
  const formFields =
    !fields.some((field) => field.key === "status") &&
    ![
      "packages",
      "invoicePayments",
      "smsSettings",
      "whatsappSettings",
      "emailSettings",
      "companyExpenses",
    ].includes(schemaKey)
      ? [...fields, statusField]
      : fields;
  const [viewing, setViewing] = useState<Record<string, any> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, any> | null>(null);
  const [resettingEmployee, setResettingEmployee] = useState<Record<string, any> | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [sortKey, setSortKey] = useState(config.columns[0]);
  const [sortAsc, setSortAsc] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const seededResources = useRef(new Set<string>());
  const isLineItemModule =
    ["estimations", "jobCards", "taskCards", "invoices"].includes(
      config.resource,
    ) || schemaKey === "taskCards" || schemaKey === "estimations";

  useEffect(() => {
    void loadApiRows();
  }, [loadApiRows]);

  /* ── Form schema ── */
  const formSchema = useMemo(
    () => {
      const shape = Object.fromEntries(
        formFields.map((field) => {
          if (field.type === "dynamic-list") {
            return [
              field.key,
              z.array(z.object({ value: z.string().min(1, "Entry cannot be empty") }))
                .min(1, "At least one information entry is required"),
            ];
          }
          const isInsuranceField = [
            "insurance_number",
            "policy_number",
            "expiry_date",
            "claim_number",
            "insurance_company",
            "insurance_company_phone",
          ].includes(field.key);

          const isRequired =
            field.required &&
            !(editing && field.optionalOnUpdate) &&
            !(schemaKey === "vehicles" && isInsuranceField);

          return [
            field.key,
            isRequired
              ? field.type === "number"
                ? z.coerce.number({ message: `${field.label} is required` }).min(0, "Must be >= 0")
                : field.type === "email"
                  ? z.string().email("Invalid email format")
                  : z.string().min(1, `${field.label} is required`)
              : z.any().optional(),
          ];
        }),
      );
      let schema = z.object(shape);

      if (schemaKey === "vehicles") {
        schema = schema.superRefine((data: any, ctx: any) => {
          const isInsured = data.insured === "1" || data.insured === true || data.insured === "Yes";
          if (isInsured) {
              const insuranceFields = [
                { key: "policy_number", label: "Policy number" },
                { key: "claim_number", label: "Claim number" },
                { key: "insurance_company", label: "Insurance company" },
                { key: "insurance_company_phone", label: "Insurance company phone/Adjuster" },
              ];
            for (const f of insuranceFields) {
              if (data[f.key] === undefined || data[f.key] === null || String(data[f.key]).trim() === "") {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${f.label} is required`,
                  path: [f.key],
                });
              }
            }
          }
        }) as any;
      }

      // Cross-field validation: end_date must be after start_date (Package Subscriptions)
      if (schemaKey === "packageSubscriptions") {
        schema = schema.superRefine((data: any, ctx: any) => {
          if (data.start_date && data.end_date && data.end_date <= data.start_date) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End date must be after start date",
              path: ["end_date"],
            });
          }
        }) as any;
      }
      return schema;
    },
    [formFields, editing, schemaKey],
  );

  const form = useForm<Record<string, any>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  /* ── Seed data ── */
  useEffect(() => {
    if (!apiEnabled && !rows.length && !seededResources.current.has(config.resource)) {
      seededResources.current.add(config.resource);
      for (let index = 1; index <= 2; index += 1) {
        const seedRecord = Object.fromEntries(
          fields.map((field) => {
            if (field.type === "dynamic-list") {
              return [
                field.key,
                [
                  { value: `Information line 1 for ${config.title}` },
                  { value: `Information line 2 for ${config.title}` },
                ],
              ];
            }
            return [
              field.key,
              field.type === "number"
                ? index * 50
                : field.type === "star"
                  ? 4
                  : field.type === "toggle" || field.type === "checkbox"
                    ? "1"
                    : field.type === "select"
                      ? (field.options?.[0]?.value ?? "1")
                      : `${field.label} ${index}`,
            ];
          }),
        );
        add(seedRecord);
      }
    }
  }, [add, apiEnabled, config.resource, fields, rows.length]);

  /* ── Filtered / sorted data ── */
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            JSON.stringify(row).toLowerCase().includes(query.toLowerCase()) &&
            (status === "all" || String(row.status ?? "1") === status) &&
            (!config.dateRangeField || !dateFrom || new Date(row[config.dateRangeField]).getTime() >= new Date(`${dateFrom}T00:00:00`).getTime()) &&
            (!config.dateRangeField || !dateTo || new Date(row[config.dateRangeField]).getTime() <= new Date(`${dateTo}T23:59:59.999`).getTime()),
        )
        .sort(
          (a, b) =>
            String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")) *
            (sortAsc ? 1 : -1),
        ),
    [rows, query, status, dateFrom, dateTo, sortKey, sortAsc, config.dateRangeField],
  );

  const totalPages = apiEnabled ? apiTotalPages : Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = apiEnabled ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const statusCounts = useMemo(() => {
    if (apiEnabled) return Object.entries(apiStatusCounts);
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const value = String(row.status ?? "1").toLowerCase();
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return Array.from(counts.entries()).slice(0, 3);
  }, [apiEnabled, apiStatusCounts, rows]);

  useEffect(() => {
    setPage(1);
  }, [query, status, dateFrom, dateTo, pageSize]);

  const exportBalanceSheet = () => {
    const xmlEntities: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" };
    const escapeXml = (value: unknown) => String(value ?? "").replace(/[<>&'\"]/g, (character) => xmlEntities[character]);
    const totalCredits = filtered.reduce((total, row) => total + (String(row.transaction_type).toLowerCase() === "credit" ? Number(row.amount) || 0 : 0), 0);
    const totalDebits = filtered.reduce((total, row) => total + (String(row.transaction_type).toLowerCase() === "debit" ? Number(row.amount) || 0 : 0), 0);
    const netBalance = totalCredits - totalDebits;
    const dateRange = [dateFrom || "All dates", dateTo || "All dates"].join(" to ");
    const cells = (values: unknown[]) => `<Row>${values.map((value) => `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`).join("")}</Row>`;
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Balance Sheet"><Table>${cells(["Balance Sheet"])}${cells(["Date range", dateRange])}${cells(["Total Credit", totalCredits.toFixed(2)])}${cells(["Total Debit", totalDebits.toFixed(2)])}${cells(["Net Balance", netBalance.toFixed(2)])}${cells([])}${cells(["Created At", "Transaction Type", "Reason", "Amount", "Balance", "Created By"])}${filtered.map((row) => cells([row.createdAt ? new Date(row.createdAt).toLocaleString() : "", row.transaction_type, row.reason, Number(row.amount ?? 0).toFixed(2), Number(row.balance ?? 0).toFixed(2), row.created_by_name])).join("")}</Table></Worksheet></Workbook>`;
    const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `balance-sheet-${dateFrom || "all"}-${dateTo || "dates"}.xls`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  /* ── Handlers ── */
  const openCreate = () => {
    if (config.createPath) {
      const query = new URLSearchParams(window.location.search).toString();
      router.push(`${config.createPath}${query ? `?${query}` : ""}`);
      return;
    }
    setEditing(null);
    form.reset({
      status: schemaKey === "appointments" ? "pending" : "1",
      information: [{ value: "" }], // Pre-populate one row for repeatable package field
    });
    setLineItems([]);
    setOpen(true);
  };

  const openEdit = (row: Record<string, any>) => {
    setEditing(row);
    // Ensure information conforms to FieldArray structure if it's stored as array of strings
    let formattedInfo = row.information;
    if (formattedInfo && Array.isArray(formattedInfo) && typeof formattedInfo[0] === "string") {
      formattedInfo = formattedInfo.map(v => ({ value: v }));
    }
    // If vehicle has nested insuredVehicle, merge its fields to top-level so form fields bind correctly
    const mergedRow = { ...row };
    if (schemaKey === "vehicles" && row.insuredVehicle) {
      mergedRow.insurance_number = row.insuredVehicle.insurance_number ?? row.insuredVehicle.insuranceNumber;
      mergedRow.policy_number = row.insuredVehicle.policy_number ?? row.insuredVehicle.policyNumber;
      mergedRow.expiry_date = row.insuredVehicle.expiry_date ?? row.insuredVehicle.expiryDate;
      mergedRow.claim_number = row.insuredVehicle.claim_number ?? row.insuredVehicle.claimNumber;
      mergedRow.insurance_company = row.insuredVehicle.insurance_company ?? row.insuredVehicle.insuranceCompany;
      mergedRow.insurance_company_phone = row.insuredVehicle.insurance_company_phone ?? row.insuredVehicle.insuranceCompanyPhone;
    }

    form.reset({
      ...mergedRow,
      ...(schemaKey === "companies" && { owner_id: String(row.owner_id ?? "") }),
      ...(schemaKey === "vehicles" && {
        insured:
          String(row.insured) === "1" || row.insured === true || row.insured === "Yes"
            ? "1"
            : "0",
      }),
      status: String(row.status ?? "1"),
      information: formattedInfo || [{ value: "" }],
      ...(schemaKey === "packageSubscriptions" && {
        start_date: row.start_date ? String(row.start_date).slice(0, 16) : "",
        end_date: row.end_date ? String(row.end_date).slice(0, 16) : "",
      }),
    });
    setLineItems(row.lineItems ?? []);
    setOpen(true);
  };

  const resetEmployeePassword = async () => {
    if (!resettingEmployee) return;
    setIsResettingPassword(true);
    try {
      const targetId = config.resource === "companyUsers"
        ? (resettingEmployee.company_user_id || resettingEmployee.id)
        : resettingEmployee.id;
      if (apiEnabled) {
        await requestApi(`/${targetId}/reset-password`, { method: "POST" });
      }
      toast.success(`Password reset successfully.`);
      setResettingEmployee(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const submit = async (data: Record<string, any>) => {
    // Flatten information array of objects into simple array of strings before saving to store
    let payload = { ...data };
    if (editing && config.updateFields) {
      payload = Object.fromEntries(
        config.updateFields.map((field) => [field, data[field]]),
      );
    }
    if (data.information && Array.isArray(data.information)) {
      payload.information = data.information.map((item: any) => item.value);
    }
    payload = { ...payload, ...(isLineItemModule ? { lineItems } : {}) };
    try {
      if (config.companyScoped) {
        if (!selectedCompany) {
          throw new Error("Select a company before managing company employees.");
        }
        payload.company_id = selectedCompany;
      }
      if (config.customerScoped) {
        if (!selectedCustomer) {
          throw new Error("Open Vehicles from a customer before managing vehicles.");
        }
        payload.customer_id = selectedCustomer;
      }
      if (config.assignCurrentUserId && !editing) {
        if (!user) {
          throw new Error("You must be logged in to create this record.");
        }
        payload.created_by = user.id;
      }
      if (apiEnabled) {
        const { id, createdAt, updatedAt, is_deleted, packageInfos, ...apiPayload } = payload;
        if (!apiPayload.password) delete apiPayload.password;
        const fileFields = fields.filter((field) => field.type === "file");
        const hasFile = fileFields.some((field) => apiPayload[field.key] instanceof File);
        const body = hasFile
          ? (() => {
              const formData = new FormData();
              Object.entries(apiPayload).forEach(([key, value]) => {
                if (value instanceof File) {
                  formData.append(key, value);
                } else if (!fileFields.some((field) => field.key === key)) {
                  formData.append(key, String(value ?? ""));
                }
              });
              return formData;
            })()
          : JSON.stringify(apiPayload);
        await requestApi(editing ? `/${editing.id}` : "", {
          method: editing ? "PUT" : "POST",
          body,
        });
        await loadApiRows();
      } else {
        editing ? update(editing.id, payload) : add(payload);
      }
      toast.success(`${singularize(config.title)} ${editing ? "updated" : "created"} successfully`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save record.");
    }
  };

  /* ── Get first two visible text fields for identity display ── */
  const identityFields = fields.filter(
    (f) => !["file", "checkbox", "textarea", "dynamic-list"].includes(f.type ?? "text"),
  ).slice(0, 2);

  /* ── Badge helpers for categorical columns ── */
  const isBadgeColumn = (column: string) =>
    ["status", "role", "scope", "priority", "payment_status", "invoice_status", "quotation_status", "appointments", "task_status", "payment_method", "active", "insured"].includes(column);

  const getBadgeColor = (column: string, value: string) => {
    const v = String(value).toLowerCase();
    if (column === "status" || column === "active" || column === "insured") {
      return v === "1" || v === "active" || v === "true" || v === "yes"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-red-100 text-red-800 border-red-200";
    }
    if (["approved", "completed", "verified", "confirmed"].includes(v))
      return "bg-green-100 text-green-800 border-green-200";
    if (["pending", "draft", "not_verified"].includes(v))
      return "bg-amber-100 text-amber-800 border-amber-200";
    if (["rejected", "cancelled", "no_show"].includes(v))
      return "bg-red-100 text-red-800 border-red-200";
    if (["inprogress", "in-progress", "in_progress"].includes(v))
      return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-primary/10 text-primary border-primary/20";
  };

  const IconComponent = config.icon || iconMap[config.title] || ShieldCheck;
  const isRoleReadOnly = config.readOnlyForRoles?.includes(dashboardRole) ?? false;

  /* ══════════════════════════════════════════════════════════════ */
  /*                           RENDER                              */
  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="p-6 lg:p-8 w-full">
      <div className="mx-auto max-w-7xl">

        {/* ═══ PAGE HEADER ═══ */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            {IconComponent && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconComponent className="size-5" />
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {config.title}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {!config.hideCreateButton && (
              <Button
                onClick={openCreate}
                className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 h-10 shrink-0"
              >
                <Plus className="size-4" />
                Add {singularize(config.title)}
              </Button>
            )}
            {config.balanceSheetExport && (
              <Button onClick={exportBalanceSheet} variant="outline" className="gap-2 rounded-lg px-5 h-10 shrink-0" disabled={filtered.length === 0}>
                <Download className="size-4" />
                Export Balance Sheet
              </Button>
            )}
          </div>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search...`}
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <DateRangeFilter
            value={dateFrom && dateTo ? { startDate: new Date(`${dateFrom}T00:00:00`), endDate: new Date(`${dateTo}T23:59:59.999`) } : null}
            onChange={(range: DateRangeValue | null) => {
              setDateFrom(range ? format(range.startDate, "yyyy-MM-dd") : "");
              setDateTo(range ? format(range.endDate, "yyyy-MM-dd") : "");
              setPage(1);
            }}
          />
          {/* Status filter */}
          {!config.hideStatusFilter && <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              {schemaKey === "appointments" ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </>
              ) : (
                <>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </>
              )}
            </select>
          </div>}
          {config.dateRangeField && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} type="date" aria-label="Created from" className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none" />
              <span className="text-sm text-muted-foreground">to</span>
              <input value={dateTo} onChange={(event) => setDateTo(event.target.value)} type="date" aria-label="Created to" className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none" />
            </div>
          )}
          {/* View mode toggle (visual only for now) */}
          <div className="flex items-center gap-0.5 ml-auto border border-border rounded-lg p-0.5 bg-muted/40">
            <button type="button" className="p-1.5 rounded bg-background text-primary shadow-sm" aria-label="List view">
              <List className="size-4" />
            </button>
            <button type="button" className="p-1.5 rounded text-muted-foreground hover:text-foreground" aria-label="Grid view">
              <LayoutGrid className="size-4" />
            </button>
            <button type="button" className="p-1.5 rounded text-muted-foreground hover:text-foreground" aria-label="Column view">
              <Columns3 className="size-4" />
            </button>
          </div>
        </div>

        {/* ═══ DATA TABLE ═══ */}
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-[#FAFAFA]">
                  <th className="w-12 px-5 py-3">
                    <input type="checkbox" className="rounded border-border text-primary bg-background focus:ring-primary size-4" />
                  </th>
                  {config.columns.map((column) => (
                    <th key={column} className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSortKey(column);
                          setSortAsc(sortKey === column ? !sortAsc : true);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {labelize(column)}
                        <ChevronDown className={`size-3 transition-transform ${sortKey === column && !sortAsc ? "rotate-180" : ""}`} />
                      </button>
                    </th>
                  ))}
                  {!config.hideRowActions && (
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={config.columns.length + (config.hideRowActions ? 1 : 2)}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      {config.empty}
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <input type="checkbox" className="rounded border-border text-primary bg-background focus:ring-primary size-4" />
                      </td>
                      {config.columns.map((column, colIdx) => (
                        <td key={column} className="px-5 py-4">
                          {isBadgeColumn(column) ? (
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase border ${getBadgeColor(column, row[column])}`}
                            >
                              {column === "insured"
                                ? row[column] === 1 || row[column] === "1" || row[column] === true
                                  ? "Yes"
                                  : "No"
                                : column === "active" || (column === "status" && schemaKey !== "appointments")
                                ? String(row[column]) === "0" || row[column] === false
                                  ? "Inactive"
                                  : "Active"
                                : labelize(String(row[column] ?? "—"))}
                            </span>
                          ) : column === "information" ? (
                            <span className="text-foreground font-medium">
                              {Array.isArray(row[column]) ? `${row[column].length} items` : row[column] ? "1 item" : "0 items"}
                            </span>
                          ) : column === "rating" ? (
                            /* Visual stars rendering in data-table cell */
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`size-3.5 ${Number(row[column] ?? 0) >= star
                                      ? "fill-current"
                                      : "text-muted-foreground/20"
                                    }`}
                                />
                              ))}
                            </div>
                          ) : colIdx === 0 ? (
                            /* First column: bold primary text + secondary below */
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {formatValue(row[column])}
                              </span>
                              {/* Show email or second field as secondary text if available */}
                              {row.email && column !== "email" && (
                                <span className="text-xs text-muted-foreground mt-0.5">
                                  {row.email}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-foreground">
                              {formatValue(row[column])}
                            </span>
                          )}
                        </td>
                      ))}
                      {/* Actions column */}
                      {!config.hideRowActions && <td className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            aria-label="Row actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => setViewing(row)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Eye className="size-4" />
                              View
                            </DropdownMenuItem>
                            {!config.hideEditAction && !isRoleReadOnly && (
                              <DropdownMenuItem
                                onClick={() => openEdit(row)}
                                className="gap-2 cursor-pointer text-xs"
                              >
                                <Pencil className="size-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {config.resource === "customers" && (
                              <DropdownMenuItem
                                onClick={() => router.push(`/vehicles?customer_id=${encodeURIComponent(String(row.id))}`)}
                                className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                <Truck className="size-4 text-blue-600" />
                                Vehicles
                              </DropdownMenuItem>
                            )}
                            {(config.resource === "vehicles" || schemaKey === "vehicles") && (
                              <DropdownMenuItem
                                onClick={() => router.push(`/quotations?vehicle_id=${encodeURIComponent(String(row.id))}`)}
                                className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                <ClipboardList className="size-4 text-blue-600" />
                                Quotation
                              </DropdownMenuItem>
                            )}
                            {(config.resource === "vehicles" || schemaKey === "vehicles") && (
                              <DropdownMenuItem
                                onClick={() => router.push(`/towing-invoices?vehicle_id=${encodeURIComponent(String(row.id))}`)}
                                className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                <FileText className="size-4 text-blue-600" />
                                Towing Invoice
                              </DropdownMenuItem>
                            )}
                            {(config.resource === "estimations" || schemaKey === "estimations" || config.title === "Quotations") && (
                              <DropdownMenuItem
                                onClick={() => router.push("/task-cards")}
                                className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                <FileText className="size-4 text-blue-600" />
                                Task Card
                              </DropdownMenuItem>
                            )}
                            {(config.resource === "jobCards" || schemaKey === "taskCards" || config.title === "Task Cards") && (
                              <DropdownMenuItem
                                onClick={() => router.push("/invoices")}
                                className="gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                <CreditCard className="size-4 text-blue-600" />
                                Invoice
                              </DropdownMenuItem>
                            )}
                            {(config.resource === "companyUsers" || config.resource === "customers" || schemaKey === "customers" || config.title === "Customers") && (
                              <DropdownMenuItem
                                onClick={() => setResettingEmployee(row)}
                                className="gap-2 cursor-pointer text-xs"
                              >
                                <KeyRound className="size-4" />
                                Reset Password
                              </DropdownMenuItem>
                            )}
                            {!config.hideStatusAction && !isRoleReadOnly && <DropdownMenuItem
                              onClick={async () => {
                                const updated = { ...row, status: String(row.status) === "0" ? "1" : "0" };
                                try {
                                  if (apiEnabled) {
                                    await requestApi(`/${row.id}`, {
                                      method: "PUT",
                                      body: JSON.stringify({ status: updated.status }),
                                    });
                                    await loadApiRows();
                                  } else {
                                    update(row.id, updated);
                                  }
                                  toast.success(`${singularize(config.title)} ${updated.status === "1" ? "activated" : "deactivated"} successfully`);
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : "Unable to update record.");
                                }
                              }}
                              className="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 text-xs"
                            >
                              <CircleX className="size-4" />
                              Deactivate
                            </DropdownMenuItem>}
                            {!config.hideDeleteAction && !isRoleReadOnly && <DropdownMenuItem
                              onClick={() => setDeleting(row)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive text-xs"
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <RecordCountBadges counts={[
            { label: "Total", value: apiEnabled ? apiTotal : rows.length },
            ...statusCounts.map(([value, count]) => ({
              label: value === "1" ? "Active" : value === "0" ? "Inactive" : labelize(value),
              value: count,
              color: value === "1" ? "green" as const : value === "0" ? "neutral" as const : "blue" as const,
            })),
          ]} />
          <div className="flex flex-wrap items-center gap-4 sm:ml-auto">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Rows per page
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="h-9 w-[70px] bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{[10, 25, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${singularize(config.title).toLowerCase()}?`}
        message={`Are you sure you want to delete this ${singularize(config.title).toLowerCase()}? This action cannot be undone.`}
        successMessage={`${singularize(config.title)} deleted successfully.`}
        onConfirm={async () => {
          if (!deleting) return;
          if (apiEnabled) {
            await requestApi(`/${deleting.id}`, { method: "DELETE" });
            await loadApiRows();
          } else {
            remove(deleting.id);
          }
          setDeleting(null);
        }}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*                   ADD / EDIT MODAL                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={config.resource === "invoicePayments" ? "flex max-h-[90vh] sm:max-w-lg flex-col gap-0 overflow-hidden p-0 bg-background border-border" : isExcluded ? "flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 bg-background border-border" : "flex max-h-[90vh] sm:max-w-[650px] flex-col gap-0 overflow-hidden p-0 bg-white border border-slate-200 rounded-xl shadow-xl"}>
          <DialogHeader className={isExcluded ? "shrink-0 border-b border-border px-6 py-5 pr-14" : "shrink-0 px-6 pt-6 pb-4 space-y-1 pr-14"}>
            <DialogTitle className={isExcluded ? "text-lg font-bold text-foreground" : "text-xl font-bold text-slate-900"}>
              {editing
                ? `Update ${singularize(config.title)}`
                : `Add New ${singularize(config.title)}`}
            </DialogTitle>
            <DialogDescription className={isExcluded ? "text-xs text-muted-foreground mt-1" : "text-sm text-slate-500 font-normal mt-1"}>
              {editing
                ? `Make changes to this ${singularize(config.title).toLowerCase()} below.`
                : `Create a new ${singularize(config.title).toLowerCase()} record. Fields marked with * are required.`}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className={isExcluded ? "min-h-0 flex-1 overflow-y-auto px-6 py-5" : "min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2"}>
              <div className={config.resource === "invoicePayments" ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
                {formFields
                  .filter(
                    (field) =>
                      !(["admin", "customers", "employees", "packages", "roles", "companies", "companyUsers", "vehicles", "smsSettings", "whatsappSettings", "emailSettings"].includes(schemaKey) && field.key === "status"),
                  )
                  .filter(
                    (field) =>
                      !(
                        !editing &&
                        field.key === "status" &&
                        [
                          "admin",
                          "users",
                          "roles",
                          "companies",
                          "employees",
                          "companyUsers",
                          "customers",
                          "vehicles",
                          "appointments",
                          "packageSubscriptions",
                          "invoices",
                          "reviews",
                          "demoBookings",
                          "packages",
                          "taskCards",
                          "vehicleMaintenancePictures",
                        ].includes(schemaKey)
                      ),
                  )
                  .filter((field) => {
                    if (schemaKey === "vehicles") {
                      const isInsuranceField = [
                        "insurance_number",
                        "policy_number",
                        "expiry_date",
                        "claim_number",
                        "insurance_company",
                        "insurance_company_phone",
                      ].includes(field.key);
                      const insuredVal = form.watch("insured");
                      const isInsured = insuredVal === "1" || insuredVal === true || insuredVal === "Yes";
                      if (isInsuranceField && !isInsured) return false;
                    }
                    return true;
                  })
                  .map((field) => (
                    <FormFieldRenderer
                      key={field.key}
                      field={field}
                      form={form}
                      resourceKey={config.resource}
                      isEditing={Boolean(editing)}
                    />
                  ))}
                {editing && editingFileUrl && (
                  <div className="space-y-2">
                    <Label>Payment proof</Label>
                    <Button type="button" variant="outline" className="w-fit" onClick={() => window.open(editingFileUrl, "_blank", "noopener,noreferrer")}>
                      <Eye className="size-4" />
                      View file
                    </Button>
                  </div>
                )}
                {isLineItemModule && (
                  <LineItems
                    resource={config.resource}
                    value={lineItems}
                    onChange={setLineItems}
                  />
                )}
              </div>
              {/* Active Toggle (Mockup Style) */}
              {!isExcluded && schemaKey !== "appointments" && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Active</p>
                    <p className="text-xs text-slate-500">Enable or disable this record</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.watch("status") !== "0"}
                      onChange={(e) =>
                        form.setValue("status", e.target.checked ? "1" : "0")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              )}
            </div>
            <DialogFooter className={isExcluded ? "shrink-0 border-t border-border px-6 py-4 bg-muted/20" : "shrink-0 border-t border-slate-200/80 px-6 py-4 bg-white flex justify-end gap-3"}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className={isExcluded ? "" : "border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 rounded-lg"}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={isExcluded ? "font-semibold bg-primary hover:bg-primary/95 text-white" : "bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-4 rounded-lg transition-colors"}
              >
                {editing ? "Update" : "Create"} {singularize(config.title)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*                     VIEW MODAL                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(value) => !value && setViewing(null)}
      >
        <DialogContent className={isExcluded ? "max-w-2xl p-0 gap-0 bg-background border-border" : "flex max-h-[90vh] sm:max-w-[650px] flex-col gap-0 overflow-hidden p-0 bg-white border border-slate-200 rounded-xl shadow-xl"}>
          <DialogHeader className={isExcluded ? "border-b border-border px-6 py-5 pr-14" : "shrink-0 px-6 pt-6 pb-4 space-y-1 pr-14"}>
            <DialogTitle className={isExcluded ? "text-lg font-bold text-foreground" : "text-xl font-bold text-slate-900"}>
              {singularize(config.title)} Details
            </DialogTitle>
            <DialogDescription className={isExcluded ? "text-xs text-muted-foreground mt-1" : "text-sm text-slate-500 font-normal mt-1"}>
              Viewing details for this {singularize(config.title).toLowerCase()} record.
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className={isExcluded ? "px-6 py-5" : "min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2"}>
              {/* Identity block */}
              {/* Merge insuredVehicle fields into view data for display */}
              {(() => {
                const viewData = schemaKey === "vehicles" && viewing.insuredVehicle ? { ...viewing, ...viewing.insuredVehicle } : viewing;
                return (
                  <> 
                    {identityFields.length > 0 && (
                      <div className="mb-5 rounded-lg bg-muted/40 border border-border px-4 py-3">
                        <p className="font-semibold text-foreground">
                          {formatValue(viewData[identityFields[0].key])}
                        </p>
                        {identityFields[1] && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatValue(viewData[identityFields[1].key])}
                          </p>
                        )}
                      </div>
                    )}
              {/* Fields grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {fields.map((field) => (
                        <div key={field.key} className="border-b border-border/50 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {field.label}
                          </p>
                          {field.type === "dynamic-list" ? (
                            <ul className="mt-1 list-disc list-inside text-sm font-semibold text-foreground space-y-1">
                              {Array.isArray((schemaKey === "vehicles" && viewing.insuredVehicle ? { ...viewing, ...viewing.insuredVehicle } : viewing)[field.key]) ? (
                                (schemaKey === "vehicles" && viewing.insuredVehicle ? { ...viewing, ...viewing.insuredVehicle } : viewing)[field.key].map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))
                              ) : (
                                <li>{formatValue((schemaKey === "vehicles" && viewing.insuredVehicle ? { ...viewing, ...viewing.insuredVehicle } : viewing)[field.key])}</li>
                              )}
                            </ul>
                          ) : (
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {formatValue((schemaKey === "vehicles" && viewing.insuredVehicle ? { ...viewing, ...viewing.insuredVehicle } : viewing)[field.key])}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
              {/* Timestamps */}
              {(viewing.createdAt || viewing.id) && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Created
                    </p>
                    <p className="mt-1 text-xs font-bold text-foreground">
                      {viewing.createdAt
                        ? new Date(viewing.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Updated
                    </p>
                    <p className="mt-1 text-xs font-bold text-foreground">
                      {viewing.updatedAt
                        ? new Date(viewing.updatedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/*                RESET PASSWORD MODAL                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Dialog
        open={Boolean(resettingEmployee)}
        onOpenChange={(value) => !value && setResettingEmployee(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset password?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-slate-600">
              New password will be{" "}
              <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-slate-900 border border-slate-200">
                {config.resource === "customers" || schemaKey === "customers" || config.title === "Customers" ? "garageCustomer@123" : "garage@123"}
              </code>
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResettingEmployee(null)}
              disabled={isResettingPassword}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={resetEmployeePassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Resetting..." : "Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Config, Field };
