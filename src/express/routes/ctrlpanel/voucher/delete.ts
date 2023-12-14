import axios from 'axios'
import { type Request, type Response } from 'express'

interface deleteCtrlPanelVoucher {
  id: string
  token: string
  url: string
}

class Voucher {
  /**
    * Recebe solicitação para deletar vouchers
    */
  public async post (req: Request, res: Response): Promise<any> {
    const { id, url, token } = req.body as deleteCtrlPanelVoucher

    if (
      id === undefined ||
      typeof url !== 'string' ||
      typeof token !== 'string'
    ) {
      console.log('Missing required fields')
      return res.status(400).json({
        error: 'Bad Request: Missing required fields',
        status: 400
      })
    }

    try {
      const response = await axios.delete(`${url}/api/vouchers/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const { data, status } = response

      if (status === 200 && data.status === 'VALID') {
        res.status(200).json({
          status: 200
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({
        status: 500,
        message: 'Houve um problema'
      })
    }
  }
}

export const Root = new Voucher()
