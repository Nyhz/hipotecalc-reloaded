# Implementación de Google Analytics 4 con CookieYes - Hipotecalc

## ✅ **¿Qué ya está implementado?**

### 1. **Configuración Base de GA4 con Consent Management**

- ✅ Google Analytics script correctamente configurado en `Layout.astro`
- ✅ ID de tracking: `G-RCYZ4N1WPT`
- ✅ Script con `is:inline` para evitar errores de TypeScript
- ✅ **CookieYes integración** - Analytics solo se inicializa con consentimiento
- ✅ **Consent Mode** configurado con analytics_storage denied por defecto

### 2. **Hook Personalizado con Consent Management**

- ✅ `useGoogleAnalytics.ts` - Hook para trackear eventos con verificación de consentimiento
- ✅ Funciones preparadas para diferentes tipos de tracking
- ✅ **Verificación automática de consentimiento** antes de cada evento

### 3. **CookieYes Integration Features**

- ✅ **Event Listener** para cambios de consentimiento (`cookieyes_consent_update`)
- ✅ **Consent Mode API** - Google Analytics respeta el estado de consentimiento
- ✅ **Retroactive Consent** - Analytics se activa cuando el usuario acepta cookies
- ✅ **Dynamic Script Loading** - GA script solo se carga tras consentimiento

### 4. **ContactButton Tracking**

- ✅ Track de clicks en botón de contacto (solo con consentimiento)
- ✅ Diferenciación entre versión desktop y mobile
- ✅ Eventos: `contact_attempt` y `button_click`

### 5. **MortgageCalculator Tracking**

- ✅ Track de interacciones con campos importantes (solo con consentimiento)
- ✅ Track de cambios de tipo de vivienda
- ✅ Eventos: `calculator_usage`

### 6. **PageTracking con Consent Management**

- ✅ Track de page views solo con consentimiento
- ✅ **Listener para cambios de consentimiento** - trackea la página actual si el usuario acepta cookies después de cargar

## 🎯 **Eventos que se están trackeando (Solo con Consentimiento)**

### **⚠️ Importante: Privacy-First Approach**

Todos los eventos de Google Analytics **SOLO** se ejecutan cuando:

1. ✅ CookieYes está cargado
2. ✅ El usuario ha dado consentimiento para cookies analíticas
3. ✅ Google Analytics está completamente inicializado

### **Botón de Contacto**

```javascript
// Evento cuando se hace click en contactar (solo con consent)
if (cookieyes.getItem("analytics") === "yes") {
  gtag("event", "contact_attempt", {
    contact_source: "navbar_desktop", // o 'navbar_mobile'
    event_category: "conversion",
    value: 1,
  })
}
```

### **Calculadora Hipotecaria**

```javascript
// Cuando se actualiza un campo importante (solo con consent)
if (cookieyes.getItem("analytics") === "yes") {
  gtag("event", "calculator_usage", {
    calculator_type: "mortgage",
    action: "field_updated_precio", // precio, ahorro, tae, plazo
    event_category: "tools",
  })
}

// Cuando se cambia tipo de vivienda (solo con consent)
if (cookieyes.getItem("analytics") === "yes") {
  gtag("event", "calculator_usage", {
    calculator_type: "mortgage",
    action: "property_type_changed_Obra nueva",
    event_category: "tools",
  })
}
```

## 🍪 **Cómo Funciona la Integración CookieYes**

### **1. Inicialización**

```javascript
// Al cargar la página
gtag("consent", "default", {
  analytics_storage: "denied", // Denied por defecto
})

// GA se inicializa pero SIN recopilar datos
gtag("config", "G-RCYZ4N1WPT", {
  analytics_storage: "denied",
})
```

### **2. Cuando el Usuario Acepta Cookies**

```javascript
// Event listener automático
document.addEventListener("cookieyes_consent_update", function (e) {
  if (e.detail.analytics === "yes") {
    // 1. Cargar script de GA (si no está cargado)
    loadGoogleAnalytics()

    // 2. Actualizar consent mode
    gtag("consent", "update", {
      analytics_storage: "granted",
    })

    // 3. Reinicializar GA con tracking habilitado
    gtag("config", "G-RCYZ4N1WPT", {
      analytics_storage: "granted",
      anonymize_ip: true,
    })
  }
})
```

