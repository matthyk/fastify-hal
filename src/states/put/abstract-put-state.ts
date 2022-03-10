import { AbstractState } from '../abstract-state'
import { IModel } from '../../model'

export abstract class AbstractPutState<
  Model extends IModel,
  Request extends { Body?: unknown; Params?: unknown; Headers?: unknown; Querystring?: unknown }
> extends AbstractState<Model, Request> {
  protected model?: Model

  public override async build(): Promise<void> {
    await this.before()

    this.model = this.createModel()
    this.model.modifiedAt = Date.now()

    try {
      await this.updateModelInDatabase(this.model)
    } catch (e) {
      this.error(`Error while updating resource in database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    await this.after(this.model)

    this.defineProperties()

    await this.defineLinks()

    await this.defineEmbedded()

    this.reply.status(200)

    this.defineHttpResponse()

    return this.reply.send(this.resourceObject)
  }

  protected createModel(): Model {
    return this.req.body as Model
  }

  protected after(_model: Model): Promise<void> | void {}

  protected abstract updateModelInDatabase(model: Model): Promise<void>
}
