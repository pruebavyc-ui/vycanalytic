/**
 * Guarda datos en un archivo JSON
 * Solo funciona en modo desarrollo con Vite
 */
export async function saveToJSON(filename: string, data: any): Promise<boolean> {
  // Solo funciona en desarrollo
  if (import.meta.env.PROD) {
    console.warn('saveToJSON solo funciona en modo desarrollo')
    return false
  }

  try {
    const response = await fetch('/api/save-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, data }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ ${result.message}`)
      return true
    } else {
      console.error(`❌ Error guardando ${filename}:`, result.error)
      return false
    }
  } catch (error) {
    console.error(`❌ Error guardando ${filename}:`, error)
    return false
  }
}
