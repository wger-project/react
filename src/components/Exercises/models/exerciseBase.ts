import { Adapter } from "utils/Adapter";
import { ExerciseImage, ExerciseImageAdapter } from "components/Exercises/models/image";
import { Equipment, EquipmentAdapter } from "components/Exercises/models/equipment";
import { Muscle, MuscleAdapter } from "components/Exercises/models/muscle";
import { Category, CategoryAdapter } from "components/Exercises/models/category";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { Language } from "components/Exercises/models/language";

export class ExerciseBase {

    //translations: ExerciseTranslation[] = [];

    constructor(public id: number,
                public uuid: string,
                public date: Date,
                public category: Category,
                public equipment: Equipment[],
                public muscles: Muscle[],
                public musclesSecondary: Muscle[],
                public images: ExerciseImage[],
                public variations: number[],
                public comments: string[],
                public translations: ExerciseTranslation[] = [new ExerciseTranslation(1, 'some-uuid', 'Cool name', 'The description', new Language('en', 'English'))]
                /*
                license: number,
                licenseAuthor: string,
                 */
    ) {

    }
}


export class ExerciseBaseAdapter implements Adapter<ExerciseBase> {
    fromJson(item: any): ExerciseBase {

        return new ExerciseBase(
            item.id,
            item.uuid,
            new Date(item.creation_date),
            new CategoryAdapter().fromJson(item.category),
            item.equipment.map((e: any) => (new EquipmentAdapter().fromJson(e))),
            item.muscles.map((m: any) => (new MuscleAdapter().fromJson(m))),
            item.muscles_secondary.map((m: any) => (new MuscleAdapter().fromJson(m))),
            item.images.map((i: any) => (new ExerciseImageAdapter().fromJson(i))),
            item.variations,
            item.comments
            /*
            item.license,
            item.license_author,
             */
        );
    }

    /**
     * Don't return all properties, since not all items can be updated (they would
     * be ignored by the server, but it's better to not send too much anyway)
     */
    toJson(item: ExerciseBase): any {
        return {
            id: item.id,
            uuid: item.uuid,
            category: new CategoryAdapter().fromJson(item.category),
            equipment: item.equipment.map(e => new EquipmentAdapter().toJson(e)),
            muscles: item.muscles.map(m => new MuscleAdapter().toJson(m)),
            muscles_secondary: item.musclesSecondary.map(m => new MuscleAdapter().toJson(m)),
            images: item.images.map(i => new ExerciseImageAdapter().toJson(i)),
        };
    }
}