# enriqueolvera.com

Sitio oficial de Enrique Olvera. **Astro** (estático) + **Keystatic** (CMS git-based)
para que el equipo administre las **News** sin tocar código. Pensado para deploy en
**Vercel** con **Vercel Web Analytics**. Costo de infra: $0.

El diseño visual se reusa tal cual del prototipo elegido en
`../DEVOLUTION PROPOSSAL/` (mismo `styles.css` + `script.js`, sin rediseñar).

---

## Stack

- Astro `^6.4` — output `static`, on-demand routes solo para el admin de Keystatic.
- Keystatic (`@keystatic/core` + `@keystatic/astro`) en **local mode** (sin cuentas todavía).
- React 19 (`@astrojs/react`) — lo necesita el admin UI de Keystatic.
- `@astrojs/node` — adapter usado SOLO para `npm run build` (ver nota en `astro.config.mjs`).

## Cómo correr

```sh
npm install
npm run dev      # http://localhost:4321/
```

- **Home:** `http://localhost:4321/` — renderiza las News desde el CMS.
- **Admin (CMS):** `http://localhost:4321/keystatic` — crear / editar / borrar News.
  En local mode los cambios se escriben directo en el repo (`src/content/news/*` +
  imágenes en `public/images/news/`).

```sh
npm run build    # genera ./dist
npm run preview  # sirve el build local
```

> Nota dev/build: `astro dev` corre **sin** adapter (Astro sirve las rutas del admin
> nativamente). El adapter de Node se agrega solo en `build` porque su módulo de
> sesiones rompe el dev bajo Vite 7. Está todo automatizado en `astro.config.mjs`.

## Modelo de datos — collection `news`

Una News = una card simple. **No tiene página interna de detalle**: toda la card
linkea a un `link` externo (se abre en otra pestaña con el botón "View +").

Definida en `keystatic.config.ts`. Campos:

| Campo     | Tipo            | Label (admin)                  | Notas                                                        |
| :-------- | :-------------- | :----------------------------- | :----------------------------------------------------------- |
| `image`   | image           | Imagen                         | Se guarda en `public/images/news/`, se respeta su proporción |
| `title`   | slug (text)     | Título                         | Requerido                                                    |
| `date`    | date            | Fecha                          | Ordena las cards (más reciente = nota destacada / lead)      |
| `excerpt` | text multiline  | Resumen (máx. ~200 palabras)   | Máx. ~1200 caracteres. Se muestra solo en la nota destacada  |
| `link`    | url             | Link externo                   | Requerido. El "View +" lo abre en otra pestaña               |

**Lógica de layout** (`src/pages/index.astro`): se ordena por `date` desc. La más
reciente va como `.lead` (destacada, 2 columnas, con excerpt). El resto van al
`.mosaic`. Las cards se generan en build con `@keystatic/core/reader` (no están
hardcodeadas).

El resto del sitio (masthead, mega-menú con restaurantes, footer) es **estático /
hardcodeado** en `index.astro`, igual que en el prototipo. NO va al CMS.

### Contenido inicial

Ya están cargadas las 7 News del prototipo (Pujol, Cosme, Damian, Atla, Ticuchi,
Manta, Ditroit) en `src/content/news/*.yaml`, con sus imágenes y textos en inglés.
El `link` de todas es un placeholder `https://www.enriqueolvera.com` — **el cliente
los reemplaza** por la URL real de cada nota desde el admin.

---

## PASOS FINALES PENDIENTES (cuando existan las cuentas)

Estos pasos dependen de cuentas que el dueño está creando en paralelo. No hacer nada
de esto todavía.

### (a) Keystatic: de local mode a GitHub mode

Para que el equipo edite desde el admin en producción (y los cambios se commiteen al
repo vía GitHub), hay que pasar Keystatic a GitHub mode:

1. En `keystatic.config.ts`, cambiar:
   ```ts
   storage: { kind: 'local' }
   // por:
   storage: { kind: 'github', repo: 'OWNER/enriqueolvera-site' }
   ```
2. Crear una **GitHub App** para el OAuth de Keystatic (ver docs de Keystatic →
   "GitHub mode"): te da `clientID`, `clientSecret` y un app slug.
3. Cargar en Vercel las env vars:
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET` y `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.

Hay un comentario con los detalles en `keystatic.config.ts`.

### (b) Conectar el repo a Vercel y deployar

1. `npm install @astrojs/vercel`
2. En `astro.config.mjs`: `import vercel from '@astrojs/vercel'` y reemplazar
   `node({ mode: 'standalone' })` por `vercel()`.
3. Importar el repo de GitHub en Vercel y deployar (framework: Astro, detección
   automática).

### (c) Activar Vercel Web Analytics

1. En el dashboard de Vercel → proyecto → pestaña **Analytics** → Enable.
2. `npm install @vercel/analytics` y montar `<Analytics />` (componente React) en
   `index.astro`, o seguir la guía de Astro + Vercel Analytics.

### (d) Re-sincronizar el diseño antes del deploy final

`styles.css` y `script.js` se siguen puliendo **en paralelo** en
`../DEVOLUTION PROPOSSAL/`. **Antes del deploy final**, recopiar las últimas versiones:

```sh
cp "../DEVOLUTION PROPOSSAL/styles.css" public/styles.css
cp "../DEVOLUTION PROPOSSAL/script.js"  public/script.js
# y las fonts/imágenes si cambiaron:
cp "../DEVOLUTION PROPOSSAL/fonts/sofiapro-light.otf" public/fonts/
cp "../DEVOLUTION PROPOSSAL/img/"*.webp public/img/
cp "../DEVOLUTION PROPOSSAL/img/news/"*.webp public/img/news/
cp "../DEVOLUTION PROPOSSAL/img/menu/"*.webp public/img/menu/
```

Si el HTML del prototipo cambió (masthead / mega-menú / footer), reflejar esos
cambios manualmente en `src/pages/index.astro` (la sección de News ya es dinámica,
no se toca).
