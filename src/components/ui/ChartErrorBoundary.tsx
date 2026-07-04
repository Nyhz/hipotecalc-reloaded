import React from "react"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
}

// Las gráficas (echarts) se cargan de forma diferida. Si el chunk falla al
// descargarse (red, despliegue con assets renovados, HMR obsoleto), sin este
// boundary React desmontaría la isla completa — la calculadora entera — en
// lugar de degradar a "sin gráfica".
export default class ChartErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
