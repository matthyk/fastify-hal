import { AbstractState } from '../abstract-state'
import { IModel } from '../../model'
import { copyPrimitiveProperties } from '../../utils/copy-properties'
import { RequestModel } from '../request-model'

export abstract class AbstractGetState<
  Model extends IModel,
  Request extends RequestModel = {}
> extends AbstractState<Model, Request> {
  protected requestedModel: Model

  protected etag?: string

  public override async build(): Promise<void> {
    await this.before()

    let databaseResult

    try {
      databaseResult = await this.loadModelFromDatabase()
    } catch (e) {
      this.error(`Error when query the resource from the repository. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    if (typeof databaseResult === 'undefined') {
      throw this.fastify.httpErrors.notFound('The requested resource could not be found.')
    }

    this.requestedModel = databaseResult

    await this.after()

    if (this.clientHasCurrentVersion()) {
      return this.reply.status(304).send()
    }

    this.defineProperties()

    await this.defineLinks()

    await this.defineEmbedded()

    this.defineValidationType()

    this.defineCacheControl()

    this.reply.status(200)

    this.defineHttpResponse()

    return this.reply.send(this.resourceObject)
  }

  protected after(): Promise<void> | void {}

  protected clientHasCurrentVersion(): boolean {
    this.etag = this.createEtag(this.requestedModel)

    // at this point requestedModel is guaranteed to be defined
    return this.req.evaluatePreconditions(this.requestedModel.modifiedAt, this.etag)
  }

  protected abstract loadModelFromDatabase(): Promise<Model | undefined>

  protected override defineProperties(): void {
    this.resourceObject = copyPrimitiveProperties(this.requestedModel, this.resourceObject)
  }

  protected override getTheModel(): Model {
    return this.requestedModel!
  }

  /*
   * Some HTTP caching utility methods
   *
   * We are waiting for https://github.com/fastify/fastify-sensible/pull/45
   */
  protected setTimestamp(): void {
    this.reply.header(
      'Last-modified',
      this.requestedModel
        ? new Date(this.requestedModel.modifiedAt).toUTCString()
        : new Date(Date.now()).toUTCString()
    )
  }

  protected setEtag(): void {
    this.reply.header('Etag', this.etag ?? this.createEtag(this.requestedModel))
  }

  protected defineValidationType(): void {
    this.setEtag()
  }

  protected defineCacheControl(): void {
    this.preventCaching()
  }
}
