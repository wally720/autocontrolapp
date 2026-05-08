# Plan de rediseño visual por capas

## Dirección visual

El rediseño adopta un estilo **cockpit financiero oscuro**: una interfaz de control vehicular y financiero con fondo grafito profundo, superficies tipo panel, bordes luminosos sutiles y acentos en azul petróleo, cian y ámbar. La meta es elevar la percepción premium sin alterar rutas, autenticación ni modelo de datos.

## Capa 1 — Fundaciones globales

- Centralizar tokens CSS en `src/index.css`: colores, fondos, radios, sombras, foco, alturas táctiles, espaciado y tipografía.
- Definir base responsive mobile-first: `box-sizing`, `overflow-x` controlado, selección, foco accesible y escalas fluidas.
- Mantener compatibilidad con los módulos existentes para que el rediseño pueda avanzar por etapas.

## Capa 2 — Shell y navegación

- Actualizar `src/App.css` para que la aplicación use el fondo atmosférico, contenedores con ancho controlado y tarjetas coherentes.
- Refactorizar `Navbar.jsx` para eliminar estilos inline y mejorar semántica visual sin cambiar rutas ni lógica de auth.
- Rediseñar `Navbar.css` como barra premium responsive: links envolventes, controles apilables, avatares consistentes y touch targets cercanos o superiores a 44px.

## Capa 3 — Dashboard operativo

- **Implementada**: `DashboardHeader` ahora funciona como panel de instrumentos con total mensual dominante, mes anterior clickeable hacia `/reports?report=detail`, fondo tipo cockpit y jerarquía responsive.
- **Implementada**: `ExpenseForm` usa campos táctiles, foco coherente con tokens, CTA fuerte y secciones visuales por tipo de dato sin tocar validación ni lógica.
- **Implementada**: `ExpenseHistory` suma lectura financiera con montos alineados, hover, badges por categoría, estados vacío/loading consistentes y overflow horizontal controlado en móvil.

### Pendientes posteriores a Capa 3

- Revisar visualmente en dispositivos reales la densidad de la tabla del historial y ajustar si hay categorías/notas especialmente largas.
- Continuar con Capa 4 para llevar `Reports` y visualizaciones Recharts al mismo lenguaje visual oscuro.

## Capa 4 — Reportes y visualización

- **Implementada**: `Reports` ahora funciona como cockpit analítico con hero de estado, tabs tipo consola con scroll móvil y exportación CSV integrada visualmente sin tocar la lógica de exportación.
- **Implementada**: `ExpenseDetail` normaliza filtros de fechas/categoría, total del periodo, contador de registros, chip de filtro activo y tabla con overflow horizontal controlado.
- **Implementada parcialmente**: visualizaciones Recharts ajustadas a tema oscuro en evolución mensual y distribución por categoría mediante ejes, grillas, leyendas, tooltips y paleta compatibles con tokens.
- **Implementada**: tablas y estados de reportes secundarios usan paneles oscuros, tokens globales, montos alineados y contenedores responsive.

### Pendientes posteriores a Capa 4

- Validar visualmente en navegador real los labels largos del gráfico de distribución para decidir si conviene una leyenda más compacta en móvil.
- Revisar capturas desktop/móvil antes de Capa 5 para ajustar densidad fina de tablas si aparecen categorías o notas extremadamente largas.

## Capa 5 — Superficies secundarias

- **Implementada**: `Login` y `PendingAccess` usan paneles oscuros, CTA táctiles, foco por tokens y textos existentes sin cambiar autenticación.
- **Implementada**: `AdminDashboard` adopta hero de consola, tabs oscuros, tablas dentro de contenedores con overflow horizontal y estados/badges alineados al cockpit.
- **Implementada**: `ConfirmModal` y `NotificationToast` eliminan superficies claras, usan blur, bordes luminosos, radios/touch targets globales y estados cromáticos del sistema.
- **Pendiente**: validar visualmente en navegador real el ancho de correos largos en la tabla de administración y la posición de toasts sobre pantallas muy pequeñas.

### Pendientes posteriores a Capa 5

- Revisar capturas móvil de Admin Dashboard con listas reales de usuarios/vehículos para ajustar densidad si aparecen emails extremadamente largos.
- Hacer una pasada final de contraste/foco en navegación por teclado antes de cerrar el rediseño visual completo.

## Criterios de continuidad

- No agregar dependencias visuales salvo decisión explícita.
- No tocar Firebase/Auth ni reglas de datos durante el rediseño visual.
- Cada capa debe poder verificarse de forma aislada con `npm test` y lint focalizado cuando aplique.
