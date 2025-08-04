"use client";

import { Animation } from "@/app/components/InputErrors";
import { fetchCreateProduct, fetchProductsByType, fetchUpdateProduct } from "@/app/lib/products.service";
import { CreateProfileSchema } from "@/app/utils/schemas";
import { input_tailwind, label_input } from "@/app/utils/tailwindStyles";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";

const schema = CreateProfileSchema;

export default function Form({ profile }) {

  const router = useRouter();
  const profilePath = "streaming/profile";
  const accountPath = "streaming/account";
  const redirectPath = "/dashboard/products/accounts/profiles/"
  const [accounts, setAccounts] = useState([]);


  const requiredField = {
    value: true,
    message: "Campo requerido",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      idStreamingAccount: profile ? profile?.idStreamingAccount : "",
      profileUser: profile ? profile?.profileUser : "",
      profileKey: profile ? profile?.profileKey : "",
      principal: profile ? profile?.principal : false,
    },
    resolver: yupResolver(schema),
  });

  const { data: session } = useSession();


  const options = [...accounts]
    .filter((item) => item.status === true)
    .map((item) => {
      return {
        value: item.id,
        name: `${item.id}- ${
          item.description ? item.description : "Sin descripción"
        }`,
      };
    });

  useEffect(() => {
    getAccounts();
  }, []);

  async function getAccounts() {
    const result = await fetchProductsByType(accountPath);
    setAccounts(result.content);
  }

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    const idStreamingAccount = data["idStreamingAccount"];
    const profileUser = data["profileUser"];
    const profileKey = data["profileKey"];
    //Validar que no exista otro principal
    //const principal = data['principal']

    let body: any = {
      idStreamingAccount,
      profileUser,
      profileKey,
      //principal
    };

    let httpMethod = "POST";
    let response;
    if (profile) {
      httpMethod = "PUT";
      body = { ...body, id: profile.id };
      response = await fetchUpdateProduct(profile.id, JSON.stringify(body), profilePath);
    } else {
      response = await fetchCreateProduct(JSON.stringify(body), profilePath);
    }

    if (response.ok) {
      router.push(redirectPath);
    } else {
      console.log('Ha ocurrido un error')
    }
  });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      noValidate
      autoComplete="off"
      className="space-y-4 mb-4"
    >
      <div className="w-full md:w-fit border-2 border-gray-300 rounded-lg py-6 px-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col w-full">
            <label className={label_input} htmlFor="idStreamingAccount">
              Cuenta
            </label>
            <Animation errors={errors} field="idStreamingAccount" />
            <select
              {...register("idStreamingAccount", { required: requiredField })}
              id="idStreamingAccount"
              className={`${input_tailwind} text-gray-500`}
            >
              <option value={"DISABLED"} disabled>
                Cuenta
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label_input} htmlFor="profileUser">
              Usuario
            </label>
            <Animation errors={errors} field="profileUser" />
            <input
              {...register("profileUser")}
              id="profileUser"
              type="text"
              placeholder="Usuario"
              className={`${input_tailwind} text-gray-900`}
            />
          </div>
          <div>
            <label className={label_input} htmlFor="profileKey">
              Clave
            </label>
            <Animation errors={errors} field="profileKey" />
            <input
              {...register("profileKey")}
              id="profileKey"
              type="text"
              placeholder="Clave"
              className={`${input_tailwind} text-gray-900`}
            />
          </div>
          <div className="flex justify-between">
            <div>
              <Animation errors={errors} field="principal" />
              <div className=" flex items-center gap-2">
                <label className="text-gray-500" htmlFor="principal">
                  Matriz
                </label>
                <input
                  id="principal"
                  type="checkbox"
                  {...register("principal")}
                />
              </div>
            </div>
            {profile && profile.client ? (
              <div className="text-gray-500">
                Asignado al cliente: {profile?.client?.name}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onSubmit}
            className="flex w-full md:w-fit justify-center rounded-md bg-green-500 hover:bg-green-400 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            {profile ? "Editar" : "Agregar"}
          </button>
        </div>
      </div>
      <Toaster
        containerStyle={{
          position: "absolute",
        }}
      />
    </form>
  );
}
