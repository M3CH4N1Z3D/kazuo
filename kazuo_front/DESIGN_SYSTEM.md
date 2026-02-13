# Sistema de Diseño - Kazuo

Este documento define las directrices visuales y técnicas para la interfaz de usuario de Kazuo, asegurando consistencia, accesibilidad y una estética moderna y profesional.

## 1. Colores

Basado en la identidad actual, estandarizamos la paleta para eliminar inconsistencias entre las variables de Tailwind por defecto y los colores "hardcoded" en los componentes.

### Paleta Primaria (Brand)
El color principal de acción y marca.
- **Primary Blue:** `#2563EB` (Tailwind `blue-600`)
  - *Uso:* Botones principales (CTAs), enlaces activos, estados de foco, iconos destacados.
  - *Hover:* `#1D4ED8` (`blue-700`)
  - *Surface/Light:* `#EFF6FF` (`blue-50`) - Para fondos sutiles de elementos seleccionados.

### Paleta Secundaria (Acento)
Para elementos que requieren atención especial o notificaciones.
- **Accent Orange:** `#F97316` (Tailwind `orange-500` / config `terciary`)
  - *Uso:* Badges, notificaciones, llamadas a la atención secundarias.

### Paleta Neutra (Grayscale)
Para texto, bordes y fondos estructurales.
- **Text Primary:** `#111827` (`gray-900`) - Títulos y texto principal.
- **Text Secondary:** `#4B5563` (`gray-600`) - Párrafos, etiquetas, descripciones.
- **Text Muted:** `#9CA3AF` (`gray-400`) - Placeholders, texto deshabilitado.
- **Border:** `#E5E7EB` (`gray-200`) - Bordes de tarjetas e inputs.
- **Background:** `#FFFFFF` (Blanco puro) y `#F9FAFB` (`gray-50`) para fondos de sección.

### Semántica (Feedback)
- **Success:** `#22C55E` (`green-500`) - Confirmaciones, estados positivos.
- **Error:** `#EF4444` (`red-500`) - Errores de validación, acciones destructivas.
- **Warning:** `#EAB308` (`yellow-500`) - Alertas.

---

## 2. Tipografía

Fuente base: **Inter** (ya configurada en `layout.tsx`).

### Escala Tipográfica
| Nivel | Tamaño (Web) | Peso | Tracking | Uso |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | 36px / 40px (md) | Bold (700) | -0.02em | Títulos de Landing, Dashboard Headers |
| **H2** | 30px | SemiBold (600) | -0.01em | Subtítulos de sección |
| **H3** | 24px | SemiBold (600) | Normal | Títulos de tarjetas (Cards) |
| **Body Large** | 18px | Regular (400) | Normal | Intros, textos destacados |
| **Body** | 16px | Regular (400) | Normal | Texto general, párrafos |
| **Small** | 14px | Medium (500) | Normal | Etiquetas, Inputs, Botones secundarios |
| **Tiny** | 12px | Regular (400) | Normal | Captions, Metadatos |

---

## 3. Espaciado y Estructura

Utilizamos la escala de Tailwind (rem based).

### Radius (Bordes)
Para un look moderno y amigable ("Kazuo" sugiere armonía).
- **Small:** `0.375rem` (6px) - Inputs, Botones internos, Badges.
- **Medium:** `0.5rem` (8px) - Tarjetas de contenido denso, Botones estándar.
- **Large:** `1rem` (16px) - Contenedores principales, Modales.
- **X-Large:** `1.5rem` (24px) - Imágenes decorativas, contenedores de landing.

### Sombras (Elevation)
- **Subtle:** `0 1px 2px 0 rgb(0 0 0 / 0.05)` (`shadow-sm`) - Cards interactivas en reposo.
- **Default:** `0 4px 6px -1px rgb(0 0 0 / 0.1)` (`shadow`) - Cards, Dropdowns.
- **Hover:** `0 10px 15px -3px rgb(0 0 0 / 0.1)` (`shadow-lg`) - Estado hover de cards.

---

## 4. Componentes Base (Átomos)

### Botones (`Button`)
Estandarización basada en Shadcn UI pero con branding Kazuo.

*   **Variant Default (Primary):**
    *   Bg: `blue-600` -> Hover: `blue-700`
    *   Text: White
    *   Radius: `md` o `xl` (para landing)
    *   Shadow: `shadow-md` -> Hover: `shadow-lg` (con transición suave)
*   **Variant Outline (Secondary):**
    *   Border: `gray-200`
    *   Bg: `white` -> Hover: `gray-50`
    *   Text: `gray-700`
*   **Variant Ghost:**
    *   Bg: Transparent -> Hover: `blue-50`
    *   Text: `blue-600`

### Inputs (`Input`)
- **Normal:** Border `gray-300`, Bg `white`, Text `gray-900`.
- **Focus:** Border `blue-500`, Ring `2px blue-100` (Eliminar el outline azul default del navegador).
- **Error:** Border `red-500`, Texto de error debajo en `text-sm text-red-500`.
- **Label:** `text-sm font-medium text-gray-700`, espaciado `mb-1.5`.

### Tarjetas (`Card`)
- Bg: `white`
- Border: `1px solid gray-100` (sutil)
- Shadow: `shadow-sm`
- Padding: `p-6` (estándar)

---

## 5. Iconografía
- Continuar usando **Lucide React** como librería principal por su consistencia y limpieza (trazos uniformes).
- Tamaño estándar iconos inline: `18px` o `20px`.
- Tamaño iconos feature: `24px` o `32px`.
