export default function ZinliData({payment}) {
  
  return (
    <>
    {
      payment
      ?
      <div className="flex justify-between border-b px-2 py-4">
        <p className="font-bold text-gray-600 mb-0">Correo electrónico</p>
        <p className="mb-0">{ payment.ownerEmail }</p>
      </div>
    : null
    }
    </>
  )
}
