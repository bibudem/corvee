export default function(exclude = false) {
    return todos.map(todo => ({
        ...todo,
        exclude
    }))
}

const todos = [{
    code: 'dev-todo',
    test: (report) => {
        switch (report.url) {
            case 'http://revistaseug.ugr.es/index.php/tsg':
                return 'htt header: refresh: \'0; url=https://revistaseug.ugr.es/index.php/tsg\''
            case 'https://cve.grics.ca/fr/1338/66923':
                return 'status null';
            case 'http://content.apa.org/books/2013-30427-000':
                return 'status 416, it should be 301';
            case 'http://www.sfphysio.fr/index.php':
                return 'status null, should be 301';
            case 'https://bib.umontreal.ca/activites':
                return 'finalUrl and httpStatusCode null, but it should be a 200'
            case 'http://bibliomontreal.com/coupdepoing':
                return 'status final: 403, devrait être 200';
            default:
                return false;
        }
    },

}]