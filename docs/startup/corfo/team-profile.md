# Perfil del Equipo - nitoagua

**Postulación CORFO Semilla Inicia**
**Fecha:** 16 de diciembre de 2025

---

## 1. Fundador Principal

### Gabriel Cárcamo - Fundador y Desarrollador

**Rol:** Fundador único, responsable de desarrollo técnico, estrategia de producto y operaciones.

**Resumen Profesional:**

Ingeniero en Informática con **más de 11 años de experiencia** desarrollando soluciones tecnológicas complejas para instituciones financieras globales como Chase, Citi y Bank of America. Mi experiencia abarca sistemas mainframe, distribuidos (AIX/Linux) y cloud (AWS), lo que me otorga una perspectiva única para diseñar soluciones escalables y robustas.

Durante mi carrera en Experian, lideré implementaciones de modelos de riesgo crediticio que impactan a **más de 300 millones de usuarios finales**, coordinando equipos multidisciplinarios y gestionando proyectos críticos con plazos estrictos.

**Formación Académica:**
- **Ingeniero en Informática** - Universidad Mayor, Chile (2016-2020)
- Cursos de Machine Learning, Data Science y System Design (Udemy, Educative)

**Ubicación:** Santiago, Chile

---

## 2. Capacidades Demostradas

### 2.1 MVP Funcional en Producción

