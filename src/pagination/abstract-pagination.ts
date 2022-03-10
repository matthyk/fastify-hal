import { PaginationResult } from './pagination-result'

export abstract class AbstractPagination<V> {
  protected constructor(protected readonly current: V) {}

  protected abstract hasPrev(): boolean

  protected abstract hasNext(): boolean

  protected hasLast(): boolean {
    return false
  }

  protected hasFirst(): boolean {
    return false
  }

  protected abstract getPrev(): V

  protected abstract getNext(): V

  protected getLast(): V | undefined {
    return undefined
  }

  protected getFirst(): V | undefined {
    return undefined
  }

  protected getCurrent(): V {
    return this.current
  }

  /*
   * And again the template method pattern
   */
  public build(): PaginationResult<V> {
    const paginationResult: PaginationResult<V> = {
      self: this.getCurrent(),
    }

    if (this.hasFirst()) {
      paginationResult.first = this.getFirst()
    }

    if (this.hasPrev()) {
      paginationResult.prev = this.getPrev()
    }

    if (this.hasNext()) {
      paginationResult.next = this.getNext()
    }

    if (this.hasLast()) {
      paginationResult.last = this.getLast()
    }

    return paginationResult
  }
}
