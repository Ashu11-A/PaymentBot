import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { type UserData } from '@/interfaces'

export class CtrlPanel {
  private readonly url
  private readonly token

  constructor ({ url, token }: {
    url: string
    token: string
  }) {
    this.url = url
    this.token = token
  }

  private client (): AxiosInstance {
    return axios.create({
      baseURL: `${this.url}/api`,
      maxRedirects: 5,
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })
  }

  /**
   * Create User
   */
  public async createUser (options: {
    data: {
      name: string
      email: string
      password: string
    }
  }): Promise<UserData | AxiosError<any, any> | undefined> {
    try {
      const { data } = options
      return await this.client().post('/users', data)
        .then((res: { data: UserData }) => { return res.data })
    } catch (err) {
      console.log(err)
      if (axios.isAxiosError(err)) {
        return err
      }
    }
  }
}
