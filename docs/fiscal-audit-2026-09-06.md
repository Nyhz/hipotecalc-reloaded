# Revisión fiscal de compra de vivienda — 6 de septiembre de 2026

Estado: implementación local en `develop`, sin commit ni push. Fecha normativa de corte: **06/09/2026**. El cálculo cubre devengos desde el 01/01/2026; una fecha posterior a la revisión se identifica como provisional.

## 1. Resultado y alcance

Se ha sustituido la lógica fiscal dispersa por un motor único con **239 reglas registradas**: tarifas generales, beneficios, recargos y versiones temporales para 19 territorios (17 comunidades y Ceuta/Melilla separadas), con tratamiento de los tres territorios vascos. Las 36 páginas regionales existentes siguen conservando sus rutas ES/EN; Ceuta y Melilla comparten guía, pero tienen cálculos independientes.

No equivale a una autoliquidación ni a una certificación de todos los posibles negocios inmobiliarios. La precisión depende de que el usuario aporte valores fiscales y acreditaciones correctos. Las limitaciones concretas están en el apartado 6: no se presenta como completo lo que no se ha automatizado.

### Antes

- `constants/comunidades.ts` mezclaba tarifas parciales y flags de elegibilidad.
- `utils/calculadora-itp.ts` elegía porcentajes sin verificar todos los requisitos, confundía datos ausentes con cero y no aceptaba fecha.
- El modal mantenía otra regla de IVA que podía conceder el 4 % por una casilla VPO genérica.
- Hipoteca, alquiler, sensibilidad y gastos seguían caminos distintos. En gastos existía un AJD fijo del 1,2 %; en otros flujos faltaba el AJD de compra.
- No había comandos de pruebas fiscales, lint ni comprobación de tipos.

### Ahora

- `src/fiscal/types.ts`: contrato de entrada, perfiles de compradores, valoración, fechas, tarifas y resultado.
- `requirements.ts`: requisitos verdaderos/falsos/desconocidos; dato vacío nunca acredita un beneficio.
- `rules.ts`: única tabla ejecutable de reglas, prioridad expresa, compatibilidad, fuentes y vigencia.
- `tariffs.ts`: tarifa marginal, tipo único sobre valor total, base parcialmente beneficiada, bonificación/deducción de cuota y reparto por adquirente.
- `engine.ts`: validación, base fiscal, evaluación, desglose y avisos.
- `sources.ts`: territorios, fuente oficial, fecha de revisión y cobertura.
- `constants/comunidades.ts` conserva nombres para compatibilidad, **sin la antigua tabla de tipos**.
- `utils/calculadora-itp.ts` conserva la entrada compatible y delega al motor. Sus antiguos booleanos no se convierten en certificados.
- ITP independiente/regional, hipoteca, alquiler, gastos y sensibilidad consumen el mismo motor. Los cambios de precio vuelven a evaluar tarifas y límites: no escalan una cuota fiscal guardada.

El campo `effectiveFrom: 2026-01-01` en una regla histórica indica el comienzo de cobertura del motor, no una supuesta aprobación de esa ley en 2026.

## 2. Base y presentación

- Precio de compraventa del inmueble completo, sin impuestos.
- Precio, valor declarado, existencia/importe del valor de referencia y valor de mercado son campos distintos.
- Régimen común: mayor magnitud exigida por el art. 10 TRLITPAJD; sin referencia, se considera también el valor de mercado aportado. La ausencia de información genera aviso.
- Navarra y País Vasco usan una valoración foral independiente, no el valor de referencia estatal como sustituto automático.
- Obra nueva: ITP = 0; IVA/IGIC/IPSI sobre contraprestación sin impuestos; AJD de compra separado y con su propia base.
- VPO libre/general/especial/pública/precio máximo/VPL/precio tasado balear/sin clasificar se distinguen. El IVA del 4 % requiere el régimen habilitante y entrega por promotor.
- El AJD del préstamo a cargo del prestamista no se suma al comprador.
- Resultado con tramos, ajustes de cuota, requisitos utilizados, norma, fecha, base, impuestos separados y total.
- Alquiler bloquea beneficios exclusivos de vivienda habitual. Los supuestos rurales generales de Galicia siguen disponibles.
- Sin comunidad, fecha válida o base calculable se oculta el total definitivo. Una estimación con datos pendientes queda expresamente marcada.

