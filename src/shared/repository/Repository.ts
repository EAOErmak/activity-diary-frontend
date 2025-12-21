export interface Repository<T> {
  get(): {
    data: T;
    version: number;
  };
  set(data: T, version: number): void;
}
