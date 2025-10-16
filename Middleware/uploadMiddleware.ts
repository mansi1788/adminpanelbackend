import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"upload/");
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