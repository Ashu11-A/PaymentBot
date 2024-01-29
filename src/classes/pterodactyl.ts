import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { type UserObject, type EggObject, type NestObject } from './interfaces'
import { core } from '@/app'

export class Pterodactyl {
  private readonly url
  private readonly token
  private readonly tokenUser
  constructor (options: {
    url: string
    token: string
    tokenUser?: string
  }) {
    this.url = options.url
    this.token = options.token
    this.tokenUser = options.tokenUser
    this.showLog()
  }

  /**
    * @return PendingRequest
    */
  private client (): AxiosInstance {
    const { token, url } = this
    return axios.create({
      baseURL: `${url}/api`,
      method: 'POST',
      maxRedirects: 5,
      headers: {
        Accept: 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
    * @return PendingRequest
    */
  private clientAdmin (): AxiosInstance {
    const { url, tokenUser } = this
    return axios.create({
      baseURL: `${url}/api`,
      method: 'POST',
      maxRedirects: 5,
      headers: {
        Accept: 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUser}`
      }
    })
  }

  private showLog (): void {
    core.info(`Requicição para ${this.url}`)
  }

  public async getNests (): Promise<NestObject[] | undefined> {
    try {
      return await this.client().get('application/nests?per_page=999')
        .then(async (res) => {
          if (res.status === 200) {
            return res.data.data as NestObject[]
          }
        })
    } catch (err) {
      console.log(err)
    }
  }

  public async getEggs (nestId: string | number): Promise<EggObject[] | undefined> {
    try {
      return await this.client().get(`application/nests/${nestId}/eggs`)
        .then(async (res) => {
          return res.data.data as EggObject[]
        })
    } catch (err) {
      console.log(err)
    }
  }

  public async user (options: {
    userId?: string | number
    data?: {
      email: string
      username: string
      first_name: string
      last_name: string
      password?: string
    }
    type: 'create' | 'update' | 'delete'
  }): Promise<UserObject | number | undefined | AxiosError<any, any>> {
    try {
      const { type, data, userId } = options

      switch (type) {
        case 'create':
          return await this.client().post('application/users', data)
            .then(async (res) => {
              return res.data as UserObject
            })
        case 'update':
          return await this.client().patch(`application/users/${userId}`, data)
            .then(async (res) => {
              return res.data as UserObject
            })
        case 'delete':
          return await this.client().delete(`application/users/${userId}`)
            .then(async (res) => {
              return res.status
            })
      }
    } catch (err: any | Error | AxiosError) {
      console.log(err)
      if (axios.isAxiosError(err)) {
        return err
      }
    }
  }
}
