# Narrativa de Escalabilidad Nacional - nitoagua

## 1. El Problema: Una Realidad Nacional, No Regional

### 1.1 La Crisis del Agua en Chile

Chile enfrenta una crisis hídrica estructural que afecta a millones de personas. Según el [Censo 2024 del INE (Instituto Nacional de Estadísticas)][1], más de **131.000 viviendas** en Chile dependen de camiones aljibe como fuente principal de agua potable. A nivel nacional, el 2% de las viviendas chilenas no tiene acceso a red pública de agua.

Sin embargo, esta cifra nacional oculta realidades regionales dramáticas:

| Región | % Viviendas con Camión Aljibe | % Sin Red Pública |
|--------|-------------------------------|-------------------|
| Atacama | 10,2% | 19,0% |
| Tarapacá | 9,7% | 15,3% |
| Coquimbo | 5,9% | 12,1% |
| Arica y Parinacota | 5,3% | 10,7% |
| La Araucanía | 2,0% | **19,8%** |
| Los Ríos | 1,8% | **19,9%** |
| Los Lagos | 1,5% | **18,9%** |

*Fuente: [Censo de Población y Vivienda 2024, INE][1]*

### 1.2 El Impacto en la Población

Según datos de la [Dirección General de Aguas (DGA)][2], hasta **188 comunas** que concentran más de **8,35 millones de personas** (47,5% de la población chilena) han sido declaradas bajo escasez hídrica en algún momento, abarcando 9 de las 16 regiones del país:

- Atacama
- Coquimbo
- Valparaíso
- Metropolitana
- O'Higgins
- Maule
- Los Ríos
- Los Lagos
- Aysén

Actualmente, [44 comunas mantienen decretos de escasez hídrica vigentes][3], con la Región de Coquimbo como la zona más crítica.

### 1.3 El Gasto Estatal: Una Oportunidad de Mercado

Según una [investigación de Vergara 240 (UDP)][4], entre 2011 y 2019, el Estado chileno gastó más de **$222 mil millones de pesos** en contratar camiones aljibe. Este gasto ha continuado creciendo:

- **2022:** [Casi $10 mil millones solo en el primer trimestre][5]
- **2024 (La Araucanía):** [$7.440 millones para abastecer 50.468 personas][6] en 17 comunas

Este gasto representa un mercado establecido y creciente que opera de manera fragmentada e ineficiente.

---

## 2. La Araucanía: Piloto Estratégico para una Solución Nacional

### 2.1 Por Qué La Araucanía

Elegimos La Araucanía como región piloto porque representa un microcosmos de la problemática nacional:

**Magnitud del Problema:**
- [32 comunas con déficit hídrico declarado][6]
- **92.461 personas** (10,6% de la población regional) dependen de camiones aljibe
- Aproximadamente **25.000 familias** reciben agua por esta modalidad
- Solo 80,2% de viviendas tienen acceso a red pública (vs. 92,3% nacional) según [Censo 2024][1]

**Mercado Activo:**
- Padre Las Casas es la [segunda comuna de Chile donde más se ha gastado en camiones aljibe][4]: más de $3.665 millones entre 2011-2019
- Temuco: $2.204 millones en el mismo período
- [Red de más de 100 proveedores activos en la región][7]

**Representatividad:**
La Araucanía combina características del sur (alta ruralidad, precipitaciones variables) con desafíos similares al norte (sequía prolongada, infraestructura deficiente). Lo que funcione aquí, funcionará en otras regiones.

### 2.2 Validación en Terreno

El piloto en La Araucanía nos permite:

1. **Validar la tecnología** con usuarios reales en condiciones desafiantes (conectividad variable, ruralidad)
2. **Refinar el modelo de negocio** antes de escalar
3. **Generar métricas de impacto** para futuras rondas de financiamiento
4. **Construir casos de éxito** replicables en otras regiones

---

## 3. Arquitectura Tecnológica Preparada para Escalar

### 3.1 Diseño Multi-Región

nitoagua está construido desde el inicio con escalabilidad en mente:

**Tecnología Cloud-Native:**
- Infraestructura en la nube (Vercel + Supabase) que escala automáticamente
- Sin servidores físicos por región
- Costo marginal cercano a cero por cada nueva región

**Modelo Multi-Tenant:**
- Una sola plataforma sirve múltiples regiones
- Cada región tiene sus propios proveedores y configuraciones
- Los usuarios acceden desde cualquier lugar

**Progressive Web App (PWA):**
- Funciona en cualquier dispositivo con navegador
- No requiere descarga de app stores

