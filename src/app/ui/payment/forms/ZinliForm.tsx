import { Animation } from "@/app/components/InputErrors";
import { Streaming, ZinliPayload, ZinliTransaction } from "@/app/lib/definitions";
import { fetchTransaction } from "@/app/lib/transactions.service";
import { ZinliSchema } from "@/app/utils/schemas";
import { input_tailwind } from "@/app/utils/tailwindStyles";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

const schema = ZinliSchema;

export default function ZinliForm({service, payload, setOpenModal}: { service: Streaming, payload: ZinliPayload, setOpenModal: any }) {

  const { 
    register,
    handleSubmit,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      reference: ""
    },
    resolver: yupResolver(schema)
  });

  const onSubmit = handleSubmit( async (data) => {
    // CORRECCIÓN: Agregamos fallback '|| 0' para asegurar que sea un número
    const serviceId = service.id || 0;
    
    const paymentMethodId = parseInt(payload.id);
    const amount = service.price;
    const name = data['name'];
    const reference = data['reference'];
    
    // CORRECCIÓN: Agregamos fallback '|| ""' para asegurar que sea un string
    const email = data['email'] || "";
    
    const serviceType = service.serviceType;
    const message = `Se ha registrado un pago para el servicio ${service.name}, mediante el método de pago Zinli.`;
    const url = "/dashboard/transactions"

    const body: ZinliTransaction = {
      serviceId,
      paymentMethodId,
      amount,
      name,
      reference,
      email,
      serviceType,
      message,
      url
    }

    const result = await fetchTransaction(body);

    if(result) {
      setOpenModal(false);
    } else {
      toast.error('ha ocurrido un error.', {
        style: {
          backgroundColor: '#fba6a9',
          width: '100%'
        }
      })
    }
  });

  return (
    <form
      onSubmit={e => e.preventDefault()}
      noValidate
      autoComplete="off"
      className="space-y-4 mb-4"
    >
      <div>
        <Animation errors={errors} field='name' />
        <input {...register('name')} type='text' placeholder="Nombre" className={`${input_tailwind} text-gray-900`}/>
      </div>
      <div>
        <Animation errors={errors} field='reference' />
        <input {...register('reference')} type='text' placeholder="Referencia" className={`${input_tailwind} text-gray-900`}/>
      </div>
      <div>
        <Animation errors={errors} field='email' />
        <input {...register('email')} type='text' placeholder="Correo electrónico" className={`${input_tailwind} text-gray-900`}/>
      </div>
      <div className="flex justify-between gap-4">
        <button type="button" onClick={onSubmit} className="flex w-full justify-center rounded-md bg-gradient-to-r from-orange-500 to-orange-300 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:from-orange-300 hover:to-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Enviar</button>
        {/* <button type="button" onClick={() => setOpenModal(false)} className="flex w-full justify-center rounded-md bg-gradient-to-r from-red-500 to-red-300 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:from-red-300 hover:to-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Cancelar</button> */}
      </div>
      <Toaster />
    </form>
  )
}