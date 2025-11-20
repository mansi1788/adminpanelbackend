import * as yup from "yup";


const emojiRegex =
  /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF])/;
const lettersAndSpacesRegex = /^[A-Za-z ]*$/;

export const registerSchema = yup.object({
  firstname: yup
    .string()
    .trim()
    .min(3, "Minimum 3 characters")
    .max(30, "Maximum 30 characters")
    .test("no-emoji", "Emojis are not allowed", (value) => !(value && emojiRegex.test(value)))
    .test(
      "letters-only",
      "Only letters and spaces are allowed",
      (value) => !(value && !lettersAndSpacesRegex.test(value))
    )
    .required("Firstname is required"),

    
  lastname: yup
    .string()
    .trim()
    .min(3, "Minimum 3 characters")
    .max(30, "Maximum 30 characters")
    .test("no-emoji", "Emojis are not allowed", (value) => !(value && emojiRegex.test(value)))
    .test(
      "letters-only",
      "Only letters and spaces are allowed",
      (value) => !(value && !lettersAndSpacesRegex.test(value))
    )
    .required("Lastname is required"),

  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .test("no-emoji", "Emojis are not allowed", (value) => !emojiRegex.test(value || ""))
    .required("Email is required"),

  phoneno: yup
    .string()
    .trim()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .test("no-emoji", "Emojis are not allowed", (value) => !emojiRegex.test(value || ""))
    .test(
      "phone-validation",
      "Invalid phone number",
      (value: string | undefined) => {
        if (!value) return true;
        if (/^(\d)\1+$/.test(value)) return false; // all same digits
        if (/^0/.test(value)) return false; // starts with 0
        if (/(.)\1{4,}/.test(value)) return false; // 4+ repeated
        return true;
      }
    )
    .required("Phone number is required"),

  isActive: yup.boolean().required(),
  
  roles: yup
    .string()
    .trim()
    .required("Role is required"),
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
 
  photo: yup.mixed().notRequired(),

  isActive: yup.boolean(),
  password: yup
    
    // .matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //   "Password must be at least 8 characters long and include uppercase, lowercase, number and special character"
    // )
    .mixed().notRequired(),

    
});

export const loginSchema = yup.object({
   email:yup.string().email("Invaild email format").required("Email is required"),
   password:yup.string().required("Password is required"),

})