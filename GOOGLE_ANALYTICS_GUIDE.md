# Implementación de Google Analytics 4 - Hipotecalc

## ✅ **¿Qué ya está implementado?**

### 1. **Configuración Base de GA4**
- ✅ Google Analytics script correctamente configurado en `Layout.astro`
- ✅ ID de tracking: `G-BB1WE4FZET`
- ✅ Script con `is:inline` para evitar errores de TypeScript

### 2. **Hook Personalizado**
- ✅ `useGoogleAnalytics.ts` - Hook para trackear eventos
- ✅ Funciones preparadas para diferentes tipos de tracking

### 3. **ContactButton Tracking**
- ✅ Track de clicks en botón de contacto
- ✅ Diferenciación entre versión desktop y mobile
- ✅ Eventos: `contact_attempt` y `button_click`

### 4. **MortgageCalculator Tracking**
- ✅ Track de interacciones con campos importantes
- ✅ Track de cambios de tipo de vivienda
- ✅ Eventos: `calculator_usage`

## 🎯 **Eventos que se están trackeando**

### **Botón de Contacto**
```javascript
// Evento cuando se hace click en contactar
gtag('event', 'contact_attempt', {
  contact_source: 'navbar_desktop', // o 'navbar_mobile'
  event_category: 'conversion',
  value: 1
});

gtag('event', 'button_click', {
  button_name: 'contact_broker',
  button_location: 'navbar_desktop', // o 'navbar_mobile'
  event_category: 'interaction'
});
```

### **Calculadora Hipotecaria**
```javascript
// Cuando se actualiza un campo importante
gtag('event', 'calculator_usage', {
  calculator_type: 'mortgage',
  action: 'field_updated_precio', // precio, ahorro, tae, plazo
  event_category: 'tools'
});

// Cuando se cambia tipo de vivienda
gtag('event', 'calculator_usage', {
  calculator_type: 'mortgage',
  action: 'property_type_changed_Obra nueva',
  event_category: 'tools'
});
```

## 📊 **Recomendaciones adicionales para implementar**

### 1. **Tracking de Páginas (PageTracking.tsx ya creado)**
Añadir a cada página:
```astro
---
// En cada página .astro
---
<PageTracking client:load pagePath="/calculadora-hipotecaria" pageTitle="Calculadora Hipotecaria" />
```

### 2. **Calculadora ITP**
```tsx
// En ITPCalculator.tsx
const { trackCalculatorUsage } = useGoogleAnalytics()

// Cuando se abre el modal
const handleOpenModal = () => {
  trackCalculatorUsage('itp', 'modal_opened')
  setShowItpModal(true)
}

// Cuando se calcula ITP
const handleCalculateITP = () => {
  trackCalculatorUsage('itp', 'calculation_completed')
}
```

### 3. **Calculadora de Alquiler**
```tsx
// En RentalCalculator.tsx
const { trackCalculatorUsage } = useGoogleAnalytics()

const handleCalculate = () => {
  trackCalculatorUsage('rental', 'calculation_completed')
}
```

### 4. **Links de Navegación**
```tsx
// En Navbar.tsx para los links del menú
const handleNavClick = (toolLabel: string) => {
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
  trackEvent('chart_interaction', {
    chart_type: chartType,
    event_category: 'visualization'
  })
}
```

### 6. **Errores y Validaciones**
```tsx
// Cuando hay errores de validación
const trackValidationError = (field: string, errorType: string) => {
  trackEvent('validation_error', {
    field_name: field,
    error_type: errorType,
    event_category: 'form_error'
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
    if (timeSpent > 30) { // Solo si estuvo más de 30 segundos
      trackEvent('calculator_session', {
        calculator_type: 'mortgage',
        time_spent_seconds: timeSpent,
        event_category: 'engagement'
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

1. **Implementar PageTracking** en todas las páginas
2. **Añadir tracking a ITPCalculator** y RentalCalculator
3. **Configurar Goals en GA4** para conversiones
4. **Crear Custom Events** en GA4 dashboard
5. **Implementar Enhanced Ecommerce** si añades productos/servicios

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
