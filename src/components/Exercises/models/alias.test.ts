import { Alias, AliasAdapter } from "@/components/Exercises/models/alias";

describe("Exercise alias adapter", () => {

    const apiResponse = {
        id: 200,
        uuid: "eb18288d-4ca3-4c54-8279-343b110d86e0",
        translation: 111,
        alias: "Elbow dislocator",
    };

    test('parses the response of the API', () => {

        // Act
        const result = new AliasAdapter().fromJson(apiResponse);

        // Assert
        expect(result).toEqual(new Alias(
            200,
            "eb18288d-4ca3-4c54-8279-343b110d86e0",
            "Elbow dislocator"
        ));
    });

    test('serializes the keys the API expects', () => {

        // Act
        const adapter = new AliasAdapter();
        const json = adapter.toJson(adapter.fromJson(apiResponse));

        // Assert
        // The serializer knows the field as 'alias', not as 'name'
        expect(json).toEqual({ id: 200, alias: "Elbow dislocator" });
        expect(json).not.toHaveProperty('name');
    });
});
