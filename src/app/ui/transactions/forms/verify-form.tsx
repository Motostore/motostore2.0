import { Animation } from "@/app/components/InputErrors";
import { FetchError, TransactionVerify } from "@/app/lib/definitions";
import { TransactionEnum } from "@/app/lib/enums";
import { fetchVerifyTransaction } from "@/app/lib/transactions.service";
import { error_message, input_tailwind } from "@/app/utils/tailwindStyles";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function VerifyForm({ transactionId, clientId, transactionStatus, setOpenModal}) {

  const [fetchError, setFetchError] = useState<FetchError>();
  const router = useRouter();

  const { 
    register,
    handleSubmit,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      message: ""
    }
  });

  const onSubmit = handleSubmit( async (data) => {
    const message = data['message']
    const status = transactionStatus
    const notificationMessage = status === TransactionEnum.REJECTED 
    ? `Su solicitud ha sido rechazada ${ transactionId }` 
    : `Su solicitud ha sido aprobada ${ transactionId }`
    let body: TransactionVerify = { 
      message,
      status,
      notificationMessage,
      notificationRecipient: clientId,
      url: '/dashboard/accounts'
    }

    const result = await fetchVerifyTransaction(transactionId, body)

    if(!result.error) {
      setFetchError(undefined);
      router.push('/dashboard/transactions');
    } else {
      setFetchError(result);
    }
  })

  return (
    <form
      onSubmit={e => e.preventDefault()}
      noValidate
      autoComplete="off"
      className="space-y-3 mb-4 w-full"
    >
      <>
      {
        fetchError
        ? <span className={error_message}>{fetchError?.message}</span>
        : null
      }
      </>
      {
        transactionStatus === TransactionEnum.REJECTED
        ?
        <>
        <label htmlFor="message" className="text-gray-600 font-bold">Motivo</label>
        <div>
          <Animation errors={errors} field='message' />
          <input {...register('message')} id="message" type='text' placeholder="Mensaje" className={`${input_tailwind} text-gray-900`}/>
        </div>
        </>
        : null
      }
      <div className="flex justify-between gap-4">
        <button type="button" onClick={() => setOpenModal(false)} className="flex w-full justify-center rounded-md bg-gray-400 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Cancelar</button>
        {
          transactionStatus === TransactionEnum.REJECTED
          ?
          <button type="button" onClick={onSubmit} className="flex w-full justify-center rounded-md bg-red-400 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Rechazar</button>
          : null
        }
        {
          transactionStatus === TransactionEnum.PROCESSED
          ?
          <button type="button" onClick={onSubmit} className="flex w-full justify-center rounded-md bg-green-400 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Aprobar</button>
          : null
        }
      </div>
    </form>
  )
}