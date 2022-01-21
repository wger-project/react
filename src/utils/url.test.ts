import { makeHeader, makeUrl } from "utils/url";

describe("test url utility", () => {

    test('generate overview URL', () => {
        const result = makeUrl('endpoint', { server: 'http://localhost:8000' });
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/');
    });

    test('generate overview URL, default server', () => {
        const result = makeUrl('endpoint');
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/');
    });

    test('generate detail URL', () => {
        const result = makeUrl('endpoint', { id: 1, server: 'https://example2.com' });
        expect(result).toStrictEqual('https://example2.com/api/v2/endpoint/1/');
    });

    test('generate detail URL, default server', () => {
        const result = makeUrl('endpoint', { id: 1 });
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/1/');
    });
});

describe("test the header utility", () => {

    test('generate header', () => {
        const result = makeHeader('123');
        expect(result).toStrictEqual({
            'Authorization': `Token 123`,
            'Content-Type': 'application/json',
        });
    });

    test('generate header - token from config', () => {
        const result = makeHeader();
        expect(result).toStrictEqual({
            'Authorization': `Token 122333444455555666666`,
            'Content-Type': 'application/json',
        });
    });


});
