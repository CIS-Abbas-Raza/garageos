"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpDown,
  Eye,
  FileImage,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
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
import { useGarageStore } from "@/lib/store/garage-store";

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
  | "file";
type Field = {
  key: string;
  label: string;
  type?: FieldType;
  options?: { label: string; value: string }[];
  required?: boolean;
  readOnly?: boolean;
  multiple?: boolean;
};
type Config = {
  resource: string;
  title: string;
  description: string;
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
    { key: "monthly", label: "Monthly", type: "number", required: true },
    { key: "yearly", label: "Yearly", type: "number", required: true },
    {
      key: "information",
      label: "Information",
      type: "textarea",
      required: true,
    },
  ],
  admin: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "password", label: "Password", type: "number", required: true },
    { key: "phone", label: "Phone", type: "number", required: true },
  ],
  roles: [{ key: "name", label: "Name", required: true }],
  customers: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "password", label: "Password", type: "password", required: true },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "address", label: "Address", required: true },
  ],
  employees: [
    { key: "profile_photo", label: "Profile photo", type: "file" },
    { key: "name", label: "Name", required: true },
    {
      key: "country",
      label: "Country",
      type: "select",
      required: true,
      options: options([
        "Pakistan",
        "United Arab Emirates",
        "Saudi Arabia",
        "United Kingdom",
      ]),
    },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "password", label: "Password", type: "password", required: true },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "address", label: "Address", required: true },
    {
      key: "role",
      label: "Role",
      type: "select",
      required: true,
      options: options(["Mechanic", "Finance"]),
    },
  ],
  companies: [
    {
      key: "user",
      label: "User",
      type: "select",
      required: true,
      options: options(["Garage Admin"]),
    },
    { key: "logo", label: "Logo", type: "file" },
    { key: "email", label: "Email", type: "email", required: true },
    {
      key: "country",
      label: "Country",
      type: "select",
      required: true,
      options: options([
        "Pakistan",
        "United Arab Emirates",
        "Saudi Arabia",
        "United Kingdom",
      ]),
    },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "address", label: "Address", required: true },
    {
      key: "registration_no",
      label: "Registration no.",
      type: "number",
      required: true,
    },
  ],
  vehicles: [
    { key: "name", label: "Name", required: true },
    { key: "make", label: "Make", required: true },
    { key: "model", label: "Model", required: true },
    { key: "variant", label: "Variant", required: true },
    { key: "year", label: "Year", type: "number", required: true },
    { key: "VIN", label: "VIN", type: "number", required: true },
    { key: "license_plate", label: "License plate", required: true },
    { key: "insured", label: "Insured", type: "checkbox", required: true },
    { key: "insurance_number", label: "Insurance number", required: true },
    { key: "policy_number", label: "Policy number", required: true },
    { key: "expiry_date", label: "Expiry date", type: "date", required: true },
    { key: "claim_number", label: "Claim number", required: true },
    { key: "insurance_company", label: "Insurance company", required: true },
    {
      key: "insurance_company_phone",
      label: "Insurance company phone",
      type: "number",
      required: true,
    },
  ],
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
    { key: "note", label: "Note", type: "textarea" },
    {
      key: "appointments",
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
  ],
  estimations: [
    { key: "quotation_number", label: "Quotation number", required: true },
    { key: "mileage", label: "Mileage", type: "number", required: true },
    { key: "note", label: "Note", type: "textarea" },
    {
      key: "quotation_status",
      label: "Quotation status",
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
    { key: "document", label: "Document", type: "file" },
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
  invoicePayments: [
    {
      key: "invoice_id",
      label: "Invoice ID",
      type: "number",
      required: true,
      readOnly: true,
    },
    {
      key: "total_amount",
      label: "Total amount",
      type: "number",
      required: true,
    },
    {
      key: "balance_amount",
      label: "Balance amount",
      type: "number",
      required: true,
    },
    {
      key: "paid_amount",
      label: "Paid amount",
      type: "number",
      required: true,
    },
    { key: "picture", label: "Picture", type: "file" },
    {
      key: "payment_method",
      label: "Payment method",
      type: "select",
      required: true,
      options: options(["cash", "card", "bank_transfer", "online"]),
    },
    {
      key: "payment_status",
      label: "Payment status",
      type: "select",
      required: true,
      options: options(["pending", "not_verified", "verified", "rejected"]),
    },
  ],
  reviews: [
    { key: "rating", label: "Rating (1-5)", type: "number", required: true },
    { key: "review", label: "Review", type: "textarea", required: true },
  ],
  demoBookings: [
    { key: "name", label: "Name", required: true },
    { key: "company_name", label: "Company name", required: true },
    { key: "country", label: "Country", required: true },
    { key: "phone", label: "Phone", type: "number", required: true },
    { key: "email", label: "Email", type: "email", required: true },
  ],
  vehicleMaintenancePictures: [
    {
      key: "before_pictures",
      label: "Before pictures",
      type: "file",
      required: true,
      multiple: true,
    },
    {
      key: "after_pictures",
      label: "After pictures",
      type: "file",
      required: true,
      multiple: true,
    },
  ],
  smsSettings: [
    { key: "sms_account_sid", label: "SMS account SID", required: true },
    {
      key: "sms_auth_token",
      label: "SMS auth token",
      type: "textarea",
      required: true,
    },
    { key: "sms_from_number", label: "SMS from number", required: true },
    statusField,
  ],
  whatsappSettings: [
    {
      key: "whatsapp_account_sid",
      label: "WhatsApp account SID",
      required: true,
    },
    {
      key: "whatsapp_auth_token",
      label: "WhatsApp auth token",
      type: "textarea",
      required: true,
    },
    {
      key: "whatsapp_from_number",
      label: "WhatsApp from number",
      required: true,
    },
    statusField,
  ],
  emailSettings: [
    {
      key: "sendgrid_api_key",
      label: "SendGrid API key",
      type: "textarea",
      required: true,
    },
    statusField,
  ],
};

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
const formatValue = (value: unknown) =>
  value === null || value === undefined || value === ""
    ? "—"
    : typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : String(value);

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

export function EntityCrudPage({ config }: { config: Config }) {
  const store = useGarageStore();
  const schemaKey =
    config.title === "Admin"
      ? "admin"
      : config.title === "Users"
        ? "employees"
        : config.title === "Task Cards"
          ? "taskCards"
          : config.resource;
  const fields = exactFields[schemaKey] ?? config.fields;
  const singular = singularize(config.resource);
  const rows = ((store as any)[config.resource] ??
    (store as any).crudRecords?.[config.resource] ??
    []) as Record<string, any>[];
  const add = (record: Record<string, any>) =>
    (store as any).addCrudRecord(config.resource, record);
  const update = (id: string, record: Record<string, any>) =>
    (store as any).updateCrudRecord(config.resource, id, record);
  const remove = (id: string) =>
    (store as any).deleteCrudRecord(config.resource, id);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const formFields =
    editing &&
    !fields.some((field) => field.key === "status") &&
    ![
      "packages",
      "invoicePayments",
      "smsSettings",
      "whatsappSettings",
      "emailSettings",
    ].includes(schemaKey)
      ? [...fields, statusField]
      : fields;
  const [viewing, setViewing] = useState<Record<string, any> | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState(config.columns[0]);
  const [sortAsc, setSortAsc] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const isLineItemModule =
    ["estimations", "jobCards", "taskCards", "invoices"].includes(
      config.resource,
    ) || schemaKey === "taskCards";
  const formSchema = useMemo(
    () =>
      z.object(
        Object.fromEntries(
          formFields.map((field) => [
            field.key,
            field.required
              ? field.type === "number"
                ? z.coerce.number({ message: `${field.label} is required` })
                : z.string().min(1, `${field.label} is required`)
              : z.any().optional(),
          ]),
        ),
      ),
    [formFields],
  );
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  useEffect(() => {
    if (!rows.length) {
      for (let index = 1; index <= 2; index += 1)
        add(
          Object.fromEntries(
            fields.map((field) => [
              field.key,
              field.type === "number"
                ? index
                : field.type === "checkbox"
                  ? true
                  : field.type === "select"
                    ? (field.options?.[0]?.value ?? "1")
                    : `${field.label} ${index}`,
            ]),
          ),
        );
    }
  }, [add, config.resource, fields, rows.length]);
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            JSON.stringify(row).toLowerCase().includes(query.toLowerCase()) &&
            (status === "all" || String(row.status ?? "1") === status),
        )
        .sort(
          (a, b) =>
            String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")) *
            (sortAsc ? 1 : -1),
        ),
    [rows, query, status, sortKey, sortAsc],
  );
  const openCreate = () => {
    setEditing(null);
    form.reset({});
    setLineItems([]);
    setOpen(true);
    setMenuId(null);
  };
  const openEdit = (row: Record<string, any>) => {
    setEditing(row);
    form.reset(row);
    setLineItems(row.lineItems ?? []);
    setOpen(true);
    setMenuId(null);
  };
  const submit = (data: Record<string, any>) => {
    const payload = { ...data, ...(isLineItemModule ? { lineItems } : {}) };
    editing ? update(editing.id, payload) : add(payload);
    toast.success(
      `${singular} ${editing ? "updated" : "created"} successfully`,
    );
    setOpen(false);
  };
  const title = editing ? `Edit ${singular}` : `Add ${singular}`;
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title={config.title} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">Operations</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  {config.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {config.description}
                </p>
              </div>
              <Button onClick={openCreate}>
                <Plus data-icon="inline-start" />
                Add {singular}
              </Button>
            </div>
            <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-border px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${config.title.toLowerCase()}...`}
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      {config.columns.map((column) => (
                        <th key={column} className="px-5 py-4 font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setSortKey(column);
                              setSortAsc(sortKey === column ? !sortAsc : true);
                            }}
                            className="inline-flex items-center gap-2"
                          >
                            {labelize(column)}
                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                          </button>
                        </th>
                      ))}
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/30">
                        {config.columns.map((column) => (
                          <td key={column} className="px-5 py-4">
                            {column === "status" ? (
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                {row[column] === "0" ? "Inactive" : "Active"}
                              </span>
                            ) : (
                              formatValue(row[column])
                            )}
                          </td>
                        ))}
                        <td className="relative px-5 py-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Row actions"
                            onClick={() =>
                              setMenuId(menuId === row.id ? null : row.id)
                            }
                          >
                            <MoreHorizontal />
                          </Button>
                          {menuId === row.id && (
                            <div className="absolute right-5 top-12 z-20 w-40 rounded-lg border border-border bg-popover p-1 text-left shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewing(row);
                                  setMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                              >
                                <Eye className="size-4" />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(row)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                              >
                                <Pencil className="size-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  remove(row.id);
                                  setMenuId(null);
                                  toast.success(
                                    `${singular} deleted successfully`,
                                  );
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-14">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Enter the required information below.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                {formFields
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
                      "vehicles",
                      "appointments",
                      "estimations",
                      "invoices",
                      "reviews",
                      "demoBookings",
                    ].includes(schemaKey)
                  ),
              )
              .map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={`${config.resource}-${field.key}`}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                  {field.type === "select" ? (
                    <Select
                      value={form.watch(field.key) ?? ""}
                      onValueChange={(value) =>
                        form.setValue(field.key, value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger id={`${config.resource}-${field.key}`}>
                        <SelectValue
                          placeholder={`Select ${field.label.toLowerCase()}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={`${config.resource}-${field.key}`}
                      {...form.register(field.key)}
                    />
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                      <input type="checkbox" {...form.register(field.key)} />
                      Yes
                    </label>
                  ) : field.type === "file" ? (
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
                      <FileImage className="size-4" />
                      Choose file
                      <input
                        className="sr-only"
                        type="file"
                        accept="image/*"
                        multiple={field.multiple}
                        onChange={(e) =>
                          form.setValue(
                            field.key,
                            e.target.files?.[0]?.name ?? "",
                          )
                        }
                      />
                    </label>
                  ) : (
                    <Input
                      id={`${config.resource}-${field.key}`}
                      type={field.type ?? "text"}
                      readOnly={field.readOnly}
                      {...form.register(field.key)}
                    />
                  )}
                  {form.formState.errors[field.key] && (
                    <p className="text-xs text-destructive">
                      {String(form.formState.errors[field.key]?.message)}
                    </p>
                  )}
                </div>
              ))}
                {isLineItemModule && (
                  <LineItems
                    resource={config.resource}
                    value={lineItems}
                    onChange={setLineItems}
                  />
                )}
              </div>
            </div>
            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Update" : "Create"} {singular}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(value) => !value && setViewing(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{singular} details</DialogTitle>
            <DialogDescription>Viewing assignment details.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key}>
                  <p className="text-sm text-muted-foreground">{field.label}</p>
                  <p className="mt-1 font-medium">
                    {formatValue(viewing[field.key])}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Config, Field };
