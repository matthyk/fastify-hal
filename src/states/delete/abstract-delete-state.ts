import { IModel } from '../../model'
import { AbstractState } from '../abstract-state'
import { RequestModel } from '../request-model'

export abstract class AbstractDeleteState<
  Model extends IModel,
  Request extends RequestModel
> extends AbstractState<Model, Request> {
  public override async build(): Promise<void> {
    await this.before()

    try {
      await this.deleteModelInDatabase()
    } catch (e) {
      this.error(`Error while updating resource in database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    await this.after()

    this.defineProperties()

    await this.defineLinks()

    await this.defineEmbedded()

    this.reply.status(200)

    this.defineHttpResponse()

    return this.reply.send(this.resourceObject)
  }

  protected after(): Promise<void> | void {}

  protected abstract deleteModelInDatabase(): Promise<void>
}
