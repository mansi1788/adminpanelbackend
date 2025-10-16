import express  from "express";
import { emailcontroller, isActivecontroller, phonenoconroller, rolecontroller, searchcontroller } from "../Controller/searchController.ts";
const searchroute = express.Router();

searchroute.post("/api/usernamesearch",searchcontroller);
searchroute.post("/api/emailsearch",emailcontroller);
searchroute.post("/api/phonenosearch",phonenoconroller);
searchroute.post("/api/rolesearch",rolecontroller);
searchroute.post("/api/isactive",isActivecontroller);

export default searchroute;