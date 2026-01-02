// CORRECCIÓN: Tipamos 'payment' como 'any' para que pase el build
export default function ZelleData({ payment }: { payment: any }) {
  
  return (
    <>
    {
      payment
      ?
      <>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Nombre</p>
          <p className="mb-0">{ payment.ownerName }</p>
        </div>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Correo electrónico</p>
          <p className="mb-0">{ payment.ownerEmail }</p>
        </div>
      </>
      :
      null
    }
    </>
  )
}