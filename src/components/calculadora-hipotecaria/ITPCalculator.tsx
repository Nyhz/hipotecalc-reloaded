import React, { useEffect, useState } from "react"
import Modal from "./Modal"
import PurchaseTaxForm from "../fiscal/PurchaseTaxForm"
import { defaultPurchase, resultDescription } from "../../fiscal/engine"
import type { Purchase, TaxResult } from "../../fiscal/types"

interface ITPCalculatorProps {
  open: boolean
  onClose: () => void
  onResult: (total: number, effectiveRate?: number, description?: string, detail?: TaxResult) => void
  comunidadSeleccionada?: string
  initialPrecio?: string | number
  initialTipoVivienda?: string
  initialEdad?: string | number
  initialSituacion?: string
  initialDiscapacidad?: boolean
  initialPorcentajeDiscapacidad?: string | number
  initialPrimeraVivienda?: boolean
  initialNumHijos?: string | number
  initialVictimaViolencia?: boolean
  initialVictimaTerrorismo?: boolean
  initialZonaDespoblada?: boolean
  initialVpo?: boolean
  initialFiscal?: Purchase
  onComunidadChange?: (comunidad: string) => void
  onTipoViviendaChange?: (tipo: string) => void
  lang?: 'es' | 'en'
  inline?: boolean
  investment?: boolean
}
export default function ITPCalculator(props:ITPCalculatorProps) {
  const {open,onClose,onResult,lang='es',inline=false}=props
  const initial=():Purchase=>({
    ...defaultPurchase(Number(props.initialPrecio)||0,props.comunidadSeleccionada??'',props.initialTipoVivienda==='Obra nueva'?'Obra nueva':'Segunda mano'),
    habitual:undefined,primera:props.initialPrimeraVivienda,
    edad:props.initialEdad!==undefined&&String(props.initialEdad)!==''?Number(props.initialEdad):undefined,
    gradoDiscapacidad:props.initialPorcentajeDiscapacidad!==undefined&&String(props.initialPorcentajeDiscapacidad)!==''?Number(props.initialPorcentajeDiscapacidad):undefined,
    hijos:props.initialNumHijos!==undefined?Number(props.initialNumHijos):undefined,
    proteccion:props.initialVpo?'sin-clasificar':'libre',
    // Legacy checkbox flags do not establish official certificates or rural status.
    ...props.initialFiscal,
    ...(props.investment?{habitual:false}:{}),
  })
  const [value,setValue]=useState<Purchase>(initial)
  useEffect(()=>{if(open&&!inline)setValue(initial())},[open])
  const change=(next:Purchase)=>{
    setValue(next)
    if(next.comunidad!==value.comunidad)props.onComunidadChange?.(next.comunidad)
    if(next.tipoVivienda!==value.tipoVivienda)props.onTipoViviendaChange?.(next.tipoVivienda)
  }
  const result=(detail:TaxResult)=>{
    if(detail.total===null)return
    onResult(detail.total,detail.fiscalBase>0?detail.total/detail.fiscalBase*100:0,resultDescription(detail,lang),detail)
    if(!inline)onClose()
  }
  const form=<PurchaseTaxForm value={value} onChange={change} onResult={result} lang={lang} investment={props.investment}/>
  if(inline)return <div className='pl-card p-5 md:p-6'>{form}</div>
  return <Modal open={open} onClose={onClose} lang={lang} title={lang==='es'?'Impuestos de adquisición':'Purchase taxes'}>{form}</Modal>
}
