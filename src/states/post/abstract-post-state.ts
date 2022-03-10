import { AbstractState } from '../abstract-state'
import { IModel } from '../../model'
import { copyPrimitiveProperties } from '../../copy-properties'

export abstract class AbstractPostState<
  Model extends IModel,
  Request extends { Body?: unknown; Params?: unknown; Headers?: unknown; Querystring?: unknown }
> extends AbstractState<Model, Request> {
  protected model: Model

  protected createdModel: Model

  public override async build(): Promise<void> {
    await this.before()

    this.model = this.createModel()

    const now = Date.now()
    this.model.modifiedAt = now
    this.model.createdAt = now

    try {
      this.createdModel = await this.saveModelInDatabase(this.model)
    } catch (e) {
      this.logger.error(
        `[ ${this.constructor.name} ]: Error while saving resource in database. ${e}`
      )
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    await this.after(this.model)

    this.defineProperties()

    await this.defineLinks()

    await this.defineEmbedded()

    this.defineLocationLink()

    this.reply.status(201)

    this.defineHttpResponse()

    return this.reply.send(this.resourceObject)
  }

  protected createModel(): Model {
    return this.req.body as Model
  }

  protected override defineProperties() {
    this.resourceObject = copyPrimitiveProperties(this.createdModel, this.resourceObject)
  }

  protected defineLocationLink(): void {
    const locationLink = this.req.fullUrl() + '/' + this.createdModel.id
    this.reply.header('Location', locationLink)
  }

  protected after(_model: Model): Promise<void> | void {}

  protected abstract saveModelInDatabase(model: Model): Promise<Model>
}
