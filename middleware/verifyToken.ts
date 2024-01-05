import { Response, Request } from "express";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response, next: () => void) => {
  let authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    req.body.user = null;
    next();
  } else {
    let token = authHeader.split(" ")[1];

    jwt.verify(
      token,
      process.env.API_SECRET as string,
      function (err, decode: any) {
        if (err) {
          console.error("JWT Verification Error:", err);
          return res.status(401).json({ error: "Unauthorized" });
        }
        req.body.user = decode;
        next();
      }
    );
  }
};
export default verifyToken;
