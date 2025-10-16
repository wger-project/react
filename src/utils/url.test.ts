import { makeHeader, makeLink, makeUrl, WgerLink } from "utils/url";

describe("test url utility", () => {

    test('generate overview URL', () => {
        const result = makeUrl('endpoint', { server: 'http://localhost:8000' });
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/');
    });

    test('generate object method URL', () => {
        const result = makeUrl('endpoint', { server: 'http://localhost:8000', objectMethod: 'foo' });
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/foo/');
    });

    test('generate object method for object detail URL', () => {
        const result = makeUrl('endpoint', { server: 'http://localhost:8000', id: 1234, objectMethod: 'foo' });
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/1234/foo/');
    });

    test('generate overview URL, with query parameters', () => {
        const params = { server: 'http://localhost:8000', query: { limit: 900 } };
        const result = makeUrl('endpoint', params);
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/?limit=900');
    });

    test('generate overview URL, with query parameters and an object method', () => {
        const params = { server: 'http://localhost:8000', query: { limit: 900 }, objectMethod: 'calculate_foo' };
        const result = makeUrl('endpoint', params);
        expect(result).toStrictEqual('http://localhost:8000/api/v2/endpoint/calculate_foo/?limit=900');
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


describe("test the makeLink helper", () => {

    test('link to dashboard', () => {
        const result = makeLink(WgerLink.DASHBOARD, 'de');
        expect(result).toEqual('/');
    });

    test('link to exercise overview, simple language code', () => {
        const result = makeLink(WgerLink.EXERCISE_OVERVIEW, 'de');
        expect(result).toEqual('/de/exercise/overview');
    });

    test('link to exercise overview, complex language code', () => {
        const result = makeLink(WgerLink.EXERCISE_OVERVIEW, 'de-DE');
        expect(result).toEqual('/de-de/exercise/overview');
    });

    test('link to exercise overview, no language code', () => {
        const result = makeLink(WgerLink.EXERCISE_OVERVIEW,);
        expect(result).toEqual('/en/exercise/overview');
    });

    test('link to exercise contribution page', () => {
        const result = makeLink(WgerLink.EXERCISE_CONTRIBUTE, 'de');
        expect(result).toEqual('/de/exercise/contribute');
    });

    test('link to exercise detail page - with slug', () => {
        const result = makeLink(WgerLink.EXERCISE_DETAIL, 'de', { id: 123, slug: 'foobar' });
        expect(result).toEqual('/de/exercise/123/view/foobar');
    });

    test('link to exercise detail page - no slug', () => {
        const result = makeLink(WgerLink.EXERCISE_DETAIL, 'de', { id: 123 });
        expect(result).toEqual('/de/exercise/123/view');
    });

    test('link to weight overview page', () => {
        const result = makeLink(WgerLink.WEIGHT_OVERVIEW, 'de',);
        expect(result).toEqual('/de/weight/overview');
    });

});