### **3. Cuando el Usuario Rechaza Cookies**

```javascript
if (e.detail.analytics === "no") {
  gtag("consent", "update", {
    analytics_storage: "denied",
  })
}
```

### **4. Verificación en Hook useGoogleAnalytics**

```typescript
const hasAnalyticsConsent = () => {
  return (
    typeof window !== "undefined" &&
    window.cookieyes &&
    window.cookieyes.getItem("analytics") === "yes"
  )
}

// Cada evento verifica consentimiento
const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (isGtagLoaded() && hasAnalyticsConsent()) {
    gtag("event", eventName, parameters)
  }
}
```

## 🧪 **Testing CookieYes Integration**

### **1. Verificar que NO se trackee sin consentimiento**

```javascript
// Abrir DevTools Console
// 1. Cargar página sin aceptar cookies
console.log(window.cookieyes?.getItem("analytics")) // debería ser null o 'no'
console.log(window.gtag) // debería existir
console.log(window.dataLayer) // debería tener consent: denied

// 2. Intentar hacer click en botón de contacto
// En Network tab NO debería aparecer requests a google-analytics.com/collect
```

### **2. Verificar que SÍ se trackee con consentimiento**

```javascript
// 1. Aceptar cookies en banner CookieYes
console.log(window.cookieyes?.getItem("analytics")) // debería ser 'yes'

// 2. Hacer click en botón de contacto
// En Network tab debería aparecer requests a google-analytics.com/collect

// 3. Verificar eventos en GA4 Real-time reports
```

### **3. Verificar cambios de consentimiento**

```javascript
// 1. Rechazar cookies después de haberlas aceptado
// 2. Intentar trackear eventos
// 3. NO debería enviar datos a GA

// Listener para debugging
document.addEventListener("cookieyes_consent_update", function (e) {
  console.log("Consent updated:", e.detail)
})
```

## 📊 **Recomendaciones adicionales para implementar**

### 1. **Tracking de Páginas (PageTracking.tsx ya implementado con Consent)**

Añadir a cada página:

```astro
---
// En cada página .astro
---
<PageTracking client:load pagePath="/calculadora-hipotecaria" pageTitle="Calculadora Hipotecaria" />
```

### 2. **Calculadora ITP (con verificación de consentimiento)**

```tsx
// En ITPCalculator.tsx
const { trackCalculatorUsage, hasAnalyticsConsent } = useGoogleAnalytics()

// Cuando se abre el modal
const handleOpenModal = () => {
  if (hasAnalyticsConsent()) {
    trackCalculatorUsage("itp", "modal_opened")
  }
  setShowItpModal(true)
}

// Cuando se calcula ITP
const handleCalculateITP = () => {
  if (hasAnalyticsConsent()) {
    trackCalculatorUsage("itp", "calculation_completed")
  }
}
```

### 3. **Calculadora de Alquiler (con verificación de consentimiento)**

```tsx
// En RentalCalculator.tsx
const { trackCalculatorUsage, hasAnalyticsConsent } = useGoogleAnalytics()

const handleCalculate = () => {
  if (hasAnalyticsConsent()) {
    trackCalculatorUsage("rental", "calculation_completed")
  }
}
```

### 4. **Links de Navegación (con verificación de consentimiento)**

```tsx
// En Navbar.tsx para los links del menú
const { trackEvent, hasAnalyticsConsent } = useGoogleAnalytics()

const handleNavClick = (toolLabel: string) => {
  if (hasAnalyticsConsent()) {
    trackEvent('navigation_click', {
      link_text: toolLabel,
      event_category: 'navigation'
    })
  }
}
  trackEvent('navigation_click', {
    link_text: toolLabel,
    event_category: 'navigation'
  })
}
```

### 5. **Gráficos y Visualizaciones**

