const vhs = require('vhs-tape')
const html = require('hui/html')

const Infinilist = require('./')
const Infinitable = require('./table')

/*
vhs('mounts infinitable to dom', async t => {
  const renderItem = (index) => {
    return html`<tr data-index="${index}">
      <td style="text-align: center;">${index}</td>
      </tr>`
  }
  const table = new Infinitable(renderItem, { total: 1000 })
  const tbl = document.createElement('table')
  tbl.appendChild(table.element)
  t.element.appendChild(tbl)
})
*/
vhs('mounts infinilist to dom', async t => {
  const renderItem = (index) => {
    return html`<div data-index="${index}">
      <div style="text-align: center;">${index}</div>
      </div>`
  }
  const table = new Infinilist(renderItem, { total: 0 })
  t.element.appendChild(table.element)
})

