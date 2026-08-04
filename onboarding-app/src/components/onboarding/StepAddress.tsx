import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Info, MapPinned } from "lucide-react";

// Asegúrate de que las props coincidan con tus tipos
interface StepAddressProps {
  fiscalAddress: any;
  onFiscalChange: (fields: any) => void;
  contactData?: any;
  onContactChange?: (fields: any) => void;
}

export function StepAddress({
  fiscalAddress,
  onFiscalChange,
}: StepAddressProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Datos del Domicilio Registrado
          </h2>
          <p className="text-sm text-slate-500">
            Copia esta información exactamente como aparece en tu Constancia de
            Situación Fiscal.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex gap-2 items-start text-amber-800 text-xs mb-4">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Para evitar errores de facturación 4.0, no abrevies palabras si no
          están abreviadas en tu documento del SAT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
        {/* Fila 1 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Código Postal <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Ej. 04120"
            maxLength={5}
            value={fiscalAddress.codigoPostal}
            onChange={(e) => onFiscalChange({ codigoPostal: e.target.value })}
            className="h-10 bg-white font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tipo de Vialidad <span className="text-red-500">*</span>
          </Label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 px-3 bg-white text-sm focus:ring-indigo-600"
            value={fiscalAddress.tipoVialidad}
            onChange={(e) => onFiscalChange({ tipoVialidad: e.target.value })}
          >
            <option value="">Selecciona...</option>
            <option value="AVENIDA">AVENIDA (AV.)</option>
            <option value="CALLE">CALLE (C.)</option>
            <option value="CALLEJON">CALLEJON (CJON.)</option>
            <option value="CALZADA">CALZADA (CALZ.)</option>
            <option value="CARRETERA">CARRETERA (CARR.)</option>
            <option value="BOULEVARD">BOULEVARD (BLVD.)</option>
            <option value="PRIVADA">PRIVADA (PRIV.)</option>
            <option value="CAMINO">CAMINO</option>
          </select>
        </div>

        {/* Fila 2 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nombre de Vialidad <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Ej. DEL CONVENTO"
            value={fiscalAddress.calle}
            onChange={(e) =>
              onFiscalChange({ calle: e.target.value.toUpperCase() })
            }
            className="h-10 bg-white uppercase"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Núm. Exterior <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Ej. 24"
              value={fiscalAddress.numeroExterior}
              onChange={(e) =>
                onFiscalChange({ numeroExterior: e.target.value })
              }
              className="h-10 bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Núm. Interior
            </Label>
            <Input
              placeholder="Opcional"
              value={fiscalAddress.numeroInterior}
              onChange={(e) =>
                onFiscalChange({ numeroInterior: e.target.value })
              }
              className="h-10 bg-white"
            />
          </div>
        </div>

        {/* Fila 3 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nombre de la Colonia <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Ej. CHURUBUSCO"
            value={fiscalAddress.colonia}
            onChange={(e) =>
              onFiscalChange({ colonia: e.target.value.toUpperCase() })
            }
            className="h-10 bg-white uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nombre de la Localidad
          </Label>
          <Input
            placeholder="Opcional"
            value={fiscalAddress.localidad}
            onChange={(e) =>
              onFiscalChange({ localidad: e.target.value.toUpperCase() })
            }
            className="h-10 bg-white uppercase"
          />
        </div>

        {/* Fila 4 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Municipio o Demarcación <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Ej. COYOACAN"
            value={fiscalAddress.municipio}
            onChange={(e) =>
              onFiscalChange({ municipio: e.target.value.toUpperCase() })
            }
            className="h-10 bg-white uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Entidad Federativa <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Ej. CIUDAD DE MEXICO"
            value={fiscalAddress.estado}
            onChange={(e) =>
              onFiscalChange({ estado: e.target.value.toUpperCase() })
            }
            className="h-10 bg-white uppercase"
          />
        </div>

        {/* Fila 5 - Referencias */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Entre Calle
          </Label>
          <Input
            placeholder="Ej. CALLE HEROES DE 47"
            value={fiscalAddress.entreCalle}
            onChange={(e) =>
              onFiscalChange({ entreCalle: e.target.value.toUpperCase() })
            }
            className="h-10 bg-white uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Y Calle
          </Label>
          <Input
            placeholder="Ej. CALLE 20 DE AGOSTO"
            value={fiscalAddress.yCalle}
            onChange={(e) =>
              onFiscalChange({ yCalle: e.target.value.toUpperCase() })
            }
            className="h-10 bg-white uppercase"
          />
        </div>
      </div>

      {/* NUEVA SECCIÓN DE GEOLOCALIZACIÓN */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <MapPinned className="h-4 w-4 text-indigo-600" /> Ubicación Exacta
            (Coordenadas)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Ayúdanos a fijar el pin en el mapa para evitar errores en nuestras
            referencias de entrega y facturación.
          </p>
        </div>
        <div className="h-48 bg-slate-100 flex items-center justify-center relative">
          {/* SIMULADOR DE MAPA */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="text-center z-10 flex flex-col items-center gap-3">
            <MapPinned className="h-10 w-10 text-indigo-400 animate-bounce" />
            <button
              type="button"
              className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-xs px-4 py-2 rounded-md shadow-sm transition-colors flex items-center gap-2"
            >
              <MapPin className="h-3.5 w-3.5" /> Marcar dirección fiscal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
