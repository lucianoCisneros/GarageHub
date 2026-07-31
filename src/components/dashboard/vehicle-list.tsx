"use client";

import Link from "next/link";
import type { VehicleWithLastService } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { CalendarDays } from "lucide-react";
import { DeleteVehicleDialog } from "@/components/vehicles/delete-vehicle-dialog";

interface VehicleListProps {
  vehicles: VehicleWithLastService[];
}

export function VehicleList({ vehicles }: VehicleListProps) {
  if (vehicles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-200">
        <p className="text-zinc-500 text-sm">No hay vehículos registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/80">
      {/* Desktop table */}
      <table className="hidden sm:table w-full">
        <thead>
          <tr className="border-b border-zinc-800/80">
            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
              Cliente
            </th>
            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
              Vehículo
            </th>
            <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
              Patente
            </th>
            <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
              Km
            </th>
            <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">
              Último servicio
            </th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="group hover:bg-zinc-900/50 transition-colors"
            >
              <td className="px-4 py-3.5">
                <Link
                  href={`/vehicles/${vehicle.id}`}
                  className="text-sm font-medium text-zinc-200 group-hover:text-amber-400 transition-colors"
                >
                  {vehicle.ownerName}
                </Link>
              </td>
              <td className="px-4 py-3.5">
                <Link
                  href={`/vehicles/${vehicle.id}`}
                  className="text-sm text-zinc-300"
                >
                  {vehicle.brand} {vehicle.model}{" "}
                  <span className="text-zinc-500">{vehicle.year}</span>
                </Link>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-sm text-amber-400/80 tracking-wide">
                  {vehicle.licensePlate}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <span className="text-sm text-zinc-400">
                  {vehicle.currentMileage.toLocaleString("es-AR")}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right">
                {vehicle.lastServiceDate ? (
                  <span className="text-sm text-zinc-400">
                    {formatDate(vehicle.lastServiceDate)}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-600">—</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-right">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteVehicleDialog
                    vehicleId={vehicle.id}
                    vehicleLabel={`${vehicle.licensePlate} (${vehicle.ownerName})`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-zinc-800/50">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group relative flex items-center justify-between px-4 py-4 active:bg-zinc-900/50 transition-colors"
          >
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="min-w-0 flex-1 space-y-1"
            >
              <p className="text-sm font-medium text-zinc-200 truncate">
                {vehicle.ownerName}
              </p>
              <p className="text-sm text-zinc-400 truncate">
                {vehicle.brand} {vehicle.model}
              </p>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="font-mono text-amber-400/70">
                  {vehicle.licensePlate}
                </span>
                <span>{vehicle.currentMileage.toLocaleString("es-AR")} km</span>
              </div>
            </Link>
            <div className="shrink-0 ml-3 flex items-center gap-3">
              <div className="text-right">
                {vehicle.lastServiceDate ? (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <CalendarDays className="size-3" />
                    <span>{formatDate(vehicle.lastServiceDate)}</span>
                  </div>
                ) : null}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1.5">
                <DeleteVehicleDialog
                  vehicleId={vehicle.id}
                  vehicleLabel={`${vehicle.licensePlate} (${vehicle.ownerName})`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}