**La prueba más contundente de mis capacidades es el MVP funcional de nitoagua disponible en [nitoagua.vercel.app](https://nitoagua.vercel.app).**

Este MVP fue desarrollado en aproximadamente **2 semanas** (desde el 30 de noviembre de 2025), demostrando:

- **Velocidad de ejecución:** De idea a producto funcional en tiempo récord
- **Capacidad técnica integral:** Diseño, desarrollo frontend y backend, base de datos, autenticación, despliegue
- **Enfoque práctico:** Priorizando funcionalidad sobre perfección teórica

#### Funcionalidades Implementadas:

**Flujo del Consumidor:**
- Solicitud de agua con formulario intuitivo
- Seguimiento de estado en tiempo real
- Notificaciones por correo electrónico
- Historial de pedidos para usuarios registrados

**Flujo del Proveedor:**
- Panel de administración de solicitudes
- Gestión de ofertas y entregas
- Sistema de verificación de proveedores

**Panel de Administración:**
- Gestión de proveedores y solicitudes
- Configuración de precios y comisiones
- Dashboard de operaciones

### 2.2 Diseño UX Completo

Además del MVP funcional, ya contamos con **mockups completos** para las tres interfaces principales:

- **Consumidor:** Flujo completo de solicitud, seguimiento y selección de ofertas
- **Proveedor:** Dashboard de solicitudes, gestión de ofertas y entregas
- **Administrador:** Panel de operaciones, verificación y configuración

Estos mockups sirvieron como base para generar toda la documentación técnica (PRD, arquitectura, especificaciones técnicas, épicas y user stories) que guía el desarrollo. **Actualmente estamos implementando las funcionalidades avanzadas basadas en estos diseños.**

### 2.3 Desarrollo Ágil Potenciado por IA

Un diferenciador clave en mi metodología es el uso del **framework BMAD (BMad Method)** para desarrollo ágil con IA multi-agente. Esta metodología permite:

- **Agentes especializados:** Diferentes "agentes" de IA actúan como Product Manager, Arquitecto, Desarrollador y QA, cada uno con expertise específico
- **Documentación automatizada:** Generación de PRDs, especificaciones técnicas y user stories de forma estructurada
- **Consistencia:** Mantiene coherencia entre documentación, código y tests a lo largo del proyecto
- **Velocidad de iteración:** Reduce significativamente el tiempo desde idea a implementación

Esta capacidad de **orquestar herramientas de IA de manera efectiva** es una habilidad crítica en el desarrollo de software moderno, y me permite operar como un equipo de múltiples personas siendo un fundador único.

### 2.4 Stack Técnico Demostrado

El desarrollo de nitoagua demuestra dominio de tecnologías modernas:

| Área | Tecnología | Aplicación en nitoagua |
|------|------------|------------------------|
| **Frontend** | Next.js 14, React, TypeScript | Interfaz de usuario responsive y PWA |
| **Backend** | Next.js API Routes, Server Actions | APIs RESTful y autenticación |
| **Base de Datos** | Supabase (PostgreSQL) | Almacenamiento, autenticación, RLS |
| **Despliegue** | Vercel | CI/CD automático, edge functions |
| **Notificaciones** | Resend, React Email | Emails transaccionales |
| **Testing** | Playwright, Vitest | E2E y pruebas unitarias |

### 2.5 Otros Proyectos Demostrativos

**Gastify (https://boletapp-d609f.web.app/)**
- Smart Expense Tracker PWA
- Automatización de entrada de boletas usando IA
- Captura de datos a nivel de ítem con analíticas
- Demuestra capacidad de entregar productos funcionales

**Proyectos Profesionales en Experian:**
- Frameworks de automatización para validación cross-platform
- Herramientas de visualización 3D para modelos de riesgo
- Pipelines ETL + ML de extremo a extremo
- Framework de redes neuronales desde cero

---

## 3. Evidencia de Ejecución

### 3.1 Timeline del Proyecto nitoagua

| Fecha | Hito |
|-------|------|
| 30 Nov 2025 | Inicio del proyecto |
| 2 Dic 2025 | Infraestructura base (Supabase, autenticación, PWA) |
| 5 Dic 2025 | Flujo completo del consumidor |
| 8 Dic 2025 | Flujo del proveedor y notificaciones |
| 14 Dic 2025 | Panel de administración y sistema de ofertas |
| 16 Dic 2025 | MVP completo con múltiples flujos |

**Tiempo total:** ~2 semanas (tiempo parcial)

### 3.2 Decisiones Clave Tomadas

1. **Next.js sobre React puro:** Mejor SEO, server-side rendering, y API routes integrados
2. **Supabase sobre Firebase:** Row Level Security nativo, PostgreSQL estándar, mejor control
3. **PWA desde el inicio:** Instalación en móvil sin pasar por tiendas de apps
4. **TypeScript estricto:** Menos errores en producción, mejor mantenibilidad
5. **Modelo de ofertas competitivas:** Diferenciación versus modelo de asignación directa

### 3.3 Ejemplos de Resolución de Problemas

- **Desafío:** Sincronización de datos en tiempo real entre consumidores y proveedores
- **Solución:** Implementación de Supabase Realtime con suscripciones optimizadas

- **Desafío:** Autenticación segura para usuarios guest y registrados
- **Solución:** Sistema híbrido con tracking por código de solicitud + autenticación opcional

- **Desafío:** Testing E2E robusto para múltiples flujos
- **Solución:** Suite de Playwright con datos seedeados y tests paralelos

---

## 4. Conocimiento del Mercado

### 4.1 Conexión con la Araucanía

Mi conexión con el problema viene de fuentes directas:

1. **Experiencia personal:** He enfrentado la necesidad de solicitar agua en camión aljibe en el pasado, experimentando la frustración de no tener un canal centralizado.

2. **Testimonio de contactos locales:** Un amigo de la región me compartió el dolor de no poder direccionar a sus clientes a una plataforma centralizada para solicitudes de agua.

### 4.2 Investigación del Mercado

La investigación confirma un mercado significativo:

- **Crisis hídrica estructural:** La Araucanía enfrenta déficit hídrico crónico
- **Mercado fragmentado:** Operadores dispersos sin presencia digital unificada
- **Oportunidad de digitalización:** Similar a lo que Uber hizo con taxis

### 4.3 Entendimiento de los Usuarios

**Consumidores (hogares rurales):**
- Necesitan agua de forma urgente y predecible
- Valoran transparencia en precios y tiempos
- Prefieren canales simples (móvil, WhatsApp)

**Proveedores (camiones aljibe):**
- Buscan optimizar rutas y tiempo
- Necesitan flujo constante de clientes
- Valoran herramientas que reduzcan llamadas telefónicas

---

## 5. Visión y Liderazgo

### 5.1 Visión a 5 Años

**Corto plazo (1 año):**
- Consolidar operación en Araucanía
- Alcanzar 1,000 solicitudes mensuales
- Red de 50+ proveedores verificados

**Mediano plazo (2-3 años):**
- Expansión a otras regiones con déficit hídrico (Coquimbo, Valparaíso, Maule)
- Desarrollo de funcionalidades avanzadas (predicción de demanda, optimización de rutas)
- Integración con municipios y organismos públicos

**Largo plazo (5 años):**
- Plataforma líder de gestión hídrica en Chile
- Modelo replicable en otros países latinoamericanos
- Datos para informar política pública sobre recursos hídricos

### 5.2 Enfoque de Priorización

Mi enfoque ha sido **MVP primero, perfección después:**

1. **Validar problema:** Confirmar que la necesidad existe
2. **Entregar valor mínimo:** Producto funcional que resuelve el problema core
3. **Iterar con feedback:** Mejorar basado en uso real
4. **Escalar con evidencia:** Crecer cuando el modelo esté validado

### 5.3 Compromiso Personal

- **Inversión de tiempo:** Desarrollo en tiempo parcial mientras mantengo otros proyectos
- **Inversión futura:** Disposición a dedicación completa con financiamiento CORFO
- **Motivación:** Resolver un problema real que he vivido personalmente

---

## 6. Plan de Crecimiento del Equipo

### 6.1 Brechas Identificadas

Como fundador técnico, reconozco áreas donde necesito apoyo:

| Área | Brecha | Impacto |
|------|--------|---------|
| **Ventas/Comercial** | Sin experiencia en ventas B2B | Limita captación de proveedores |
| **Operaciones** | Sin experiencia en logística | Necesario para optimización |
| **Marketing** | Conocimiento básico | Limita adquisición de usuarios |
| **Legal/Regulatorio** | Sin expertise específico | Riesgo de compliance |

### 6.2 Plan de Mitigación con Financiamiento CORFO

El financiamiento CORFO permitiría:

**Contrataciones prioritarias:**
1. **Encargado Comercial/Operaciones** (50% del tiempo): Captación de proveedores y gestión de relaciones
2. **Community Manager** (freelance): Marketing digital y gestión de redes

**Servicios externos:**
- Asesoría legal para términos de servicio y contratos
- Consultoría en operaciones logísticas

**Capacitación personal:**
- Cursos de ventas y negociación
- Networking con emprendedores del sector

### 6.3 Ventaja del Fundador Técnico

Ser fundador técnico único tiene ventajas:

- **Velocidad de iteración:** Sin dependencia de terceros para cambios técnicos
- **Costos reducidos:** Sin gastos de desarrollo externo
- **Conocimiento profundo:** Entiendo cada línea del código
- **Flexibilidad:** Puedo pivotar rápidamente basado en feedback

---

## 7. Red de Apoyo

### 7.1 Estado Actual

Actualmente no cuento con asesores o mentores formales. El desarrollo ha sido autónomo, basado en:

- Experiencia profesional de 11+ años en tecnología
- Autoformación continua en emprendimiento y negocios
- Comunidades online de emprendedores y desarrolladores

### 7.2 Plan de Construcción de Red

Con el financiamiento CORFO buscaré:

1. **Mentores de CORFO:** Aprovechar la red de mentores del programa
2. **Redes de emprendimiento:** Participación en Startup Chile, aceleradoras locales
3. **Conexiones en el sector:** Contactos en municipios y organizaciones de la Araucanía
4. **Comunidad tech:** Networking en comunidades de desarrollo en Chile

---

## 8. Resumen Ejecutivo del Equipo

### Fortalezas Clave

| Aspecto | Evidencia |
|---------|-----------|
| **Capacidad técnica** | MVP funcional en 2 semanas |
| **Experiencia profesional** | 11+ años en empresas de clase mundial |
| **Ejecución demostrada** | Producto en producción con múltiples flujos |
| **Conocimiento del problema** | Experiencia personal + conexión regional |
| **Compromiso** | Inversión de tiempo propio sin financiamiento |

### Por qué un Fundador Solo Puede Tener Éxito

1. **El MVP está listo:** No es una idea, es un producto funcionando
2. **Capacidad técnica probada:** 11+ años de entregar soluciones complejas
3. **Mentalidad de ejecución:** De idea a MVP en 2 semanas
4. **Plan de crecimiento claro:** Sé qué necesito y cómo obtenerlo
5. **Autoconciencia:** Reconozco mis brechas y tengo plan para abordarlas

---

## 9. Contacto

**Gabriel Cárcamo**
- **Email:** [khujta.ai@gmail.com](khujta.ai@gmail.com)
- **LinkedIn:** [linkedin.com/in/gabriel-carcamo](http://www.linkedin.com/in/gabriel-carcamo)
- **Producto:** [nitoagua.vercel.app](https://nitoagua.vercel.app)
- **Ubicación:** Villarrica, Chile

---

*Este documento fue preparado para la postulación a CORFO Semilla Inicia 2025.*
