const vhs = require('vhs-tape')
const html = require('hui/html')

const Infinilist = require('./')
const Infinitable = require('./table')

const renderItem = (index) => {
  return html`<tr data-index="${index}">
    <td style="text-align: center;">${index}</td>
    </tr>`
}
/*
vhs('mounts infinitable to dom', async t => {
  const table = new Infinitable(renderItem, { total: 1000 })
  const tbl = document.createElement('table')
  tbl.appendChild(table.element)
  t.element.appendChild(tbl)
})
*/
vhs('mounts infinilist to dom', async t => {
  const table = new Infinilist(renderItem, { total: 1000 })
  t.element.appendChild(table.element)
})

