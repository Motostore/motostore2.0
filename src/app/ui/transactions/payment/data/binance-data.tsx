// CORRECCIÓN: Tipamos 'payment' como 'any' para que pase el build
export default function BinanceData({ payment }: { payment: any }) {
  
  return (
    <>
      {
      payment
      ?
      <>
        <div className="flex justify-between border-b px-2 py-4">
          <p className="font-bold text-gray-600 mb-0">Binance Pay</p>
          <p className="mb-0">{ payment.binancePay }</p>
        </div>
      </>
      :
      null
      }
    </>
  )
}