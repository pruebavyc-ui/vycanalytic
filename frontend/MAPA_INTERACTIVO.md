# 🗺️ Sistema de Posicionamiento de Máquinas en Mapa

## 📋 Funcionalidad Implementada

### ✨ Características Principales

1. **Agregar Puntos de Máquinas**
   - Botón "Agregar Máquina" para crear nuevos puntos
   - Los puntos aparecen inicialmente en el centro del mapa

2. **Modo Edición (Bloqueo/Desbloqueo)**
   - 🔒 **Bloqueado**: Los puntos no se pueden mover, solo se puede hacer click para ver información
   - 🔓 **Desbloqueado**: Los puntos se pueden arrastrar libremente por el mapa

3. **Arrastrar y Soltar**
   - En modo desbloqueado, puedes arrastrar los puntos a cualquier posición
   - Las posiciones se guardan automáticamente en localStorage

4. **Modal de Información**
   - Click en un punto (modo bloqueado) abre un modal
   - Puedes asignar una máquina al punto
   - Muestra información de la máquina seleccionada
   - Opción para eliminar el punto

5. **Persistencia de Datos**
   - Las posiciones se guardan por sucursal en localStorage
   - Al volver a la sucursal, los puntos aparecen en sus posiciones guardadas

## 🎮 Cómo Usar

### Paso 1: Acceder al Mapa
1. Ve a "Reportes de Vibraciones"
2. Selecciona una empresa
3. Selecciona una sucursal
4. Verás el mapa de la sucursal

### Paso 2: Agregar Máquinas
1. Click en **"Agregar Máquina"**
2. Aparece un punto rojo con icono de engranaje (⚙️)
3. El punto está en el centro del mapa

### Paso 3: Posicionar las Máquinas
1. Click en **"🔓 Desbloquear Posición"**
2. Arrastra los puntos a las ubicaciones físicas en el mapa
3. Suelta el punto donde quieres que quede
4. La posición se guarda automáticamente

### Paso 4: Asignar Máquinas a los Puntos
1. Asegúrate de estar en modo bloqueado (🔒)
2. Click en un punto rojo
3. Se abre un modal
4. Selecciona la máquina del dropdown
5. Ve la información de la máquina
6. Click en "Cerrar"

### Paso 5: Bloquear Posiciones
1. Click en **"🔒 Bloquear Posición"**
2. Ahora los puntos no se pueden mover
3. Solo se puede hacer click para ver información

## 🎨 Indicadores Visuales

### Estados de los Puntos
- **Punto Rojo** 🔴: Máquina en posición normal
- **Punto Azul** 🔵: Máquina siendo arrastrada
- **Animación Ping**: Efecto de pulso alrededor del punto
- **Icono ⚙️**: Representa una máquina

### Estados del Botón de Bloqueo
- **🔒 Gris**: Posiciones bloqueadas (no se pueden mover)
- **🔓 Verde**: Posiciones desbloqueadas (se pueden arrastrar)

### Contador
- Muestra el número total de máquinas en el mapa
- Actualizado en tiempo real

## 💾 Almacenamiento

Los datos se guardan en `localStorage` con la siguiente estructura:

```javascript
localStorage.key: `machinePoints_${sucursalId}`
localStorage.value: [
  {
    id: "point_1234567890",
    x: 45.5,  // Posición X en porcentaje (0-100)
    y: 60.2,  // Posición Y en porcentaje (0-100)
    machineId: "m5"  // ID de la máquina asignada
  }
]
```

## 🔧 Funciones Principales

### `addMachinePoint()`
Crea un nuevo punto en el centro del mapa (50%, 50%)

### `handlePointMouseDown(pointId, e)`
- **Modo Bloqueado**: Abre modal de información
- **Modo Desbloqueado**: Inicia el arrastre del punto

### `handleMapMouseMove(e)`
Actualiza la posición del punto mientras se arrastra

### `handleMapMouseUp()`
Detiene el arrastre y guarda la posición final

### `saveMachinePoints(points)`
Guarda todas las posiciones en localStorage

### `deleteMachinePoint(pointId)`
Elimina un punto del mapa

## 📱 Responsive

- El mapa se adapta al tamaño de la pantalla
- Altura: `calc(100vh - 300px)`
- Los puntos mantienen su posición relativa (porcentajes)

## 🎯 Casos de Uso

1. **Mapeo Inicial**
   - Agregar todos los puntos necesarios
   - Desbloquear y posicionar cada uno
   - Asignar máquinas a cada punto
   - Bloquear cuando termines

2. **Consulta Rápida**
   - Modo bloqueado por defecto
   - Click en cualquier punto para ver información
   - Cerrar modal para continuar

3. **Actualización**
   - Desbloquear posiciones
   - Mover puntos según sea necesario
   - Volver a bloquear

4. **Reorganización**
   - Eliminar puntos innecesarios desde el modal
   - Agregar nuevos puntos
   - Reposicionar existentes

## 🚀 Próximas Mejoras Posibles

- [ ] Zoom en el mapa
- [ ] Etiquetas con nombres de máquinas
- [ ] Diferentes colores por tipo de máquina
- [ ] Exportar/importar configuraciones
- [ ] Historial de cambios
- [ ] Agrupación de máquinas por área

## 💡 Tips

- Usa el modo desbloqueado solo cuando necesites mover puntos
- Asigna máquinas a los puntos para mejor organización
- El contador te ayuda a saber cuántas máquinas has mapeado
- Las posiciones se guardan automáticamente, no necesitas botón "Guardar"
