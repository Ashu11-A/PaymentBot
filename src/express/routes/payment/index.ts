import axios from 'axios'
import { type Request, type Response } from 'express'

class Payment {
  /**
     * Verifica o status de pagamento
     */
  public async post (req: Request, res: Response): Promise<any> {
    const { mpToken, paymentId } = req.body

    if (mpToken === undefined || paymentId === undefined) {
      return res.status(400).json({
        error: 'Bad Request: Missing required fields',
        status: 400
      })
    }

    try {
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${mpToken}`
        }
      })

      return res.status(200).json({
        code: 200,
        status: response.data.status
      })
    } catch (err) {
      console.log(err)
      return res.status(500)
    }
  }
}

export const Root = new Payment()
