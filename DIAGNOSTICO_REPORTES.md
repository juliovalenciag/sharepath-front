# Diagnóstico: Error "Ruta no encontrada" en Reportes

## Problema
El endpoint `/reporte` no está disponible en el backend, lo que causa que la página de reportes falle al intentar cargar los datos.

## Error Original
```
src\api\ItinerariosAPI.ts (197:13) @ ItinerariosAPI.get
Error: Ruta no encontrada
```

## Cambios Realizados

### 1. **Mejora del Manejo de Errores** (`src/api/ItinerariosAPI.ts`)
- ✅ Mejorado el método `get()` para loguear errores más detallados
- ✅ Incluye status HTTP, statusText y full response en el console.error

### 2. **Endpoints con Fallback** (`src/api/ItinerariosAPI.ts`)
- ✅ `getReports()`: Intenta `/reporte` primero, luego `/admin/reports`
- ✅ `getReportById()`: Intenta `/reporte/{id}` primero, luego `/admin/detail/{id}`

### 3. **UI Mejorada** (`src/app/(admin)/admin/reportes/page.tsx`)
- ✅ Muestra aviso amarillo cuando datos provienen de fallback
- ✅ Validación de campos nullables para evitar errores de mapping
- ✅ Estado `backendError` para informar al usuario

## Qué Verificar en el Backend

### Opción 1: Usa `/reporte`
Asegúrate de que exista:
```
GET /reporte
```
Retorna: `Reporte[]`

### Opción 2: Usa `/admin/reports`
Si prefieres otra ruta, cámbiala en `ItinerariosAPI.getReports()`:
```typescript
async getReports(): Promise<Reporte[]> {
    try {
      return await this.get<Reporte[]>("/reporte", true);
    } catch (error) {
      console.warn("Intentando ruta alternativa...");
      return await this.get<Reporte[]>("/tu-ruta-correcta", true);
    }
  }
```

### Opción 3: Usar datos de demostración
Si prefieres solo datos de demo mientras desarrollas el backend:
```typescript
async getReports(): Promise<Reporte[]> {
    // Retorna array vacío para usar datos de demo
    return [];
}
```

## Estructura Esperada de `Reporte`

```typescript
interface Reporte {
    id: number;
    description: string;
    usuario_emitente: {
        correo: string;
        username: string;
        nombre_completo: string;
        foto_url: string;
        role: "viajero" | "administrador";
        account_status: boolean;
        privacity_mode: boolean;
    };
    historial: Array<{
        id: number;
        action_description: string;
    }>;
}
```

## Cómo Verificar

1. **Abre la consola del navegador** (F12 → Console)
2. **Ve a la página de reportes** (`/admin/reportes`)
3. **Verifica los logs**:
   - Si ves `API Error en /reporte:` → El endpoint no existe
   - Si ves `Endpoint /reporte no disponible, intentando...` → Está usando fallback
   - Si ves `No se pudieron cargar los reportes` → Está usando datos de demo

## Flujo de Ejecución

```
1. ReportesPage monta
   ↓
2. loadReports() intenta api.getReports()
   ↓
3. getReports() intenta GET /reporte
   ├─ ✅ Éxito → Retorna datos del backend
   └─ ❌ Fallo → Intenta GET /admin/reports
      ├─ ✅ Éxito → Retorna datos del backend
      └─ ❌ Fallo → Retorna []
   ↓
4. Si retorna [], se muestra error y datos de demo
```

## Next Steps

1. Verifica que el endpoint exista en tu backend
2. Prueba con herramientas como Postman/Thunder Client
3. Si existe pero con otra ruta, actualiza la URL en `getReports()`
4. El usuario verá el aviso amarillo hasta que el backend esté disponible
