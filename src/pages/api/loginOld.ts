import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || "mysecret"

const token = jwt.sign({ userId: 123 }, jwtSecret)
console.log(token);

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const loginData = req.body
        if (!loginData.password) {
            res.status(401).json({ success: false, message: "Password must be filled!" })
            return
        }
        if (loginData.password !== "senhawithbackend") {
            res.status(401).json({ success: false, message: "Wrong password!" })
            return
        } else {
            try {
                const token = jwt.sign({ userId: 123 }, jwtSecret)
                res.status(201).json({ success: true, message: { message: "Logged in!", token: token }})
            } catch (error) {
                console.log(error)
                res.status(500).json({ success: false, message: (error as any).message })
            }
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed" })
    }
}