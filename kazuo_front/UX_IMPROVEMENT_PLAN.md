# Plan de Mejora UX/UI - Spot-On Front

Este plan detalla las acciones estratégicas para elevar la calidad visual y la experiencia de usuario de la aplicación Spot-On, transformándola de un prototipo funcional a un producto profesional pulido.

## Fase 1: Fundamentos y Limpieza Visual (Quick Wins)

### 1.1. Unificación de Paleta de Colores
**Problema:** Uso mezclado de variables CSS `hsl`, colores de Tailwind directos (`text-blue-600`) y colores hardcoded hex. La configuración de `primary` en `globals.css` (negro) entra en conflicto con la identidad visual azul de la landing.
**Acción:**
- Actualizar `tailwind.config.ts` y `globals.css` para que la variable `--primary` apunte al Azul Corporativo (`221 83% 53%` aprox) en lugar de negro.
- Reemplazar negros absolutos (`#000`) por grises oscuros (`gray-900`) para suavizar el contraste y reducir fatiga visual.

### 1.2. Mejora de la Tipografía y Legibilidad
**Problema:** Textos a veces muy pequeños o con poco contraste.
**Acción:**
- Aumentar el tamaño base de fuente en `globals.css` o `layout.tsx` si es necesario.
- Asegurar que todos los inputs tengan al menos `16px` de tamaño de fuente para evitar que iOS haga zoom automático al enfocar.
- Estandarizar los pesos: Usar `font-medium` (500) para etiquetas y botones en lugar de `font-semibold` o `bold` excesivos.

### 1.3. Feedback de Usuario No Intrusivo
**Problema:** Uso excesivo de `SweetAlert2` (modales bloqueantes) para notificaciones simples (ej. "Bienvenido", errores de form). Interrumpe el flujo.
**Acción:**
- Implementar librería de "Toasts" (ej. `sonner` o `react-hot-toast`).
- Reemplazar alertas de éxito de login y actualizaciones menores por notificaciones toast flotantes.
- Mantener SweetAlert solo para confirmaciones críticas (ej. "Borrar cuenta", "Cerrar sesión").

---

## Fase 2: Componentes Clave y Navegación

### 2.1. Rediseño del Navbar
**Problema:** El Navbar actual es funcional pero visualmente plano. El menú móvil es una lista simple superpuesta.
**Mejora:**
- **Desktop:** Añadir un sutil "backdrop-blur" (efecto vidrio) al fondo del navbar al hacer scroll. Mejorar el espaciado de los enlaces.
- **Mobile:** Usar un componente `Sheet` (drawer lateral) en lugar de un div absoluto desplegable. Esto mejora la percepción de "app nativa" y organiza mejor el contenido.
- **Estado Activo:** Indicadores visuales más claros para la ruta actual (ej. subrayado animado o fondo sutil en el ítem).

### 2.2. Login y Registro (Auth Experience)
**Problema:** Formulario básico centrado. Feedback de error por alerta.
**Mejora:**
- **Diseño Split:** Usar un layout de dos columnas en desktop: Izquierda con imagen de marca/testimonial inspirador, Derecha con el formulario limpio.
- **Validación Inline:** Mostrar errores de campo (email inválido) directamente debajo del input correspondiente en tiempo real o al perder foco (onBlur), en lugar de esperar al submit.
- **Loading States:** Mostrar spinners dentro de los botones de acción para indicar proceso, evitando clics múltiples (ya implementado parcialmente, pulir visualmente).

### 2.3. Dashboard y Layout Interno (`ClientLayout`)
**Problema:** La estructura actual parece empujar todo el contenido `margin-top: 5em` en global css.
**Mejora:**
- Crear un layout de Dashboard dedicado (Sidebar lateral colapsable + Header superior) diferente al layout de Landing page.
- Separar claramente el contexto de "Sitio Web" del contexto de "Aplicación de Gestión".

---

## Fase 3: "Look & Feel" y Detalles (Polishing)

### 3.1. Micro-interacciones
- Añadir transiciones suaves (`transition-all duration-200`) a todos los elementos interactivos (botones, cards, inputs).
- Efecto de escala sutil (`scale-[1.02]`) en tarjetas al hacer hover.

### 3.2. Empty States (Estados Vacíos)
- Diseñar componentes ilustrativos para cuando no hay datos (ej. "No hay productos en el inventario"). Evitar pantallas en blanco o tablas vacías tristes.

### 3.3. Accesibilidad (a11y)
- Asegurar que todos los campos de formulario tengan `labels` asociados correctamente (a veces ocultos visualmente pero presentes en DOM).
- Verificar contraste de colores (texto gris sobre fondo gris).
- Navegación por teclado funcional en menús y modales.

## Prioridad de Implementación

1.  **Alta:** Configuración de Tailwind (Colores/Fuentes) y reemplazo de `SweetAlert` por Toasts en Login.
2.  **Alta:** Rediseño visual del Login (Primera impresión del usuario).
3.  **Media:** Refactorización del Navbar (Desktop y Mobile Drawer).
4.  **Media:** Estandarización de Inputs y Botones en toda la app.
5.  **Baja:** Micro-interacciones y transiciones avanzadas.
