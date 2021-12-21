// util function that generates a url string from a base url and a query object
export function make_url(serverUrl: string,
                         path: string,
                         id?: number)
//query?: { [key: string]: string | number }): string
{
    /*
    const queryString = query != null ? Object.keys(query!)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query![key].toString())}`)
        .join('&') : '';

     if (queryString) {
        pathlist.push(`?${queryString}`);
    }
     */

    const pathlist = ['api', 'v2', path];

    if (id) {
        pathlist.push(id.toString());
    }

    return `${serverUrl}/${pathlist.join('/')}/`;
}