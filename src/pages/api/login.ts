import { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import { MongoClient } from "mongodb"

const uri = process.env.NEXT_PUBLIC_MONGO_DB_CONNECTION_STRING || ""
const client = new MongoClient(uri)
const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || "mysecret"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email, password } = req.body;

    try {
        // Conecta ao banco de dados MongoDB
        await client.connect()
        const users = client.db("mydatabase").collection("users")

        // Verifica se o usuário existe no banco de dados
        const user = await users.findOne({ email })

        if (!user) {
            return res.status(401).json({ success: false, message: "Usuário não encontrado." })
        }

        // Verifica se a senha está correta
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: "Dados incorretos." })
        }

        // Gera um token de acesso
        const token = jwt.sign({ userId: user._id, userName: user.name }, jwtSecret, { expiresIn: '1h' })

        res.status(200).json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Erro ao realizar login." })
    } finally {
        // Fecha a conexão com o banco de dados
        await client.close()
    }
}