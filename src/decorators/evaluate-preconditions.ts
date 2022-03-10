import { FastifyRequest } from 'fastify'

export function _evaluatePreconditions(
  serverEtag: string | undefined,
  serverDate: number | undefined,
  clientEtag: string | undefined,
  clientDate: string | undefined
): boolean {
  if (clientEtag) {
    return clientEtag === serverEtag
  } else if (clientDate) {
    return new Date(clientDate).getTime() === serverDate
  } else {
    return false
  }
}

export function evaluatePreconditions(
  this: FastifyRequest,
  lastModifiedAt: number,
  etag: string
): boolean {
  try {
    if (this.method === 'GET') {
      return _evaluatePreconditions(
        etag,
        lastModifiedAt,
        this.headers['if-none-match'],
        this.headers['if-modified-since']
      )
    } else if (this.method === 'PUT' || this.method === 'DELETE') {
      return _evaluatePreconditions(
        etag,
        lastModifiedAt,
        this.headers['if-match'],
        this.headers['if-unmodified-since']
      )
    }
  } catch (e) {
    return false
  }

  return false
}
