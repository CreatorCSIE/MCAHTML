# MCAHTML - Minecraft Classic Applet 离线启动器

`MCAHTML` 是一个致力于高度还原与复刻 Minecraft 早期历史版本（Classic、Indev、Infdev、Alpha、Beta、Release 以及 Infinite Map Visualizer）Java Applet 网页运行体验的纯前端离线启动项目。

本项目支持在本地通过极简脚本一键拉起轻量 Web 服务，在支持 Java 插件的浏览器（如 Pale Moon）中原汁原味地重温早期 Minecraft 的网页版魅力。

---

## 🌟 核心功能特性

- **多阶段历史版本自由切换**：支持 Classic、Indev、Infdev、Alpha、Beta、Release 正式版（直至 1.5.2）以及经典的 [Infinite Map Visualizer](https://minecraft.wiki/w/Infinite_Map_Visualizer) 等距地图预览器。
- **自定义离线身份**：支持自由输入离线玩家名字（Username），自动生成随机 SessionID。
- **Classic 多人联机直连**：对于支持联机的 Classic 版本，支持在启动前输入服务器 IP 和端口（Port），启动后自动直连服务器。
- **可视化版本管理器 (`version.html`)**：提供图形化界面自由添加新版本、修改版本属性，并支持**鼠标拖拽标签直接排列版本顺序**。
- **双端一键离线启动**：
  - **Windows**：双击 `启动离线版.bat` 即可一键拉起本地离线 Web 服务。
  - **Linux**：运行 `./run.sh` 脚本，全自动进行环境检测、开启服务并唤醒 Pale Moon 浏览器。
- **体验与兼容性内置优化**：
  - **内存限制突破**：支持给 Applet 分配 800M+ 堆内存，告别默认 256M 堆内存，你也可以修改初始内存的大小。
  - **Alpha 1.1.1 灰屏修复**：内置 Betacraft 社区灰屏与 OpenAL 音效修复补丁。
  - **Linux 高 DPI 自动适配**：Linux 启动脚本自动注入 `GDK_SCALE=1` 环境变量，解决高缩放屏幕下的 Applet 画面裁切问题。

---

## 📁 客户端 JAR 包放置指引 (Client JAR Placement)

⚠️ **特别说明（版权合规）**：受 DMCA 与版权合规限制，**本 GitHub 仓库不提供、不分发任何官方 Minecraft 游戏 `.jar` 客户端文件**（仓库仅包含 LWJGL 基础依赖与启动器网页源码）。

请自行准备或提取您的 Minecraft 历史版本 `.jar` 文件，并将其放置在 `bin/` 目录下对应的子文件夹中：

- **Classic JAR**：放置于 `bin/classic/`（例如 `bin/classic/c0.0.22a_05.jar`）
- **Indev JAR**：放置于 `bin/indev/`（例如 `bin/indev/in-20100223.jar`）
- **Infdev JAR**：放置于 `bin/infdev/`
- **Alpha JAR**：放置于 `bin/alpha/`
- **Beta JAR**：放置于 `bin/beta/`
- **Release JAR**：放置于 `bin/release/`
- **Infinite Map Visualizer JAR**：放置于 `bin/isom/`

> **提示**：放置的 `.jar` 文件名与路径，需要与您在 `version.html` 版本管理器中填写的 `jar` 字段保持一致。

---

## 💻 运行环境要求

### 1. 推荐浏览器
- **Pale Moon (苍月浏览器)**（强烈推荐，跨平台支持 NPAPI Java 插件，[前往官网下载](https://www.palemoon.org/download.shtml)，[配置 Applet 教程](https://223.85.20.43:55914/Tutorial.php?type=palemoon)）
- **Internet Explorer 11** (Windows)
- 其他支持 NPAPI 插件的经典/复古浏览器 (如 Firefox 52 ESR 及更早版本)

### 2. 支持的 Java 运行环境 (JRE)
- **Java 8**（**推荐 32位 或 64位 Java 8 JRE**，现已完美支持 64位 Java 8 突破内存上限）
- **Java 6 ~ Java 7**

> 如需下载 Oracle 历史归档版 Java JRE，可复制以下链接至浏览器：
> - **Java 8 官方下载**：[https://www.java.com/zh-CN/download/](https://www.java.com/zh-CN/download/)
> - **Java 6 归档下载**：[https://www.oracle.com/java/technologies/javase-java-archive-javase6-downloads.html](https://www.oracle.com/java/technologies/javase-java-archive-javase6-downloads.html)
> - **Java 7 归档下载**：[https://www.oracle.com/java/technologies/javase/javase7-archive-downloads.html](https://www.oracle.com/java/technologies/javase/javase7-archive-downloads.html)

### 3. 可选的本地 Web 服务环境（启动脚本会自动检测并按优先级匹配）
- **[Node.js](https://nodejs.org/)（强烈推荐）**：
  - 仅需要 Node.js 基础运行环境，**完全无需安装任何 `npm` 扩展包**。
  - 项目内置原生 `server.js`，除了提供静态文件托管外，还支持在 `version.html` 页面拖拽重排或添加版本后，**全自动将配置直接写入磁盘上的 `config/version.json` 文件**。
- **[static-web-server (SWS)](https://github.com/static-web-server/static-web-server)（备用 / 绿色免安装）**：
  - 项目 `web/` 目录下已内置预编译好的单文件绿色二进制程序（Windows 的 `sws.exe` 与 Linux 的 `sws`），体积仅 5MB 左右。**小白用户无需安装任何环境**，解压后双击脚本即可调用。
- **Python（备用）**：
  - 支持系统自带的 Python 3（`python -m http.server`），全平台原生支持。

---

## 🚀 如何启动与使用？

### 1. Windows 系统
1. 双击运行项目根目录下的 **`run.bat`**。
2. 命令行窗口会提示本地服务器已启动。
3. 打开 Pale Moon 或支持 Java 的浏览器，访问提示中的地址：  
   `http://127.0.0.1:8080/Minecraft.html`
4. 在页面顶部选择游戏版本与玩家名字，点击 **【启动游戏】** 即可。

### 2. Linux 系统 (Debian / Ubuntu / Mint / Fedora 等)
1. 在终端赋予脚本执行权限并运行：
   ```bash
   chmod +x run.sh
   ./run.sh
   ```
2. 脚本会自动后台开启离线服务并唤醒 Pale Moon 浏览器访问启动器页面。

### 3. 管理与添加新版本
- 在浏览器中访问 `http://127.0.0.1:8080/version.html`。
- 可在图形界面中添加新的 Minecraft 版本、修改主类名或 JAR 包路径，并可通过**鼠标拖拽右上角的版本标签**直接调整版本的展示顺序。

---

## 🌐 Localization / 国际化与多语言支持

本项目（包含启动器页面与文档）随时欢迎社区提供多语言本地化（i18n）与翻译支持！  
*This repository, launcher UI, and documentation welcome community contributions for localization (i18n) and translations at any time!*

如果你希望为本项目贡献其他语言（如 English、繁體中文等）的 README 文档或界面翻译，欢迎随时提交 **Pull Request** 或开 **Issue** 讨论！

---

## ❓ 常见问题排查与解决

### 1. 遇到 `java.security.AccessControlException` 安全报错
这是 Java 本地安全策略拦截导致的，请修改你的 Java 配置文件 `java.policy`：

- **文件路径**：
  - **64位 OS / 64位 Java**：`C:\Program Files\Java\<你的Java版本>\lib\security\java.policy`
  - **32位 Java**：`C:\Program Files (x86)\Java\<你的Java版本>\lib\security\java.policy`
  - **Linux**：`/usr/lib/jvm/<你的Java版本>/lib/security/java.policy`

- **修改方法**：在文件末尾的大括号内追加以下两行权限声明：
  ```text
  permission java.net.SocketPermission "*:*", "accept,connect,resolve";
  permission java.security.AllPermission;
  ```

### 2. 网页提示“你的浏览器不支持 Java”或画面黑屏
- 请确认你使用的是 **Pale Moon** 或 **Internet Explorer**，现代浏览器（如 Chrome、Edge、Firefox 52+）已全面废弃 NPAPI 插件支持。
- 在 Pale Moon 地址栏输入 `about:addons` -> 点击 **插件 (Plugins)** -> 确认 **`Java(TM) Platform SE`** 的状态已设置为 **“总是激活 (Always Activate)”**。

---

## 📄 许可证与版权声明 (License & Copyright)

- 本项目仅供 Minecraft 历史版本研究、Applet 怀旧与技术交流使用。
- 本项目源码采用 [MIT 许可证](LICENSE) 进行开源。
  - **Copyright (c) 2020-2026 CreatorCSIE. All rights reserved.**
- **第三方资产与商标免责声明**：
  - 本仓库仅包含 LWJGL 基础库、离线启动器网页源码与脚本，**不包含、不分发任何官方 Minecraft 游戏 `.jar` 客户端包或音效资源**。
  - 本项目所涉及的 Minecraft 游戏资产、商标与品牌版权均归 **Mojang Studios / Microsoft** 所有。