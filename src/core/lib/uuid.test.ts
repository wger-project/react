import { randomUUID } from "@/core/lib/uuid";

describe("randomUUID", () => {

    const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test('uses the native implementation when it is available', () => {
        const spy = vi.spyOn(globalThis.crypto, 'randomUUID')
            .mockReturnValue('583281c7-2362-48e7-95d5-8fd6c455e0fb');

        expect(randomUUID()).toEqual('583281c7-2362-48e7-95d5-8fd6c455e0fb');
        expect(spy).toHaveBeenCalled();
    });

    test('falls back to getRandomValues outside of secure contexts', () => {
        // Only randomUUID is restricted to secure contexts, getRandomValues stays available
        const nativeCrypto = globalThis.crypto;
        vi.stubGlobal('crypto', {
            getRandomValues: (array: Uint8Array<ArrayBuffer>) => nativeCrypto.getRandomValues(array)
        });

        expect(randomUUID()).toMatch(UUID_V4);
    });

    test('returns different values on each call', () => {
        expect(randomUUID()).not.toEqual(randomUUID());
    });
});
