import { type Request, type Response } from 'express'
import { MercadoPagoConfig, Payment } from 'mercadopago'

class CreatePayment {
  /**
     * post
     */
  public async post (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> {
    const { userName, userId, mpToken, valor, method, ipn, infoPayment } = req.body

    if (
      userName === undefined ||
        userId === undefined ||
        mpToken === undefined ||
        valor === undefined ||
        method === undefined ||
        ipn === undefined ||
        infoPayment === undefined
    ) {
      return res.status(400).json({
        error: 'Bad Request: Missing required fields',
        status: 400
      })
    }

    try {
      const client = new MercadoPagoConfig({ accessToken: mpToken })

      const date = new Date()
      date.setDate(date.getDate() + 3)
      const isoDate = date.toISOString()

      const payment = await new Payment(client).create({
        body: {
          payer: {
            first_name: userName,
            last_name: userId,
            email: `${userName}@gmail.com`
          },
          additional_info: {
            items: [
              {
                id: userId,
                title: 'Pagamento Via Discord',
                description: `${userName} | R$${valor.toFixed(2)}`,
                unit_price: valor,
                quantity: 1,
                currency_id: 'BRL'
              }
            ]
          },
          payment_method_id: method,
          installments: 1,
          notification_url: ipn ?? undefined,
          metadata: {
            userId,
            price: valor,
            ...infoPayment
          },
          date_of_expiration: isoDate
        }
      })
      const dateStr = (payment.date_of_expiration ?? isoDate)
      const expirationDate = new Date(dateStr)
      expirationDate.setMinutes(expirationDate.getMinutes())
      const unixTimestamp = Math.floor(expirationDate.getTime() / 1000)

      return res.status(200).json({ unixTimestamp, payment })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        code: 500,
        message: 'Houve um erro na solicitação.'
      })
    }
  }
}

export const Root = new CreatePayment()
