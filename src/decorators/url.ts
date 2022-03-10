import { FastifyRequest } from 'fastify'

export function fullUrl(this: FastifyRequest): string {
  return this.baseUrl() + this.url
}

export function baseUrl(this: FastifyRequest): string {
  return typeof this.server.baseUrl === 'undefined'
    ? this.protocol + '://' + this.hostname + this.server.prefix
    : this.server.baseUrl + this.server.prefix
}

export function absoluteUrl(this: FastifyRequest, url: string): string {
  return url.charAt(0) !== '/' ? this.baseUrl() + '/' + url : this.baseUrl() + url
}

export function fillInPlaceholder(pattern: string, data: Record<string, any>): string {
  return pattern.replace(
    /{.*?}/g,
    (substring: string) => data[substring.substring(1, substring.length - 1)]
  )
}
