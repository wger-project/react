import { make_url } from "utils/url";

describe("test url utility", () => {

    test('generate overview URL', () => {
        const result = make_url('https://example.com', 'endpoint');
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/');
    });

    test('generate detail URL', () => {
        const result = make_url('https://example.com', 'endpoint', 1);
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/1/');
    });
});