Fuentes estatales: [TRLITPAJD, arts. 10, 30 y 45](https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359), [Ley del IVA, arts. 3, 78 y 91](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740), [Ley 5/2019, art. 14](https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814).

## 3. Reformas y correcciones de 2026

| Territorio | Tratamiento implementado y verificado |
|---|---|
| Baleares | Límites insulares exactos: 331.859,70 € Mallorca/Menorca desde 14/06 y 378.211,68 € Eivissa/Formentera; versiones anteriores de enero y marzo. Beneficio sobre 270.151,20 € y exceso al 8 % cuando corresponde. 100 % exige residencia previa, renta individual/conjunta, primera vivienda, cuota adquirida explícita ≥50 %, titularidad anterior y financiación ≥60 % de tasación. Familia requiere progenitor conviviente con hijos bajo patria potestad. Extensión familiar del 15 % con excepción monoparental general. AJD 1/0,5 %, bonificación 100 % parcial y VPL 50 % desde 14/06; precio tasado balear en AJD. Tarifa general AJD del 2 % desde 1 M€. Redondeo del tipo medio conforme a ATIB. |
| Cantabria | Desde 01/05: 7 % en primeros 300.000 € y 9 % al exceso; antes, condición estricta de valor inferior a 200.000 € para el 7 %. Beneficios personales limitados a 300.000 €, grado 33–64 % al 4 % y ≥65 % al 3 %; edad inferior a 40 desde mayo. Declaración del beneficio en escritura. AJD parcial 1/0,1/0,05 % según supuesto. |
| Castilla-La Mancha | Fecha de reforma 31/03: límite 180.000 → 240.000 €; joven <36 pasa del 5 al 3 %. Primera habitual 6 %, familias/discapacidad 5 %, zonas riesgo/intensa/extrema 5/4/3 %. Hipoteca estrictamente >50 %, garantizada sobre el inmueble y con entidad de crédito. Valoración y límite de financiación anteriores separados de los nuevos. AJD 0,75/0,50/0,25/0,15 % según supuesto. Se verificó que la norma es la **Ley 1/2026**, no Ley 2/2026. |
| Comunitat Valenciana | Desde 01/06: ITP general 9 %; por encima de 1 M€, 11 % sobre toda la base. AJD 1,4 %, vivienda habitual 0,1 % con requisitos. Jóvenes <35: 6/8 % según valor; familiares y VPO 3/4 o 6/8 según régimen; renta, clase y grado de discapacidad. DANA/Campanar solo mediante confirmación y acreditación explícita y dentro de vigencia, con proporción de titularidad siniestrada. Referencia Campanar ajustada a la DA 18.ª que recoge el BOE. |
| Extremadura | Tarifa 8/10/11 % marginal. Versiones anteriores y posteriores al 05/08 para protegida y rural. Umbral actual 200.000 €, IRPF 30.000 individual / 55.000 conjunta; eliminación del antiguo requisito agregado rural. Protegida ya no se etiqueta “sin renta”. AJD actual 0,50 % habitual / 0,10 % protegida con precio máximo; anteriores 0,75 y rural 0,5 % separados. Pago bancario con salvedad legal de arras en efectivo hasta 3.000 €. |
| Galicia | Límites de valor y patrimonio de 240.000 € + 30.000 por miembro adicional para los supuestos pertinentes; fórmula de familia numerosa separada. Monoparental acreditada 3 % ITP / 0,5 % AJD; deducción rural 100 % en los supuestos legales, incluida monoparental en 2026. Reparto por comprador cuando solo uno cumple. |
| Andalucía | Discapacidad relevante del comprador o núcleo familiar acreditado; límite de valor según colectivo. General 7 %, habitual 6 %, reducidos 3,5 %, y sus AJD. Borrascas: solo viviendas y fechas habilitadas, acreditación de ruina/sustitución, límite 250.000 € y régimen temporal 2026. |
| Asturias | Escala por valor total, no progresiva por tramos. Colectivos y rural oficial: 4 % hasta 150.000 €, 6 % por encima, incluidos jóvenes hasta 35 años. Ocupación en seis meses y mantenimiento. Diferenciación del 20 % para grandes tenedores/edificios turísticos. |
| Cataluña | Tarifa 10/11/12/13 % y recargo del 20 %; 5 % con requisitos personales; discapacidad del núcleo familiar e IRPF, fórmula monoparental específica. Rural 4/3 % con escolarización o rehabilitación estructural cualificada, lista PRE/415/2026 y vigencia hasta 16/07/2029. |
| Canarias | IGIC general 7 %, habitual 5 %, 3 % por supuestos alternativos y 0 % protegido cualificado, con topes familiares y declaración al transmitente donde la ley la exige. ITP 6,5/5/1/0 %, bonificación 20 % para supuestos elegibles, AJD de compra separado. No se confunde el IGIC con IVA. |

