import yup from "yup";

export const updateSchema = yup.object({
    username:yup.string().min(3).max(30),
    email:yup.string().email("Invalid email format"),
    phoneno:yup.string().matches(/^[0-9]{10}$/,"Phone number must be 10 digits"),
    photo:yup.string().matches(/\.(jpeg|jpg|png|gif)$/i,"photo must be an image URL"),
    isActive:yup.boolean(),
    password:yup.string().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must be at least 8 characters long and include uppercase, lowercase, number and special character")

})
       

