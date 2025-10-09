# Arquitectura de Datos - VyC Analytic

## 📊 Estructura Actual

```
frontend/src/data/
├── 📄 users.json          → Gestión de usuarios (admin/clientes)
├── 🏢 companies.json      → Empresas y sucursales
├── ⚙️  machines.json       → Máquinas industriales
├── 📋 reports.json        → Reportes técnicos
├── 🔗 index.ts            → Exportador central
└── 📚 README.md           → Documentación
```

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────┐
│  Archivos JSON Individuales                    │
├─────────────────────────────────────────────────┤
│  users.json                                     │
│  companies.json                                 │
│  machines.json                                  │
│  reports.json                                   │
└────────────┬────────────────────────────────────┘
             │
             ↓
      ┌──────────────┐
      │  index.ts    │  ← Combina todos los JSONs
      └──────┬───────┘
             │
             ↓
   ┌─────────────────────┐
   │  import sample      │
   │  from '../data'     │
   └─────────┬───────────┘
             │
      ┌──────┴──────┐
      │             │
      ↓             ↓
┌──────────┐  ┌──────────────────┐
│ Clientes │  │ ReportesVibraciones│
└──────────┘  └──────────────────┘
      ↓             ↓
┌──────────┐  ┌──────────┐
│Dashboard │  │  Login   │
└──────────┘  └──────────┘
```

## ✅ Confirmación de Uso

### Archivos que importan datos:

1. **Clientes.tsx**
   ```typescript
   import sample from '../data'
   const companies = sample.companies
   const users = sample.users
   const machines = sample.machines
   const reports = sample.reports
   ```

2. **Dashboard.tsx**
   ```typescript
   import sample from '../data'
   const companiesCount = sample.companies.length
   const reportsCount = sample.reports.length
   ```

3. **Login.tsx**
   ```typescript
   import sample from '../data'
   const users = sample.users
   ```

4. **ReportesVibraciones.tsx**
   ```typescript
   import sample from '../data'
   const companies = sample.companies
   const users = sample.users
   const machines = sample.machines
   ```

## 🎯 Beneficios Alcanzados

✅ **Modularidad**: Cada entidad en su propio archivo
✅ **Mantenibilidad**: Editar datos específicos sin tocar otros
✅ **Escalabilidad**: Agregar nuevas entidades fácilmente
✅ **Claridad**: Estructura clara tipo base de datos
✅ **Versionamiento**: Git trackea cambios por entidad
✅ **Performance**: Menor carga por archivo

## 🔧 Cómo Editar Datos

### Para agregar un usuario:
Editar `users.json` → Agregar objeto al array

### Para agregar una empresa:
Editar `companies.json` → Agregar objeto con sucursales

### Para agregar una máquina:
Editar `machines.json` → Agregar con companyId y branchId

### Para agregar un reporte:
Editar `reports.json` → Agregar con machineId y companyId

## 🚫 Archivo Eliminado

~~`sample.json`~~ (893 líneas) - Ya no se usa

Los datos ahora están distribuidos en archivos especializados.
