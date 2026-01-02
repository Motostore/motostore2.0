import { useEffect, useState } from "react"

// CORRECCIÓN 1: Tipamos la prop 'verification' como 'any'
export default function ZinliVerify({ verification }: { verification: any }) {

    // CORRECCIÓN 2: Definimos el estado como un array de objetos (<any[]>)
    const [data, setData] = useState<any[]>([])
    
    useEffect(() => {
      let tmp = [];
      if (verification !== null) {
        // CORRECCIÓN 3: Aseguramos que 'verification' sea tratado como objeto
        for (const [key, value] of Object.entries(verification || {})) {
          tmp.push({name: key, value: value})
        }
        setData(tmp)
      }
    }, [verification])

    return (
      <>
      {
        data.length > 0
        ?
        <>
        {
          // CORRECCIÓN 4: Al tipar el estado arriba, 'd' ya no dará error
          data.map((d, i) => (
            <div key={i} className="flex justify-between border-b px-2 py-4">
              <p className="font-bold text-gray-600 mb-0 ">{d.name}</p>
              <p className="mb-0">{ d.value }</p>
            </div>
          ))
        }
        </>
        :
        <>
         <div className="mt-2">
            No hay información disponible.
         </div>
        </>
      }
      </>
    )
  }
  