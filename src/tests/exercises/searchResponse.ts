import { Exercise } from "components/Exercises/models/exercise";
import { Category } from "components/Exercises/models/category";
import { Translation } from "components/Exercises/models/translation";

export const searchResponse: Exercise[] = [
    new Exercise(
        998, // id
        "uuid-998", // uuid
        new Category(8, "Bauch"), // category
        [], // equipment
        [], // muscles
        [], // musclesSecondary
        [], // images
        null, // variationId
        [
            new Translation(
                1149, // id
                "uuid-1149", // uuid
                "Crunches an Negativbank", // name
                "", // description
                1 // language (German)
            )
        ], // translations
        [], // videos
        [] // authors
    ),
    new Exercise(
        979, // id
        "uuid-979", // uuid
        new Category(11, "Brust"), // category
        [], // equipment
        [], // muscles
        [], // musclesSecondary
        [], // images
        null, // variationId
        [
            new Translation(
                1213, // id
                "uuid-1213", // uuid
                "Crunches am Seil", // name
                "", // description
                1 // language (German)
            )
        ], // translations
        [], // videos
        [] // authors
    )
];