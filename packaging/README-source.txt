OpenCode 桌面 源码运行包

适用系统
- Windows 10 或 Windows 11，64 位。
- 需要安装 Python 3.11 或更高版本，推荐 64 位 Python 3.13。
- 需要安装并登录 OpenCode CLI。
- OpenCode 需要联网访问模型服务。

准备环境
1. 安装 64 位 Python 3.13，安装时勾选“Add python.exe to PATH”。
2. 安装 OpenCode CLI，在终端执行 opencode --version 确认可以运行。
3. 首次登录可执行 opencode auth login，或在启动后的欢迎界面点击“登录 OpenCode”。
4. 确认 Microsoft Edge WebView2 Runtime 已安装；缺少时应用会尝试使用附带安装程序自动安装。

使用提示
- 点击输入框左侧的“图片”可以添加图片，也可以直接粘贴或拖入图片。
- 点击“文件”可以选择任意本地文件，发送时会把绝对路径交给 Agent 读取；文件本身不会上传。
- 模型正在工作时仍可继续发送，新消息会显示在输入框上方排队，并在当前任务的下一分段插入执行，而不是等整个任务结束。
- 队列支持暂停、继续和清空。点击“停止生成”会自动暂停当前会话的队列，需要手动点击“继续”才会插入。
- 单个会话最多排队 20 条，附件总量最多 64 MB。插入中的首条消息不能移除，此时清空按钮会禁用。
- 队列首条发送失败时会保留该消息，可以重试或移除；失败消息未处理前，后续消息不会发送。
- 切换项目、重启服务或更新 OpenCode CLI 前会提示队列将被清空，可以取消操作。
- 输入框以 / 开头会弹出 OpenCode 命令与技能列表，支持键盘选择；右键左侧会话可以重命名、置顶/取消置顶或删除。
- 回车发送消息，Ctrl+Enter 换行。
- 任务完成或失败时，会通过 Windows 系统通知提醒。
- 每条回答和每个分段都会显示耗时；生成过程中实时更新，多分段回答还会显示本轮总耗时。
- 模型选择器旁会显示上下文的已用 / 总量和百分比，悬停可查看完整 token；切换模型后按新模型的上限重算。
- 设置中可以开启“自动允许权限”。开启后 OpenCode 的工具权限请求会自动允许，请只在信任当前项目时开启。
- 图片和提示词会发送给你选择的模型提供商，请注意内容隐私。
- 排队消息只保存在当前应用内，关闭应用或重启服务后未插入的排队消息会丢失。

开始使用
1. 将压缩包完整解压到有写入权限的普通文件夹，不要放在 Program Files。
2. 双击“启动.bat”。首次运行会创建 .venv 并联网安装依赖，可能需要几分钟。
3. 如果安装失败，双击“调试启动.bat”查看详细错误。
4. 选择或输入项目文件夹，点击“开始使用”。

目录说明
- app.py：桌面应用主程序
- static：界面资源
- requirements.txt：运行依赖
- webview2：WebView2 Runtime 安装引导程序
- 启动.bat：正常启动
- 调试启动.bat：带控制台调试启动
- 登录 OpenCode.bat：打开 OpenCode 登录窗口

数据位置
- 桌面设置：%APPDATA%\opencode-desktop\config.json
- 服务日志：%APPDATA%\opencode-desktop\serve.log
- 启动错误：%APPDATA%\opencode-desktop\desktop.log
- OpenCode 登录信息：%USERPROFILE%\.local\share\opencode\auth.json
- 本压缩包不包含任何账号、API Key 或登录凭据。

故障排查
- 未找到 Python：重新安装 Python 并勾选添加到 PATH。
- 依赖安装失败：检查网络或代理设置，然后删除 .venv 后重新运行“启动.bat”。
- 不能放在 Program Files 或只读目录，因为首次运行需要创建 .venv。
- Windows SmartScreen 可能提示未知发布者。
- 更新 OpenCode CLI 后如服务异常，请重启应用。