### Resto de territorios: regresión y requisitos

- Madrid: 6 % general, bonificaciones de cuota —no falsos tipos generales—, vivienda habitual, joven rural y familia numerosa; AJD por tramos.
- Aragón: escala marginal, bonificaciones compatibles expresamente y régimen rural oficial; límites de renta/superficie y mantenimiento.
- Castilla y León: escala 8 % más 10 % sobre exceso de 250.000 €, 4 % y 0,01 % rural con límites estrictos y requisitos conjuntos.
- Murcia: 7,75 %, 3 % con edad/discapacidad/IRPF general y ahorro; VPO especial diferenciada; AJD 0,1 % cuando procede.
- La Rioja: 7 %, jóvenes 4/3 %, familiares/discapacidad/VPO 5 % y familia numerosa 3 % con plazo y requisitos adicionales.
- Navarra: art. 8 (no art. 7), 6 % general, 5 % limitado a 180.304 € por unidad familiar y vivienda, resto 6 %. Rural oficial 4 % y pleno dominio sin consolidación previa expresamente acreditado.
- País Vasco: 4 % vivienda, 6 % titularidad cualificada de más de cinco viviendas, 2,5 % con requisitos propios de Álava/Bizkaia/Gipuzkoa y 1,5 % alavés rural. Superficies construida/útil, parcela y titularidad municipal; retirada de la condición histórica de “solo una vez”.
- Ceuta/Melilla: ITP estatal 6 % con bonificación 50 %, AJD de adquisición estatal con bonificación; IPSI diferenciado por ciudad. Véase la reserva documental de Ceuta en el apartado 6.

## 4. Fuentes autonómicas oficiales

Se consultaron textos consolidados, articulado de reformas y portales tributarios; no se usaron comparadores ni blogs como autoridad normativa.

