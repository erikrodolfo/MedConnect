import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'

export interface CustomRequest extends Request {
  usuario?: any
}

export function autenticarToken(req: CustomRequest, res: Response, next: NextFunction) {
    //obtendo o token do header authorization
    const authHeader = req.headers['authorization'] 

    //extraindo token (formato: Bearer)
    const token = authHeader && authHeader.split(' ')[1]

    if(!token) {
        return res.status(401).json({
            erro: 'Acesso Negado. Token Ausente'
        })
    }

    //verificando se o token é válido e nao expirou
    jwt.verify(token, process.env.JWT_SECRET as string, (err, usuario) => {
        if(err) {
            return res.status(401).json({
                erro: 'Token inválido ou expirado'
            })
        }

        //injetando os dados do usuário decodificados dentro do req
        req.usuario = usuario;

        //seguindo em frente para o controller
        next()
    })
}

export function verificarAdmin(req: CustomRequest, res: Response, next: NextFunction) {
    const perfilUsuario = req.usuario?.role

    if (perfilUsuario !== 'ADMIN') {
        return res.status(403).json({ 
            erro: 'Acesso negado. Apenas administradores pode realizar esta ação.'
         })
    }
    next()
}