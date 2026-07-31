import { notFound } from "next/navigation";
import Link from "next/link";
import { getVehicleById } from "@/lib/actions/vehicle-actions";
import { getServiceRecordsByVehicle } from "@/lib/actions/service-actions";
import { getStatusLabel, getStatusColorClasses, formatDate, formatCurrency, getServiceTypeLabel } from "@/lib/utils/format";
import { generateWhatsAppLink, STATUS_LABELS } from "@/lib/utils/whatsapp";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { AddServiceDialog } from "@/components/vehicles/add-service-dialog";
import { EditServiceDialog } from "@/components/vehicles/edit-service-dialog";
import { DeleteServiceDialog } from "@/components/vehicles/delete-service-dialog";

interface VehicleDetailPageProps {
  params: Promise<{ vehicleId: string }>;
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { vehicleId } = await params;
  const vehicleResult = await getVehicleById(vehicleId);

  if (!vehicleResult.success || !vehicleResult.data) {
    notFound();
  }

  const vehicle = vehicleResult.data;
  const colors = getStatusColorClasses(vehicle.status);
  const servicesResult = await getServiceRecordsByVehicle(vehicleId);
  const services = servicesResult.success ? servicesResult.data ?? [] : [];

  // WhatsApp manual link (always visible)
  const whatsappLink = vehicle.ownerPhoneNormalized
    ? generateWhatsAppLink(vehicle.ownerPhoneNormalized, {
        customerName: vehicle.ownerName,
        vehicleModel: `${vehicle.brand} ${vehicle.model}`,
        licensePlate: vehicle.licensePlate,
        statusLabel: getStatusLabel(vehicle.status),
      })
    : null;

  return (
    <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-4 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver al tablero
      </Link>

      {/* Vehicle header card */}
      <div
        className={`bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 border-l-4 ${colors.border} mb-6`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-sm text-zinc-500">{vehicle.year}</p>
          </div>
          <Badge
            variant="outline"
            className={`${colors.badge} text-sm font-medium px-3 py-1 rounded-full`}
          >
            {getStatusLabel(vehicle.status)}
          </Badge>
        </div>

        <Separator className="my-4 bg-zinc-800" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Patente</span>
            <p className="font-mono text-amber-400/80 font-medium tracking-wide mt-0.5">
              {vehicle.licensePlate}
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Kilometraje</span>
            <p className="text-zinc-200 font-medium mt-0.5">
              {vehicle.currentMileage.toLocaleString("es-AR")} km
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-zinc-500">Dueño</span>
            <p className="text-zinc-200 font-medium mt-0.5">
              {vehicle.ownerName}
            </p>
          </div>
          {vehicle.ownerPhoneRaw && (
            <div className="col-span-2">
              <span className="text-zinc-500">Teléfono</span>
              <p className="text-zinc-200 font-medium mt-0.5">
                {vehicle.ownerPhoneRaw}
              </p>
            </div>
          )}
        </div>

        {/* WhatsApp manual button */}
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold active:scale-[0.98] transition-all"
          >
            <MessageCircle className="size-5" />
            Enviar WhatsApp a {vehicle.ownerName}
          </a>
        )}
      </div>

      {/* Service history */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
            Historial del vehiculo
          </h2>
          <AddServiceDialog
            vehicleId={vehicleId}
            currentMileage={vehicle.currentMileage}
          />
        </div>

        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-zinc-800/50">
            <p className="text-zinc-500 text-sm">
              Sin registros de servicio todavía
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-4 space-y-3"
              >
                {/* Service header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        service.type === "repair"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : service.type === "service"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : "bg-violet-500/10 text-violet-400 border-violet-500/30"
                      }`}
                    >
                      {getServiceTypeLabel(service.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <EditServiceDialog service={service} vehicleId={vehicleId} />
                    <DeleteServiceDialog serviceId={service.id} />
                    <span className="text-xs text-zinc-500 ml-1">
                      {formatDate(service.serviceDate)}
                    </span>
                  </div>
                </div>

                {/* Service details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-zinc-500 text-xs">Kilometraje</span>
                    <p className="text-zinc-300 font-medium">
                      {service.mileageAtService.toLocaleString("es-AR")} km
                    </p>
                  </div>
                  {service.cost && (
                    <div>
                      <span className="text-zinc-500 text-xs">Costo</span>
                      <p className="text-zinc-300 font-medium">
                        {formatCurrency(service.cost)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {service.description && (
                  <div>
                    <span className="text-zinc-500 text-xs">Detalle</span>
                    <p className="text-zinc-400 text-sm mt-0.5 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                )}

                {/* Images gallery */}
                {service.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {service.images.map((image) => (
                      <div
                        key={image.id}
                        className="shrink-0 size-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                      >
                        <span className="text-[10px] text-zinc-500 uppercase">
                          {image.imageType}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}