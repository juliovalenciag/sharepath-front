"use client";
import { useEffect, useState } from "react";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { toast } from "sonner";
import { X, AlertTriangle, ChevronRight, Check } from "lucide-react"; // Importamos nuevos iconos
import { Button } from "../ui/button";


interface ReportModalProps {
    open: boolean;
    onClose: (val: boolean) => void;
    publicationId: number;
}

// Lista de razones (puedes editarla a tu gusto)
const REPORT_REASONS = [
    "Promoción de artículos restringidos",
    "Violencia, odio o explotación",
    "Desnudez o actividad sexual",
    "Spam",
    "Información falsa",
    "Otro"
];

export function ReportModal({ open, onClose, publicationId }: ReportModalProps) {
    const api = ItinerariosAPI.getInstance();
    
    const [selectedReason, setSelectedReason] = useState(""); // Razón seleccionada de la lista
    const [customDetails, setCustomDetails] = useState("");   // Texto extra si eligen "Otro"
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedReason("");
            setCustomDetails("");
            setLoading(false);
        }
    }, [open]);

    if (!open) return null;

    const handleClose = () => {
        onClose(false);
    }

    const handleSubmit = async () => {
        // Validar que haya seleccionado algo
        if (!selectedReason) {
            toast.error("Selecciona un motivo para el reporte");
            return;
        }

        // Si eligió "Otro", validamos que haya escrito algo
        if (selectedReason === "Otro" && !customDetails.trim()) {
            toast.error("Por favor describe el motivo");
            return;
        }

        setLoading(true);

        // Construimos el mensaje final
        const finalReason = selectedReason === "Otro" 
            ? `Otro: ${customDetails}` 
            : selectedReason;

        toast.promise(
            api.createReport(publicationId, finalReason),
            {
                loading: "Enviando reporte...",
                success: () => {
                    handleClose();
                    return "Reporte enviado correctamente";
                },
                error: (err: any) => {
                    setLoading(false);
                    return err.message || "Error al enviar reporte";
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background border rounded-xl shadow-lg p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
                
                <div className="flex flex-col gap-2 mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Reportar Publicación
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        ¿Por qué estás reportando esta publicación?
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Lista de Botones */}
                    <div className="flex flex-col gap-2">
                        {REPORT_REASONS.map((reason) => (
                            <Button
                                key={reason}
                                variant={selectedReason === reason ? "secondary" : "outline"}
                                className={`w-full justify-between h-auto py-3 px-4 text-left font-normal transition-all ${
                                    selectedReason === reason 
                                        ? "border-primary bg-primary/5 text-primary" 
                                        : "hover:bg-muted/50"
                                }`}
                                onClick={() => setSelectedReason(reason)}
                                disabled={loading}
                            >
                                <span>{reason}</span>
                                {selectedReason === reason ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Área de texto condicional: Solo aparece si selecciona "Otro" */}
                    {selectedReason === "Otro" && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                Cuéntanos más detalles:
                            </label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                placeholder="Describe el problema..."
                                value={customDetails}
                                onChange={(e) => setCustomDetails(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <Button variant="ghost" onClick={handleClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleSubmit} 
                            disabled={loading || !selectedReason || (selectedReason === "Otro" && !customDetails.trim())}
                        >
                            {loading ? "Enviando..." : "Enviar Reporte"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}