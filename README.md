# dsh-quote-selection

DeepSeek Harness Web UI 插件:在会话中选中文字后,选区第一行顶部浮出「❝ 引用」按钮,点击把选中内容以 Markdown 引用块写入输入框,光标停在引用块下一行,直接输入提问即可。再次引用时,两段引用块之间恰好空一行。

参考 ChatGPT 网页端的“询问 ChatGPT”交互。

## 安装

```sh
# 从 GitHub 安装(推荐 pin 到具体 commit)
dsh plugin --profile web add github:YOUR_ACCOUNT/dsh-quote-selection
dsh --profile web
```

本插件零依赖、零构建脚本:GitHub 安装不触发任何构建,因此**不需要** pnpm 的 `allowBuilds` 授权。

本地开发安装(把本仓库与 deepseek-harness 保持兄弟目录):

```sh
dsh plugin --profile web add ../dsh-quote-selection
```

## 使用

1. 在任意回复中选中一段文字(单行或多行);
2. 点击浮出的「❝ 引用」按钮;
3. 输入框出现:

   ```
   > 引用的第一行
   >
   > 第二行
   ```

   光标停在引用块下方一行,直接打字提问。

## 卸载 / 升级

```sh
dsh plugin --profile web remove dsh-quote-selection
dsh plugin --profile web update dsh-quote-selection
```

## 实现说明

- 浮层按钮注册在 `shell.overlay`(list 座位,可加性、默认点击穿透);选区校验基于产品自带锚点 `[data-conversation-scroll]` / `[data-composer-seat]`,滚动、缩放、点击别处即隐藏。
- 写入走输入机器的单一公开写路径 `inputActions.setDraft`(通过 `conversation.composer.dock` 座位上的隐形桥组件获取),撤销栈与引用 chip 等既有机制不受影响。
- 浏览器半边只使用基线模块表(`react`)与 Cordis 服务(`slots`、`timer`),无任何其他 `@deepseek-ai/*` 值依赖。
