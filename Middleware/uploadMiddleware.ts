import multer from 'multer';
import path from 'path';
import fs from "fs";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ensure the folder exists
const uploadDir = path.join(__dirname,"../upload");
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,uploadDir);
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname));
    },
});

const fileFilter = (req:any,file:any,cb:any)=>{
    if(
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === "image/jpg"
    ){
        cb(null,true);
    }else{
        cb(new Error('only jpg,png,jpeg is allowed !!'),false);

    }
};
export const upload = multer({storage,fileFilter});