import { z } from "zod";

/**
 * Admin settings validation schema
 * Validates offer validity bounds and request timeout settings
 */
export const adminSettingsSchema = z
  .object({
    offer_validity_default: z
      .number()
      .int("El valor debe ser un numero entero")
      .min(1, "El valor minimo es 1 minuto"),
    offer_validity_min: z
      .number()
      .int("El valor debe ser un numero entero")
      .min(1, "El valor minimo es 1 minuto"),
    offer_validity_max: z
      .number()
      .int("El valor debe ser un numero entero")
      .min(1, "El valor minimo es 1 minuto"),
    request_timeout_hours: z
      .number()
      .int("El valor debe ser un numero entero")
      .min(1, "El valor minimo es 1 hora"),
  })
  .refine((data) => data.offer_validity_min > 0, {
    message: "El valor minimo debe ser mayor a 0",
    path: ["offer_validity_min"],
  })
  .refine((data) => data.offer_validity_max >= data.offer_validity_default, {
    message: "El maximo debe ser mayor o igual al valor por defecto",
    path: ["offer_validity_max"],
  })
  .refine((data) => data.offer_validity_default >= data.offer_validity_min, {
    message: "El valor por defecto debe ser mayor o igual al minimo",
    path: ["offer_validity_default"],
  });

/**
 * Type for admin settings form input
 */
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;

/**
 * Default settings values (used when no settings exist in database)
 */
export const DEFAULT_ADMIN_SETTINGS: AdminSettingsInput = {
  offer_validity_default: 30, // minutes
  offer_validity_min: 15, // minutes
  offer_validity_max: 120, // minutes
  request_timeout_hours: 4, // hours
};

/**
 * Setting keys as used in admin_settings table
 */
export const SETTING_KEYS = {
  OFFER_VALIDITY_DEFAULT: "offer_validity_default",
  OFFER_VALIDITY_MIN: "offer_validity_min",
  OFFER_VALIDITY_MAX: "offer_validity_max",
  REQUEST_TIMEOUT_HOURS: "request_timeout_hours",
  // Pricing keys
  PRICE_100L: "price_100l",
  PRICE_1000L: "price_1000l",
  PRICE_5000L: "price_5000l",
  PRICE_10000L: "price_10000l",
  URGENCY_SURCHARGE_PERCENT: "urgency_surcharge_percent",
  DEFAULT_COMMISSION_PERCENT: "default_commission_percent",
} as const;

/**
 * Amount tiers available for pricing
 */
export const AMOUNT_TIERS = [100, 1000, 5000, 10000] as const;
export type AmountTier = (typeof AMOUNT_TIERS)[number];

/**
 * Price tier schema - min, suggested, max prices for each amount tier
 */
const priceTierSchema = z
  .object({
    min: z
      .number()
      .int("El precio debe ser un numero entero")
      .positive("El precio minimo debe ser mayor a 0"),
    suggested: z
      .number()
      .int("El precio debe ser un numero entero")
      .positive("El precio sugerido debe ser mayor a 0"),
    max: z
      .number()
      .int("El precio debe ser un numero entero")
      .positive("El precio maximo debe ser mayor a 0"),
  })
  .refine((data) => data.min <= data.suggested, {
    message: "El minimo debe ser menor o igual al sugerido",
    path: ["min"],
  })
  .refine((data) => data.suggested <= data.max, {
    message: "El sugerido debe ser menor o igual al maximo",
    path: ["suggested"],
  });

/**
 * Pricing settings validation schema
 * Validates water prices (with min/suggested/max), urgency surcharge, and commission rates
 */
export const pricingSettingsSchema = z.object({
  price_100l: priceTierSchema,
  price_1000l: priceTierSchema,
  price_5000l: priceTierSchema,
  price_10000l: priceTierSchema,
  urgency_surcharge_percent: z
    .number()
    .int("El porcentaje debe ser un numero entero")
    .min(0, "El porcentaje minimo es 0%")
    .max(100, "El porcentaje maximo es 100%"),
  default_commission_percent: z
    .number()
    .int("El porcentaje debe ser un numero entero")
    .min(1, "El porcentaje minimo es 1%")
    .max(100, "El porcentaje maximo es 100%"),
});

/**
 * Type for pricing settings form input
 */
export type PricingSettingsInput = z.infer<typeof pricingSettingsSchema>;

/**
 * Type for a single price tier
 */
export type PriceTier = z.infer<typeof priceTierSchema>;

/**
 * Default pricing settings values (used when no settings exist in database)
 * Each tier has min, suggested, and max prices
 */
export const DEFAULT_PRICING_SETTINGS: PricingSettingsInput = {
  price_100l: { min: 4000, suggested: 5000, max: 6500 }, // CLP
  price_1000l: { min: 16000, suggested: 20000, max: 26000 }, // CLP
  price_5000l: { min: 60000, suggested: 75000, max: 100000 }, // CLP
  price_10000l: { min: 110000, suggested: 140000, max: 180000 }, // CLP
  urgency_surcharge_percent: 10, // %
  default_commission_percent: 15, // %
};
