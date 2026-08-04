import { useState } from "react";
import {
  UploadCloud,
  File,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type FileStatus = "pending" | "uploading" | "success" | "error";

interface DocumentState {
  file: File | null;
  status: FileStatus;
  progress: number;
  error?: string;
}

const requiredDocuments = [
  {
    id: "constanciaFiscal",
    title: "Constancia de Situación Fiscal (CSF)",
    description:
      "Documento oficial del SAT, no mayor a 3 meses. No es la opinión de cumplimiento.",
  },
  {
    id: "comprobanteDomicilio",
    title: "Comprobante de Domicilio",
    description:
      "Recibo de luz, agua o teléfono, no mayor a 3 meses. Debe coincidir con el domicilio fiscal.",
  },
  {
    id: "identificacionRepresentante",
    title: "Identificación Oficial del Representante Legal",
    description: "INE/IFE vigente por ambos lados o pasaporte.",
  },
  {
    id: "estadoCuenta",
    title: "Carátula de Estado de Cuenta Bancario",
    description:
      "No mayor a 3 meses. Debe mostrar claramente la CLABE interbancaria.",
  },
];

const DocumentUploader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const [doc, setDoc] = useState<DocumentState>({
    file: null,
    status: "pending",
    progress: 0,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDoc({ file, status: "uploading", progress: 0 });

      // Simulación de carga a Supabase Storage
      const interval = setInterval(() => {
        setDoc((prev) => {
          const newProgress = prev.progress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...prev, status: "success", progress: 100 };
          }
          return { ...prev, progress: newProgress };
        });
      }, 200);
    }
  };

  const handleRemoveFile = () => {
    setDoc({ file: null, status: "pending", progress: 0 });
  };

  const renderStatus = () => {
    switch (doc.status) {
      case "pending":
        return (
          <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
            <span className="text-sm font-semibold text-indigo-600">
              Seleccionar archivo
            </span>
            <span className="text-xs text-slate-500 mt-1">
              PDF, PNG, o JPG (máx 5MB)
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </label>
        );
      case "uploading":
        return (
          <div className="w-full text-center p-6 border border-slate-200 rounded-lg">
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 mb-2">
              Cargando: {doc.file?.name}
            </p>
            <Progress value={doc.progress} className="h-1.5" />
          </div>
        );
      case "success":
        return (
          <div className="w-full flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-3">
              <File className="h-6 w-6 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800 truncate">
                {doc.file?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-7 w-7 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      // Puedes agregar el caso de 'error' si lo necesitas
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {renderStatus()}
    </div>
  );
};

export function StepDocuments() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Documentación Requerida
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Por favor, adjunta los siguientes documentos en formato digital.
        </p>
      </div>
      <div className="space-y-6">
        {requiredDocuments.map((doc) => (
          <DocumentUploader
            key={doc.id}
            title={doc.title}
            description={doc.description}
          />
        ))}
      </div>
    </div>
  );
}