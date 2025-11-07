import yup from "yup";

export const updateroleSchema = yup.object({
  role_name: yup.string().min(3).max(30),
  description: yup
    .string(),
  isActive: yup.boolean(),
});