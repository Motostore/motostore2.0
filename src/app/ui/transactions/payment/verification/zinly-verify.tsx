import { useEffect, useState } from "react"

export default function ZinliVerify({verification}) {

    // TODO: Se tienen que mostrar los datos de validación para cada método de pago
    const [data, setData] = useState([])
    
    useEffect(() => {
      let tmp = [];
      if (verification !== null) {
        for (const [key, value] of Object.entries(verification)) {
          tmp.push({name: key, value: value})
        }
        setData(tmp)
      }
    }, [])

    return (
      <>
      {
        data.length > 0
        ?
        <>
        {
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
  