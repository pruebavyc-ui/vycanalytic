# Sistema de Posiciones de Máquinas

## 📍 ¿Cómo funciona?

Este sistema permite guardar permanentemente las posiciones de las máquinas en el mapa de cada sucursal.

## ⚙️ Modo Desarrollo (Automático)

Cuando ejecutas `npm run dev`, el sistema guarda **automáticamente** los cambios:

### ✅ Se guarda automáticamente:
- ✨ **Nuevas máquinas** → Se agregan a `machines.json`
- 📍 **Posiciones de puntos** → Se guardan en `machine-positions.json`
- 🔄 **Cambios en tiempo real** → Sin necesidad de exportar

### 🎯 Indicador visual:
Verás un badge verde que dice **"Guardado automático activo"** cuando estés en modo desarrollo.

### 🔄 Flujo de trabajo en desarrollo:
1. Navega a **Reportes de Vibraciones** > Empresa > Sucursal
2. Agrega máquinas con **"Agregar Máquina"**
3. Posiciónalas en el mapa (desbloquea con 🔓)
4. ¡Listo! Los cambios se guardan automáticamente en los JSON

## 🚀 Modo Producción

En producción (build), usa los botones de exportación:

### 📥 Botones disponibles:
- **💾 Exportar Posiciones** - Descarga `machine-positions.json`
- **⚙️ Exportar Máquinas** - Descarga `machines.json`

### 🔄 Flujo de trabajo en producción:
1. Trabaja normalmente (se guarda en localStorage temporalmente)
2. Haz clic en los botones de exportación
3. Copia los archivos descargados a `src/data/`

## 📋 Formato de archivos

### machine-positions.json
```json
[
  {
    "id": "point_1234567890",
    "x": 45.5,
    "y": 60.2,
    "machineId": "m1234567890",
    "branchId": "b1"
  }
]
```

### machines.json
```json
[
  {
    "id": "m1234567890",
    "name": "Motor Principal",
    "serial": "MTR-001",
    "model": "ABB M3BP 280",
    "companyId": "c1",
    "branchId": "b1",
    "location": "Planta Norte"
  }
]
```

## 🔍 Prioridad de carga

El sistema carga los datos en este orden:
1. **Primero**: Lee desde los archivos JSON (permanente)
2. **Segundo**: Si no hay en JSON, usa localStorage (temporal)
3. **Tercero**: Si no hay nada, inicia vacío

## 🛠️ Tecnología

- **Plugin de Vite**: Escribe archivos durante el desarrollo
- **Middleware HTTP**: Maneja peticiones POST a `/api/save-json`
- **Guardado automático**: Solo en modo desarrollo
- **Fallback a exportación**: Para modo producción
