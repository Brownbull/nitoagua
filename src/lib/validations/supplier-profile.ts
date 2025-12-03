import { z } from "zod";

// Chilean phone format: +56 followed by 9 digits (mobile starts with 9)
const chileanPhoneRegex = /^\+56[0-9]{9}$/;

export const supplierProfileSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  phone: z
    .string()
    .regex(chileanPhoneRegex, "Formato inválido. Ejemplo: +56912345678"),
  serviceArea: z
    .string()
    .min(1, "Selecciona un área de servicio"),
  price100l: z
    .number()
    .int("El precio debe ser un número entero")
    .positive("El precio debe ser mayor a 0"),
  price1000l: z
    .number()
    .int("El precio debe ser un número entero")
    .positive("El precio debe ser mayor a 0"),
  price5000l: z
    .number()
    .int("El precio debe ser un número entero")
    .positive("El precio debe ser mayor a 0"),
  price10000l: z
    .number()
    .int("El precio debe ser un número entero")
    .positive("El precio debe ser mayor a 0"),
});

export type SupplierProfileInput = z.infer<typeof supplierProfileSchema>;

// Service areas for MVP (Villarrica region)
export const SERVICE_AREAS = [
  { value: "villarrica", label: "Villarrica" },
  { value: "pucon", label: "Pucón" },
  { value: "lican-ray", label: "Lican Ray" },
] as const;

export type ServiceArea = (typeof SERVICE_AREAS)[number]["value"];
