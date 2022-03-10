import { IModel } from '../../model'
import { AbstractPagination } from '../abstract-pagination'
import { OffsetSizePage } from './offset-size-page'
import { CollectionResult } from '../collection-result'

export class OffsetSizePagination<Model extends IModel> extends AbstractPagination<OffsetSizePage> {
  protected size: number

  protected offset: number

  protected totalCount: number

  constructor(
    protected collectionResult: CollectionResult<Model>,
    current: OffsetSizePage,
    protected defaultSize: number = 10,
    protected defaultOffset: number = 0
  ) {
    super(current)
    this.size = current.size
    this.offset = current.offset
    this.totalCount = collectionResult.totalCount
  }

  protected override getFirst(): OffsetSizePage {
    return {
      offset: 0,
      size: this.getFirstSize(),
    }
  }

  protected override getLast(): OffsetSizePage {
    return {
      size: this.getLastSize(),
      offset: this.getLastOffset(),
    }
  }

  protected override getNext(): OffsetSizePage {
    return {
      size: this.getNextSize(),
      offset: this.getNextOffset(),
    }
  }

  protected override getPrev(): OffsetSizePage {
    return {
      size: this.getPrevSize(),
      offset: this.getPrevOffset(),
    }
  }

  protected override hasFirst(): boolean {
    return this.totalCount > 0 && this.offset - this.size > 0
  }

  protected override hasLast(): boolean {
    return this.currentOffsetPlusTwoPages() < this.totalCount
  }

  protected override hasNext(): boolean {
    return this.offset + this.size < this.totalCount
  }

  protected override hasPrev(): boolean {
    return this.offset > 0 && this.totalCount > 0
  }

  private currentOffsetPlusTwoPages(): number {
    return this.offset + this.size * 2
  }

  private getLastSize(): number {
    return Math.min(this.size, this.totalCount - +this.getNextOffset() - this.size)
  }

  private getLastOffset(): number {
    return Math.max(this.currentOffsetPlusTwoPages(), this.totalCount - this.size)
  }

  private getFirstSize(): number {
    return Math.min(this.size, this.offset - this.size)
  }

  private getPrevSize(): number {
    return Math.min(this.defaultSize, this.size)
  }

  private getPrevOffset(): number {
    return Math.max(0, this.offset - this.size)
  }

  private getNextSize(): number {
    return Math.min(this.defaultSize, this.size)
  }

  private getNextOffset(): number {
    return Math.min(this.totalCount - 1, this.offset + this.size)
  }
}
