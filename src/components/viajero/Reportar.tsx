"use client";
import { useEffect, useState } from "react";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { toast } from "sonner";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

interface ReportModalProps {
    open: boolean;
    onClose: (val: boolean)=> void;
    publicationId: number;
}

export function ReportModal ({ open, onClose, publicationId }: ReportModalProps) {
    const api = ItinerariosAPI.getInstance();
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setReason("");
            setLoading(false);
        }
    }, [open]);

    if (!open) return null;

    const handleClose = () => {
        onClose(false);
    }

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast.error("Ingrese un motivo para el reporte");
            return;
        }
        setLoading(true);

        toast.promise(
            api.createReport(publicationId, reason),
            {
                loading: "Enviando reporte...",
                success: () => {
                    handleClose();
                    return "Reporte enviado correctamente";
                },
                error: (err) => {
                    setLoading(false);
                    return "Error al enviar reporte";
                },
            }
        );
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background border rounded-xl shadow-lg p-6 relative animate-in zoom-in-95 duration-200">
                <button
                onClick={handleClose}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5"/>
                </button>
                <div className="flex flex-col gap-2 mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Reportar Publicación
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Publicación ID: {publicationId}
                    </p>
                </div>
                
                <div className="space-y-4">
                    <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Describe el motivo..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                    />
                    
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Enviando..." : "Enviar Reporte"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

