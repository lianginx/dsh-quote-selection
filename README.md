<div align="center">

<img src="assets/banner.svg" alt="dsh-quote-selection: select chat text, click ❝ Quote, it lands in the composer as a Markdown blockquote" width="880">

# dsh-quote-selection

**❝ Quote selected chat text into the composer · A DeepSeek Harness Web UI plugin**

[![GitHub release](https://img.shields.io/github/v/tag/lianginx/dsh-quote-selection?label=release)](https://github.com/lianginx/dsh-quote-selection/tags)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-DSH%20Web%20UI-4176E6)

**Install**

```sh
dsh plugin --profile web add github:lianginx/dsh-quote-selection
```

[Features](#features) · [Install](#install) · [Usage](#usage) · [How it works](#how-it-works)

English · [简体中文](README.zh.md)

</div>

---

Inspired by ChatGPT's "Ask ChatGPT" selection popover: select any text in a conversation reply — one line or many — and a floating **❝ 引用 (Quote)** button appears above the selection's first line. Click it and the selection lands in the composer as a Markdown blockquote, with the caret ready on the line right below. Type your follow-up question immediately.

## Features

- **Floating quote button** — appears on selection over conversation text; hides on scroll, resize, or clicking elsewhere
- **Clean Markdown output** — one `> ` per line; multi-line selections carry proper `>` continuation lines and render as a standard blockquote after sending
- **Chained quotes** — quoting again appends a new block separated by exactly one blank line, handy for asking about several passages at once
- **Writes through the front door** — inserts via `inputActions.setDraft`, the input machine's single public write path, so undo history, reference chips, and draft stats all keep working
- **Zero dependencies, zero build** — plain JavaScript shipped as-is; installing from GitHub runs no code and needs no pnpm `allowBuilds` permission

## Install

```sh
# From GitHub (pinning to a tag or commit is recommended)
dsh plugin --profile web add github:lianginx/dsh-quote-selection
# Or locked:
dsh plugin --profile web add github:lianginx/dsh-quote-selection#v0.1.0

dsh --profile web   # or: dsh web
```

Local development install (with this checkout kept next to deepseek-harness):

```sh
dsh plugin --profile web add ../dsh-quote-selection
```

> `add` links the checkout (`link:` semantics), so editing `client.js` takes effect after restarting `dsh web` — no reinstall needed.

Requires `node ^22.19 || >=24` and a profile containing the official `@deepseek-ai/dsh-web-app` layer (the shipped `web` template has it).

## Usage

1. Select some text in any assistant reply;
2. Click the floating **❝ 引用** button;
3. The composer now holds:

   ```markdown
   > The quoted first line
   >
   > The second line
   ```

   with the caret on the line below — start typing your question;
4. Select other text and quote again: the new block joins with exactly one blank line between quotes.

### Uninstall / upgrade

```sh
dsh plugin --profile web remove dsh-quote-selection
dsh plugin --profile web update dsh-quote-selection
```

## How it works

| Piece | Slot / mechanism |
|---|---|
| Floating button | `shell.overlay` (additive list slot, click-through by default); selection validated against the product anchors `[data-conversation-scroll]` / `[data-composer-seat]` |
| Draft write | An invisible bridge component on `conversation.composer.dock` holding `inputActions.setDraft` — the input machine's only public write path |
| Styling | A `data-plugin`-tagged stylesheet injected inside the factory closure, built on theme tokens (`--dsw-alias-*`) so light and dark both adapt |
| Timers | The Cordis `timer` service (`inject: ['timer']`); no native timer globals |

The browser half depends only on baseline module-table entries (`react`) and Cordis services (`slots`, `timer`) — no other `@deepseek-ai/*` value imports. The package follows the DSH publishing conventions ([publish tutorial](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)): manifest dual declaration `dsh.bundle.patch` + `dsh.client { platform: 'web' }`, and a patch that only inserts rows.

## License

[MIT](LICENSE)
