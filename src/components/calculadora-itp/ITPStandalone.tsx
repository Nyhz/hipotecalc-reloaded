import ITPCalculator from "../calculadora-hipotecaria/ITPCalculator"
export default function ITPStandalone({lang='es',initialComunidad}:{lang?:'es'|'en';initialComunidad?:string}){
  return <div className='flex flex-col gap-6'>
    <ITPCalculator inline open onClose={()=>{}} onResult={()=>{}} comunidadSeleccionada={initialComunidad} lang={lang}/>
    <div className='flex flex-wrap gap-3'>
      <a href={lang==='es'?'/calculadora-hipotecaria':'/en/mortgage-calculator'} className='btn-ink px-5 py-2.5 text-sm'>{lang==='es'?'Calcular la hipoteca completa →':'Calculate the full mortgage →'}</a>
      <a href={lang==='es'?'/itp':'/en/itp'} className='btn-outline px-5 py-2.5 text-sm'>{lang==='es'?'Ver la guía de tu comunidad':"See your region’s guide"}</a>
    </div>
  </div>
}
