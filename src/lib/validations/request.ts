import { z } from "zod";

/**
 * Chilean phone number regex pattern
 * Format: +56 followed by 9 digits
 * Example: +56912345678
 */
export const CHILEAN_PHONE_REGEX = /^\+56[0-9]{9}$/;

/**
 * Water request validation schema
 * Used for guest consumer water request form validation
 */
export const requestSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre es requerido")
    .max(100, "El nombre es demasiado largo"),
  phone: z
    .string()
    .regex(CHILEAN_PHONE_REGEX, "Formato: +56912345678"),
  email: z
    .string()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Email inválido" }
    ),
  comunaId: z.string().optional(),
  address: z
    .string()
    .min(5, "La dirección es requerida")
    .max(200, "La dirección es demasiado larga"),
  specialInstructions: z
    .string()
    .min(1, "Las instrucciones son requeridas")
    .max(500, "Las instrucciones son demasiado largas"),
  amount: z.enum(["100", "1000", "5000", "10000"], {
    message: "Selecciona una cantidad",
  }),
  isUrgent: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/**
 * Type inferred from the request schema
 * Input type allows optional isUrgent (defaults to false in form)
 */
export type RequestInput = z.infer<typeof requestSchema>;

/**
 * Form input type with optional isUrgent for initial data
 */
export type RequestFormInput = Omit<RequestInput, "isUrgent"> & {
  isUrgent?: boolean;
};

/**
 * Amount options with their display labels and prices in CLP
 */
export const AMOUNT_OPTIONS = [
  { value: "100", label: "100 L", price: 5000 },
  { value: "1000", label: "1.000 L", price: 15000 },
  { value: "5000", label: "5.000 L", price: 45000 },
  { value: "10000", label: "10.000 L", price: 80000 },
] as const;

/**
 * Format price in Chilean pesos
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}
