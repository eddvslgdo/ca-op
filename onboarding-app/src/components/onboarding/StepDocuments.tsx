import { Button } from "@/components/ui/button"
import { FileUp, FileText, CheckCircle2, Trash2, ShieldAlert } from "lucide-react"

export interface StepDocumentsData {
  csf: File | null;
  comprobante: File | null;
  ine: File | null;
}

interface StepDocumentsProps {
  documents?: StepDocumentsData; // Hacemos la prop opcional por si acaso
  onDocumentsChange: (docs: StepDocumentsData) => void;
}

export function StepDocuments({ 
  // Le damos un valor por defecto para evitar el error "undefined"
  documents = { csf: null, comprobante: null, ine: null }, 
  onDocumentsChange 
}: StepDocumentsProps) {

  const handleFileUpload = (id: keyof StepDocumentsData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, sube únicamente archivos en formato PDF.");
      e.target.value = ""; 
      return;
    }

    onDocumentsChange({ ...documents, [id]: file })
  }

  const removeDoc = (id: keyof StepDocumentsData) => {
    onDocumentsChange({ ...documents, [id]: null })
  }

  const requiredDocuments: Array<{ id: keyof StepDocumentsData; title: string; desc: string }> = [
    { id: "csf", title: "Constancia de Situación Fiscal", desc: "Actualizada al mes en curso (PDF)." },
    { id: "comprobante", title: "Comprobante de Domicilio", desc: "Luz, agua o telefonía no mayor a 3 meses (PDF)." },
    { id: "ine", title: "Identificación Oficial", desc: "INE o Pasaporte vigente del representante (PDF)." },
  ]

  return (
    <div className="space-y-4 w-full animate-in fade-in">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex gap-2 items-start text-amber-800 text-xs mb-6">
        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Toda la documentación es manejada de forma confidencial para tu alta comercial. <strong>Por seguridad, solo se admiten archivos en formato PDF.</strong>
        </p>
      </div>

      <div className="space-y-3">
        {requiredDocuments.map((doc) => {
          const file = documents[doc.id]
          const isUploaded = !!file

          return (
            <div 
              key={doc.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                isUploaded ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isUploaded ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                  {isUploaded ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${isUploaded ? "text-emerald-900" : "text-slate-900"}`}>
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {isUploaded ? file.name : doc.desc}
                  </p>
                </div>
              </div>

              <div>
                {isUploaded ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeDoc(doc.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="relative">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <FileUp className="h-3.5 w-3.5" /> Subir PDF
                    </Button>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(doc.id, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}