"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Loader2, Check, Plus, Minus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressIndicator } from "./progress-indicator";
import { cn } from "@/lib/utils";

// Vehicle types with their max capacities based on UX mockup
const VEHICLE_TYPES = [
  { id: "moto", label: "Moto", emoji: "🏍️", maxCapacity: 100, description: "Hasta 100L por viaje" },
  { id: "auto", label: "Auto", emoji: "🚗", maxCapacity: 300, description: "Hasta 300L por viaje" },
  { id: "camioneta", label: "Camioneta", emoji: "🛻", maxCapacity: 1000, description: "Hasta 1,000L por viaje" },
  { id: "camion", label: "Camión", emoji: "🚚", maxCapacity: 10000, description: "5,000 - 10,000L por viaje" },
] as const;

// Working hours options
const WORKING_HOURS = [
  { value: "4-6", label: "4-6 horas" },
  { value: "6-8", label: "6-8 horas" },
  { value: "8-10", label: "8-10 horas" },
  { value: "10+", label: "Tiempo completo (10+ horas)" },
] as const;

// Days of the week
const DAYS = [
  { id: "lun", label: "Lun" },
  { id: "mar", label: "Mar" },
  { id: "mie", label: "Mie" },
  { id: "jue", label: "Jue" },
  { id: "vie", label: "Vie" },
  { id: "sab", label: "Sab" },
  { id: "dom", label: "Dom" },
] as const;

// Vehicle type enum
const vehicleTypeEnum = ["moto", "auto", "camioneta", "camion"] as const;

// Validation schema - capacity max depends on vehicle type (handled in component)
const vehicleSchema = z.object({
  vehicleType: z.enum(vehicleTypeEnum, {
    message: "Selecciona un tipo de vehículo",
  }),
  capacity: z
    .number()
    .min(20, "Capacidad mínima: 20L")
    .max(10000, "Capacidad máxima: 10,000L"),
  workingHours: z.string().optional(),
  // AC7.9.9: At least one working day must be selected
  availableDays: z.array(z.string()).min(1, "Selecciona al menos un día"),
});

type VehicleInput = z.infer<typeof vehicleSchema>;

