import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number } & JwtPayload; // user object from JWT
    }
  }
}
