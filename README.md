# Infinilist

> hui component for listing a millions of items, partially rendering only a
> viewport and viewport buffer amount of them, using a single intersection observer


## Usage example

``` js
const Infinilist = require('infinilist')
const html = require('hui/html')

const items = [ ...millionsOfItems ]

// render function passed down to list, requesting a rendered item at index
const renderItem (i) {
  return html`<li>${items[i]}</li>`
}

const list = new Infinilist(renderItem, { total: items.length })

document.body.appendChild(list.element)
```
