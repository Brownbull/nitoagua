import { ClipboardList, CheckCircle, Package } from "lucide-react";

type TabType = "pending" | "accepted" | "completed";

interface EmptyStateProps {
  tab: TabType;
}

const emptyStateConfig: Record<
  TabType,
  {
    icon: React.ReactNode;
    message: string;
    description: string;
  }
> = {
  pending: {
    icon: <ClipboardList className="w-12 h-12 text-gray-300" />,
    message: "No hay solicitudes pendientes",
    description:
      "Las solicitudes de agua aparecerán aquí cuando los clientes las envíen",
  },
  accepted: {
    icon: <Package className="w-12 h-12 text-gray-300" />,
    message: "No tienes solicitudes aceptadas",
    description: "Las solicitudes que aceptes aparecerán aquí",
  },
  completed: {
    icon: <CheckCircle className="w-12 h-12 text-gray-300" />,
    message: "No has completado entregas aún",
    description: "Tu historial de entregas completadas aparecerá aquí",
  },
};

export function EmptyState({ tab }: EmptyStateProps) {
  const config = emptyStateConfig[tab];

  return (
    <div
      className="text-center py-12 text-gray-500"
      data-testid={`empty-state-${tab}`}
    >
      <div className="mx-auto mb-4">{config.icon}</div>
      <p className="text-lg font-medium" data-testid="empty-state-message">
        {config.message}
      </p>
      <p className="text-sm mt-2">{config.description}</p>
    </div>
  );
}
