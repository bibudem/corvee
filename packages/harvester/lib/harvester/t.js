import {
    BrowsingContextStore
} from '.'

const b = new BrowsingContextStore();

//            page                                  context
b.addContext('http://guides.bib.umontreal.ca/123', 'http://bib.umontreal.ca/aaa')
b.addContext('http://guides.bib.umontreal.ca/456', 'http://bib.umontreal.ca/bbb')
b.addContext('http://extern.com/video', 'http://guides.bib.umontreal.ca/123')
b.addContext('http://extern.com/video', 'http://bib.umontreal.ca/ccc')

console.log(b.entries())
console.log(JSON.stringify(b.getContext('http://extern.com/video'), null, 2))