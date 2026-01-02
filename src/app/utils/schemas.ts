import * as yup from "yup"

// Expresión regular para email (robusta y estándar)
export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// --- LOGIN ---
export const LoginSchema = yup
  .object({
    username: yup
      .string()
      .required('El nombre de usuario es requerido'), // Mensaje completo
    password: yup
      .string()
      .required('La contraseña es requerida') // Mensaje completo
  })

// --- REGISTRO DE CLIENTE (Front-end) ---
export const RegisterSchema = yup
  .object({
    username: yup
      .string()
      .required('El nombre de usuario es requerido')
      .min(3, "Mínimo 3 caracteres."),
    name: yup
      .string()
      .required('El nombre completo es requerido'),
    identificationCard: yup
      .string()
      .required('La cédula/RIF es requerida'),
    phone: yup
      .string()
      .required('El teléfono es requerido'),
    email: yup
      .string()
      .required('El correo electrónico es requerido')
      .trim()
      .matches(emailRegex , 'Ingresa un correo electrónico válido'),
    country: yup
      .string()
      .required('El país es requerido'),
    state: yup
      .string()
      .required('El estado/subdivisión es requerido'),
    city: yup
      .string()
      .required('La ciudad es requerida'),
    password: yup
      .string()
      .required('La contraseña es requerida')
      .min(8, "Mínimo 8 caracteres."),
    passwordConfirm: yup
      .string()
      .required('La confirmación de contraseña es requerida')
      .min(8, "Mínimo 8 caracteres.")
      .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
  })

// --- REGISTRO DASHBOARD (Admin) ---
export const RegisterDashboardSchema = yup
  .object({
    username: yup
      .string()
      .required('El nombre de usuario es requerido')
      .min(3, "Mínimo 3 caracteres."),
    role: yup
      .string()
      .required('El rol es requerido'),
    name: yup
      .string()
      .required('El nombre completo es requerido'),
    identificationCard: yup
      .string()
      .required('La cédula/RIF es requerida'),
    phone: yup
      .string()
      .required('El teléfono es requerido'),
    email: yup
      .string()
      .required('El correo electrónico es requerido')
      .trim()
      .matches(emailRegex , 'Ingresa un correo electrónico válido'),
    country: yup
      .string()
      .required('El país es requerido'),
    state: yup
      .string()
      .required('El estado/subdivisión es requerido'),
    city: yup
      .string()
      .required('La ciudad es requerida'),
  })

// --- CREACIÓN DE PROVEEDORES (Genérico) ---
export const CreateProviderSchema = yup
.object({
  name: yup
    .string()
    .required('El nombre del proveedor es requerido'),
  description: yup
    .string(),
  duration: yup
    .number()
    .required('La duración es requerida')
    .typeError('Debe ser un número válido') // Mensaje estandarizado
    .moreThan(0, "La duración debe ser mayor a cero"),
  price: yup
    .number()
    .required('El precio es requerido')
    .typeError('Debe ser un número válido') // Mensaje estandarizado
    .moreThan(0, "El precio debe ser mayor a cero"),
  image: yup
    .mixed()
})

// --- CREACIÓN DE PERFIL (Streaming/Cuentas) ---
export const CreateProfileSchema = yup
.object({
  idStreamingAccount: yup
    .string()
    .required('El ID de la cuenta es requerido'),
    profileUser: yup
    .string()
    .required('El usuario del perfil es requerido'),
    profileKey: yup
    .string()
    .required('La clave del perfil es requerida'),
    principal: yup
    .boolean()
})

// --- ZINLI (Pasarela de Pago) ---
export const ZinliSchema = yup
.object({
  name: yup
    .string()
    .required('El nombre es requerido'),
  email: yup
    .string(),
  reference: yup
    .string()
    .required('La referencia de pago es requerida')
})

// --- RECARGAS ---
export const RechargeSchema = yup
.object({
  provider: yup.string(),
  name: yup.string()
    .required('El nombre de la recarga es requerido'),
  description: yup.string(),
  image: yup.mixed(),
  prices: yup.string() // Asumo que Prices es un string con formato especial
    .required('El precio de la recarga es requerido'),
})

// --- LICENCIAS ---
export const LicenseSchema = yup
.object({
  provider: yup.string(),
  name: yup.string()
    .required('El nombre de la licencia es requerido'),
  description: yup.string(),
  image: yup.mixed(),
  price: yup.number()
    .required('El precio es requerido')
    .typeError('Debe ser un número válido')
    .moreThan(0, "El precio debe ser mayor a cero"),
  duration: yup.number()
    .required('La duración es requerida')
    .typeError('Debe ser un número válido')
    .moreThan(0, "La duración debe ser mayor a cero"),
})

// --- MARKETING (Promociones) ---
export const MarketingSchema = yup
.object({
  provider: yup.string(),
  name: yup.string()
    .required('El nombre de la promoción es requerido'),
  description: yup.string(),
  image: yup.mixed(),
  price: yup.number()
    .required('El precio es requerido')
    .typeError('Debe ser un número válido')
    .moreThan(0, "El precio debe ser mayor a cero"),
  duration: yup
    .number()
    .required('La duración es requerida')
    .typeError('Debe ser un número válido')
    .moreThan(0, "La duración debe ser mayor a cero"),
})

// --- CREACIÓN DE LICENCIAS (Uso) ---
export const CreateLicenseSchema = yup
.object({
  providerId: yup
    .string()
    .required('El ID del proveedor es requerido'),
  user: yup
    .string()
    .required('El usuario es requerido'),
  key: yup
    .string()
    .required('La clave de licencia es requerida'),
})