/*
 * Small adapter interface to make TypeScript and us happy
 */
export interface Adapter<T> {
    fromJson(item: any): T;

    toJson(item: T): any;
}