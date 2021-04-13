import Axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { readPackageUpSync as readPkg } from 'read-pkg-up'
import { IMGUR_CLID } from '~env'

const pkg = readPkg()
const name = pkg?.packageJson.name ?? 'dreddit'
const version = pkg?.packageJson.version ?? 'Unknown'

const common: AxiosRequestConfig = {
  headers: {
    'User-Agent': `${name}/v${version}`,
  },
}

export const redditAxios = Axios.create({
  ...common,
  baseURL: 'https://www.reddit.com/',
})

export const imgurAxios = Axios.create({
  baseURL: 'https://api.imgur.com/3/',
  headers: {
    ...common.headers,
    Authorization: `Client-ID ${IMGUR_CLID}`,
  },
})

// @ts-expect-error
export const isAxiosError: (error: unknown) => error is AxiosError = error => {
  if (typeof error !== 'object') return false
  if (error === null) return false

  // @ts-expect-error
  return error.isAxiosError === true
}
