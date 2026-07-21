import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, FileText, CheckCircle2, Trash2 } from "lucide-react"

export function StepDocuments() {
  // Simulamos que la CSF ya viene cargada del Paso 1
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({
    csf: "Constancia_Situacion_Fiscal_OCR.pdf" 
  })

  // Función para simular que subimos un archivo
  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedDocs((prev) => ({ ...prev, [id]: file.name }))
    }
  }

  // Función para simular que borramos un archivo
  const removeDoc = (id: string) => {
    setUploadedDocs((prev) => {
      const newDocs = { ...prev }
      delete newDocs[id]
      return newDocs
    })
  }

  const requiredDocuments = [
    { id: "csf", title: "Constancia de Situación Fiscal", desc: "Actualizada al mes en curso." },
    { id: "acta", title: "Acta Constitutiva", desc: "Documento completo con sellos del RPPC." },
    { id: "poder", title: "Poder Notarial", desc: "Facultades del representante legal (si aplica)." },
    { id: "comprobante", title: "Comprobante de Domicilio", desc: "Luz, agua o telefonía (No mayor a 3 meses)." },
    { id: "ine", title: "Identificación Oficial", desc: "INE o Pasaporte vigente del representante." },
  ]

  return (
    <div className="space-y-4 w-full">
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 font-medium">
          Sube los documentos en formato PDF o JPG (Máximo 5MB por archivo).
        </p>
      </div>

      <div className="space-y-3">
        {requiredDocuments.map((doc) => {
          const isUploaded = !!uploadedDocs[doc.id]

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
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isUploaded ? uploadedDocs[doc.id] : doc.desc}
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
                      <FileUp className="h-3.5 w-3.5" /> Subir
                    </Button>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
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