| Territorio | Fuente principal |
|---|---|
| Andalucía | [Ley 5/2021, arts. 3, 43, 49–50](https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915); [BOJA extraordinario de borrascas](https://www.juntadeandalucia.es/boja/2026/38/c02/1) . |
| Aragón | [DLeg. 1/2005, arts. 121, 122 y 160](https://www.boe.es/buscar/act.php?id=BOA-d-2005-90006). |
| Asturias | [DLeg. 2/2014, arts. 26–35 y reformas 2025](https://www.boe.es/buscar/act.php?id=BOE-A-2015-945). |
| Baleares | [DLeg. 1/2014](https://www.boe.es/buscar/act.php?id=BOE-A-2014-6925); [Ley 4/2026, DF 67](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-15579); [corrección ATIB 23/06/2026](https://www.atib.es/General/Novedad.aspx?idTexto=16988&idTipoTexto=1&lang=es). |
| Canarias | [Texto refundido vigente](https://www.boe.es/buscar/act.php?id=BOC-j-2025-90249); [Ley 9/2025 en BOC](https://www.gobiernodecanarias.org/boc/archivo/2025/256/pda/4414.html). |
| Cantabria | [DLeg. 62/2008, arts. 9, 13 y 14](https://www.boe.es/buscar/act.php?id=BOCT-c-2008-90028); Ley 5/2026. |
| Castilla-La Mancha | [Ley 8/2013, arts. 19–22](https://www.boe.es/buscar/act.php?id=BOE-A-2014-1368); [Ley 1/2026: articulado DOCM](https://www.boe.es/ccaa/docm/2026/061/q10660-10683.pdf). |
| Castilla y León | [DLeg. 1/2013, arts. 24 y 26](https://www.boe.es/buscar/act.php?id=BOCL-h-2013-90254). |
| Cataluña | [Código tributario, arts. 641 y 642](https://www.boe.es/buscar/act.php?id=BOE-A-2024-6951); [Ley 8/2025, Estatuto de municipios rurales](https://www.boe.es/buscar/doc.php?id=BOE-A-2025-16833). |
| Comunitat Valenciana | [Ley 13/1997, arts. 13–14 y DA 18](https://www.boe.es/buscar/act.php?id=BOE-A-1998-8202); [prórroga Campanar, texto BOE](https://www.boe.es/buscar/doc.php?id=DOGV-r-2026-90066). |
| Extremadura | [DLeg. 1/2018, arts. 39–52](https://www.boe.es/buscar/act.php?id=BOE-A-2018-8159); [Ley 2/2026](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-17839); [Portal Tributario](https://portaltributario.juntaex.es/PortalTributario/web/guest/itpajd26). |
| Galicia | [DLeg. 1/2011, arts. 14–17](https://www.boe.es/buscar/act.php?id=BOE-A-2011-18161). |
| Madrid | [DLeg. 1/2010, arts. 28 y ss.](https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068). |
| Murcia | [DLeg. 1/2010, arts. 6–9](https://www.boe.es/buscar/act.php?id=BOE-A-2011-10542). |
| Navarra | [DFLeg. 129/1999 actualizado, arts. 8, 22 y 35](https://www.boe.es/buscar/act.php?id=BON-n-1999-90001). |
| Álava | [NF 11/2003 consolidada](https://web.araba.eus/documents/d/araba/indice_norma-foral-itp-ajd-cas-2-pdf). |
| Bizkaia | [NF 1/2011 consolidada en 2026](https://www.bizkaia.eus/documents/880307/15187815/ca_1_2011.pdf). |
| Gipuzkoa | [Hacienda Foral: tipos modelo 60T](https://www.gipuzkoa.eus/es/web/ogasuna/impuestos/modelo/60t/tipos-impositivos). |
| La Rioja | [Ley 10/2017, arts. 44–47 bis](https://www.boe.es/buscar/act.php?id=BOE-A-2017-13750). |
| Ceuta | [Ciudad Autónoma: aprobación fiscal y nueva vivienda al 0,5 %](https://www.ceuta.es/gobiernodeceuta/index.php/noticia/8-hacienda/13709-la-asamblea-respalda-con-una-amplia-mayoria-el-ambicioso-plan-de-medidas-fiscales). |
| Melilla | [Servicios tributarios: IPSI operaciones interiores](https://www.melilla.es/melillaportal/contenedor.jsp?codMenu=764&codMenuPN=601&codMenuSN=1&codMenuTN=182&codbusqueda=801&seccion=s_fdes_d4_v1.jsp). |

El enlace y artículo de cada decisión también aparecen en el desglose del resultado. Las normas temporales llevan sus fechas explícitas.

## 5. Verificación ejecutada

### Pruebas automáticas

- `npm test`: **276 pruebas, 276 aprobadas, 0 fallidas**.
- `tests/rules-contract.test.ts`: una prueba por cada una de las 239 reglas; escenario elegible, datos ausentes, fechas inicial/final y coherencia de tramos/cuota.
- `tests/fiscal.test.ts`: escenarios exigidos por el encargo, general de todas las comunidades, límites y regresiones.
- `tests/integration-cases.test.ts`: AJD general de 19 territorios, perfiles mixtos, requisitos adicionales, vigencias y emergencias.
- `npm run lint`: correcto. Alcance explícito: motor, componentes fiscales, tests y adaptador; no es un lint general del proyecto antiguo.
- `npm run typecheck:fiscal`: correcto, comprobación TypeScript estricta.
- `npm run typecheck`: **22 errores en archivos preexistentes sin modificar**: 16 en `astro.config.mjs` y 6 en `keystatic.config.ts`. No se han ocultado con exclusiones globales ni casts; no son errores del motor o de sus integraciones. El repositorio completo no queda con typecheck verde.
- `npm run build`: **107 páginas, sin errores**.
- `node scripts/qa-fiscal-build.mjs`: 36 regionales, 470 JSON-LD parseados, ocho fechas de calculadoras comprobadas, cero imágenes ausentes y cero literales retirados detectados.
- `git diff --check`: sin errores de whitespace.

Estas pruebas validan implementación, aritmética y casos documentados, no sustituyen la interpretación jurídica de una operación singular.

| Caso de control | Resultado |
|---|---|
| Madrid usada 200.000 €, sin beneficio | 12.000 € |
| Cantabria habitual 350.000 € | 25.500 € = 21.000 + 4.500 |
| Cantabria 200.000 €, discapacidad 50 % / 65 % | 8.000 € / 6.000 € |
| CLM joven 35, 200.000 €, financiación >50 % | 6.000 €; con exactamente 50 % no obtiene el 3 % |
| CLM rural riesgo/intensa/extrema elegible | 5/4/3 % |
| CV usada 1.200.000 € | 132.000 € sobre toda la base |
| CV nueva habitual 300.000 € | ITP 0 + IVA 30.000 + AJD 300 = 30.300 € |
| CV nueva no habitual 300.000 € | 30.000 + 4.200 = 34.200 € |
| IVA 200.000 €, libre / VPO cualificada | 20.000 € / 8.000 €; VPO sin clasificar no obtiene el 4 % |
| Baleares Eivissa | 378.211,68 € dentro; 378.211,69 € fuera |
| Baleares 300.000 €, beneficio 4 % parcial | 13.193,95 € |
| Baleares 300.000 €, bonificación 100 % parcial | 2.387,90 € de exceso; no cero por toda la compra |
| Baleares, residencia/renta/hipoteca/titularidad/cuota ausente o incompatible | No se concede el 100 % |
| Extremadura IRPF individual 30.000 / conjunta 55.000 | Límite incluido; +0,01 € excluido |
| Extremadura nueva elegible 200.000 € | AJD 1.000 € habitual / 200 € protegida precio máximo |
| Galicia monoparental 2 / 3 miembros | Topes 270.000 / 300.000 €; precio y patrimonio +0,01 € excluidos |
| Galicia dos compradores, 300.000 €, 50 % al 3 y 50 % al 8 | 16.500 € |
| Andalucía discapacidad familiar acreditada, 200.000 € | 7.000 €; falta de acreditación impide el beneficio |
| Navarra rural, 200.000 € | 8.000 €; sin municipio acreditado o pleno dominio, no se concede |

### Navegador real, ES/EN y móvil

- Cantabria: introducción de datos y resultados 25.500, 8.000 y 6.000 €; pantalla de 390 px sin scroll horizontal.
- Inglés: CV nueva habitual 30.300 €, cambio a inversión 34.200 €, desglose y textos en inglés.
- Hipoteca: Madrid 200.000 → 300.000 € recalcula 12.000 → 18.000 €. Valor de referencia 320.000 € produce 19.200 €; al subir precio a 400.000 €, 24.000 €. El modal conserva la valoración.
- Alquiler: Cantabria 200.000 → 350.000 € produce 18.000 → 31.500 €, sin aplicar habitual. Modal explica la restricción.
- Gastos: obra nueva CV 300.000 €, 34.200 € provisionales sin acreditar habitual; céntimos conservados y sin desbordamiento móvil.
- Durante desarrollo hubo un error antiguo de recarga del toolbar de Astro tras reoptimizar dependencias. No fue un error del motor. Se repitió la prueba de gastos después de hidratar React; actuar sobre HTML antes de hidratar no valida el cálculo.

## 6. Qué NO está automatizado o requiere cautela

1. **Municipios/parroquias oficiales.** No se ha incorporado una base municipal completa con versiones históricas. Se exige municipio, categoría y confirmación de su inclusión oficial, con enlace normativo. Un simple checkbox “pueblo pequeño” no concede el beneficio. La confirmación sigue siendo responsabilidad del usuario.
2. **Certificados y renta.** No hay conexión a Catastro, IRPF, registro de familias, discapacidad o VPO. Se piden las bases fiscales y acreditaciones, no el salario bruto. El motor no puede verificar documentalmente lo declarado.
3. **Foral y derechos especiales.** No calcula desmembración de dominio, usufructo, nuda propiedad, consolidación, sucesiones o donaciones. Los tipos reducidos navarros rechazan la consolidación previa declarada. La exención de vivienda protegida foral no está automatizada y genera aviso explícito; requiere calificación, primera transmisión/plazo de seis años y norma del territorio.
4. **Pluralidad de compradores.** La UI permite dos perfiles independientes en Galicia. El motor admite más, pero las extensiones a cónyuges y reglas conjuntas de otros territorios requieren revisión individual; se advierte expresamente. No afirmar que la mera proporcionalidad resuelve todos los regímenes matrimoniales.
5. **Rehabilitación y negocios especiales.** No están todas las reducciones de rehabilitación, conversión de locales, transmisiones empresariales exentas de IVA sin renuncia, vitalicios, explotaciones agrarias, opciones, dación en pago o convenios especiales. Por ejemplo, el 5 % de rehabilitación de Cantabria y el régimen gallego de rehabilitación necesitan un tratamiento adicional específico.
6. **Anejos.** No se distribuye separadamente el precio de garajes/locales/trasteros. El IVA/IGIC de anejos fuera de los límites legales necesita desglose individual; en particular, el régimen protegido IGIC del art. 38 tiene límite de un garaje. No utilizar la suma de múltiples fincas heterogéneas como una vivienda ordinaria.
7. **Baleares VPL + bonificación 100 %.** Se ha modelado VPL con tarifas ordinarias/reducidas compatibles, pero no se añade automáticamente otro 50 % al exceso tras el beneficio del 100 %. Concurrencia marcada como pendiente de confirmación con ATIB.
8. **IPSI Ceuta.** El 0,5 % se ha contrastado en información oficial municipal. No se logró una lectura íntegra de la ordenanza definitiva del BOCCE extraordinario n.º 16 de 08/05/2025; no se certifican aquí todas sus exenciones o transitorios. Recomendada confirmación con Servicios Tributarios antes de una autoliquidación. Melilla: guía oficial consultada actualizada en enero de 2026, tipo general 4 % y 0,5 % de VPO de promotor.
9. **Fechas históricas.** Cobertura desde enero de 2026, con transitorios relevantes del encargo. No es un archivo universal de todas las medidas excepcionales históricas; anteriores a 2026 no calculan.
10. **Costes no fiscales.** Notaría, registro, gestoría y tasación siguen siendo aproximaciones. No son aranceles liquidados ni una oferta de préstamo. No se han alterado las fórmulas de rentabilidad, amortización o plusvalía, ajenas a este encargo.

## 7. Contenido, fechas y mapas

- Corregidos los límites exactos baleares, las secciones AJD y transitorios CLM/Extremadura, la deducción rural/AJD gallega, las condiciones rurales catalanas y el desglose Ceuta/Melilla, con espejos ingleses.
- Guías de gastos, AJD y páginas de calculadoras dejan de prometer IVA equivalente, VPO genérica al 4 % o un intervalo universal de AJD.
- Las ocho landings de calculadoras tienen actualización 06/09/2026 tanto visible como en schema. Las guías cuyo contenido se modificó llevan esa fecha. No se han estampado nuevas fechas en artículos no modificados.
- Los textos generales de otras guías conservan su redacción y referencias; no se ha reescrito cada explicación empresarial ajena al caso de compra residencial.
- **38 mapas (36 regionales + 2 hubs)** y sus tres variantes WebP se regeneran a partir del motor mediante `case.ts → export-data.mjs → itp_data.py`, sin una segunda tabla fiscal.
- El caso del mapa se declara: 200.000 €, primera habitual, 41 años, sin colectivos especiales, financiación/valoración y patrimonio explícitos; no pretende representar el mínimo/máximo de cualquier compra.
- Revisión visual de mapa ES y regional EN: etiquetas y notas legibles, sin recortes. Se mantienen dimensiones, WebP responsive y carga diferida de las regionales. El alt ya no mezcla el tipo general de la guía con el efectivo del ejemplo.
- La revisión visual siguiendo el skill de visualización mantuvo el diseño existente y añadió supuestos auditables, no imágenes decorativas.

## 8. Porcentajes fuera del motor

Listado por fichero y literal en [fiscal-literals-2026-09-06.md](fiscal-literals-2026-09-06.md), con advertencia sobre los falsos positivos del inventario conservador.

No quedan tarifas ejecutables de ITP/AJD/IVA duplicadas en los consumidores. El único adaptador calcula a través de `calculatePurchaseTaxes`. La antigua tabla y sus flags han desaparecido.

Sí quedan **literales editoriales e históricos**, que no son entradas del cálculo:

- `src/content/guias/itp/*.md` y `src/content/en/guias/itp/*.md`: tarifas y requisitos explicados por comunidad, ejemplos y regímenes especiales no automatizados. Los frontmatter `tipoGeneral` alimentan tarjetas/SEO, no las calculadoras.
- `src/pages/itp/[slug].astro`: tres títulos del experimento SEO con porcentajes; FAQ IVA. Su equivalente EN mantiene la FAQ.
- Hubs `src/pages/itp/index.astro` y EN: dos matices editoriales de tabla para País Vasco/Cataluña, explicación fiscal, FAQ y alt del caso del mapa.
- Homes ES/EN: se ha eliminado el intervalo introductorio que presentaba el 13 % como techo; no ejecutan tarifas.
- Landings de gastos ES/EN: ejemplo de Madrid al 6 % sin beneficios, comparación con Cataluña al 10 %, IVA ordinario, umbral AJD balear. Entrada 20 % no es impuesto.
- Blog AJD ES/EN y guías de compra/gastos/expats: tipos explicativos y ejemplos. No contienen lógica de cálculo.
- `messages/es.json` y EN: etiquetas informativas IVA y recibo ilustrativo de la home “ITP (Madrid, 6%)”.
- `PurchaseTaxForm.tsx`: texto de cuota adquirida del 50 %, no una tarifa.
- `CashFlowEntradaChart.tsx`: porcentajes de entrada/ejes, no ITP. Plusvalía, regla del 35 %, rentabilidad y TIN/TAE son otras magnitudes y no se centralizan en este motor.

La existencia de contenido editorial estático exige revisión cuando cambie una ley. Centralizar el cálculo elimina las tablas divergentes de las herramientas, pero no actualiza automáticamente todas las frases SEO del sitio.

## 9. Cómo revisar en local y mantenerlo

Servidor local: [calculadora ITP](http://localhost:4321/calculadora-itp), [Cantabria](http://localhost:4321/itp/cantabria), [Baleares](http://localhost:4321/itp/baleares), [versión inglesa](http://localhost:4321/en/itp-calculator), [gastos](http://localhost:4321/calculadora-gastos-compraventa).

Para una reforma: leer articulado oficial, cerrar `effectiveTo` de la versión previa, añadir nueva regla con fuente/requisitos, actualizar `REVIEWED`, añadir fronteras de fecha y cuantía a tests, revisar artículos afectados y regenerar mapas.

```sh
npm run lint
npm run typecheck:fiscal
npm run typecheck
npm test
npm run build
node scripts/qa-fiscal-build.mjs
npm run maps:data
python3 scripts/itp-map/make_map.py
python3 scripts/itp-map/make_region_maps.py
```

Los mapas requieren los módulos Python y el shapefile Natural Earth que ya utiliza el proyecto. El typecheck global conserva el problema de configuración descrito arriba.

## 10. Inventario completo de ficheros

Véase [fiscal-files-2026-09-06.txt](fiscal-files-2026-09-06.txt), incluyendo cada variante PNG/WebP. No se han cambiado las dependencias directas de producción; las incorporaciones son herramientas de desarrollo para comprobaciones.
