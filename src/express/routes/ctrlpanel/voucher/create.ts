import axios from 'axios'
import { type Request, type Response } from 'express'
import randomstring from 'randomstring'

interface createCtrlPanelVoucher {
  user: { id: string, name: string }
  guild: { id: string, name: string }
  credits: number
  price: number
  name: string
  token: string
  url: string
}
class CreateVoucher {
  /**
    * Recebe solicitações para a criação de vouchers
    */
  public async post (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> {
    const { user, credits, price, name, url, token } = req.body as createCtrlPanelVoucher
    const pass = randomstring.generate({ length: 36 })
    const code = pass.toString()
    console.log(req.body)

    try {
      if (
        typeof user !== 'object' ||
        typeof credits !== 'number' ||
        typeof price !== 'number' ||
        typeof name !== 'string' ||
        typeof url !== 'string' ||
        typeof token !== 'string'
      ) {
        console.log('Missing required fields')
        return res.status(400).json({
          error: 'Bad Request: Missing required fields',
          status: 400
        })
      }
      const postData = {
        memo: `${user.name} (ID: ${user.id}) comprou créditos no valor de R$${price}`,
        code,
        uses: 1,
        credits
      }

      const { data, status } = await axios.post(url + '/api/vouchers', postData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      if (status === 201 && data.status === 'VALID') {
        res.status(201).json({
          code,
          id: data.id
        })
      } else {
        return res.status(500).json({
          error: 'A função createVoucher não retornou corretamente o code e id',
          status: 500
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({
        status: 500,
        message: 'Houve um erro na requisição'
      })
    }
  }
}

export const Root = new CreateVoucher()
