import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const readDevVar = (name) => {
  try {
    const line = fs.readFileSync('.dev.vars', 'utf8').split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`))
    return line?.slice(name.length + 1).trim().replace(/^"|"$/g, '') || ''
  } catch {
    return ''
  }
}

const web3FormsAccessKey = process.env.VITE_WEB3FORMS_ACCESS_KEY || readDevVar('WEB3FORMS_ACCESS_KEY')

export default defineConfig({
  plugins: [tailwindcss(), react()],
  define: {
    'import.meta.env.VITE_WEB3FORMS_ACCESS_KEY': JSON.stringify(web3FormsAccessKey),
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
