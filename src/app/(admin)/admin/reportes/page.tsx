"use client";

import React from "react";

type ReportStatus = "en_revision" | "pendiente";

type ReportItem = {
	id: string;
	author: {
		name: string;
		role: "viajero" | "administrador";
	};
	date: string; // ISO or formatted
	status: ReportStatus;
};

const sampleReports: ReportItem[] = [
	{
		id: "RPT-0001",
		author: { name: "Ana López", role: "viajero" },
		date: "2025-12-01",
		status: "en_revision",
	},
	{
		id: "RPT-0002",
		author: { name: "Equipo Admin", role: "administrador" },
		date: "2025-11-28",
		status: "pendiente",
	},
	{
		id: "RPT-0003",
		author: { name: "Carlos Díaz", role: "viajero" },
		date: "2025-11-25",
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
	const [queryId, setQueryId] = React.useState("");
	const [queryUser, setQueryUser] = React.useState("");
	const [queryDate, setQueryDate] = React.useState(""); // yyyy-mm-dd
	const [queryStatus, setQueryStatus] = React.useState<ReportStatus | "">("");
	const [reports, setReports] = React.useState<ReportItem[]>(sampleReports);

  const filtered = React.useMemo(() => {
		return reports.filter((r) => {
			const matchId = queryId
				? r.id.toLowerCase().includes(queryId.toLowerCase())
				: true;
			const matchUser = queryUser
				? r.author.name.toLowerCase().includes(queryUser.toLowerCase()) ||
				  r.author.role.toLowerCase().includes(queryUser.toLowerCase())
				: true;
			const matchDate = queryDate ? toYMD(r.date) === toYMD(queryDate) : true;
			const matchStatus = queryStatus ? r.status === queryStatus : true;
			return matchId && matchUser && matchDate && matchStatus;
		});
  }, [reports, queryId, queryUser, queryDate, queryStatus]);	const onView = (id: string) => {
		// Placeholder: replace with navigation or modal
		console.log("Ver reporte", id);
		alert(`Ver reporte ${id}`);
	};

	const onApprove = (id: string) => {
		console.log("Aprobar", id);
		alert(`Aprobado reporte ${id}`);
	};

	const onReject = (id: string) => {
		console.log("Rechazar", id);
		alert(`Rechazado reporte ${id}`);
	};

	const onDelete = (id: string) => {
		console.log("Eliminar", id);
		const ok = confirm(`¿Eliminar reporte ${id}?`);
		if (ok) alert(`Eliminado reporte ${id}`);
	};

	const onToggleStatus = (id: string) => {
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
							<th style={thStyle}>Detalles</th>
							<th style={thStyle}>Estado</th>
							<th style={thStyle}>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((r) => (
							<tr key={r.id} style={{ borderTop: "1px solid #e5e7eb" }}>
								<td style={tdStyle}>
									<div style={{ display: "flex", flexDirection: "column" }}>
										<span style={{ fontWeight: 600 }}>{r.author.name}</span>
										<span style={{ fontSize: 12, color: "#6b7280" }}>
											Usuario {r.author.role}
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
										Ver reporte
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
											title="Aprobar"
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
											title="Eliminar"
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

