import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGODB_URI || ""

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {

        const client = new MongoClient(uri)

        try {
            await client.connect();
            const db = client.db("mydatabase")
            const collection = db.collection("users")

            const count = await collection.countDocuments()

            if (count === 0) {
                throw new Error("Não foram encontrados dados.");
            }

            
            const users = await collection.find({}, { projection: { password: 0 }}).toArray()
            
            const filteredUsers = users.map((user: any) => (
                {
                    name: user.name,
                    email: user.email,
                    isAdm: user.role ? user.role === 1 ? true : false : false 
                }
            ))

            res.status(200).json({ success: true, data: filteredUsers })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: "Erro ao buscar usuários" })
        } finally {
            await client.close()
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed" })
    }
}