"use client";

import React from "react";
import { ItinerariosAPI } from "@/api/ItinerariosAPI";
import { Reporte } from "@/api/interfaces/ApiRoutes";

type ReportStatus = "en_revision" | "pendiente";

type ReportItem = {
	id: number;
	description: string;
	usuario_emitente: {
		username: string;
		nombre_completo: string;
		role: "viajero" | "administrador";
	};
	date: string;
	status: ReportStatus;
};

const sampleReports: ReportItem[] = [
	{
		id: 1,
		description: "Contenido inapropiado",
		usuario_emitente: { username: "usuario1", nombre_completo: "Ana López", role: "viajero" },
		date: "2025-12-01",
		status: "en_revision",
	},
	{
		id: 2,
		description: "Spam",
		usuario_emitente: { username: "admin", nombre_completo: "Equipo Admin", role: "administrador" },
		date: "2025-11-28",
		status: "pendiente",
	},
];

function formatStatus(status: ReportStatus) {
	switch (status) {
		case "en_revision":
			return "En revisión";
		case "pendiente":
			return "Pendiente";
		default:
			return status;
	}
}

function StatusBadge({ status }: { status: ReportStatus }) {
	const color = status === "pendiente" ? "#2563eb" : "#ca8a04"; // pendiente vs en_revision
	const bg = status === "pendiente" ? "#dbeafe" : "#fef9c3";
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				padding: "4px 10px",
				fontSize: 12,
				fontWeight: 600,
				color,
				backgroundColor: bg,
				borderRadius: 9999,
				border: `1px solid ${color}20`,
			}}
		>
			<span
				style={{
					width: 8,
					height: 8,
					borderRadius: 9999,
					backgroundColor: color,
				}}
			/>
			{formatStatus(status)}
		</span>
	);
}

