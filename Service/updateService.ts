
import { User } from "../Model/userModel.ts";

export const updateUser=async(id:number,data:{username?:string, email?:string, phoneno?:string, photo?:string })=>{
   const user = await User.findByPk(id);
   if(!user)
   {
    console.log("User not found in db");
    return null;
   }

   if(Object.keys(data).length>0){
    const [updatedRows] = await User.update(data,{where:{id},logging:console.log});
    console.log("Updated Rows:", updatedRows);
   }


    const [updatedRows] = await User.update(data,{ where:{id},logging: console.log});
    console.log(id);
    console.log(data)
    console.log("Updated Rows:", updatedRows);

    if(updatedRows == 0)
    {
        console.log("User not found or no changes made");
       return await User.findByPk(id);
    }

    // return await User.findByPk(id);

    const userBefore = await User.findByPk(id);
    console.log("Before update:", userBefore?.toJSON());
    



}