### 3.2 Replicación por Comuna

Para expandir a una nueva región, solo necesitamos:

1. Registrar proveedores locales (proceso 100% digital)
2. Configurar zonas de servicio y precios regionales
3. Difusión local a consumidores

**Tiempo estimado de despliegue por región:** 2-4 semanas
**Inversión por región:** Marketing, operaciones locales, y eventualmente infraestructura tecnológica escalada (servidores, equipo de desarrollo) según crezca la demanda

---

## 4. Hoja de Ruta de Expansión Nacional

### Fase 1: Validación (Meses 1-6)
**Región:** La Araucanía (Villarrica, Pucón, Padre Las Casas, Temuco)
**Objetivo:** 500 transacciones, 20 proveedores activos
**Métricas clave:** Tasa de repetición, satisfacción del usuario, tiempo de respuesta

### Fase 2: Expansión Sur (Meses 7-12)
**Regiones:** Los Ríos, Los Lagos
**Justificación:** Geografía y problemática similares a La Araucanía
- Los Ríos: 19,9% viviendas sin red pública ([Censo 2024][1])
- Los Lagos: 18,9% viviendas sin red pública, incluye [Chiloé con decreto de escasez vigente hasta marzo 2026][8]

### Fase 3: Expansión Norte (Meses 12-18)
**Regiones:** Coquimbo, Atacama
**Justificación:** Mayor dependencia de camiones aljibe en el país
- Atacama: 10,2% viviendas usan camión aljibe ([Censo 2024][1])
- Coquimbo: 5,9% viviendas, [zona más crítica según DGA][3]

### Fase 4: Zona Central (Meses 18-24)
**Regiones:** Valparaíso, O'Higgins, Maule
**Justificación:** [Alto gasto estatal histórico][4]
- La Ligua (Valparaíso): $6.470 millones en camiones aljibe (2011-2019)
- Petorca: $2.841 millones

### Fase 5: Consolidación Nacional (Meses 24-36)
**Regiones:** Metropolitana, Biobío, y restantes
**Objetivo:** Cobertura en todas las regiones con decretos de escasez históricos

---

## 5. Dimensión del Mercado Nacional

### 5.1 Mercado Actual (Estimación Conservadora)

| Concepto | Valor | Fuente |
|----------|-------|--------|
| Viviendas con camión aljibe | 131.141 | [Censo 2024][1] |
| Viviendas sin red pública | 492.693 | [Censo 2024][1] |
| Gasto estatal (2011-2019) | $222 mil millones | [Vergara 240][4] |
| Gasto estatal anual estimado | ~$25 mil millones | Cálculo propio |
| Personas en zonas de escasez | 8,35 millones | [DGA][2] |

### 5.2 Mercado Direccionable

Considerando solo las viviendas que actualmente usan camión aljibe:

- **131.141 viviendas** × costo promedio mensual de agua ($30.000-$50.000)
- **Mercado anual estimado:** $47-78 mil millones CLP (pesos chilenos)

Con una comisión de plataforma del 2-5%, el potencial de ingresos es de **$940 millones - $3.9 mil millones CLP anuales** a nivel nacional.

### 5.3 Tendencia de Crecimiento

Según [Escenarios Hídricos 2030][9], el cambio climático está desplazando las zonas áridas hacia el sur. Las proyecciones indican que la seguridad hídrica en Chile, especialmente en la zona central, alcanzará niveles críticos hacia 2050. Esto implica:

- **Más comunas** con decretos de escasez
- **Más familias** dependientes de camiones aljibe
- **Mayor gasto estatal** en soluciones de emergencia
- **Mayor demanda** para plataformas de coordinación eficiente

---

## 6. Visión Internacional

### 6.1 Potencial Latinoamericano

La problemática de acceso a agua potable no es exclusiva de Chile. nitoagua puede expandirse a:

**Perú:**
- [3,3 millones de peruanos sin acceso a agua potable][10], dependiendo de camiones cisterna, pozos o ríos
- [1,5 millones de habitantes de Lima][11] (la segunda ciudad más grande construida en un desierto) no tienen acceso a red pública
- Quienes compran agua de camiones cisterna pagan [hasta 6 veces más][10] que usuarios conectados a la red

**Bolivia:**
- [2 millones de personas afectadas][12] por sequía en 7 de 9 departamentos (2023-2024)
- Cochabamba: [más de 30 municipios en emergencia][13] por falta de agua, con racionamiento de 2-3 días por semana
- Comunidades rurales dependiendo de camiones repartidores o pozos sobreexplotados

