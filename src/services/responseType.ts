/*
 * Generic paginated response from the wger API
 */
export interface ResponseType<T> {
    count: number,
    next: number | null,
    previous: number | null,
    results: T[]
}
