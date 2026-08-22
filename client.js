/* global window, document */
/**
 * Quote Selection browser half: selecting text inside the conversation shows a
 * floating "❝ 引用" button above the selection's first line; clicking appends
 * the selection to the composer draft as one Markdown blockquote and parks the
 * caret on the line below it. Repeated quotes join with exactly one blank line.
 *
 * Module-table factory bundle (same artifact shape tsdown's clientBundle emits):
 * externals resolve through the injected require; every side effect — including
 * stylesheet injection — lives inside this factory closure.
 */
window.__ModuleLoader__.load({ id: 'dsh-quote-selection', factory: (require) => {
var module = { exports: {} };
var exports = module.exports;

const React = require('react')

const BUTTON_CSS = [
  '.dshq-btn {',
  '  position: fixed;',
  '  z-index: 60;',
  '  display: inline-flex;',
  '  align-items: center;',
  '  gap: 5px;',
  '  padding: 4px 11px;',
  '  border: 1px solid var(--dsw-alias-border-l2);',
  '  border-radius: 999px;',
  '  background: var(--dsw-alias-bg-base);',
  '  color: var(--dsw-alias-label-primary);',
  '  font-family: var(--dsw-font-family);',
  '  font-size: var(--dsw-font-xs-13, 13px);',
  '  line-height: 1.5;',
  '  /* Theme surface shadows read as invisible on a small floater, so this */',
  '  /* carries its own visible lift, kept light/dark neutral. */',
  '  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08);',
  '  cursor: pointer;',
  '  user-select: none;',
  '}',
  '/* The hover token is a translucent wash: layer it OVER the opaque base */',
  '/* instead of replacing it, or the floating button turns see-through. */',
  '.dshq-btn:hover {',
  '  box-shadow:',
  '    0 6px 20px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08),',
  '    inset 0 0 0 999px var(--dsw-alias-interactive-bg-hover);',
  '}',
  '.dshq-glyph { font-size: 15px; line-height: 1; transform: translateY(-1px); }',
].join('\n')

// One tagged style per plugin id; a reload of this script re-executes the
// factory, and the guard keeps the tag single-instanced.
if (typeof document !== 'undefined' && document.querySelector('style[data-plugin="dsh-quote-selection"]') === null) {
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-quote-selection'
  tag.textContent = BUTTON_CSS
  document.head.appendChild(tag)
}

const composerTextarea = () => document.querySelector('[data-composer-seat] textarea')

/** Selected text -> one Markdown blockquote block, one "> " per line. */
function buildQuoteBlock(text) {
  const body = text.replace(/\r\n?/g, '\n').replace(/^\n+/, '').replace(/\n+$/, '')
  return body.split('\n').map((line) => '> ' + line).join('\n')
}

module.exports = {
  name: 'quote-selection',
  inject: ['timer'],
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    // Package-private handoff: the session-scoped bridge installs the input
    // machine's single public draft write path; the root-scoped overlay reads it.
    const bridge = { setDraft: null }

    /** Append one quote block to the draft and park the caret right below it. */
    function insertQuote(text) {
      if (bridge.setDraft === null) return
      const ta = composerTextarea()
      if (ta === null) return
      const base = ta.value.replace(/\n+$/, '')
      const prefix = base === '' ? '' : base + '\n\n'
      bridge.setDraft(prefix + buildQuoteBlock(text) + '\n')
      // Caret placement lands after React commits the new controlled value.
      ctx.timeout(() => {
        const el = composerTextarea()
        if (el === null) return
        el.focus()
        const end = el.value.length
        el.setSelectionRange(end, end)
      }, 0)
    }

    function QuoteOverlay() {
      const stateHook = React.useState(null)
      const target = stateHook[0]
      const setTarget = stateHook[1]
      React.useEffect(() => {
        let raf = 0
        const hide = () => setTarget(null)
        const readSelection = () => {
          const selection = window.getSelection()
          if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return hide()
          const text = selection.toString()
          if (text.trim() === '') return hide()
          let node = selection.getRangeAt(0).commonAncestorContainer
          if (node.nodeType === 3) node = node.parentNode
          const scroll = document.querySelector('[data-conversation-scroll]')
          if (scroll === null || !scroll.contains(node)) return hide()
          if (node.closest('[data-composer-seat]') !== null) return hide()
          if (node.closest('[data-shell-overlay]') !== null) return hide()
          const rects = selection.getRangeAt(0).getClientRects()
          let first = null
          for (const rect of rects) {
            if (rect.width > 0 || rect.height > 0) { first = rect; break }
          }
          if (first === null) return hide()
          setTarget({ text: text, x: Math.max(8, first.left), y: first.top })
        }
        const schedule = () => {
          window.cancelAnimationFrame(raf)
          raf = window.requestAnimationFrame(readSelection)
        }
        document.addEventListener('selectionchange', schedule)
        window.addEventListener('scroll', hide, true)
        window.addEventListener('resize', hide)
        return () => {
          document.removeEventListener('selectionchange', schedule)
          window.removeEventListener('scroll', hide, true)
          window.removeEventListener('resize', hide)
          window.cancelAnimationFrame(raf)
        }
      }, [])
      if (target === null) return null
      return React.createElement('button', {
        className: 'dshq-btn',
        style: { left: target.x + 'px', top: Math.max(8, target.y - 38) + 'px' },
        // Keep the page selection alive through the press; the click still owns the text.
        onMouseDown: (e) => e.preventDefault(),
        onClick: () => {
          insertQuote(target.text)
          const selection = window.getSelection()
          if (selection !== null) selection.removeAllRanges()
          setTarget(null)
        },
      },
      React.createElement('span', { className: 'dshq-glyph' }, '\u275D'),
      '\u5F15\u7528')
    }

    function QuoteBridge(props) {
      React.useEffect(() => {
        bridge.setDraft = props.inputActions.setDraft
        return () => { bridge.setDraft = null }
      }, [props.inputActions])
      return null
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'quote-selection-overlay' },
      QuoteOverlay,
    ))
    slots.inject('conversation.composer.dock', () => slots.register(
      { name: 'conversation.composer.dock', id: 'quote-selection-bridge' },
      QuoteBridge,
    ))
  },
}

return module.exports; } });
