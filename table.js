const Component = require('hui')
const html = require('hui/html')

const topCss = `
  height: calc(var(--row-height, 20px) * var(--position, 0));
`

const btmCss = `
  height: calc(var(--row-height, 20px) * calc(var(--total-count) - calc(var(--position, 0) + var(--child-count))));
`

module.exports = class Infinitable extends Component {
  constructor (renderItem, opts = {}) {
    super()

    this._startingIndex = opts.startingIndex || 0
    this._totalCount = opts.total === 0 ? 0 : (opts.total || 1000)
    this._renderItem = renderItem
    this._defaultRowHeight = opts.rowHeight || 20
    this._children = null
    this._indices = new WeakMap()
    this._visible = new Set()
    this._renderReset = false
    this._renderResize = false
    this._bottomSentinel = html`<tr style="${btmCss}"></tr>`
    this._topSentinel = html`<tr style="${topCss}"></tr>`
    this._setDefaultHeight = !!opts.rowHeight

    this._observer = new window.IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        const idx = this._indices.get(entry.target)

        if (idx !== undefined) {
          const isVisible = entry.intersectionRatio > 0

          if (isVisible) this._visible.add(idx)
          else this._visible.delete(idx)
        }
      }

      this.update()
    })
  }

  resize (totalCount) {
    this._totalCount = totalCount
    this._renderResize = true
    this.update()
  }

  reset () {
    this._renderReset = true
    this.update()
  }

  get pageSize () {
    return Math.round(window.innerHeight / this._defaultRowHeight)
  }

  get rowHeightAverage () {
    const heights = []
    for (const el of this._children.children) {
      heights.push(el.getBoundingClientRect().height)
    }
    if (heights.length === 0) return this._defaultRowHeight
    return heights.reduce((a, b) => a + b, 0) / this._children.children.length
  }

  onload () {
    if (this._children.childElementCount > 2) return

    const end = Math.min(this._startingIndex + this.pageSize * 3, this._totalCount)

    for (let i = this._startingIndex; i < end; ++i) {
      this._addChild(i, false)
    }

    this._observer.observe(this._bottomSentinel)
    this._observer.observe(this._topSentinel)

    this.element.style.setProperty('--position', this._top)
    this.element.style.setProperty('--total-count', this._totalCount)
    this.element.style.setProperty('--child-count', this._children.childElementCount)
  }

  onunload () {
    this._observer.disconnect()
  }

  _updateElements (top, btm) {
    while (this._children.childElementCount > 2) {
      const child = this._children.firstChild.nextSibling
      const index = this._indices.get(child)

      if (index < top || index >= btm) this._removeChild(child)
      else if (index > top) this._addChild(index - 1, true)
      else break
    }

    while (this._children.childElementCount > 2 && this._totalCount > 0) {
      const child = this._children.lastChild.previousSibling
      const index = this._indices.get(child)

      if (index < top || index >= btm) this._removeChild(child)
      else if (index < btm - 1) this._addChild(index + 1, false)
      else break
    }
  }

  _viewport () {
    if (!this._visible.size) return [0, 0]

    let top = this._totalCount - 1
    for (const idx of this._visible) {
      if (idx < top) top = idx
    }

    top -= this.pageSize
    if (top < 0) top = 0

    let btm = Math.min(top + 3 * this.pageSize, this._totalCount)

    return [top, btm]
  }

  _removeChild (el) {
    this._observer.unobserve(el)
    this._children.removeChild(el)
    this.element.style.setProperty('--child-count', this._children.childElementCount - 2)
  }

  _addChild (index, prepend) {
    const el = this._renderItem(index)
    this._indices.set(el, index)
    this._observer.observe(el)
    if (prepend) this._children.insertBefore(el, this._children.firstChild.nextSibling)
    else this._children.insertBefore(el, this._children.lastChild)
    this.element.style.setProperty('--child-count', this._children.childElementCount - 2)

    if (!this._setDefaultHeight) {
      const { height } = el.getBoundingClientRect()
      this._setDefaultHeight = true
      this._defaultRowHeight = height
      this.element.style.setProperty('--row-height', `${height}px`)
    }

    return el
  }

  render () {
    if (!this.loaded) return

    if (this._renderResize) {
      this._renderResize = false
      this.element.style.setProperty('--total-count', this._totalCount)
    }

    let [top, btm] = this._viewport()

    if (this._renderReset) {
      this._renderReset = false
      while (this._children.childElementCount > 2) this._removeChild(this._children.lastChild.previousSibling)
      if (this._totalCount > 0) this._addChild(top, false)
    }

    this._updateElements(top, btm)

    if (this._children.childElementCount === 2 && this._totalCount > 0) {
      const rect = this.element.getBoundingClientRect()
      top = Math.max(0, Math.floor(this._totalCount * -(rect.top / rect.height)) - this.pageSize) || 0
      btm = Math.min(top + 3 * this.pageSize, this._totalCount)
      this.element.style.setProperty('--position', top)
      this.element.style.setProperty('--child-count', 1)
      this._addChild(top, false)
      this._updateElements(top, btm)
    }

    this.element.style.setProperty('--position', top)
    this.element.style.setProperty('--child-count', this._children.childElementCount - 2)
  }

  createElement () {
    const el = html`
      <tbody>
        ${this._topSentinel}
        ${this._bottomSentinel}
      </tbody>
    `
    this._children = el

    return el
  }
}
