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

- Llevar `Reports` a tarjetas analíticas con tabs tipo consola y jerarquía clara de KPIs.
- Ajustar colores de Recharts desde componentes para ejes, tooltips y leyendas compatibles con el tema oscuro.
- Normalizar tablas y estados vacíos de reportes para que hereden los tokens globales.

## Capa 5 — Superficies secundarias

- Adaptar Login, Pending Access, Admin Dashboard y modales para eliminar superficies claras aisladas.
- Unificar botones, inputs, alerts y estados de error/éxito con los tokens globales.
- Revisar contraste, navegación por teclado y comportamiento en pantallas estrechas.

## Criterios de continuidad

- No agregar dependencias visuales salvo decisión explícita.
- No tocar Firebase/Auth ni reglas de datos durante el rediseño visual.
- Cada capa debe poder verificarse de forma aislada con `npm test` y lint focalizado cuando aplique.
