import Link from "next/link";
import { getVehicles } from "@/lib/actions/vehicle-actions";
import { getStatusLabel, getStatusColorClasses } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { CreateVehicleDialog } from "@/components/vehicles/create-vehicle-dialog";
import { Car } from "lucide-react";

interface VehiclesPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function VehiclesPage({
  searchParams,
}: VehiclesPageProps) {
  const params = await searchParams;
  const search = params.q;

  const vehicleResult = await getVehicles(search);

  if (!vehicleResult.success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-zinc-400">{vehicleResult.error}</p>
      </div>
    );
  }

  const vehicles = vehicleResult.data ?? [];

  return (
    <div className="flex-1 p-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Vehículos
        </h1>
        <CreateVehicleDialog />
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Car className="size-12 text-zinc-700 mb-4" />
          <p className="text-zinc-400 text-lg mb-2">No hay vehículos</p>
          <p className="text-zinc-600 text-sm">
            {search
              ? "No se encontraron resultados para esta búsqueda"
              : "Agregá tu primer vehículo para empezar"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {vehicles.map((vehicle) => {
            const colors = getStatusColorClasses(vehicle.status);
            return (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700 transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Status indicator */}
                  <div
                    className={`size-2.5 rounded-full shrink-0 ${colors.bg} ring-1 ${colors.badge.split(" ")[0]}`}
                  />

                  {/* Vehicle info */}
                  <div className="min-w-0">
                    <span className="text-zinc-200 font-medium">
                      {vehicle.brand} {vehicle.model}
                    </span>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-zinc-500">
                      <span className="font-mono text-amber-400/70 tracking-wide text-xs">
                        {vehicle.licensePlate}
                      </span>
                      <span className="hidden sm:inline">
                        {vehicle.year}
                      </span>
                      <span className="hidden sm:inline">
                        {vehicle.currentMileage.toLocaleString("es-AR")} km
                      </span>
                      {vehicle.ownerName && (
                        <span className="text-zinc-600 truncate">
                          {vehicle.ownerName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="outline"
                    className={`${colors.badge} text-xs font-medium px-2.5 py-0.5 rounded-full`}
                  >
                    {getStatusLabel(vehicle.status)}
                  </Badge>
                  <span className="text-zinc-600 text-sm group-hover:text-zinc-400 transition-colors">
                    Ver →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}