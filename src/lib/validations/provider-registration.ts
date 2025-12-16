import { z } from "zod";

// Chilean phone format: +56 followed by 9 digits (mobile starts with 9)
const chileanPhoneRegex = /^\+56[0-9]{9}$/;

// Chilean RUT validation
function validateRut(rut: string): boolean {
  // Clean RUT: remove dots and dashes
  const clean = rut.replace(/[.-]/g, "").toLowerCase();
  if (clean.length < 8 || clean.length > 9) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }

  const expected = 11 - (sum % 11);
  const dvExpected =
    expected === 11 ? "0" : expected === 10 ? "k" : expected.toString();

  return dv === dvExpected;
}

// Export validateRut for use in components
export { validateRut };

// Step 1: Personal Information (UX aligned - includes RUT and avatar)
export const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  rut: z.string().refine(validateRut, "RUT inválido. Formato: 12.345.678-9"),
  phone: z
    .string()
    .regex(chileanPhoneRegex, "Formato inválido. Ejemplo: +56912345678"),
  avatarUrl: z.string().optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

// Step 3: Service Areas
export const serviceAreasSchema = z.object({
  comunaIds: z
    .array(z.string())
    .min(1, "Selecciona al menos una comuna de servicio"),
});

export type ServiceAreasInput = z.infer<typeof serviceAreasSchema>;

// Step 2: Documents (validated separately for file uploads)
// Per UX mockup Section 13.3: Document Upload
export const documentTypesSchema = z.enum([
  "cedula",
  "licencia_conducir",
  "vehiculo",
  "permiso_sanitario",
  "certificacion",
]);

export type DocumentType = z.infer<typeof documentTypesSchema>;

// Required documents for registration (per UX mockup)
// - Cédula de identidad (required)
// - Licencia de conducir (required if motorized vehicle)
// - Fotos del vehículo (required)
export const REQUIRED_DOCUMENTS: DocumentType[] = [
  "cedula",
  "licencia_conducir",
  "vehiculo",
];

// Optional documents (per UX mockup - dashed border styling)
// - Permiso sanitario (optional - moved from required)
// - Certificación (optional)
export const OPTIONAL_DOCUMENTS: DocumentType[] = [
  "permiso_sanitario",
  "certificacion",
];

// Vehicle type options (per UX mockup Section 13.4)
export const VEHICLE_TYPES = [
  { id: "moto", label: "Moto", emoji: "🏍️", maxCapacity: 100, description: "Hasta 100L por viaje" },
  { id: "auto", label: "Auto", emoji: "🚗", maxCapacity: 300, description: "Hasta 300L por viaje" },
  { id: "camioneta", label: "Camioneta", emoji: "🛻", maxCapacity: 1000, description: "Hasta 1,000L por viaje" },
  { id: "camion", label: "Camión", emoji: "🚚", maxCapacity: 10000, description: "5,000 - 10,000L por viaje" },
] as const;

export type VehicleType = "moto" | "auto" | "camioneta" | "camion";

// Working hours options (per UX mockup Section 13.4)
export const WORKING_HOURS = [
  { value: "4-6", label: "4-6 horas" },
  { value: "6-8", label: "6-8 horas" },
  { value: "8-10", label: "8-10 horas" },
  { value: "10+", label: "Tiempo completo (10+ horas)" },
] as const;

export type WorkingHours = "4-6" | "6-8" | "8-10" | "10+";

// Working days (per UX mockup Section 13.4)
export const WORKING_DAYS = [
  { id: "lun", label: "Lun" },
  { id: "mar", label: "Mar" },
  { id: "mie", label: "Mie" },
  { id: "jue", label: "Jue" },
  { id: "vie", label: "Vie" },
  { id: "sab", label: "Sab" },
  { id: "dom", label: "Dom" },
] as const;

export type WorkingDay = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

// Legacy vehicle capacity options (kept for backwards compatibility)
export const VEHICLE_CAPACITIES = [
  { value: 1000, label: "1,000 litros" },
  { value: 5000, label: "5,000 litros" },
  { value: 10000, label: "10,000 litros" },
] as const;

// Vehicle info schema (updated for UX alignment)
export const vehicleInfoSchema = z.object({
  vehicleType: z.enum(["moto", "auto", "camioneta", "camion"], {
    message: "Selecciona un tipo de vehículo",
  }),
  vehicleCapacity: z.number()
    .min(20, "Capacidad mínima: 20L")
    .max(10000, "Capacidad máxima: 10,000L"),
  workingHours: z.enum(["4-6", "6-8", "8-10", "10+"], {
    message: "Selecciona tus horas disponibles",
  }).optional(),
  // AC7.9.9: At least one working day must be selected
  workingDays: z.array(z.enum(["lun", "mar", "mie", "jue", "vie", "sab", "dom"])).min(1, "Selecciona al menos un día").optional(),
});

export type VehicleInfoInput = z.infer<typeof vehicleInfoSchema>;

