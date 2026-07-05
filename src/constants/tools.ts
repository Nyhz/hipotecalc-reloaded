export const getTools = (lang: 'es' | 'en' = 'es') => {
  const tools = {
    es: [
      {
        icon: "lucide:house",
        title: "Calculadora Hipotecaria",
        label: "Calculadora Hipotecaria",
        description:
          "Calcula tu cuota mensual, intereses y cuadro de amortización de tu hipoteca.",
        href: "/calculadora-hipotecaria",
        nav: true,
        active: true,
      },
      {
        icon: "lucide:calculator",
        title: "Calculadora de Alquiler",
        label: "Calculadora de Alquiler",
        description:
          "Analiza la rentabilidad de tu inversión inmobiliaria. Calcula ROI, cash flow y más métricas clave.",
        href: "/calculadora-alquiler",
        nav: true,
        active: true,
      },
      {
        icon: "lucide:table",
        title: "Comparativa de Hipotecas",
        label: "Comparativa",
        description:
          "Las ofertas hipotecarias de bancos, cajas y cooperativas de España: TIN, TAE, vinculaciones y comisiones, frente a frente.",
        href: "/comparativa-hipotecas",
        nav: true,
        active: true,
      },
      {
        icon: "lucide:newspaper",
        title: "Blog",
        label: "Blog",
        description: "Guías y análisis sobre hipotecas, euríbor y vivienda en España.",
        href: "/blog",
        nav: true,
        active: true,
        card: false,
      },
    ],
    en: [
      {
        icon: "lucide:house",
        title: "Mortgage Calculator",
        label: "Mortgage Calculator",
        description:
          "Calculate your monthly payment, interest and amortization schedule for your mortgage.",
        href: "/en/mortgage-calculator",
        nav: true,
        active: true,
      },
      {
        icon: "lucide:calculator",
        title: "Rental Calculator",
        label: "Rental Calculator",
        description:
          "Analyze the profitability of your real estate investment. Calculate ROI, cash flow and other key metrics.",
        href: "/en/rental-calculator",
        nav: true,
        active: true,
      },
    ]
  };
  
  return tools[lang];
};

// For backward compatibility
export const tools = getTools('es');
