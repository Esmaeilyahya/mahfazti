// Telegram API adapter for Node (GitHub Actions). The token comes from the environment only.
export function makeTg(T){const api=m=>`https://api.telegram.org/bot${T}/${m}`;return{
  call:async(m,params)=>{const r=await fetch(api(m),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(params||{})});return r.json()},
  file:async path=>{const r=await fetch(`https://api.telegram.org/file/bot${T}/${path}`);return r.ok?r.arrayBuffer():null},
  upload:async(m,fields,f)=>{const fd=new FormData();for(const k in fields)fd.append(k,fields[k]);fd.append(f.field,new Blob([f.data],{type:f.type}),f.name);const r=await fetch(api(m),{method:'POST',body:fd});return r.json()}}}