// Step 4: Bank Information (RUT pre-filled from personal info step)
// Per UX mockup Section 13.5: Only 2 account types (removed "ahorro")
export const bankInfoSchema = z.object({
  bankName: z.string().min(1, "Selecciona un banco"),
  accountType: z.enum(["vista", "corriente"], {
    message: "Selecciona un tipo de cuenta",
  }),
  accountNumber: z
    .string()
    .min(5, "Número de cuenta inválido")
    .max(20, "Número de cuenta muy largo"),
  // RUT is now entered on personal info step and pre-filled here
  rut: z.string().refine(validateRut, "RUT inválido. Formato: 12.345.678-9"),
});

export type BankInfoInput = z.infer<typeof bankInfoSchema>;

// Account type for bank info (vista = default per UX mockup)
export type AccountType = "vista" | "corriente";

// Chilean banks list
export const CHILEAN_BANKS = [
  { value: "banco_estado", label: "Banco Estado" },
  { value: "banco_chile", label: "Banco de Chile" },
  { value: "santander", label: "Santander" },
  { value: "bci", label: "BCI" },
  { value: "scotiabank", label: "Scotiabank" },
  { value: "itau", label: "Itaú" },
  { value: "security", label: "Banco Security" },
  { value: "bice", label: "BICE" },
  { value: "falabella", label: "Banco Falabella" },
  { value: "ripley", label: "Banco Ripley" },
] as const;

// Account types as toggle buttons - Cuenta Vista/RUT is most common for this use case
export const ACCOUNT_TYPES = [
  { value: "vista", label: "Cuenta Vista/RUT" },
  { value: "corriente", label: "Cuenta Corriente" },
] as const;

// Service areas (comunas)
export const COMUNAS = [
  { id: "villarrica", name: "Villarrica" },
  { id: "pucon", name: "Pucón" },
  { id: "lican-ray", name: "Licán Ray" },
  { id: "curarrehue", name: "Curarrehue" },
  { id: "freire", name: "Freire" },
] as const;

// Full registration data type
export interface ProviderRegistrationData {
  // Personal info (Step 1)
  name: string;
  phone: string;
  rut: string;
  avatarUrl?: string;
  // Service areas (Step 4)
  comunaIds: string[];
  // Vehicle (Step 3) - per UX mockup Section 13.4
  vehicleType: VehicleType;
  vehicleCapacity: number;
  workingHours?: WorkingHours;
  workingDays?: WorkingDay[];
  // Documents (Step 2) - per UX mockup Section 13.3
  documents: {
    cedula: string[]; // Required
    licencia_conducir: string[]; // Required (if motorized vehicle)
    vehiculo: string[]; // Required
    permiso_sanitario?: string[]; // Optional
    certificacion?: string[]; // Optional
  };
  // Bank info (Step 5)
  bankName: string;
  accountType: string;
  accountNumber: string;
}

// Full registration validation (per UX mockup Section 13.3 and 13.4)
export const providerRegistrationSchema = z.object({
  name: personalInfoSchema.shape.name,
  phone: personalInfoSchema.shape.phone,
  rut: personalInfoSchema.shape.rut,
  avatarUrl: personalInfoSchema.shape.avatarUrl,
  comunaIds: serviceAreasSchema.shape.comunaIds,
  // Vehicle info (Step 3)
  vehicleType: vehicleInfoSchema.shape.vehicleType,
  vehicleCapacity: vehicleInfoSchema.shape.vehicleCapacity,
  workingHours: vehicleInfoSchema.shape.workingHours,
  workingDays: vehicleInfoSchema.shape.workingDays,
  documents: z.object({
    cedula: z.array(z.string()).min(1, "Sube tu cédula de identidad"),
    licencia_conducir: z.array(z.string()).min(1, "Sube tu licencia de conducir"),
    vehiculo: z.array(z.string()).min(1, "Sube fotos de tu vehículo"),
    permiso_sanitario: z.array(z.string()).optional(), // Optional per mockup
    certificacion: z.array(z.string()).optional(),
  }),
  bankName: bankInfoSchema.shape.bankName,
  accountType: bankInfoSchema.shape.accountType,
  accountNumber: bankInfoSchema.shape.accountNumber,
});

// Document labels in Spanish (per UX mockup Section 13.3)
export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  cedula: "Cédula de identidad",
  licencia_conducir: "Licencia de conducir",
  vehiculo: "Fotos del vehículo",
  permiso_sanitario: "Permiso sanitario",
  certificacion: "Certificación de Agua",
};

// Formatting helpers
export function formatRut(value: string): string {
  // Remove all non-numeric characters except k/K
  const clean = value.replace(/[^0-9kK]/g, "").toLowerCase();
  if (clean.length === 0) return "";

  // Split body and check digit
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (body.length === 0) return clean;

  // Format with dots and dash
  let formatted = "";
  for (let i = body.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formatted = "." + formatted;
    }
    formatted = body[i] + formatted;
  }

  return `${formatted}-${dv}`;
}

export function formatPhone(value: string): string {
  // Remove all non-numeric characters
  const clean = value.replace(/[^0-9]/g, "");

  // Always start with +56
  if (!clean.startsWith("56")) {
    return `+56${clean}`;
  }

  return `+${clean}`;
}
