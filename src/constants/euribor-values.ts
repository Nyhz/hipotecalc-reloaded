// AUTO-GENERADO por scripts/update-euribor.mjs — no editar a mano.
// Fuente: BCE Data Portal (data.ecb.europa.eu), euríbor a 12 meses.
// Serie anual: media del año. El año en curso (partial) es la media de los
// meses publicados hasta la fecha.

export interface EuriborPoint {
  year: number
  value: number
  partial?: boolean
}

export const euriborData: EuriborPoint[] = [
  { year: 2000, value: 4.79 },
  { year: 2001, value: 4.09 },
  { year: 2002, value: 3.49 },
  { year: 2003, value: 2.33 },
  { year: 2004, value: 2.27 },
  { year: 2005, value: 2.33 },
  { year: 2006, value: 3.44 },
  { year: 2007, value: 4.45 },
  { year: 2008, value: 4.83 },
  { year: 2009, value: 1.61 },
  { year: 2010, value: 1.35 },
  { year: 2011, value: 2.01 },
  { year: 2012, value: 1.11 },
  { year: 2013, value: 0.54 },
  { year: 2014, value: 0.48 },
  { year: 2015, value: 0.17 },
  { year: 2016, value: -0.03 },
  { year: 2017, value: -0.15 },
  { year: 2018, value: -0.17 },
  { year: 2019, value: -0.22 },
  { year: 2020, value: -0.31 },
  { year: 2021, value: -0.49 },
  { year: 2022, value: 1.1 },
  { year: 2023, value: 3.87 },
  { year: 2024, value: 3.27 },
  { year: 2025, value: 2.22 },
  { year: 2026, value: 2.65, partial: true },
]

// Última media mensual publicada por el BCE.
export const currentEuribor = {
  value: 2.95,
  period: "2026-08",
  labelEs: "ago 2026",
  labelEn: "Aug 2026",
}
