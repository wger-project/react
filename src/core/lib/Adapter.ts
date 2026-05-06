/*
 * Small adapter interface to make TypeScript and us happy
 */
export interface Adapter<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): T;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJson?(item: T): any;
}