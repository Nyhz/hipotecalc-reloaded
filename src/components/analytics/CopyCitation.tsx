import { useState } from 'react';
export default function CopyCitation({text,lang}:{text:string;lang:'es'|'en'}) {
  const [status,setStatus]=useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(text);setStatus(lang==='es'?'Cita copiada':'Citation copied'); }
    catch {setStatus(lang==='es'?'Selecciona y copia la cita de arriba.':'Select and copy the citation above.');}
  }
  return <div className="an-actions"><button type="button" className="an-button secondary" onClick={copy}>{lang==='es'?'Copiar cita':'Copy citation'}</button><span className="an-small" role="status">{status}</span></div>;
}
