import { make_url } from "utils/url";

describe("test url utility", () => {

    test('generate overview URL', () => {
        const result = make_url('endpoint', {server: 'http://localhost:8000'});
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/');
    });

    test('generate overview URL, default server', () => {
        const result = make_url('endpoint');
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/');
    });

    test('generate detail URL', () => {
        const result = make_url('endpoint', {id: 1, server: 'https://example2.com'});
        expect(result).toStrictEqual('https://example2.com/api/v2/endpoint/1/');
    });

    test('generate detail URL, default server', () => {
        const result = make_url('endpoint', {id: 1});
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/1/');
    });
});
