import { Clock, CheckCircle, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsHeaderProps {
  pendingCount: number;
  todayDeliveries: number;
  weekTotal: number;
  isLoading?: boolean;
}

export function StatsHeader({
  pendingCount,
  todayDeliveries,
  weekTotal,
  isLoading = false,
}: StatsHeaderProps) {
  if (isLoading) {
    return <StatsHeaderSkeleton />;
  }

  return (
    <div
      className="grid grid-cols-3 gap-3"
      data-testid="stats-header"
    >
      <Card className="py-3">
        <CardContent className="p-3 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <p
            className="text-2xl font-bold text-gray-900"
            data-testid="pending-count"
          >
            {pendingCount}
          </p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </CardContent>
      </Card>

      <Card className="py-3">
        <CardContent className="p-3 text-center">
          <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <p
            className="text-2xl font-bold text-gray-900"
            data-testid="today-deliveries"
          >
            {todayDeliveries}
          </p>
          <p className="text-xs text-gray-500">Hoy</p>
        </CardContent>
      </Card>

      <Card className="py-3">
        <CardContent className="p-3 text-center">
          <CalendarDays className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <p
            className="text-2xl font-bold text-gray-900"
            data-testid="week-total"
          >
            {weekTotal}
          </p>
          <p className="text-xs text-gray-500">Esta semana</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsHeaderSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3" data-testid="stats-header-skeleton">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="py-3">
          <CardContent className="p-3 text-center">
            <Skeleton className="w-5 h-5 mx-auto mb-1 rounded" />
            <Skeleton className="h-8 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
