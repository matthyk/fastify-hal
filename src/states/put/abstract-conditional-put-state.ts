import { AbstractState } from '../abstract-state'
import { IModel } from '../../model'
import { RequestModel } from '../request-model'

export abstract class AbstractConditionalPutState<
  Model extends IModel,
  Request extends RequestModel = {}
> extends AbstractState<Model, Request> {
  protected currentModelInDatabase: Model

  protected model: Model

  public override async build(): Promise<void> {
    await this.before()

    let databaseResult

    try {
      databaseResult = await this.loadModelFromDatabase()
    } catch (e) {
      this.error(`Error while retrieving resource from database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    if (typeof databaseResult === 'undefined') {
      throw this.fastify.httpErrors.notFound('This resource could not be found.')
    }

    this.currentModelInDatabase = databaseResult

    await this.beforeUpdate()

    if (!this.clientHasCurrentVersion()) {
      throw this.fastify.httpErrors.preconditionFailed(
        'You do not know the current state of the specified resource.'
      )
    }

    this.model = this.createModel()
    this.model.modifiedAt = Date.now()

    try {
      await this.updateModelInDatabase()
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

  protected clientHasCurrentVersion(): boolean {
    const currentEtag = this.createEtag(this.currentModelInDatabase)
    const lastModifiedAt = this.currentModelInDatabase!.modifiedAt

    return this.req.evaluatePreconditions(lastModifiedAt, currentEtag)
  }

  protected createModel(): Model {
    return this.req.body as Model
  }

  protected after(): Promise<void> | void {}

  protected abstract loadModelFromDatabase(): Promise<Model | undefined>

  protected abstract updateModelInDatabase(): Promise<void>

  protected async beforeUpdate(): Promise<void> {}
}
