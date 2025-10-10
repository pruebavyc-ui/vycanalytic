import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

export default function writeJsonPlugin(): Plugin {
  return {
    name: 'vite-plugin-write-json',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/save-json') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const { filename, data } = JSON.parse(body)
              const filePath = path.join(__dirname, 'src', 'data', filename)
              
              // Escribir el archivo JSON formateado
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
              
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true, message: `${filename} guardado correctamente` }))
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: (error as Error).message }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}
