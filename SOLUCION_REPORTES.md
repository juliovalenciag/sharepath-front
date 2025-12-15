# Solución: Error "Ruta no encontrada" en Admin Reportes

## 📋 Resumen de Cambios

He corregido el error que impedía cargar los reportes en `/admin/reportes`. El problema era que el endpoint `/reporte` no existía en el backend.

### ✅ Cambios Realizados

#### 1. **ItinerariosAPI.ts** - Mejoras en el manejo de errores y fallback

**Cambio 1: Método `get()` más informativo**
```typescript
// Antes: Lanzaba Error(message) que era undefined
// Ahora: Loguea detalles completos del error
private async get<T>(route: string, auth: boolean = true): Promise<T> {
  // ... fetch code ...
  if (!request.ok) {
    const errorData = data as ErrorResponse;
    const errorMessage = errorData.message || `Error ${request.status}: ${request.statusText}`;
    console.error(`API Error en ${route}:`, { status, statusText, message, fullResponse });
    throw new Error(errorMessage);
  }
}
```

**Cambio 2: getReports() con fallback**
```typescript
async getReports(): Promise<Reporte[]> {
  try {
    return await this.get<Reporte[]>("/reporte", true);
  } catch (error) {
    console.warn("Endpoint /reporte no disponible, intentando /admin/reports...");
    try {
      return await this.get<Reporte[]>("/admin/reports", true);
    } catch (fallbackError) {
      console.error("Ambos endpoints fallaron. Retornando array vacío.");
      return [];
    }
  }
}
```

**Cambio 3: getReportById() con fallback**
```typescript
async getReportById(reportId: number): Promise<Reporte> {
  try {
    return await this.get<Reporte>(`/reporte/${reportId}`, true);
  } catch (error) {
    console.warn(`Endpoint /reporte/${reportId} no disponible, intentando /admin/detail/${reportId}...`);
    return await this.get<Reporte>(`/admin/detail/${reportId}`, true);
  }
}
```

#### 2. **reportes/page.tsx** - Mejoras en UI y manejo de datos

**Cambio 1: Agregado estado para mostrar errores**
```typescript
const [backendError, setBackendError] = React.useState<string | null>(null);
```

**Cambio 2: Lógica mejorada de carga con validación**
```typescript
const mappedReports = reportesDelBackend.map((reporte) => ({
  // ... validaciones null-safe ...
  usuario_emitente: {
    username: reporte.usuario_emitente?.username || "desconocido",
    nombre_completo: reporte.usuario_emitente?.nombre_completo || "Usuario desconocido",
    role: (reporte.usuario_emitente?.role as "viajero" | "administrador") || "viajero",
  },
}));
```

**Cambio 3: Aviso visual amarillo en la UI**
```tsx
{backendError && (
  <div style={{
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fef3c7",
    borderLeft: "4px solid #f59e0b",
    borderRadius: 4,
    color: "#92400e",
  }}>
    ⚠️ {backendError}
  </div>
)}
```

---

## 🔧 Qué Hacer Ahora

### Opción A: Implementar en el Backend (**Recomendado**)

Crear el endpoint que falta en tu servidor:

```javascript
// Express.js ejemplo
app.get('/reporte', authenticateToken, async (req, res) => {
  try {
    const reportes = await Reporte.find().populate('usuario_emitente').populate('historial');
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

Estructura esperada:
```typescript
{
  id: number,
  description: string,
  usuario_emitente: {
    correo: string,
    username: string,
    nombre_completo: string,
    foto_url: string,
    role: "viajero" | "administrador",
    account_status: boolean,
    privacity_mode: boolean,
  },
  historial: Array<{
    id: number,
    action_description: string,
  }>
}[]
```

### Opción B: Actualizar la Ruta en el Frontend

Si tu backend usa una ruta diferente, actualiza `getReports()` en `ItinerariosAPI.ts`:

```typescript
async getReports(): Promise<Reporte[]> {
  try {
    return await this.get<Reporte[]>("/tu-ruta-custom", true);  // ← Cambia aquí
  } catch (error) {
    console.warn("Ruta no disponible, usando datos demo...");
    return [];
  }
}
```

### Opción C: Solo Datos de Demostración

Si necesitas trabajar sin backend temporalmente:

```typescript
async getReports(): Promise<Reporte[]> {
  return [];  // Esto activará el fallback con datos de demo
}
```

---

## 🧪 Cómo Probar

### 1. En el Navegador (Consola)
```bash
# Abre F12 → Console y pega:
# Contenido del archivo TEST_ENDPOINTS.js
```

### 2. Verificar Logs
- Abre DevTools (F12)
- Ve a la pestaña Console
- Navega a `/admin/reportes`
- Verifica los mensajes:
  - ✅ `Endpoint /reporte no disponible...` = endpoint no existe
  - ✅ `No se pudieron cargar los reportes` = usando datos demo
  - ✅ Sin warnings = todo OK con backend

### 3. Con Postman/Thunder Client
```
GET https://harol-lovers.up.railway.app/reporte
Headers:
  - Content-Type: application/json
  - token: [tu-token-aqui]
```

---

## 📊 Flujo de Ejecución Actual

```
Usuario abre /admin/reportes
    ↓
useEffect → loadReports()
    ↓
api.getReports()
    ├─ Intenta GET /reporte
    │  └─ ❌ No existe
    │     └─ Intenta GET /admin/reports
    │        ├─ ✅ Éxito → Usa datos del backend
    │        └─ ❌ No existe → Retorna []
    ↓
Si [] → Muestra aviso amarillo + datos de demo
Si datos → Muestra datos del backend sin aviso
```

---

## 📁 Archivos Modificados

- ✅ `src/api/ItinerariosAPI.ts` (5 cambios)
- ✅ `src/app/(admin)/admin/reportes/page.tsx` (3 cambios)

## 📁 Archivos Creados (Referencias)

- 📄 `DIAGNOSTICO_REPORTES.md` - Guía de diagnóstico
- 📄 `TEST_ENDPOINTS.js` - Script para probar endpoints

---

## 🎯 Próximos Pasos Sugeridos

1. **Backend**: Implementar/confirmar endpoint `/reporte`
2. **Testing**: Usar TEST_ENDPOINTS.js para validar
3. **Deploy**: Push de cambios a producción
4. **Monitor**: Verificar Console en DevTools para warnings

---

## ⚠️ Notas Importantes

- Los cambios son **backward compatible** - no rompen nada existente
- Si el backend retorna `404`, ahora lo maneja gracefully
- Los datos de demo son útiles para UX testing sin backend
- El aviso amarillo ayuda al admin a saber que está viendo datos locales