```tsx
// Cuando se interactúa con gráficos
const handleChartInteraction = (chartType: string) => {
  trackEvent("chart_interaction", {
    chart_type: chartType,
    event_category: "visualization",
  })
}
```

### 6. **Errores y Validaciones**

```tsx
// Cuando hay errores de validación
const trackValidationError = (field: string, errorType: string) => {
  trackEvent("validation_error", {
    field_name: field,
    error_type: errorType,
    event_category: "form_error",
  })
}
```

### 7. **Tiempo de Permanencia en Calculadoras**

```tsx
// Track tiempo que el usuario pasa usando una calculadora
useEffect(() => {
  const startTime = Date.now()

  return () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    if (timeSpent > 30) {
      // Solo si estuvo más de 30 segundos
      trackEvent("calculator_session", {
        calculator_type: "mortgage",
        time_spent_seconds: timeSpent,
        event_category: "engagement",
      })
    }
  }
}, [])
```

## 🎨 **Eventos Custom Recomendados**

### **Conversiones**

- `contact_attempt` - Cuando intenta contactar
- `calculator_completed` - Cuando completa un cálculo
- `email_signup` - Si añades newsletter

### **Engagement**

- `calculator_usage` - Uso de calculadoras
- `chart_view` - Visualización de gráficos
- `help_clicked` - Si añades ayuda/tooltips

### **Navigation**

- `page_view` - Visitas a páginas
- `navigation_click` - Clicks en menú
- `external_link_click` - Links externos

### **Errors**

- `form_error` - Errores de formulario
- `calculation_error` - Errores de cálculo

## 📈 **Métricas Importantes para Analizar**

### **Conversión**

1. **Contact Rate**: % de usuarios que hacen click en contactar
2. **Calculator Completion**: % que completan cálculos
3. **Time to Contact**: Tiempo hasta que contactan

### **Engagement**

1. **Calculator Usage**: Qué calculadoras se usan más
2. **Field Interaction**: Qué campos se modifican más
3. **Session Duration**: Tiempo en cada calculadora

### **User Journey**

1. **Page Flow**: Qué páginas visitan primero
2. **Calculator Flow**: En qué orden usan las calculadoras
3. **Exit Points**: Dónde abandonan la web

## 🔧 **Próximos Pasos Recomendados**

1. **✅ COMPLETADO: CookieYes Integration** - Analytics solo con consentimiento
2. **✅ COMPLETADO: Consent Mode Implementation** - GDPR compliant analytics
3. **✅ COMPLETADO: PageTracking con Consent** - Page views respetan consentimiento
4. **Implementar tracking en ITPCalculator** y RentalCalculator (con consent checks)
5. **Configurar Goals en GA4** para conversiones
6. **Crear Custom Events** en GA4 dashboard
7. **Implementar Enhanced Ecommerce** si añades productos/servicios
8. **Testing exhaustivo** de la integración CookieYes

## 🔒 **GDPR Compliance Features Implementadas**

### **✅ Privacy by Design**

- Analytics disabled por defecto
- Consent Mode API implementada
- No tracking sin consentimiento explícito
- Respecta cambios de consentimiento en tiempo real

### **✅ User Control**

- Usuario puede cambiar preferencias en cualquier momento
- Tracking se detiene inmediatamente si retira consentimiento
- No se almacenan datos sin consentimiento

### **✅ Technical Implementation**

- Google Analytics Consent Mode v2
- CookieYes official integration
- Event-driven consent management
- TypeScript type safety para CookieYes

## 📊 **Dashboard GA4 Recomendado**

### **Eventos Principales a Monitorear**

- `contact_attempt` (conversión principal)
- `calculator_usage` (engagement)
- `button_click` (interacciones)
- `page_view` (tráfico)

### **Segmentos Útiles**

- Usuarios que usaron calculadoras
- Usuarios que contactaron
- Usuarios por tipo de calculadora
- Sesiones largas (> 2 minutos)

¡Con esta implementación tendrás datos muy valiosos sobre cómo los usuarios interactúan con tu web! 🚀
