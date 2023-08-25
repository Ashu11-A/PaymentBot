import { Request, Response } from "express";

class Home {
    /**
     * Home Page
     */
    public get(req: Request, res: Response) {
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        try {
            return res.json({
                status: 200,
                your_ip: ipAddress
            })
        } catch {
            return res.json({
                status: 500,
                your_ip: ipAddress
            })
        } finally {
            console.log(`Alguem acessou o router: ${req.originalUrl} no ip ${ipAddress}`)
        }
        
    }
}

export const Root = new Home()