import yup from "yup";


export const registerSchema = yup.object({
  firstname: yup.string().min(3).max(30).required("Firstname is required"),
  lastname: yup.string().min(3).max(30).required("Lastname is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneno: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .test((value) => {
      if (!value) return true;

      // if all digits are same reject
      if (/^(\d)\1+$/.test(value)) return false;

      //if all digits are 0
      if (/^0/.test(value)) return false;

      //if 4+ values are same reject
      if (/(.)\1{4,}/.test(value)) return false;

      return true;
    })
    .required("Phone number is required"),
  photo: yup
    .string()
    .matches(/\.(jpeg|jpg|png|gif)$/i, "photo must be an image URL")
    .required("Photo is required"),
  isActive: yup.boolean(),
  password: yup
    .string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters long and include uppercase, lowercase, number and special character"
    )
    .required("Password is required"),
});




export const updateSchema = yup.object({
  firstname: yup.string().min(3).max(30),
  lastname: yup.string().min(3).max(30),
  email: yup
    .string()
    .email("Invalid email format"),
  phoneno: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .test((value) => {
      if (!value) return true;

      // if all digits are same reject
      if (/^(\d)\1+$/.test(value)) return false;

      //if all digits are 0
      if (/^0/.test(value)) return false;

      //if 4+ values are same reject
      if (/(.)\1{4,}/.test(value)) return false;

      return true;
    }),
  photo: yup
    .string()
    .matches(/\.(jpeg|jpg|png|gif)$/i, "photo must be an image URL")
   ,
  isActive: yup.boolean(),
  password: yup
    .string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters long and include uppercase, lowercase, number and special character"
    )
    
});

export const loginSchema = yup.object({
   email:yup.string().email("Invaild email format").required("Email is required"),
   password:yup.string().required("Password is required"),

})