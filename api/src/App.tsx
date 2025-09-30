import React, { useState } from 'react'
const API = import.meta.env.VITE_API_BASE_URL
export default function App(){
  const [topic,setTopic]=useState('Derivadas')
  const [courseId,setCourseId]=useState<string|undefined>()
  return (
    <div style={{maxWidth:720,margin:'2rem auto',fontFamily:'system-ui'}}>
      <h1>StudySprint</h1>
      {!courseId && (
        <>
          <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Qual assunto?" />
          <button onClick={async ()=>{
            const r=await fetch(`${API}/course`,{
              method:'POST',headers:{'Content-Type':'application/json'},
              body:JSON.stringify({userId:'00000000-0000-0000-0000-000000000001',topic})
            })
            const j=await r.json(); setCourseId(j.courseId)
          }}>Criar trilho</button>
        </>
      )}
      {courseId && <p>Curso criado: {courseId}</p>}
    </div>
  )
}
