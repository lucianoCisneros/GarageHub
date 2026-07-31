# Plan: Eliminar Fetch Calls Repetitivos en el Dashboard

## Resumen del Problema

Al navegar al dashboard (`/dashboard`), se realizan llamados fetch a la base de datos
cada ~300ms (percibido como "cada segundo"). Esto genera una carga innecesaria en la
base de datos y degrada la performance de la aplicación.

## Causa Raíz

El problema está en el componente [`SearchBar`](src/components/dashboard/search-bar.tsx:16-28),
específicamente en el `useEffect` que sincroniza el input de búsqueda con la URL.

### Análisis Detallado

```typescript
// src/components/dashboard/search-bar.tsx (líneas 16-28)
useEffect(() => {
  const timer = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, 300);

  return () => clearTimeout(timer);
}, [value, pathname, router, searchParams]); // ← searchParams es inestable
```

**El problema:** `useSearchParams()` en Next.js App Router retorna una nueva instancia
de `ReadonlyURLSearchParams` en **cada renderizado**. Al incluir `searchParams` en el
array de dependencias del `useEffect`, se crea un loop infinito:

1. Render inicial → `useEffect` se ejecuta → después de 300ms, `router.push()` se llama
   (incluso si la URL es la misma)
2. `router.push()` dispara un re-render del Server Component → `getVehicles()` se ejecuta
   nuevamente (fetch a DB)
3. El re-render produce una nueva referencia de `searchParams` → `useEffect` se dispara otra vez
4. Después de 300ms, `router.push()` se llama de nuevo → el loop continúa

**Resultado:** Una llamada a la base de datos cada ~300ms mientras el usuario está en el dashboard.

## Solución Propuesta

### 1. Estabilizar la dependencia `searchParams`

Convertir `searchParams` a string (`searchParams.toString()`) para obtener un valor
primitivo estable que solo cambie cuando los parámetros de URL realmente cambien,
no en cada render.

### 2. Agregar guardia contra navegaciones innecesarias

Comparar la URL actual con la nueva URL antes de llamar `router.push()`. Si son
iguales, no navegar. Esto rompe el loop porque cuando el efecto se ejecuta después
de una navegación, detecta que la URL ya es la correcta y no hace nada.

### Código Modificado

```typescript
// En src/components/dashboard/search-bar.tsx

// Convertir a string para tener una dependencia estable
const searchParamsString = searchParams.toString();

useEffect(() => {
  const timer = setTimeout(() => {
    const params = new URLSearchParams(searchParamsString);
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    const newUrl = `${pathname}?${params.toString()}`;
    const currentUrl = `${pathname}?${searchParamsString}`;

    // Solo navegar si la URL realmente cambió
    if (newUrl !== currentUrl) {
      router.push(newUrl);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [value, pathname, router, searchParamsString]);
//    ^^^^^ searchParamsString es un string primitivo, no un objeto
```

### Flujo Corregido

**Sin búsqueda activa (estado inicial):**
1. Render inicial: `value = ""`, `searchParamsString = ""`
2. `useEffect` se ejecuta: `newUrl = "/dashboard?"`, `currentUrl = "/dashboard?"` → iguales
3. No se llama `router.push()` → no hay re-render → **no hay loop**

**Usuario escribe en el search:**
1. Usuario tipea "a": `value = "a"`, re-render
2. `useEffect` se ejecuta: `newUrl = "/dashboard?q=a"`, `currentUrl = "/dashboard?"` → diferentes
3. `router.push("/dashboard?q=a")` → navegación → re-render con `searchParamsString = "q=a"`
4. `useEffect` se ejecuta: `newUrl = "/dashboard?q=a"`, `currentUrl = "/dashboard?q=a"` → iguales
5. No se llama `router.push()` → **loop roto**

## Verificación Adicional

Se revisaron los siguientes componentes y no presentan problemas similares:

- [`KanbanBoard`](src/components/dashboard/kanban-board.tsx): No tiene efectos ni polling
- [`StatusDrawer`](src/components/dashboard/status-drawer.tsx): Solo hace fetch por acción del usuario
- [`VehicleCard`](src/components/dashboard/vehicle-card.tsx): Componente puro, sin efectos
- [`DashboardPage`](src/app/(dashboard)/dashboard/page.tsx): Server Component, fetch único en render
- [`VehiclesPage`](src/app/(dashboard)/vehicles/page.tsx): Server Component, fetch único en render
- [`VehicleDetailPage`](src/app/(dashboard)/vehicles/[vehicleId]/page.tsx): Server Component, fetch único en render

No se encontraron patrones de `setInterval`, polling, SWR, React Query, ni ningún
mecanismo de refetch automático en el códigobase.

## Prevención a Futuro

1. **Regla de eslint:** Configurar `react-hooks/exhaustive-deps` para advertir sobre
   dependencias inestables (objetos/arrays) en `useEffect`
2. **Code Review:** Prestar atención a `useSearchParams()` como dependencia de efectos
3. **Patrón recomendado:** Siempre convertir `searchParams` a string antes de usarlo
   como dependencia: `const searchParamsString = searchParams.toString()`