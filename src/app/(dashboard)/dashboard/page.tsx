import { SearchBar } from "@/components/dashboard/search-bar";
import { SortControls } from "@/components/dashboard/sort-controls";
import { VehicleList } from "@/components/dashboard/vehicle-list";
import { CreateVehicleDialog } from "@/components/vehicles/create-vehicle-dialog";
import { getVehicles } from "@/lib/actions/vehicle-actions";
import type { SortBy, SortOrder } from "@/types";

interface DashboardPageProps {
  searchParams: Promise<{ q?: string; sortBy?: string; sortOrder?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const search = params.q;
  const sortBy = (params.sortBy as SortBy) ?? "brand";
  const sortOrder = (params.sortOrder as SortOrder) ?? "asc";

  const vehicleResult = await getVehicles(search, sortBy, sortOrder);

  if (!vehicleResult.success) {
    const isAuthError = vehicleResult.error === "No autenticado";

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="size-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <svg
              className="size-7 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-zinc-300 text-lg font-semibold tracking-tight">
              Error al cargar el listado
            </p>
            <p className="text-zinc-500 text-sm">
              {isAuthError
                ? "Tu sesión expiró. Volvé a iniciar sesión para continuar."
                : vehicleResult.error}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {isAuthError ? (
              <a
                href="/login"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-all active:scale-95"
              >
                Volver a iniciar sesión
              </a>
            ) : null}
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-all active:scale-95"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                />
              </svg>
              Reintentar
            </a>
          </div>
        </div>
      </div>
    );
  }

  const vehicles = vehicleResult.data ?? [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Stats bar */}
      <div className="border-b border-zinc-900 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-sm text-zinc-500 whitespace-nowrap">
            Total:{" "}
            <strong className="text-zinc-300">{vehicles.length}</strong>{" "}
            vehículo{vehicles.length !== 1 ? "s" : ""}
          </span>
          <div className="ml-auto">
            <CreateVehicleDialog />
          </div>
        </div>
      </div>

      {/* Search + Sort + List */}
      <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="shrink-0">
            <SortControls />
          </div>
        </div>

        {vehicles.length === 0 && search ? (
          // Empty search results
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-2">
              <p className="text-zinc-400 text-lg">Sin resultados</p>
              <p className="text-zinc-600 text-sm">
                No se encontraron vehículos para esta búsqueda
              </p>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          // Onboarding empty state for new users
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-6 max-w-sm">
              {/* Icon */}
              <div className="size-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
                <svg
                  className="size-10 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-200">
                  Empezá a registrar vehículos
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Agregá tu primer vehículo al taller para comenzar a gestionar
                  los trabajos, hacer seguimiento de reparaciones y mantener
                  todo organizado.
                </p>
              </div>

              {/* CTA */}
              <CreateVehicleDialog />
            </div>
          </div>
        ) : (
          <VehicleList vehicles={vehicles} />
        )}
      </div>
    </div>
  );
}