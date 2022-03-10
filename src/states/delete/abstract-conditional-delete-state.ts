import { AbstractState } from '../abstract-state'
import { IModel } from '../../model'

export abstract class AbstractConditionalDeleteState<
  Model extends IModel,
  Request extends { Params?: unknown; Headers?: unknown; Querystring?: unknown }
> extends AbstractState<Model, Request> {
  protected currentModelInDatabase?: Model

  public override async build(): Promise<void> {
    await this.before()

    try {
      this.currentModelInDatabase = await this.loadModelFromDatabase()
    } catch (e) {
      this.error(`Error while retrieving resource from database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    if (!this.currentModelInDatabase) {
      throw this.fastify.httpErrors.notFound('This resource could not be found.')
    }

    await this.beforeDelete(this.currentModelInDatabase)

    if (!this.clientHasCurrentVersion()) {
      throw this.fastify.httpErrors.preconditionFailed(
        'You do not know the current state of the specified resource.'
      )
    }

    try {
      await this.deleteModelInDatabase(this.currentModelInDatabase)
    } catch (e) {
      this.error(`Error while updating resource in database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    await this.after(this.currentModelInDatabase)

    this.defineProperties()

    await this.defineLinks()

    await this.defineEmbedded()

    this.reply.status(200)

    this.defineHttpResponse()

    return this.reply.send(this.resourceObject)
  }

  protected clientHasCurrentVersion(): boolean {
    const currentEtag = this.createEtag(this.currentModelInDatabase)
    const lastModifiedAt = this.currentModelInDatabase!.modifiedAt

    return this.req.evaluatePreconditions(lastModifiedAt, currentEtag)
  }

  protected createModel(_currentModel: Model): Model {
    return this.req.body as unknown as Model
  }

  protected after(_updatedModel: Model): Promise<void> | void {}

  protected abstract loadModelFromDatabase(): Promise<Model | undefined>

  protected abstract deleteModelInDatabase(model: Model): Promise<void>

  protected async beforeDelete(_currentModelInDatabase: Model): Promise<void> {}
}
