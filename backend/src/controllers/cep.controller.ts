import { Request, Response } from 'express'
import { consultarCep } from "../services/cep.services"

export async function buscarEndereco(req: Request, res: Response) {
    const { cep } = req.params as { cep: string }
    try {
        const endereco = await consultarCep(cep)
        
        // Sempre bom enviar o resultado de volta!
        return res.status(200).json(endereco)
        
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar CEP" })
    }
}