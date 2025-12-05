import { z } from "zod";

// Chilean phone format: +56 followed by 9 digits (mobile starts with 9)
const chileanPhoneRegex = /^\+56[0-9]{9}$/;

export const consumerOnboardingSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  phone: z
    .string()
    .regex(chileanPhoneRegex, "Formato inválido. Ejemplo: +56912345678"),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  specialInstructions: z
    .string()
    .min(10, "Las instrucciones deben tener al menos 10 caracteres")
    .max(500, "Las instrucciones no pueden exceder 500 caracteres"),
});

export type ConsumerOnboardingInput = z.infer<typeof consumerOnboardingSchema>;

// Full consumer profile type (includes database fields)
export interface ConsumerProfile {
  id: string;
  role: "consumer";
  name: string;
  phone: string;
  address: string | null;
  specialInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}
