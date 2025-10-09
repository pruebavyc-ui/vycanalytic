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
Contiene todos los reportes técnicos (termográficos, vibraciones, etc.).

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
```

## Mantenimiento

Para agregar o modificar datos:

1. **Usuarios**: Editar `users.json`
2. **Empresas/Sucursales**: Editar `companies.json`
3. **Máquinas**: Editar `machines.json`
4. **Reportes**: Editar `reports.json`

Los cambios se reflejarán automáticamente en la aplicación gracias al archivo `index.ts`.

## Ventajas de esta estructura

✅ **Organización**: Cada tipo de dato en su propio archivo
✅ **Mantenibilidad**: Más fácil encontrar y editar datos específicos
✅ **Escalabilidad**: Fácil agregar nuevos tipos de datos
✅ **Legibilidad**: Archivos más pequeños y manejables
✅ **Versionamiento**: Git puede rastrear cambios específicos por tipo de dato
