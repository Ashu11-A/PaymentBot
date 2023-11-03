import { type Request, type Response } from 'express'

class PaymentCancel {
  /**
    * Faz uma solicitação ao Mercado Pago para cancelar o pagamento
    */
  public async post (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    const { mpToken, paymentId } = req.body

    const paymentCancel = await (await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${mpToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    })).json()
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
