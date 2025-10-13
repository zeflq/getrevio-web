declare module "ioredis" {
  export default class Redis {
    constructor(url: string, options?: Record<string, unknown>);
    set(key: string, value: string): Promise<unknown>;
  }
}