export function VehicleForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>(["lun", "mar", "mie", "jue", "vie"]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: undefined,
      capacity: 80,
      workingHours: "6-8",
      availableDays: ["lun", "mar", "mie", "jue", "vie"],
    },
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitoagua_provider_onboarding");
      if (saved) {
        const { data } = JSON.parse(saved);
        if (data.vehicleType) {
          setSelectedType(data.vehicleType);
          setValue("vehicleType", data.vehicleType);
        }
        if (data.vehicleCapacity) setValue("capacity", data.vehicleCapacity);
        if (data.workingHours) setValue("workingHours", data.workingHours);
        if (data.availableDays) {
          setSelectedDays(data.availableDays);
          setValue("availableDays", data.availableDays);
        }
      }
    } catch {
      // Ignore errors
    }
  }, [setValue]);

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setValue("vehicleType", typeId as "moto" | "auto" | "camioneta" | "camion");

    // Set capacity based on vehicle type
    // For non-trucks, use the fixed maxCapacity value
    // For trucks, start at 5000L (user can adjust with +/- buttons)
    const vehicleType = VEHICLE_TYPES.find(v => v.id === typeId);
    if (vehicleType) {
      const capacity = typeId === "camion" ? 5000 : vehicleType.maxCapacity;
      setValue("capacity", capacity);
    }
  };

  // Truck capacity increment/decrement (1000L steps, 5000-10000 range)
  const handleTruckCapacityChange = (delta: number) => {
    const currentCapacity = watch("capacity") || 5000;
    const newCapacity = Math.min(10000, Math.max(5000, currentCapacity + delta));
    setValue("capacity", newCapacity);
  };

  const toggleDay = (dayId: string) => {
    const newDays = selectedDays.includes(dayId)
      ? selectedDays.filter(d => d !== dayId)
      : [...selectedDays, dayId];
    setSelectedDays(newDays);
    setValue("availableDays", newDays);
  };

  const onSubmit = async (data: VehicleInput) => {
    setIsSubmitting(true);

    // Save to localStorage
    try {
      const existing = localStorage.getItem("nitoagua_provider_onboarding");
      const progress = existing ? JSON.parse(existing) : { currentStep: 3, data: {} };
      progress.data = {
        ...progress.data,
        vehicleType: data.vehicleType,
        vehicleCapacity: data.capacity,
        workingHours: data.workingHours,
        availableDays: data.availableDays,
      };
      progress.currentStep = 4;
      localStorage.setItem("nitoagua_provider_onboarding", JSON.stringify(progress));
    } catch {
      // Ignore errors
    }

    // Navigate to service areas step (step 4)
    router.push("/provider/onboarding/areas");
  };

  const handleBack = () => {
    // Go back to documents step
    router.push("/provider/onboarding/documents");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with gradient */}
      <div
        className="px-5 pt-4 pb-4"
        style={{
          background: "linear-gradient(180deg, rgba(254, 215, 170, 0.5) 0%, white 100%)",
        }}
      >
        {/* Step 3 of 6: Personal → Documentos → Vehículo → Áreas → Banco → Revisión */}
        <ProgressIndicator currentStep={3} onBack={handleBack} />

        <h1 className="text-2xl font-bold text-gray-900 mt-4">Tu vehículo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selecciona el tipo de vehículo que usarás para las entregas.
        </p>
      </div>

      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Vehicle Type Selection */}
          <div className="space-y-3">
            {VEHICLE_TYPES.map((vehicle) => {
              const isSelected = selectedType === vehicle.id;
              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => handleTypeSelect(vehicle.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-50/50"
                      : "border-gray-200 bg-white hover:border-orange-200"
                  )}
                  data-testid={`vehicle-${vehicle.id}`}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
                      isSelected ? "bg-orange-100" : "bg-gray-50"
                    )}
                  >
                    {vehicle.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {vehicle.label}
                    </div>
                    <div className="text-xs text-gray-500">{vehicle.description}</div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                  )}
                </button>
              );
            })}
            {errors.vehicleType && (
              <p className="text-sm text-red-500">{errors.vehicleType.message}</p>
            )}
          </div>

          {/* Capacity Input - Only shown for trucks */}
          {selectedType === "camion" && (
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-sm font-medium text-gray-700">
                Capacidad de carga (litros)
              </Label>

              {/* Truck: +/- buttons with 1000L increments */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTruckCapacityChange(-1000)}
                  disabled={watch("capacity") <= 5000}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    watch("capacity") <= 5000
                      ? "bg-gray-100 text-gray-300"
                      : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                  )}
                  data-testid="capacity-minus"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center min-w-20">
                  <div className="text-lg font-semibold text-gray-900" data-testid="capacity-display">
                    {(watch("capacity") || 5000).toLocaleString()}L
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTruckCapacityChange(1000)}
                  disabled={watch("capacity") >= 10000}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    watch("capacity") >= 10000
                      ? "bg-gray-100 text-gray-300"
                      : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                  )}
                  data-testid="capacity-plus"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Selecciona entre 5,000 y 10,000 litros
              </p>
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity.message}</p>
              )}
            </div>
          )}

          {/* Working Hours */}
          <div className="space-y-2">
            <Label htmlFor="workingHours" className="text-sm font-medium text-gray-700">
              Horas disponible por día
            </Label>
            <Select
              value={watch("workingHours")}
              onValueChange={(value) => setValue("workingHours", value)}
            >
              <SelectTrigger className="h-12 rounded-xl" data-testid="working-hours">
                <SelectValue placeholder="Selecciona tus horas" />
              </SelectTrigger>
              <SelectContent>
                {WORKING_HOURS.map((hours) => (
                  <SelectItem key={hours.value} value={hours.value}>
                    {hours.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available Days */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Días disponible</Label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                    data-testid={`day-${day.id}`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            {errors.availableDays && (
              <p className="text-sm text-red-500">{errors.availableDays.message}</p>
            )}
          </div>
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 rounded-xl"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !selectedType || selectedDays.length === 0}
            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
            data-testid="next-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
