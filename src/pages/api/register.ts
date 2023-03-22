import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken"

const uri = process.env.NEXT_PUBLIC_MONGODB_URI || ""
const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || ""

async function registerUser(userData: any) {
    const client = await MongoClient.connect(uri)
    const users = client.db("mydatabase").collection("users")
    const result = await users.insertOne({ role: 1, ...userData })
    console.log(`User with id ${result.insertedId} created!`)
    client.close()
    return result
}

async function registerWithToken(userData: any, token: string) {
    try {
        const decoded = jwt.verify(token, jwtSecret)
        const result = await registerUser(userData)
        return result
    } catch (error) {
        console.log(error)
        throw new Error("Invalid token");
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const userData = req.body
        const token = req.headers.authorization?.replace("Bearer ", "")
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized" })
            return
        }
        try {
            const result = await registerWithToken(userData, token)
            res.status(201).json({ success: true, message: `User created with ID: ${result.insertedId}`})
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: (error as any).message })
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed" })
    }
}

// WITHOUT JWT
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method === "POST") {
//         const userData = req.body;
//         try {
//             const result = await registerUser(userData);
//             res.status(201).json({ success: true, message: `User create with ID ${result.insertedId}`});
//         } catch (error) {
//             console.log(error);
//             res.status(500).json({ success: false, message: "Failed to create user"})
//         }
//     } else {
//         res.status(405).json({ success: false, message: "Method not allowed"});
//     }
// }