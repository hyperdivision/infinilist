const vhs = require('vhs-tape')
const html = require('hui/html')

const Infinitable = require('./infinitable')

const renderItem = (index) => {
  return html`<div data-index="${index}>
    <h3 style="text-align: center;">${index}</h3>
    </div>`
}
vhs('mounts infinitable to dom', async t => {
  const table = new Infinitable(renderItem, { total: 1000 })
  t.element.appendChild(table.element)
})
