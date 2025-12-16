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

// Step 2: Personal Information
export const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  phone: z
    .string()
    .regex(chileanPhoneRegex, "Formato inválido. Ejemplo: +56912345678"),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

// Step 3: Service Areas
export const serviceAreasSchema = z.object({
  comunaIds: z
    .array(z.string())
    .min(1, "Selecciona al menos una comuna de servicio"),
});

export type ServiceAreasInput = z.infer<typeof serviceAreasSchema>;

// Step 4: Documents (validated separately for file uploads)
export const documentTypesSchema = z.enum([
  "cedula",
  "permiso_sanitario",
  "vehiculo",
  "certificacion",
]);

export type DocumentType = z.infer<typeof documentTypesSchema>;

// Required documents for registration
export const REQUIRED_DOCUMENTS: DocumentType[] = [
  "cedula",
  "permiso_sanitario",
  "vehiculo",
];

export const OPTIONAL_DOCUMENTS: DocumentType[] = ["certificacion"];

// Vehicle capacity options
export const VEHICLE_CAPACITIES = [
  { value: 1000, label: "1,000 litros" },
  { value: 5000, label: "5,000 litros" },
  { value: 10000, label: "10,000 litros" },
] as const;

export const vehicleInfoSchema = z.object({
  capacity: z.number().refine(
    (val) => VEHICLE_CAPACITIES.some((v) => v.value === val),
    "Selecciona una capacidad válida"
  ),
});

export type VehicleInfoInput = z.infer<typeof vehicleInfoSchema>;

// Step 5: Bank Information
export const bankInfoSchema = z.object({
  bankName: z.string().min(1, "Selecciona un banco"),
  accountType: z.enum(["corriente", "vista", "ahorro"], {
    message: "Selecciona un tipo de cuenta",
  }),
  accountNumber: z
    .string()
    .min(5, "Número de cuenta inválido")
    .max(20, "Número de cuenta muy largo"),
  rut: z.string().refine(validateRut, "RUT inválido. Formato: 12.345.678-9"),
});

export type BankInfoInput = z.infer<typeof bankInfoSchema>;

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

export const ACCOUNT_TYPES = [
  { value: "corriente", label: "Cuenta Corriente" },
  { value: "vista", label: "Cuenta Vista / RUT" },
  { value: "ahorro", label: "Cuenta de Ahorro" },
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
  // Personal info
  name: string;
  phone: string;
  // Service areas
  comunaIds: string[];
  // Vehicle
  vehicleCapacity: number;
  // Documents (storage paths after upload)
  documents: {
    cedula: string[];
    permiso_sanitario: string[];
    vehiculo: string[];
    certificacion?: string[];
  };
  // Bank info
  bankName: string;
  accountType: string;
  accountNumber: string;
  rut: string;
}

// Full registration validation
export const providerRegistrationSchema = z.object({
  name: personalInfoSchema.shape.name,
  phone: personalInfoSchema.shape.phone,
  comunaIds: serviceAreasSchema.shape.comunaIds,
  vehicleCapacity: vehicleInfoSchema.shape.capacity,
  documents: z.object({
    cedula: z.array(z.string()).min(1, "Sube tu cédula de identidad"),
    permiso_sanitario: z
      .array(z.string())
      .min(1, "Sube tu permiso sanitario"),
    vehiculo: z.array(z.string()).min(1, "Sube fotos de tu vehículo"),
    certificacion: z.array(z.string()).optional(),
  }),
  bankName: bankInfoSchema.shape.bankName,
  accountType: bankInfoSchema.shape.accountType,
  accountNumber: bankInfoSchema.shape.accountNumber,
  rut: bankInfoSchema.shape.rut,
});

// Document labels in Spanish
export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  cedula: "Cédula de Identidad",
  permiso_sanitario: "Permiso Sanitario",
  vehiculo: "Fotos del Vehículo",
  certificacion: "Certificación de Agua (opcional)",
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
