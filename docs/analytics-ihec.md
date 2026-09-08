# Hipotecalc Analytics / IHEC — versión local

## Contenido y URLs

- `/analytics`: portada del área, enlazada desde home, menú y footer.
- `/analytics/indice-esfuerzo-compra`: indicador, gráfico interactivo, ranking y descargas.
- `/analytics/indice-esfuerzo-compra/metodologia`: fuentes, cálculo, validación y límites.
- `/analytics/indice-esfuerzo-compra/informes`: archivo trimestral.
- `/analytics/indice-esfuerzo-compra/informes/2023-t1` hasta `2026-t1`: 13 informes retrospectivos.
- Fichas iniciales: `madrid`, `barcelona`, `marbella`, bajo el indicador.
- Espejos EN: `/en/analytics/house-price-to-income`, `methodology`, `reports/2023-q1`, etc.

40 páginas HTML nuevas, 26 informes entre ambos idiomas, 28 CSV y 26 gráficos bilingües con PNG, SVG y WebP responsive. Sin publicar: esta tarea no incluye commit ni push.

## Fuente y cautelas de interpretación

Importación del Excel `hipotecalc_evolucion_trimestral_2023_2026.xlsx`, versión con ocho hojas y corte 7 de septiembre de 2026. El SHA-256 del original queda en el snapshot, que no modifica el archivo de entrada. El importador lee datos y resultados de fórmulas OOXML, no ejecuta macros ni instrucciones de las hojas.

IHEC = precio ofertado municipal €/m² × 80 / renta anual estimada del hogar. No es cuota/ingresos, años de ahorro, una tasación ni una media nacional. Muestra fija de los 100 municipios más poblados de 2025. Todos los datos trimestrales de renta son estimados, incluidos los de 2023.

El factor nacional común no permite observar crecimientos de renta distintos entre municipios. El contraste 2022–2023 seleccionó el proxy: no es validación independiente de todo el modelo, ni un intervalo de confianza. Estas cautelas se publican en la metodología, en las páginas y en las citas.

El último trimestre calculable es **2026T1**. T2 tiene precios pero no renta; T3 tiene precios parciales (julio-agosto; solo julio en Santiago de Compostela). No se rellenan huecos ni se publican índices/rankings para esos trimestres.

Los informes se publican retrospectivamente con fecha real UTC de esta edición; **no se finge que estaban publicados en el trimestre al que se refieren**. No sirven como backtest de información disponible en tiempo real.

## Fuentes contrastadas durante la implementación

