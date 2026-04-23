# Guía: Sube tu Interrogador de Derecho Procesal a Internet

Con esta guía vas a publicar tu app en internet **gratis** en unos 15–20 minutos.
Después podrás abrirla desde el celular sin encender el PC.

---

## Lo que vas a necesitar

- [ ] Una cuenta en **GitHub** (gratis) → https://github.com
- [ ] Una cuenta en **Vercel** (gratis) → https://vercel.com
- [ ] Una **API Key de Anthropic** (gratis con créditos iniciales) → https://console.anthropic.com
- [ ] Los archivos del proyecto (la carpeta `procesal-app` que descargaste)

---

## PASO 1 — Instala Node.js en tu PC

Node.js es el programa que permite ejecutar el proyecto localmente antes de subirlo.

1. Ve a https://nodejs.org
2. Descarga la versión **LTS** (la recomendada, botón verde)
3. Instálala con las opciones por defecto
4. Para verificar que se instaló bien, abre el **Terminal** (en Mac: Spotlight → "Terminal", en Windows: busca "cmd") y escribe:
   ```
   node --version
   ```
   Debe aparecer algo como `v20.x.x`

---

## PASO 2 — Obtén tu API Key de Anthropic

La app necesita una key para poder llamar a Claude.

1. Ve a https://console.anthropic.com y crea una cuenta (o inicia sesión)
2. En el menú lateral, haz clic en **"API Keys"**
3. Haz clic en **"Create Key"**
4. Ponle un nombre como "procesal-app"
5. **Copia la key** — empieza con `sk-ant-...` — y guárdala en un lugar seguro (solo se muestra una vez)

> ⚠️ Nunca compartas esta key con nadie ni la subas a GitHub.

---

## PASO 3 — Sube el proyecto a GitHub

GitHub es donde se va a guardar el código de tu app.

### 3.1 Crea una cuenta en GitHub
1. Ve a https://github.com y regístrate (es gratis)

### 3.2 Crea un repositorio nuevo
1. Una vez dentro, haz clic en el botón verde **"New"** (o el ícono `+` arriba a la derecha)
2. En **"Repository name"** escribe: `interrogador-procesal`
3. Déjalo en **Public** (o Private si prefieres)
4. **NO** marques ninguna casilla de inicialización
5. Haz clic en **"Create repository"**

### 3.3 Sube los archivos desde tu PC

Abre el Terminal en tu PC y ejecuta estos comandos **uno por uno**:

```bash
# Entra a la carpeta del proyecto
cd procesal-app

# Instala las dependencias del proyecto
npm install

# Inicia Git en la carpeta
git init

# Agrega todos los archivos
git add .

# Haz el primer commit
git commit -m "primer commit"

# Conecta con tu repositorio de GitHub
# ⚠️ Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/interrogador-procesal.git

# Sube el código
git push -u origin main
```

Si te pide usuario y contraseña de GitHub, ingresa los tuyos.

---

## PASO 4 — Despliega en Vercel

Vercel va a tomar tu código de GitHub y publicarlo en internet automáticamente.

1. Ve a https://vercel.com y haz clic en **"Sign Up"**
2. Elige **"Continue with GitHub"** — así conecta directamente con tu cuenta
3. Una vez dentro, haz clic en **"Add New Project"**
4. Busca tu repositorio `interrogador-procesal` y haz clic en **"Import"**
5. Vercel lo detecta como proyecto Next.js automáticamente — no cambies nada
6. **Antes de hacer clic en Deploy**, agrega la variable de entorno:
   - Haz clic en **"Environment Variables"**
   - En **Name** escribe: `ANTHROPIC_API_KEY`
   - En **Value** pega tu key de Anthropic (`sk-ant-...`)
   - Haz clic en **"Add"**
7. Ahora sí, haz clic en **"Deploy"**

Espera 1-2 minutos mientras se construye el proyecto. Cuando termine verás una pantalla de celebración 🎉

---

## PASO 5 — ¡Listo! Accede desde el celular

1. Vercel te dará una URL como: `https://interrogador-procesal-tuusuario.vercel.app`
2. Copia esa URL
3. Ábrela en el **navegador de tu celular** (Chrome funciona mejor para el micrófono)
4. La primera vez que presiones "Comenzar", el celular te pedirá permiso para usar el micrófono → **Aceptar**

Y ya está. Puedes guardar esa URL como favorito o agregarla a la pantalla de inicio de tu celular para acceder con un solo toque, como si fuera una app.

---

## ¿Algo salió mal?

**Error: "API key no configurada"**
→ Verifica que agregaste la variable `ANTHROPIC_API_KEY` en Vercel correctamente. Ve a tu proyecto en Vercel → Settings → Environment Variables.

**Error al hacer `git push`**
→ Puede que GitHub pida autenticación. Crea un "Personal Access Token" en GitHub: Settings → Developer settings → Personal access tokens → Generate new token. Úsalo como contraseña.

**El micrófono no funciona en el celular**
→ Asegúrate de estar usando Chrome (en iOS también funciona Safari). El micrófono requiere que la web sea HTTPS — Vercel lo hace automáticamente.

**La app se ve rara en el celular**
→ Prueba rotar el celular a horizontal o aumentar el zoom desde el navegador.

---

## Para actualizar la app en el futuro

Cada vez que quieras hacer cambios, solo edita los archivos y luego ejecuta en el Terminal:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el cambio automáticamente y actualiza la app en 1-2 minutos.

---

*Cualquier duda, consulta al asistente que te ayudó a crear esto 😊*
