export default abstract class AbstractPipelinePayload<Data = Record<string, unknown>> {
  constructor(private data: Data) {}

  public set<K extends keyof Data>(key: K, value: NonNullable<Data[K]>): void {
    this.data[key] = value;
  }

  public tryGet<K extends keyof Data>(key: K): Data[K] {
    return this.data[key];
  }

  // Return type is a NonUndefined but Nullable.
  public get<K extends keyof Data>(key: K): NonNullable<Data[K]> | never {
    const value = this.data[key];
    if (value === undefined || value === null) {
      throw new Error(`Data key ${String(key)} is not set`);
    }
    return value;
  }
}
