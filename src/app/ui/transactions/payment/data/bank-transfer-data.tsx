export default function BankTransferData({payment}) {
  
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
          <p className="font-bold text-gray-600 mb-0">Tipo de cuenta</p>
          <p className="mb-0">{ payment.accountType }</p>
        </div>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Número de cuenta</p>
          <p className="mb-0">{ payment.accountNumber }</p>
        </div>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Cédula</p>
          <p className="mb-0">{ payment.ownerDni }</p>
        </div>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Nombre</p>
          <p className="mb-0">{ payment.ownerName }</p>
        </div>
      </>
      :
      null
    }
    </>
  )
}