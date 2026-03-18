export interface IRepository<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  create(entity: T): Promise<T>
  update(id: string, entity: T): Promise<T>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}