- [INE, serie ECV3959](https://ine.es/consul/serie.do?d=true&s=ECV3959): 36.996 y 38.994, encuestas 2024 y 2025, ingresos de los años anteriores. Confirmación adicional mediante API oficial DATOS_SERIE.
- [INE, CTNFSI 1T2026](https://www.ine.es/dyngs/Prensa/CTNFSI1T26.htm): publicación de 30 de junio de 2026 y revisión de series desestacionalizadas.
- [INE, ADRH 2023](https://www.ine.es/dyngs/Prensa/ADRH2023.htm) y [tabla municipal 30824](https://www.ine.es/jaxiT3/Tabla.htm?t=30824).
- Tablas oficiales [CTNFSI 62275](https://www.ine.es/jaxiT3/Tabla.htm?t=62275), [ECP 60135](https://www.ine.es/jaxiT3/Tabla.htm?t=60135) y [ECV 9949](https://www.ine.es/jaxiT3/Tabla.htm?t=9949).
- [Histórico de precios ofertados de Idealista](https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/): enlaces municipales conservados en los datos y visibles en las tres fichas.

La comprobación exhaustiva de cifras reproduce el Excel, no una recaptura independiente de todas las observaciones originales de INE e Idealista. Los CSV contienen resultados derivados y atribución; no se concede una licencia sobre datos ajenos ni se ofrece el Excel original como descarga. Antes de una redistribución más amplia hay que comprobar sus condiciones con el titular.

## Mantenimiento

1. Conservar la versión antigua de `src/data/analytics/*.json`. No sobreescribir resultados ya citados.
2. Adaptar el importador a la nueva edición y comprobar su estructura: el actual es deliberadamente específico para las ocho hojas y el corte actual. Cambiar `VERSION` y fechas reales de publicación/modificación. Ejecutar `python3 scripts/analytics/import-workbook.py /ruta/al/excel.xlsx`.
3. Registrar el nuevo snapshot en `src/analytics/model.ts` y la referencia de última edición en `astro.config.mjs`. En `reports.json`, añadir solo nuevos trimestres completos. Las ediciones anteriores siguen apuntando a su snapshot.
4. Si cambia la renta municipal de referencia, versionar la metodología y documentar la reconstrucción completa. No empalmar silenciosamente series.
5. Una corrección debe anunciarse en la página, actualizar fecha y edición y mantener el CSV anterior. La interfaz de precios posteriores y la metodología de esta primera versión mencionan expresamente T2/T3 de 2026: actualizarlas con cada nueva edición.
6. `npm run build` regenera automáticamente todos los gráficos desde los snapshots registrados. PNG para compartir; WebP 800/1200 para la página; descargas CSV estáticas con versión en URL.

Autoría: Equipo Hipotecalc, sin atribuir revisión a José. No se han inventado autores o credenciales.

## Verificación ejecutada

- Importación repetible: 100 municipios, 15 trimestres, 1.500 observaciones comprobadas contra precios mensuales y resultados del Excel; 1.300 IHEC calculables y 200 sin renta.
- `npm run test:analytics`: **127/127**. Reproducción de factores, medias de precios, rentas, índices, rankings, variaciones, backtest, CSV, rutas recíprocas, contenido de las imágenes y ordenación.
- `npm test`: **276/276** pruebas fiscales existentes.
- `npm run lint`, `npm run typecheck:fiscal`, `npm run typecheck:analytics`: correctos.
- `npm run build`: **147 páginas**, sin errores.
- `npm run qa:analytics`: **40 HTML, 26 informes, 28 Dataset, 28 CSV y 2.056 enlaces internos**. Comprueba canonical, hreflang, sitemap, fechas, autoría, JSON-LD coherente con HTML, tablas SSR, dimensiones/MIME/alt y variantes responsive. Es validación local estructural, no certificación de Google ni garantía de rich results.
- QA de navegador: escritorio 1280 px y móvil 390 px; comparación Barcelona/Madrid, selección trimestral con teclado, búsqueda sin tildes y sin resultados, copia de cita con comprobación del portapapeles, descarga CSV HTTP 200 con MIME y `noindex` correctos.
- Corregidos durante QA: contraste del título del hub, hidratación de títulos SVG, comparación de un municipio consigo mismo, desplazamiento a secciones bajo la cabecera fija y desbordamiento móvil del ranking. El desplazamiento horizontal de la tabla queda dentro de su contenedor, no en toda la página.

La comprobación de tipos global conserva **12 errores previos** en Keystatic y anotaciones de configuración; ninguno en los componentes nuevos. La declaración del mapa lastmod corrige además errores previos relacionados con su indexación. No se han cambiado versiones de dependencias: `sharp` ya existía en la misma versión y solo se declara directamente para generar imágenes. La instalación informa de 17 vulnerabilidades existentes (2 moderadas y 15 altas); no se ha ejecutado una actualización global ajena a esta tarea.

## Revisión del usuario

Los rankings del índice y de todos los informes se pueden ordenar pulsando cualquier cabecera. Alternan ascendente/descendente y muestran la dirección con una flecha y `aria-sort`. Se usan números sin redondear, los datos ausentes quedan siempre al final y los puestos originales no cambian. En el explorador, las cabeceras y el selector de orden se mantienen sincronizados al filtrar o cambiar de trimestre. Se conserva la tabla completa en el HTML inicial para SEO. Verificado con ratón, teclado, filtros, porcentajes positivos/negativos, primer trimestre sin variaciones y versión inglesa a 390 px sin desbordamiento de página.

Ajustes de presentación solicitados: las tarjetas del archivo ya no repiten el municipio con mayor esfuerzo; las imágenes no muestran «reconstrucción retrospectiva» ni la fecha de corte; la cabecera Municipio se alinea a la izquierda tanto en informes como en el explorador; la tabla de precios posteriores se elimina de la página principal del índice (ES/EN). Se conserva en las fichas municipales, fuera del cambio solicitado. No cambian datos, fórmulas ni notas metodológicas.

Abrir `http://localhost:4321/analytics`. Revisar identidad y textos, entrar en el índice, comparar municipios y probar el ranking. Abrir los informes 2023T1 y 2026T1, alternar idiomas y probar «Citar y descargar datos». Revisar las cautelas de la metodología antes de autorizar publicación.
