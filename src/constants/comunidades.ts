import { REGIONS } from '../fiscal/sources'

/** Names only. All tax rates/eligibility live in fiscal/rules.ts, never in selectors. */
export const COMUNIDADES = REGIONS.map(([,nombre])=>({nombre}))
