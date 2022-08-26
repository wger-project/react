import { Muscle } from "components/Exercises/models/muscle";


describe("Muscle model tests", () => {

    test('name helper', () => {
 
        // Arrange
        const t = (a: string) => 'translated name';
        const m1 = new Muscle(2, "Anterior deltoid", "Shoulders", true);
        const m2 = new Muscle(2, "Anterior deltoid", "", true);

        // Assert
        expect(m1.getName(t)).toBe("Anterior deltoid (translated name)");
        expect(m2.getName(t)).toBe("Anterior deltoid");
    });
});