**Argentina (Noroeste):**
- [15% de la población argentina][14] sin acceso a agua potable
- Provincias como Formosa, Chaco y Salta con situaciones críticas en zonas rurales
- [Comunidades indígenas en Salta][15] enfrentando crisis por agua subterránea contaminada con sal

### 6.2 Ventaja Competitiva Regional

nitoagua, validado en Chile, tendría:

- **Plataforma probada** en condiciones reales
- **Modelo de negocio refinado** con métricas de éxito
- **Mismo idioma** (español) para expansión LATAM (Latinoamérica)
- **Conocimiento regulatorio** transferible entre países con contextos similares

---

## 7. Valor para Políticas Públicas

### 7.1 Datos para la Toma de Decisiones

nitoagua no solo resuelve un problema de mercado, sino que genera **datos valiosos para el diseño de políticas públicas**. Cada transacción en la plataforma captura información que hoy no existe de forma sistematizada:

**Datos de Demanda:**
- Ubicación geográfica exacta de hogares que solicitan agua
- Frecuencia de pedidos por zona
- Volúmenes demandados por sector
- Patrones estacionales de consumo
- Tiempos de espera y urgencia de las solicitudes

**Datos de Oferta:**
- Capacidad de proveedores por zona
- Tiempos de respuesta
- Precios de mercado por región
- Cobertura geográfica real

### 7.2 Aplicaciones para el Estado

Esta información permitiría a municipios, gobiernos regionales y ministerios:

| Aplicación | Beneficio |
|------------|-----------|
| **Mapeo de vulnerabilidad hídrica** | Identificar zonas con mayor demanda para priorizar inversión en infraestructura |
| **Planificación de emergencias** | Conocer capacidad de proveedores para respuesta ante sequías o desastres |
| **Fiscalización de precios** | Monitorear precios de mercado para detectar abusos |
| **Evaluación de políticas** | Medir impacto de inversiones en agua potable rural |
| **Asignación de subsidios** | Focalizar ayuda en hogares con mayor gasto en agua |

### 7.3 Potencial de Colaboración Público-Privada

nitoagua puede convertirse en un **aliado estratégico del Estado** en la gestión hídrica:

- **Convenios con municipios** para monitoreo de demanda en zonas rurales
- **Reportes a la DGA** sobre patrones de escasez no declarada
- **Integración con programas de subsidio** para familias vulnerables
- **Dashboard de datos** para tomadores de decisiones

Esta capacidad de generar inteligencia sobre el mercado del agua es un **activo único** que ninguna solución actual ofrece, y representa valor adicional más allá del modelo de negocio transaccional.

---

## 8. Conclusión: De Piloto Regional a Solución Nacional

nitoagua no es un proyecto regional para La Araucanía. Es una **solución tecnológica nacional** que inicia su validación en La Araucanía porque:

1. La región representa fielmente la problemática nacional
2. Existe un mercado activo de proveedores y consumidores
3. El éxito aquí es directamente replicable en otras 8+ regiones afectadas

Con el financiamiento de CORFO Semilla, validaremos el modelo en La Araucanía durante los primeros 6 meses, y comenzaremos la expansión hacia Los Ríos y Los Lagos antes del cierre del proyecto.

**El objetivo no es resolver el problema del agua en una región. Es construir la infraestructura digital que Chile necesita para gestionar eficientemente la distribución de agua en todo el territorio nacional.**

---

## Referencias

