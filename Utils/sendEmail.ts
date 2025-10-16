import nodemailer from "nodemailer";


export const sendEmail=async(to:string,subject:string,html:string)=>{
    try{
const x= nodemailer.createTransport({

    service:"gmail",
    auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS,
}
})

await x.sendMail({
    from:process.env.EMAIL_USER,
    to,
    subject,
    html,

})

console.log("Email sent successfully to",to);
}

catch(e)
{
    console.log("Error sending email",e);

}
}