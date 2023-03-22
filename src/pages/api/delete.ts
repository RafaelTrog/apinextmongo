import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.NEXT_PUBLIC_MONGO_DB_CONNECTION_STRING || ""
const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || ""

async function deleteUser(id: string, token: string) {
    const client = await MongoClient.connect(uri)
    const db = client.db("mydatabase")
    
    try {
        const decoded = jwt.verify(token, jwtSecret)

        if (!ObjectId.isValid(id)) {
            throw new Error("Invalid ID");
        }

        const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) })

        if (result.deletedCount === 0) {
            console.log("NENHUM ENCONTRADO")
            throw new Error(`User with ID ${id} was not found`)
        }

        return result
    } catch (error) {
        console.log(error)
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Unauthorized");
        } else {
            throw error;
        }
    } finally {
        client.close()
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "DELETE") {
        const userData = req.body || req.query
        const userId = userData.id

        if (!userId) {
            res.status(422).json({ success: false, message: "Missing ID" })
        }

        const token = req.headers.authorization?.replace("Bearer ",  "")

        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized" })
            return
        }

        try {
            const result = await deleteUser(userId, token)
            res.status(201).json({ success: true, message: `User deleted with ID: ${userId}`})
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: (error as any).message })
        }

    } else {
        res.status(405).json({ success: false, message: "Method not allowed" })
    }
}