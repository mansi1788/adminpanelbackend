import db from "../Config/db";

export const updateUser = async (
  id: number,
  data: { firstname?: string;
    lastname?:string; 
    email?: string; 
    
    phoneno?: string; photo?: string }
) => {
  const userBefore = await db("user").where(id).first();
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

  const updatedRows = await db("user").where({id}).update(updateData);
  console.log("Updated Rows:", updatedRows);

  // Always fetch the updated record to return
  const userAfter = await db("user").where(id).first();
  //console.log("After update:", userAfter?.toJSON());

  return userAfter; // ✅ always return the updated record
};
