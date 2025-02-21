import { Profile } from "components/User/models/profile";
import { useCanContributeExercises } from "components/User/queries/contribute";
import { usePermissionQuery } from "components/User/queries/permission";
import { useProfileQuery } from "components/User/queries/profile";

jest.mock("components/User/queries/profile");
jest.mock("components/User/queries/permission");


describe("Test the exercise contribution query", () => {

    let testProfile: Profile;

    beforeEach(() => {
        // @ts-ignore
        usePermissionQuery.mockImplementation(() => ({
            isSuccess: true,
            data: false
        }));

        testProfile = new Profile({
            username: 'testerMcTest',
            email: 'admin@google.com',
            emailVerified: false,
            dateJoined: new Date(),
            isTrustworthy: false,
            useMetric: true,
            height: 180,
            weightRounding: null,
            repetitionsRounding: null,
        });
    });


    test('no verified email', () => {
        // Arrange
        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: testProfile
        }));

        // Assert
        const result = useCanContributeExercises();
        expect(result).toStrictEqual({
            admin: false,
            anonymous: false,
            canContribute: false,
            emailVerified: false,
        });
    });


    test('verified email', () => {
        // Arrange
        testProfile.emailVerified = true;

        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: testProfile
        }));

        // Assert
        const result = useCanContributeExercises();
        expect(result).toStrictEqual({
            admin: false,
            anonymous: false,
            canContribute: false,
            emailVerified: true,
        });
    });

    test('user is trustworthy', () => {
        // Arrange
        testProfile.emailVerified = true;
        testProfile.isTrustworthy = true;

        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: testProfile
        }));

        // Assert
        const result = useCanContributeExercises();
        expect(result).toStrictEqual({
            admin: false,
            anonymous: false,
            canContribute: true,
            emailVerified: true,
        });
    });

    test('user is logged out', () => {
        // Arrange
        testProfile.emailVerified = true;
        testProfile.isTrustworthy = true;

        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: null
        }));

        // Assert
        const result = useCanContributeExercises();
        expect(result).toStrictEqual({
            admin: false,
            anonymous: true,
            canContribute: false,
            emailVerified: false,
        });
    });

    test('user is admin, even without verified email', () => {
        // Arrange
        // @ts-ignore
        usePermissionQuery.mockImplementation(() => ({
            isSuccess: true,
            data: true
        }));

        // @ts-ignore
        useProfileQuery.mockImplementation(() => ({
            isSuccess: true,
            data: testProfile
        }));

        // Assert
        const result = useCanContributeExercises();
        expect(result).toStrictEqual({
            admin: true,
            anonymous: false,
            canContribute: true,
            emailVerified: false,
        });
    });
});