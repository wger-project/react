export interface ResponseType<T> {
    count: number,
    next: number | null,
    previous: number | null,
    results: T[]
}

export interface ExerciseSearchResponse {
    value: string,
    data: {
        id: number,
        base_id: number,
        name: string,
        category: string,
        image: string | null,
        image_thumbnail: string | null,
    }
}

export interface ExerciseSearchType {
    suggestions: ExerciseSearchResponse[]
}