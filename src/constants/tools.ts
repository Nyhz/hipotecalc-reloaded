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
        icon: "lucide:receipt-euro",
        title: "Calculadora de ITP",
        label: "Calculadora de ITP",
        description:
          "Calcula el impuesto de tu vivienda de segunda mano con las bonificaciones de tu comunidad: jóvenes, familia numerosa, discapacidad y más.",
        href: "/calculadora-itp",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:piggy-bank",
        title: "¿Cuánto me prestan?",
        label: "¿Cuánto me prestan?",
        description:
          "Descubre la hipoteca máxima que te daría el banco con tus ingresos, según la regla del 35 % de endeudamiento.",
        href: "/cuanto-me-prestan",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:coins",
        title: "Gastos de compraventa",
        label: "Gastos de compraventa",
        description:
          "El coste real de comprar: ITP o IVA, notaría, registro, gestoría y tasación, desglosados según tu comunidad.",
        href: "/calculadora-gastos-compraventa",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:home",
        title: "Plusvalía municipal",
        label: "Plusvalía municipal",
        description:
          "Lo que pagarás al vender: compara el método objetivo y el real tras la reforma de 2021 y quédate con el más barato.",
        href: "/calculadora-plusvalia",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:trending-up",
        title: "Euríbor hoy",
        label: "Euríbor hoy",
        description:
          "El valor actual del euríbor, su histórico oficial y cómo afecta a tu cuota, con análisis mensual.",
        href: "/euribor",
        nav: false,
        active: true,
        card: false,
      },
      {
        icon: "lucide:landmark",
        title: "ITP por comunidad",
        label: "ITP por comunidad",
        description:
          "Cuánto ITP se paga en cada comunidad autónoma: tipos vigentes, reducciones y bonificaciones de 2026.",
        href: "/itp",
        nav: true,
        active: true,
        card: false,
      },
      {
        icon: "lucide:book-open",
        title: "Guías",
        label: "Guías",
        description:
          "El ITP en cada comunidad autónoma, tipos de hipoteca y fiscalidad de la vivienda, con datos verificados.",
        href: "/guias",
        nav: true,
        active: true,
        card: false,
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
      {
        icon: "lucide:table",
        title: "Mortgage Comparison",
        label: "Comparison",
        description:
          "Mortgage offers from Spanish banks side by side: TIN, APR, bundled products and fees.",
        href: "/en/mortgage-comparison",
        nav: true,
        active: true,
      },
      {
        icon: "lucide:receipt-euro",
        title: "ITP Calculator",
        label: "ITP Calculator",
        description:
          "Calculate the ITP transfer tax on a resale home with your region's reductions: young buyers, large families, disability and more.",
        href: "/en/itp-calculator",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:piggy-bank",
        title: "How much can I borrow?",
        label: "How much can I borrow?",
        description:
          "Find out the maximum mortgage a bank would grant you with your income, using the 35% debt-to-income rule.",
        href: "/en/how-much-can-i-borrow",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:coins",
        title: "Purchase costs",
        label: "Purchase costs",
        description:
          "The real cost of buying: ITP or VAT, notary, registry, agency and appraisal, broken down by region.",
        href: "/en/property-purchase-costs-calculator",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:home",
        title: "Plusvalía tax",
        label: "Plusvalía tax",
        description:
          "What you'll pay when selling: compare the objective and real methods after the 2021 reform and keep the cheaper one.",
        href: "/en/plusvalia-calculator",
        nav: false,
        active: true,
        card: true,
      },
      {
        icon: "lucide:trending-up",
        title: "Euribor today",
        label: "Euribor today",
        description:
          "The current Euribor value, its official history and how it affects your payment, with monthly analysis.",
        href: "/en/euribor",
        nav: false,
        active: true,
        card: false,
      },
      {
        icon: "lucide:landmark",
        title: "ITP by region",
        label: "ITP by region",
        description:
          "How much ITP is paid in each Spanish region: current rates, reductions and reliefs for 2026.",
        href: "/en/itp",
        nav: true,
        active: true,
        card: false,
      },
      {
        icon: "lucide:book-open",
        title: "Guides",
        label: "Guides",
        description:
          "ITP in every region, mortgage types and housing taxes in Spain, with verified data.",
        href: "/en/guides",
        nav: true,
        active: true,
        card: false,
      },
      {
        icon: "lucide:newspaper",
        title: "Blog",
        label: "Blog",
        description: "Guides and analysis on mortgages, the Euribor and housing in Spain.",
        href: "/en/blog",
        nav: true,
        active: true,
        card: false,
      },
    ]
  };
  
  return tools[lang];
};

// For backward compatibility
export const tools = getTools('es');
