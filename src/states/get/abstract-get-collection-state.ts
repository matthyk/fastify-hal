import { AbstractState } from '../abstract-state'
import { IModel } from '../../model'
import { AbstractPagination, PaginationResult } from '../../pagination'
import { RequestModel } from '../request-model'

export abstract class AbstractGetCollectionState<
  Model extends IModel,
  P,
  Request extends RequestModel = {}
> extends AbstractState<Model, Request> {
  protected databaseResult: Model[] = []

  protected paginationResult: PaginationResult<P>

  protected pagination: AbstractPagination<P>

  protected paginationUrls: PaginationResult<string>

  protected current: P

  public override async build(): Promise<void> {
    this.current = this.extractCurrent()

    await this.before()

    try {
      this.databaseResult = await this.loadModelsFromDatabase()
    } catch (e) {
      this.error(`Error while fetching the resources from the database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    await this.after(this.databaseResult)

    this.defineHttpCaching()

    this.pagination = this.definePagination()

    this.paginationResult = this.pagination.build()

    this.buildPaginationUrls()

    this.definePaginationResponse()

    this.defineProperties()

    await this.defineLinks()

    await this.defineEmbedded()

    this.reply.status(200)

    this.defineHttpResponse()

    return this.reply.send(this.resourceObject)
  }

  protected after(_models: Model[]): Promise<void> | void {}

  protected abstract definePagination(): AbstractPagination<P>

  protected defineHttpCaching(): void {
    this.preventCaching()
  }

  protected buildPaginationUrls(): void {
    this.paginationUrls = {
      self: this.createUrl(this.paginationResult!.self),
    }

    if (this.paginationResult!.next) {
      this.paginationUrls.next = this.createUrl(this.paginationResult!.next)
    }

    if (this.paginationResult!.prev) {
      this.paginationUrls.prev = this.createUrl(this.paginationResult!.prev)
    }

    if (this.paginationResult!.last) {
      this.paginationUrls.last = this.createUrl(this.paginationResult!.last)
    }

    if (this.paginationResult!.first) {
      this.paginationUrls.first = this.createUrl(this.paginationResult!.first)
    }
  }

  protected override getTheModel(): Model {
    return this.databaseResult[0]
  }

  protected abstract extractCurrent(): P

  protected abstract createUrl(part: P): string

  protected abstract loadModelsFromDatabase(): Promise<Model[]>

  protected definePaginationResponse(): void {
    for (const [key, value] of Object.entries(this.paginationUrls!)) {
      this.resourceObject._links[key] = {
        href: value,
      }
    }
  }
}
