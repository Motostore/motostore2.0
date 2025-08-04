"use client";

import { Animation } from "@/app/components/InputErrors";
import { fetchCreateProduct, fetchProductsByType, fetchUpdateProduct } from "@/app/lib/products.service";
import { CreateLicenseSchema, CreateProfileSchema } from "@/app/utils/schemas";
import { input_tailwind, label_input } from "@/app/utils/tailwindStyles";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";

const schema = CreateLicenseSchema;

export default function Form({ license }) {

  const router = useRouter();
  const licensePath = "license";
  const providerPath = "license/provider";
  const redirectPath = "/dashboard/products/licenses/manage/"
  const [providers, setProviders] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      providerId: license ? license?.providerId : "",
      user: license ? license?.user : "",
      key: license ? license?.key : "",
    },
    resolver: yupResolver(schema),
  });

  const requiredField = {
    value: true,
    message: "Campo requerido",
  };

  const options = [...providers]
    .filter((item) => item.status === true)
    .map((item) => {
      return {
        value: item.id,
        name: `${item.id}- ${
          item.name ? item.name : "Sin descripción"
        }`,
      };
    });

  useEffect(() => {
    getProviders();
  }, []);

  async function getProviders() {
    const result = await fetchProductsByType(providerPath);
    // Me los devuelve paginados
    setProviders(result.content);
  }

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    const providerId = data["providerId"];
    const user = data["user"];
    const key = data["key"];

    let body: any = {
        providerId,
        user,
        key
    };

    let httpMethod = "POST";
    let response;

    if (license) {
      httpMethod = "PUT";
      response = await fetchUpdateProduct(license.id, JSON.stringify(body), licensePath);
    } else {
      response = await fetchCreateProduct(JSON.stringify(body), licensePath);
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
            <label className={label_input} htmlFor="providerId">
              Licencia
            </label>
            <Animation errors={errors} field="providerId" />
            <select
              {...register("providerId", { required: requiredField })}
              id="providerId"
              className={`${input_tailwind} text-gray-500`}
            >
              <option value={"DISABLED"} disabled>
                Licencia
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label_input} htmlFor="user">
              Usuario
            </label>
            <Animation errors={errors} field="user" />
            <input
              {...register("user")}
              id="user"
              type="text"
              placeholder="Usuario"
              className={`${input_tailwind} text-gray-900`}
            />
          </div>
          <div>
            <label className={label_input} htmlFor="key">
              Clave
            </label>
            <Animation errors={errors} field="key" />
            <input
              {...register("key")}
              id="key"
              type="text"
              placeholder="Clave"
              className={`${input_tailwind} text-gray-900`}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onSubmit}
            className="flex w-full md:w-fit justify-center rounded-md bg-green-500 hover:bg-green-400 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            {license ? "Editar" : "Agregar"}
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
