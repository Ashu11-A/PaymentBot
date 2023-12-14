import axios from 'axios'
import { type Request, type Response } from 'express'

class PaymentCancel {
  /**
    * Faz uma solicitação ao Mercado Pago para cancelar o pagamento
    */
  public async post (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    const { mpToken, paymentId } = req.body

    const paymentCancel: { status: string, id: string, items: object, transaction_details: string } = await axios.put(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mpToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    })
    const { status, id, items, transaction_details: transactionDetails } = paymentCancel

    if (status === 'cancelled') {
      return res.status(200).json({
        code: 200,
        id,
        status,
        items,
        transactionDetails
      })
    } else {
      return res.status(500).json({
        code: 500,
        message: 'Houve um erro na requisição'
      })
    }
  }
}
export const Root = new PaymentCancel()
