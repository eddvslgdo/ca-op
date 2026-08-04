import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { DeliveryAddressData } from "@/types/onboarding";
import {
  Plus,
  Trash2,
  FileUp,
  CheckCircle2,
  Truck,
  Sparkles,
  Loader2,
  Info,
  MapPinned,
  UploadCloud,
} from "lucide-react";

interface StepDeliveryProps {
  deliveryAddresses: DeliveryAddressData[];
  onDeliveryChange: (addresses: DeliveryAddressData[]) => void;
}

export function StepDelivery({
  deliveryAddresses,
  onDeliveryChange,
}: StepDeliveryProps) {
  const [sameAsFiscal, setSameAsFiscal] = useState(
    deliveryAddresses.length === 0,
  );
  const [extractingOcrId, setExtractingOcrId] = useState<string | null>(null);

  const handleAddDeliveryAddress = () => {
    const newAddress: DeliveryAddressData = {
      id: `DEL-${Date.now()}`,
      nombrePlanta: `Planta / Bodega ${deliveryAddresses.length + 1}`,
      contactoRecepcion: "",
      telefonoRecepcion: "",
      calle: "",
      numeroExterior: "",
      colonia: "",
      codigoPostal: "",
      estado: "",
      municipio: "",
      horarioRecepcion: "08:00 - 17:00 hrs",
    };
    onDeliveryChange([...deliveryAddresses, newAddress]);
    // Si agregamos una planta, automáticamente asume que hay entregas personalizadas
    setSameAsFiscal(false);
  };

  const handleRemoveDeliveryAddress = (id: string) => {
    onDeliveryChange(deliveryAddresses.filter((a) => a.id !== id));
  };

  const handleUpdateDeliveryAddress = (
    id: string,
    fields: Partial<DeliveryAddressData>,
  ) => {
    onDeliveryChange(
      deliveryAddresses.map((addr) =>
        addr.id === id ? { ...addr, ...fields } : addr,
      ),
    );
  };

  const handleOcrComprobante = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingOcrId(id);

    setTimeout(() => {
      handleUpdateDeliveryAddress(id, {
        calle: "Av. Parque Industrial Lerma",
        numeroExterior: "45",
        colonia: "Parque Industrial",
        codigoPostal: "52000",
        municipio: "Lerma",
        estado: "Estado de México",
        comprobanteDomicilioUrl: file.name,
      });
      setExtractingOcrId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 w-full text-left animate-in fade-in">
      <div className="flex items-center justify-between border-b pb-4 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Destinatarios de Mercancía
            </h2>
            <p className="text-sm text-slate-500">
              Registra las plantas o almacenes donde recibes embarques de
              producto.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddDeliveryAddress}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 h-9"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar Planta
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="sameFiscal"
              checked={sameAsFiscal}
              onChange={(e) => {
                setSameAsFiscal(e.target.checked);
                // Opcional: Podríamos vaciar el array, pero es mejor dejarlo intacto por si
                // el cliente cambia de opinión y no pierda sus datos capturados.
              }}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer focus:ring-indigo-600"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 cursor-pointer">
              Planta Principal: El domicilio de entrega es el mismo que el
              Domicilio Fiscal
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Marca esta opción si recibes la mercancía directamente en la
              dirección indicada en tu Cédula Fiscal.
            </span>
          </div>
        </label>

        {sameAsFiscal && (
          <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-md p-3 flex gap-3 items-start animate-in fade-in">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Nota importante:</strong> No necesitas subir un
              comprobante extra para esta ubicación. El comprobante de tu
              domicilio principal se te solicitará en el{" "}
              <strong>Paso 5 (Documentos)</strong> al final del registro.
            </p>
          </div>
        )}
      </div>

      {deliveryAddresses.map((addr, index) => (
        <div
          key={addr.id}
          className="p-0 rounded-xl border border-slate-200 bg-white space-y-0 shadow-sm relative overflow-hidden"
        >
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-indigo-600" /> Destinatario #
              {index + 1}: {addr.nombrePlanta}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveDeliveryAddress(addr.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 text-xs px-2"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar Planta
            </Button>
          </div>

          <div className="p-5 space-y-6">
            {/* LADO A LADO: MAPA Y COMPROBANTE OCR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* MAPA */}
              <div className="border border-slate-200 rounded-md overflow-hidden flex flex-col">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPinned className="h-3.5 w-3.5 text-indigo-500" />{" "}
                    Ubicación Exacta
                  </span>
                </div>
                <div className="h-[120px] bg-slate-100 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="z-10 bg-white shadow-sm text-xs h-8 border-slate-300 font-semibold"
                  >
                    Fijar Pin en Mapa
                  </Button>
                </div>
              </div>

              {/* COMPROBANTE DE DOMICILIO OCR */}
              <div className="border border-indigo-100 rounded-md overflow-hidden flex flex-col bg-indigo-50/30">
                <div className="bg-indigo-50/60 px-3 py-2 border-b border-indigo-100">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <UploadCloud className="h-3.5 w-3.5 text-indigo-600" />{" "}
                    Comprobante de Domicilio
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Sube el PDF para extraer y autocompletar la dirección de
                    esta planta.
                  </p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                  {extractingOcrId === addr.id ? (
                    <div className="flex flex-col items-center text-indigo-600">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <span className="text-xs font-semibold">
                        Extrayendo datos...
                      </span>
                    </div>
                  ) : addr.comprobanteDomicilioUrl ? (
                    <div className="flex flex-col items-center text-emerald-600">
                      <CheckCircle2 className="h-6 w-6 mb-2" />
                      <span className="text-xs font-semibold text-slate-800 text-center line-clamp-1">
                        {addr.comprobanteDomicilioUrl}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-6 text-[10px] text-indigo-600 mt-1 relative"
                      >
                        Cambiar Archivo
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg"
                          onChange={(e) => handleOcrComprobante(addr.id, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-10 text-xs border-dashed border-2 border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50 relative"
                    >
                      <UploadCloud className="h-4 w-4 mr-2" /> Seleccionar
                      Archivo
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg"
                        onChange={(e) => handleOcrComprobante(addr.id, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4 text-xs pt-2">
              <div className="space-y-1.5 md:col-span-3">
                <Label className="font-semibold text-slate-800">
                  Identificador de Planta / Almacén{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ej. Planta Toluca Bodega B"
                  value={addr.nombrePlanta}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      nombrePlanta: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-semibold text-slate-800">
                  Contacto de Recepción <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ej. Ing. Juan Pérez"
                  value={addr.contactoRecepcion}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      contactoRecepcion: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <Label className="font-semibold text-slate-800">
                  Teléfono Directo <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="10 dígitos"
                  value={addr.telefonoRecepcion}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      telefonoRecepcion: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3 border-t border-slate-100 pt-4 mt-1">
                <Label className="font-semibold text-slate-800">
                  Calle y Número <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Calle, Av. o Parque Industrial"
                  value={addr.calle}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      calle: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800">
                  Código Postal <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ej. 52000"
                  maxLength={5}
                  value={addr.codigoPostal}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      codigoPostal: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800">
                  Colonia <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Colonia o Sector"
                  value={addr.colonia}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      colonia: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-800">
                  Municipio / Estado <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ej. Lerma, Edo. Mex."
                  value={addr.municipio}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      municipio: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label className="font-semibold text-slate-800">
                  Horario de Recepción y Notas Adicionales
                </Label>
                <Input
                  placeholder="Ej. L-V 08:00 - 16:00. Tocar timbre portón azul."
                  value={addr.horarioRecepcion}
                  onChange={(e) =>
                    handleUpdateDeliveryAddress(addr.id, {
                      horarioRecepcion: e.target.value,
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
