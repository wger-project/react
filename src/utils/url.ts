interface makeUrlInterface {
    id?: number,
    server?: string,
    query?: object,
}


/*
 * util function that generates a url string from a base url and a query object
 */
export function makeUrl(path: string, params?: makeUrlInterface) {
    params = params || {};

    // Base data
    const serverUrl = params.server || process.env.REACT_APP_API_SERVER;
    const pathlist = [serverUrl, 'api', 'v2', path];

    // Detail view
    if (params.id) {
        pathlist.push(params.id.toString());
    }
    pathlist.push('');

    // Query parameters
    if (params.query) {
        const querylist = [];
        for (const key in params.query) {
            if (params.query.hasOwnProperty(key)) {
                // @ts-ignore
                querylist.push(`${encodeURIComponent(key)}=${encodeURIComponent(params.query[key])}`);
            }
        }
        pathlist.pop();
        pathlist.push(`?${querylist.join('&')}`);
    }

    return pathlist.join('/');
}

/*
 * util function that generates the needed headers
 */
export function makeHeader(token?: string) {
    token = token || process.env.REACT_APP_API_KEY;

    return {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
    };
}