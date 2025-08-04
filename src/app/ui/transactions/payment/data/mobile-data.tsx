export default function MobileData({payment}) {
  
  return (
    <>
    {
      payment
      ?
      <>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Banco</p>
          <p className="mb-0">{ payment.bankName }</p>
        </div>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Cédula</p>
          <p className="mb-0">{ payment.ownerDni }</p>
        </div>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Teléfono</p>
          <p className="mb-0">{ payment.ownerPhone }</p>
        </div>
      </>
      :
      null
    }
    </>
  )
}