
// import { User } from "../Model/userModel.ts";

import { User } from "../Model/userModel.ts";

// export const updateUser=async(id:number,data:{username?:string, email?:string, phoneno?:string, photo?:string })=>{
//    const user = await User.findByPk(id);
//    if(!user)
//    {
//     console.log("User not found in db");
//     return null;
//    }

// //    if(Object.keys(data).length>0){
// //     const [updatedRows] = await User.update(data,{where:{id},logging:console.log});
// //     console.log("Updated Rows:", updatedRows);
// //    }


//     const [updatedRows] = await User.update(data,{ where:{id},logging: console.log});
//     console.log(id);
//     console.log(data)
//     console.log("Updated Rows:", updatedRows);

//     if(updatedRows == 0)
//     {
//         console.log("User not found or no changes made");
//        return await User.findByPk(id);
//     }

//     // return await User.findByPk(id);

//     const userBefore = await User.findByPk(id);
//     console.log("Before update:", userBefore?.toJSON());


//     const userAfter = await User.findByPk(id);
//     console.log("After update:", userAfter?.toJSON());
    



// }

export const updateUser = async (
  id: number,
  data: { firstname?: string;lastname?:string; email?: string; phoneno?: string; photo?: string }
) => {
  const userBefore = await User.findByPk(id);
  if (!userBefore) {
    console.log("User not found in DB");
    return null;
  }

 // console.log("Before update:", userBefore.toJSON());

  const updateData: any = {};
  Object.keys(data).forEach((key) => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  if (Object.keys(updateData).length === 0) {
    console.log("No fields provided to update");
    return userBefore;
  }

  const [updatedRows] = await User.update(updateData, { where: { id }, logging: console.log });
  console.log("Updated Rows:", updatedRows);

  // Always fetch the updated record to return
  const userAfter = await User.findByPk(id);
  //console.log("After update:", userAfter?.toJSON());

  return userAfter; // ✅ always return the updated record
};
