import { Adapter } from "utils/Adapter";

export class Category {

    constructor(
        public id: number,
        public name: string
    ) {
    }
}


export class CategoryAdapter implements Adapter<Category> {
    fromJson(item: any): Category {
        return new Category(
            item.id,
            item.name
        );
    }

    toJson(item: Category): any {
        return {
            id: item.id,
            name: item.name,
        };
    }
}