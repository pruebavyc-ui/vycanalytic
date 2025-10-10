# Data Structure

Este directorio contiene todos los datos de la aplicación organizados en archivos separados para facilitar el mantenimiento.

## Archivos

### `users.json`
Contiene todos los usuarios del sistema (administradores y clientes).

**Estructura:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "admin" | "client",
  "password": "string",
  "companyId": "string | null"
}
```

### `companies.json`
Contiene todas las empresas registradas con sus sucursales.

**Estructura:**
```json
{
  "id": "string",
  "name": "string",
  "ruc_or_identifier": "string",
  "address": "string",
  "contact_person": "string",
  "contact_email": "string",
  "sucursales": [
    {
      "id": "string",
      "name": "string",
      "address": "string",
      "mapImage": "string (ruta a imagen)"
    }
  ]
}
```

### `machines.json`
Contiene todas las máquinas industriales por sucursal.

**Estructura:**
```json
{
  "id": "string",
  "companyId": "string",
  "branchId": "string",
  "name": "string",
  "serial": "string",
  "location": "string",
  "model": "string"
}
```

### `reports.json`
Contiene todos los reportes técnicos (termográficos).

**Estructura:**
```json
{
  "id": "string",
  "reportNumber": "string",
  "machineId": "string",
  "companyId": "string",
  "reportDate": "string",
  "route": "string",
  "planNumber_or_OT": "string",
  "areas": ["string"],
  "plant": "string",
  "addressedTo": "string",
  "presentedBy": "string",
  "reviewedBy": "string",
  "createdByUserId": "string",
  "generalRecommendations": [...],
  "observations": [...],
  "items": [...]
}
```

### `vibration-reports.json`
Contiene todos los reportes de vibraciones con estado actual de cada máquina.

**Estructura:**
```json
{
  "report_id": "string",
  "company_id": "string",
  "branch_id": "string",
  "machine_id": "string",
  "report_name": "string",
  "report_date": "string (YYYY-MM-DD)",
  "location": "string",
  "created_by": "string",
  "approved_by": "string",
  "summary": {
    "good": "number",
    "observation": "number",
    "alarm": "number",
    "inacceptable": "number",
    "no_measurement": "number"
  },
  "items": [
    {
      "item_number": "number",
      "equipment_name": "string",
      "component": "string",
      "previous_condition": "string",
      "current_condition": "string",
      "diagnosis": "string",
      "observation": "string"
    }
  ]
}
```

### `machine-positions.json`
Contiene las posiciones de las máquinas en los mapas de cada sucursal.

**Estructura:**
```json
{
  "id": "string",
  "x": "number (0-100)",
  "y": "number (0-100)",
  "machineId": "string",
  "branchId": "string"
}
```

### `index.ts`
Archivo principal que combina todos los JSONs y exporta los datos consolidados.
Este archivo es el que se importa en los componentes de React.

**Uso:**
```typescript
import sample from '../data'

// Acceder a los datos
const users = sample.users
const companies = sample.companies
const machines = sample.machines
const reports = sample.reports
const vibrationReports = sample.vibrationReports
const machinePositions = sample.machinePositions
```

## Mantenimiento

Para agregar o modificar datos:

1. **Usuarios**: Editar `users.json`
2. **Empresas/Sucursales**: Editar `companies.json`
3. **Máquinas**: Editar `machines.json`
4. **Reportes Termográficos**: Editar `reports.json`
5. **Reportes de Vibraciones**: Editar `vibration-reports.json`
6. **Posiciones de Máquinas**: Editar `machine-positions.json` (o usar la interfaz en desarrollo)

Los cambios se reflejarán automáticamente en la aplicación gracias al archivo `index.ts`.

## Ventajas de esta estructura

✅ **Organización**: Cada tipo de dato en su propio archivo
✅ **Mantenibilidad**: Más fácil encontrar y editar datos específicos
✅ **Escalabilidad**: Fácil agregar nuevos tipos de datos
✅ **Legibilidad**: Archivos más pequeños y manejables
✅ **Versionamiento**: Git puede rastrear cambios específicos por tipo de dato
