import * as yup from "yup"

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const LoginSchema = yup
  .object({
    username: yup
      .string()
      .required('Campo requerido'),
    password: yup
      .string()
      .required('Campo requerido')
  })

export const RegisterSchema = yup
  .object({
    username: yup
      .string()
      .required('Campo requerido')
      .min(3, "3 caracteres mínimo."),
    name: yup
      .string()
      .required('Campo requerido'),
    identificationCard: yup
      .string()
      .required('Campo requerido'),
    phone: yup
      .string()
      .required('Campo requerido'),
    email: yup
      .string()
      .required('Campo requerido')
      .trim()
      .matches(emailRegex , 'Ingresa un correo válido'),
    country: yup
      .string()
      .required('Campo requerido'),
    state: yup
      .string()
      .required('Campo requerido'),
    city: yup
      .string()
      .required('Campo requerido'),
    password: yup
      .string()
      .required('Campo requerido')
      .min(8, "8 caracteres mínimo"),
    passwordConfirm: yup
      .string()
      .required('Campo requerido')
      .min(8, "8 caracteres mínimo")
      .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
  })

  export const RegisterDashboardSchema = yup
  .object({
    username: yup
      .string()
      .required('Campo requerido')
      .min(3, "3 caracteres mínimo."),
    role: yup
      .string()
      .required('Campo requerido'),
    name: yup
      .string()
      .required('Campo requerido'),
    identificationCard: yup
      .string()
      .required('Campo requerido'),
    phone: yup
      .string()
      .required('Campo requerido'),
    email: yup
      .string()
      .required('Campo requerido')
      .trim()
      .matches(emailRegex , 'Ingresa un correo válido'),
    country: yup
      .string()
      .required('Campo requerido'),
    state: yup
      .string()
      .required('Campo requerido'),
    city: yup
      .string()
      .required('Campo requerido'),
  })

export const CreateProviderSchema = yup
.object({
  name: yup
    .string()
    .required('Campo requerido'),
  description: yup
    .string(),
  duration: yup
    .number()
    .required('Campo requerido')
    .typeError('Debe ser un número')
    .moreThan(0, "El precio debe ser mayor a cero"),
  price: yup
    .number()
    .required('Campo requerido')
    .typeError('Debe ser un número')
    .moreThan(0, "El precio debe ser mayor a cero"),
  image: yup
    .mixed()
})

export const CreateProfileSchema = yup
.object({
  idStreamingAccount: yup
    .string()
    .required('Campo requerido'),
    profileUser: yup
    .string()
    .required('Campo requerido'),
    profileKey: yup
    .string()
    .required('Campo requerido'),
    principal: yup
    .boolean()
})

export const ZinliSchema = yup
.object({
  name: yup
    .string()
    .required('Campo requerido'),
  email: yup
    .string(),
  reference: yup
    .string()
    .required('Campo requerido')
})

export const RechargeSchema = yup
.object({
  provider: yup.string(),
  name: yup.string()
    .required('Campo requerido'),
  description: yup.string(),
  image: yup.mixed(),
  prices: yup.string()
    .required('Campo requerido'),
})

export const LicenseSchema = yup
.object({
  provider: yup.string(),
  name: yup.string()
    .required('Campo requerido'),
  description: yup.string(),
  image: yup.mixed(),
  price: yup.number()
    .required('Campo requerido')
    .typeError('Debe ser un número')
    .moreThan(0, "El precio debe ser mayor a cero"),
  duration: yup.number()
    .required('Campo requerido')
    .typeError('Debe ser un número')
    .moreThan(0, "La duración debe ser mayor a cero"),
})

export const MarketingSchema = yup
.object({
  provider: yup.string(),
  name: yup.string()
    .required('Campo requerido'),
  description: yup.string(),
  image: yup.mixed(),
  price: yup.number()
    .required('Campo requerido')
    .typeError('Debe ser un número')
    .moreThan(0, "El precio debe ser mayor a cero"),
  duration: yup.number()
    .required('Campo requerido')
    .typeError('Debe ser un número')
    .moreThan(0, "La duración debe ser mayor a cero"),
})

export const CreateLicenseSchema = yup
.object({
  providerId: yup
    .string()
    .required('Campo requerido'),
  user: yup
    .string()
    .required('Campo requerido'),
  key: yup
    .string()
    .required('Campo requerido'),
})