export default function ReportesPage() {
	const [reports, setReports] = React.useState<ReportItem[]>(sampleReports);
	const [loading, setLoading] = React.useState(true);
	const [selectedReport, setSelectedReport] = React.useState<Reporte | null>(null);
	const [detailLoading, setDetailLoading] = React.useState(false);
	const [queryId, setQueryId] = React.useState("");
	const [queryUser, setQueryUser] = React.useState("");
	const [queryDate, setQueryDate] = React.useState(""); // yyyy-mm-dd
	const [queryStatus, setQueryStatus] = React.useState<ReportStatus | "">("");

	const api = React.useMemo(() => ItinerariosAPI.getInstance(), []);

	// Cargar reportes del backend
	React.useEffect(() => {
		const loadReports = async () => {
			try {
				setLoading(true);
				// Obtener lista de reportes del backend
				const reportesDelBackend = await api.getReports();
				
				// Mapear reportes del backend al formato esperado
				const mappedReports = reportesDelBackend.map((reporte) => ({
					id: reporte.id,
					description: reporte.description,
					usuario_emitente: {
						username: reporte.usuario_emitente.username,
						nombre_completo: reporte.usuario_emitente.nombre_completo,
						role: (reporte.usuario_emitente.role as "viajero" | "administrador") || "viajero",
					},
					date: new Date().toISOString().split('T')[0],
					status: "pendiente" as ReportStatus,
				}));
				
				setReports(mappedReports);
			} catch (error: any) {
				console.error("Error al cargar reportes del backend:", error);
				console.log("Usando datos de muestra. Verifica que el endpoint esté disponible.");
				setReports(sampleReports);
			} finally {
				setLoading(false);
			}
		};

		loadReports();
	}, [api]);

	const toYMD = (value: unknown): string => {
		if (value == null) return "";
		if (typeof value === "string") {
			const s = value.trim();
			if (s.length >= 10) return s.slice(0, 10);
		}
		try {
			const d = new Date(value as any);
			if (isNaN(d.getTime())) return "";
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, "0");
			const day = String(d.getDate()).padStart(2, "0");
			return `${y}-${m}-${day}`;
		} catch {
			return "";
		}
	};

	const formatDateDisplay = (value: string) => {
		const ymd = toYMD(value);
		if (!ymd) return value;
		const [y, m, d] = ymd.split("-");
		return `${d}/${m}/${y}`;
	};

	const filtered = React.useMemo(() => {
		return reports.filter((r) => {
			const matchId = queryId
				? r.id.toString().includes(queryId)
				: true;
			const matchUser = queryUser
				? r.usuario_emitente.nombre_completo.toLowerCase().includes(queryUser.toLowerCase()) ||
				  r.usuario_emitente.role.toLowerCase().includes(queryUser.toLowerCase())
				: true;
			const matchDate = queryDate ? toYMD(r.date) === toYMD(queryDate) : true;
			const matchStatus = queryStatus ? r.status === queryStatus : true;
			return matchId && matchUser && matchDate && matchStatus;
		});
	}, [reports, queryId, queryUser, queryDate, queryStatus]);

	const onView = (id: number) => {
		console.log("Ver detalles del reporte", id);
		loadReportDetail(id);
	};

	const loadReportDetail = async (reportId: number) => {
		try {
			setDetailLoading(true);
			const detail = await api.getReportById(reportId);
			setSelectedReport(detail);
		} catch (error) {
			console.error("Error al cargar detalles del reporte:", error);
			alert("Error al cargar detalles del reporte");
		} finally {
			setDetailLoading(false);
		}
	};

	const onApprove = async (id: number) => {
		try {
			console.log("Baneando publicación del reporte", id);
			await api.banPublication(id);
			
			// Actualizar estado del reporte a "en_revision"
			setReports((prev) =>
				prev.map((r) =>
					r.id === id ? { ...r, status: "en_revision" as ReportStatus } : r
				)
			);
			
			alert(`Publicación baneada y reporte ${id} marcado como revisado`);
		} catch (error) {
			console.error("Error al banear publicación:", error);
			alert("Error al procesar el reporte");
		}
	};

	const onReject = (id: number) => {
		console.log("Rechazar", id);
		alert(`Reporte ${id} rechazado`);
	};

	const onDelete = async (id: number) => {
		console.log("Eliminar", id);
		const ok = confirm(`¿Eliminar reporte ${id}?`);
		if (ok) {
			try {
				await api.deleteReport(id);
				setReports((prev) => prev.filter((r) => r.id !== id));
				alert(`Reporte ${id} eliminado`);
			} catch (error) {
				console.error("Error al eliminar reporte:", error);
				alert("Error al eliminar el reporte");
			}
		}
	};

	const onToggleStatus = (id: number) => {
		setReports((prev) =>
			prev.map((r) =>
				r.id === id
					? { ...r, status: r.status === "pendiente" ? "en_revision" : "pendiente" }
					: r
			)
		);
	};

	return (
		<div style={{ padding: 24 }}>
			<h1
				style={{
					fontSize: 28,
					fontWeight: 700,
					marginBottom: 16,
				}}
			>
				Reportes
			</h1>

			{loading && <p style={{ color: "#6b7280" }}>Cargando reportes...</p>}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
					gap: 12,
					marginBottom: 16,
				}}
			>
				<input
					type="text"
					placeholder="Buscar por ID"
					value={queryId}
					onChange={(e) => setQueryId(e.target.value)}
					style={inputStyle}
				/>
				<input
					type="text"
					placeholder="Buscar por usuario/rol"
					value={queryUser}
					onChange={(e) => setQueryUser(e.target.value)}
					style={inputStyle}
				/>
				<input
					type="date"
					placeholder="Fecha"
					value={queryDate}
					onChange={(e) => setQueryDate(e.target.value)}
					style={inputStyle}
				/>
				<select
					value={queryStatus}
					onChange={(e) => setQueryStatus(e.target.value as ReportStatus | "")}
					style={inputStyle}
				>
					<option value="">Todos los estados</option>
					<option value="en_revision">En revisión</option>
					<option value="pendiente">Pendiente</option>
				</select>
			</div>

			<div
				style={{
					overflowX: "auto",
					background: "#fff",
					border: "1px solid #e5e7eb",
					borderRadius: 12,
				}}
			>
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ background: "#f9fafb" }}>
						<th style={thStyle}>Autor</th>
						<th style={thStyle}>ID</th>
						<th style={thStyle}>Fecha</th>
						<th style={thStyle}>Descripción</th>
						<th style={thStyle}>Estado</th>
						<th style={thStyle}>Acciones</th>
					</tr>
				</thead>
					<tbody>
						{filtered.map((r) => (
							<tr key={r.id} style={{ borderTop: "1px solid #e5e7eb" }}>
								<td style={tdStyle}>
									<div style={{ display: "flex", flexDirection: "column" }}>
										<span style={{ fontWeight: 600 }}>{r.usuario_emitente.nombre_completo}</span>
										<span style={{ fontSize: 12, color: "#6b7280" }}>
											Usuario {r.usuario_emitente.role}
										</span>
									</div>
								</td>
								<td style={tdStyle}>
									<code style={{ fontSize: 12 }}>{r.id}</code>
								</td>
								<td style={tdStyle}>{formatDateDisplay(r.date)}</td>
								<td style={tdStyle}>
									<button
										onClick={() => onView(r.id)}
										style={buttonStyle}
									>
										Ver detalles
									</button>
								</td>
								<td style={tdStyle}>
									<button
										onClick={() => onToggleStatus(r.id)}
										style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
										title="Cambiar estado"
									>
										<StatusBadge status={r.status} />
									</button>
								</td>
								<td style={tdStyle}>
									<div style={{ display: "flex", gap: 8 }}>
										<IconButton
											title="Banear publicación"
											color="#16a34a"
											onClick={() => onApprove(r.id)}
										>
											<CheckIcon />
										</IconButton>
										<IconButton
											title="Rechazar"
											color="#dc2626"
											onClick={() => onReject(r.id)}
										>
											<XIcon />
										</IconButton>
										<IconButton
											title="Eliminar reporte"
											color="#6b7280"
											onClick={() => onDelete(r.id)}
										>
											<TrashIcon />
										</IconButton>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

		{/* Modal de Detalles del Reporte */}
		{selectedReport && (
			<div style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: "rgba(0, 0, 0, 0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 9999,
			}} onClick={() => setSelectedReport(null)}>
				<div style={{
					background: "white",
					borderRadius: 12,
					padding: 24,
					maxWidth: 600,
					width: "90%",
					maxHeight: "80vh",
					overflowY: "auto",
				}} onClick={(e) => e.stopPropagation()}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
						<h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Detalles del Reporte #{selectedReport.id}</h2>
						<button onClick={() => setSelectedReport(null)} style={{
							background: "transparent",
							border: "none",
							fontSize: 24,
							cursor: "pointer",
						}}>×</button>
					</div>

					{detailLoading ? (
						<p style={{ color: "#6b7280" }}>Cargando detalles...</p>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							<div style={{ marginBottom: 16 }}>
								<h3 style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", margin: "0 0 8px 0" }}>Descripción</h3>
								<p style={{ margin: 0, fontSize: 14, color: "#111827" }}>{selectedReport.description}</p>
							</div>

							<div style={{ marginBottom: 16 }}>
								<h3 style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", margin: "0 0 8px 0" }}>Usuario que reportó</h3>
								<div style={{ 
									background: "#f9fafb", 
									padding: 12, 
									borderRadius: 8,
									fontSize: 14,
									color: "#111827"
								}}>
									<p style={{ margin: "0 0 4px 0" }}>
										<strong>{selectedReport.usuario_emitente.nombre_completo}</strong> (@{selectedReport.usuario_emitente.username})
									</p>
									<p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
										Rol: {selectedReport.usuario_emitente.role}
									</p>
								</div>
							</div>

							{selectedReport.historial && selectedReport.historial.length > 0 && (
								<div style={{ marginBottom: 16 }}>
									<h3 style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", margin: "0 0 8px 0" }}>Historial</h3>
									<div style={{ 
										background: "#f9fafb", 
										padding: 12, 
										borderRadius: 8,
										fontSize: 12,
										color: "#111827"
									}}>
										{selectedReport.historial.map((item, idx) => (
											<p key={idx} style={{ margin: "0 0 4px 0" }}>
												• {item.action_description}
											</p>
										))}
									</div>
								</div>
							)}

							<div style={{ 
								display: "flex", 
								gap: 8, 
								marginTop: 24,
								paddingTop: 16,
								borderTop: "1px solid #e5e7eb"
							}}>
								<button onClick={() => setSelectedReport(null)} style={{
									flex: 1,
									padding: "10px 16px",
									borderRadius: 8,
									border: "1px solid #e5e7eb",
									background: "#ffffff",
									fontSize: 14,
									fontWeight: 600,
									cursor: "pointer",
								}}>
									Cerrar
								</button>
								<button onClick={() => {
									onApprove(selectedReport.id);
									setSelectedReport(null);
								}} style={{
									flex: 1,
									padding: "10px 16px",
									borderRadius: 8,
									border: "none",
									background: "#10b981",
									color: "white",
									fontSize: 14,
									fontWeight: 600,
									cursor: "pointer",
								}}>
									Banear Publicación
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		)}
	</div>
	);
}

const thStyle: React.CSSProperties = {
	textAlign: "left",
	padding: "12px 16px",
	fontSize: 12,
	color: "#6b7280",
	fontWeight: 600,
	whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
	padding: "14px 16px",
	fontSize: 14,
	color: "#111827",
	verticalAlign: "middle",
};

const buttonStyle: React.CSSProperties = {
	padding: "6px 12px",
	borderRadius: 8,
	border: "1px solid #e5e7eb",
	background: "#f9fafb",
	fontSize: 12,
	fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
	padding: "8px 10px",
	borderRadius: 8,
	border: "1px solid #e5e7eb",
	background: "#ffffff",
	fontSize: 14,
};

function IconButton({
	children,
	onClick,
	title,
	color,
}: {
	children: React.ReactNode;
	onClick: () => void;
	title: string;
	color?: string;
}) {
	return (
		<button
			title={title}
			onClick={onClick}
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: 32,
				height: 32,
				borderRadius: 8,
				border: "1px solid #e5e7eb",
				background: "#ffffff",
				color: color || "#374151",
			}}
		>
			{children}
		</button>
	);
}

function CheckIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M20 6L9 17l-5-5" />
		</svg>
	);
}

function XIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M18 6L6 18" />
			<path d="M6 6l12 12" />
		</svg>
	);
}

function TrashIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M3 6h18" />
			<path d="M8 6V4h8v2" />
			<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
			<path d="M10 11v6" />
			<path d="M14 11v6" />
		</svg>
	);
}

