export interface PagedLoaderInterface<T> {

  loadNext(): Promise<T[]>;

}
