# Por Ellos Web

Frontend Vite + React + TypeScript de Sumando Vidas.

## Entornos y ramas

| Rama Git | Entorno | Supabase |
| --- | --- | --- |
| `develop` | Desarrollo e integración | `SumandoVidas-Dev` (`lneaejwtcffridriuwpp`) |
| `main` | Producción | `SumandoVidasDB` (`hhapfybsavgenvfqyeyq`) |

Trabaja en ramas `feature/<tema>` creadas desde `develop`. Integra mediante PR a `develop`, prueba allí y promueve mediante PR a `main`. No desarrolles directamente sobre `main`.

La organización Supabase no tiene branching/preview databases habilitado; DEV y Production son proyectos separados. Mantén sus URLs y claves diferentes. Las migraciones viven en `supabase/migrations`: aplica primero en DEV y, tras validar el PR, aplica en Production mediante un cambio controlado. No copies datos de donaciones entre proyectos.

## Variables locales

Crea `.env.local` en este repo (está ignorado por Git):

```env
VITE_SUPABASE_URL=https://lneaejwtcffridriuwpp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<clave-publica-DEV>
VITE_API_URL=http://localhost:4242
```

Para Production, define en el entorno de despliegue la URL y publishable key del proyecto Production. Las claves `VITE_*` son accesibles en el navegador: solo deben contener la publishable key, nunca una `sb_secret_...`, service-role ni otra credencial administrativa.

Las páginas de donaciones usan el backend FakeMoney solo en desarrollo. El resultado se considera confirmado únicamente después de consultar `GET /api/payments/:id`; no confíes en parámetros de retorno del navegador. Tras `paid`, vuelve a consultar las vistas públicas de rankings.

## Desarrollo y validación

```sh
npm install
npm run dev
npm run build
```

El frontend usa `http://localhost:4242` si no se define `VITE_API_URL`. GitHub Actions ejecuta `npm run build` en pushes y PRs a `develop`/`main` una vez que los cambios locales de workflow se publiquen. Para la estrategia completa y configuración backend, consulta [la guía de entornos](../../Sumando-Vidas-BACK/docs/ENVIRONMENTS.md).