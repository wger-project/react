import { makeHeader, makeUrl } from "utils/url";

describe("test url utility", () => {

    test('generate overview URL', () => {
        const result = makeUrl('endpoint', { server: 'http://localhost:8000' });
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/');
    });

    test('generate overview URL, with query parameters', () => {
        const params = { server: 'http://localhost:8000', query: { limit: 900 } };
        const result = makeUrl('endpoint', params);
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/?limit=900');
    });

    test('generate overview URL, default server', () => {
        const result = makeUrl('endpoint');
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/');
    });

    test('generate overview URL, default server, with query parameters', () => {
        const result = makeUrl('endpoint', { query: { foo: 'bar' } });
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/?foo=bar');
    });

    test('generate detail URL', () => {
        const result = makeUrl('endpoint', { id: 1, server: 'https://example2.com' });
        expect(result).toStrictEqual('https://example2.com/api/v2/endpoint/1/');
    });

    test('generate detail URL, with query parameters', () => {
        const params = { id: 1, server: 'https://example2.com', query: { test: 'foo' } };
        const result = makeUrl('endpoint', params);
        expect(result).toStrictEqual('https://example2.com/api/v2/endpoint/1/?test=foo');
    });

    test('generate detail URL, default server', () => {
        const result = makeUrl('endpoint', { id: 1 });
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/1/');
    });

    test('generate detail URL, default server, query parameters', () => {
        const params = { id: 1, query: { a: 1, b: '2', c: '&', d: 'ü' } };
        const result = makeUrl('endpoint', params);
        expect(result).toStrictEqual('https://example.com/api/v2/endpoint/1/?a=1&b=2&c=%26&d=%C3%BC');
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