[1]: https://censo2024.ine.gob.cl/censo-2024-el-611-de-los-hogares-residen-en-una-vivienda-propia-y-el-262-en-una-vivienda-arrendada/
[2]: https://dga.mop.gob.cl/escasez-hidrica-para-el-475-de-la-poblacion/
[3]: https://www.biobiochile.cl/noticias/servicios/explicado/2024/02/13/conoce-las-58-comunas-bajo-escasez-hidrica-en-chile-afectan-a-mas-de-1-millon-y-medio-de-personas.shtml
[4]: https://vergara240.udp.cl/especiales/222-mil-millones-gasto-el-estado-en-contratar-camiones-aljibe-y-mas-de-11-mil-millones-en-comprar-forraje-para-ganado/
[5]: https://www.biobiochile.cl/especial/bbcl-investiga/noticias/cronicas/2022/03/28/cuantiosos-desembolsos-chile-ya-ha-gastado-casi-10-mil-millones-este-2022-en-aljibes-por-sequia.shtml
[6]: https://www.biobiochile.cl/noticias/nacional/region-de-la-araucania/2024/11/07/araucania-gremio-de-camiones-aljibes-acusa-que-gobierno-adeuda-3-mil-millones-por-servicios-impagos.shtml
[7]: https://araucaniadiario.cl/contenido/25777/deuda-con-camiones-aljibes-que-abastecen-agua-supera-los-2550-millones-de-pesos
[8]: https://dga.mop.gob.cl/derechos-de-agua/proteccion-de-las-fuentes/decretos-de-escasez-2/
[9]: https://escenarioshidricos.cl/
[10]: https://www.infobae.com/peru/2024/03/22/mas-de-3-millones-de-peruanos-no-tienen-acceso-al-agua-potable-ni-al-alcantarillado/
[11]: https://elcomercio.pe/lima/sucesos/dia-mundial-del-agua-15-millones-de-limenos-no-tienen-conexion-de-agua-potable-en-sus-hogares-sedapal-sunass-noticia/
[12]: https://www.ifrc.org/es/articulo/sequia-sin-precedentes-agrava-crisis-del-agua-en-bolivia
[13]: https://unifranz.edu.bo/cochabamba/crisis-del-agua-en-cochabamba-mas-de-30-municipios-en-emergencia/
[14]: https://rotoplas.com.ar/escasez-de-agua-en-argentina/
[15]: https://news.un.org/es/story/2020/04/1473122

### Lista de Fuentes

1. **INE - Censo 2024:** https://censo2024.ine.gob.cl/censo-2024-el-611-de-los-hogares-residen-en-una-vivienda-propia-y-el-262-en-una-vivienda-arrendada/
2. **DGA - Escasez Hídrica:** https://dga.mop.gob.cl/escasez-hidrica-para-el-475-de-la-poblacion/
3. **BioBioChile - Comunas bajo escasez:** https://www.biobiochile.cl/noticias/servicios/explicado/2024/02/13/conoce-las-58-comunas-bajo-escasez-hidrica-en-chile-afectan-a-mas-de-1-millon-y-medio-de-personas.shtml
4. **Vergara 240 (UDP) - Gasto en camiones aljibe:** https://vergara240.udp.cl/especiales/222-mil-millones-gasto-el-estado-en-contratar-camiones-aljibe-y-mas-de-11-mil-millones-en-comprar-forraje-para-ganado/
5. **BioBioChile - Gasto 2022:** https://www.biobiochile.cl/especial/bbcl-investiga/noticias/cronicas/2022/03/28/cuantiosos-desembolsos-chile-ya-ha-gastado-casi-10-mil-millones-este-2022-en-aljibes-por-sequia.shtml
6. **BioBioChile - La Araucanía 2024:** https://www.biobiochile.cl/noticias/nacional/region-de-la-araucania/2024/11/07/araucania-gremio-de-camiones-aljibes-acusa-que-gobierno-adeuda-3-mil-millones-por-servicios-impagos.shtml
7. **Araucanía Diario - Proveedores:** https://araucaniadiario.cl/contenido/25777/deuda-con-camiones-aljibes-que-abastecen-agua-supera-los-2550-millones-de-pesos
8. **DGA - Decretos de Escasez:** https://dga.mop.gob.cl/derechos-de-agua/proteccion-de-las-fuentes/decretos-de-escasez-2/
9. **Escenarios Hídricos 2030:** https://escenarioshidricos.cl/
10. **Infobae Perú - Acceso al agua:** https://www.infobae.com/peru/2024/03/22/mas-de-3-millones-de-peruanos-no-tienen-acceso-al-agua-potable-ni-al-alcantarillado/
11. **El Comercio Perú - Lima sin agua:** https://elcomercio.pe/lima/sucesos/dia-mundial-del-agua-15-millones-de-limenos-no-tienen-conexion-de-agua-potable-en-sus-hogares-sedapal-sunass-noticia/
12. **IFRC - Sequía Bolivia:** https://www.ifrc.org/es/articulo/sequia-sin-precedentes-agrava-crisis-del-agua-en-bolivia
13. **Unifranz - Crisis Cochabamba:** https://unifranz.edu.bo/cochabamba/crisis-del-agua-en-cochabamba-mas-de-30-municipios-en-emergencia/
14. **Rotoplas Argentina - Escasez de agua:** https://rotoplas.com.ar/escasez-de-agua-en-argentina/
15. **ONU News - Comunidades indígenas Argentina:** https://news.un.org/es/story/2020/04/1473122
