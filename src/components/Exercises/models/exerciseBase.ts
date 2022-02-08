import { Adapter } from "utils/Adapter";
import { ExerciseImage } from "components/Exercises/models/image";
import { Equipment } from "components/Exercises/models/equipment";
import { Muscle } from "components/Exercises/models/muscle";
import { Category } from "components/Exercises/models/category";
import { Exercise } from "components/Exercises/models/exercise";

export class ExerciseBase {
    category!: Category;
    categoryId: number;
    muscles: Muscle[] = [];
    musclesIds: number[] = [];
    musclesSecondary: Muscle[] = [];
    musclesSecondaryIds: number[] = [];
    equipment: Equipment[] = [];
    equipmentIds: number[] = [];
    images: ExerciseImage[] = [];
    license: number;
    licenseAuthor: string;
    variations: number[];

    translations: Exercise[] = [];

    constructor(public id: number,
                public uuid: string,
                public name: string,
                public date: Date,
                public description: string,
                category: number,
                muscles: number[],
                musclesSecondary: number[],
                equipment: number[],
                license: number,
                licenseAuthor: string,
                variations: number[]) {
        this.categoryId = category;
        this.musclesIds = muscles;
        this.musclesSecondaryIds = musclesSecondary;
        this.equipmentIds = equipment;
        this.license = license;
        this.licenseAuthor = licenseAuthor;
        this.variations = variations;
    }
}


export class ExerciseBaseAdapter implements Adapter<ExerciseBase> {
    fromJson(item: any): ExerciseBase {
        return new ExerciseBase(
            item.id,
            item.uuid,
            item.name,
            new Date(item.creation_date),
            item.description,
            item.category,
            item.muscles,
            item.muscles_secondary,
            item.equipment,
            item.license,
            item.license_author,
            item.variations
        );
    }

    /**
     * Don't return all properties, since not all items can be updated (they would
     * be ignored by the server, but it's better to not send too much anyway)
     */
    toJson(item: ExerciseBase): any {

        return {
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.categoryId,
            muscles: item.musclesIds,
            muscles_secondary: item.musclesSecondaryIds,
            equipment: item.equipmentIds
        };
    }
}