/**
 * MCAHTML 离线启动器核心逻辑 (js/launcher.js)
 */

var versionsData = {};

// 1. 读取配置 (Node 环境直接读磁盘，SWS 环境优先读 localStorage)
function getVersionData() {
    if (Object.keys(versionsData).length === 0) {
        var isNode = false;
        try {
            var xhrEnv = new XMLHttpRequest();
            xhrEnv.open('GET', '/api/env', false); // 同步探测环境
            xhrEnv.send(null);
            if (xhrEnv.status === 200) {
                var envRes = JSON.parse(xhrEnv.responseText);
                if (envRes && envRes.isNode) {
                    isNode = true;
                }
            }
        } catch (e) {}

        if (isNode) {
            // Node.js 环境：强制直接读取磁盘 config/version.json
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'config/version.json?t=' + Date.now(), false);
                xhr.send(null);
                if (xhr.status === 200 || xhr.status === 0) {
                    versionsData = JSON.parse(xhr.responseText);
                    return versionsData;
                }
            } catch (e) {}
        } else {
            // SWS / 静态环境：优先读取 localStorage
            var localSaved = localStorage.getItem('MCAHTML_VERSION_JSON');
            if (localSaved) {
                try {
                    versionsData = JSON.parse(localSaved);
                    return versionsData;
                } catch (e) {}
            }
            // 静态保底读取 version.json
            try {
                var xhrStatic = new XMLHttpRequest();
                xhr.open('GET', 'config/version.json?t=' + Date.now(), false);
                xhr.send(null);
                if (xhrStatic.status === 200 || xhrStatic.status === 0) {
                    versionsData = JSON.parse(xhrStatic.responseText);
                    return versionsData;
                }
            } catch (e) {}
        }
    }
    return versionsData;
}

// 2. 解析 URL GET 参数
function getUrlParams() {
    var params = {};
    var search = window.location.search.substring(1);
    if (search) {
        var parts = search.split('&');
        for (var i = 0; i < parts.length; i++) {
            var pair = parts[i].split('=');
            if (pair[0]) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
        }
    }
    return params;
}

// 3. 页面解析期（Parse Time）同步渲染 <embed> 节点 (100% 唤醒 NPAPI 插件)
function renderSyncApplet() {
    var urlParams = getUrlParams();
    var selectedKey = urlParams.version || '';
    var data = getVersionData();
    var config = data[selectedKey];

    if (selectedKey && config) {
        var username = urlParams.username || 'Guest';
        var server = urlParams.server || '';
        var port = urlParams.port || '25565';
        var sessionId = Math.floor(Math.random() * 89999999) + 10000000;

        var width = config.width || 854;
        var height = config.height || 480;
        var title = config.title || 'Minecraft';
        var mainClass = config.main_class || 'com.mojang.minecraft.MinecraftApplet';
        var jarPath = config.jar || 'bin/minecraft.jar';

        // 组装带全套 fix_arguments 和 java_arguments 的 <embed> 节点
        var html = '<embed type="application/x-java-applet" ';
        html += 'width="' + width + '" ';
        html += 'height="' + height + '" ';
        html += 'code="org.lwjgl.util.applet.AppletLoader" ';
        html += 'archive="LWJGL/lwjgl_util_applet.jar" ';
        html += 'codebase="." ';
        html += 'al_title="' + title + '" ';
        html += 'al_main="' + mainClass + '" ';
        html += 'al_logo="bg/logo_small.gif" ';
        html += 'al_progressbar="bg/appletprogress.gif" ';
        html += 'al_cache="false" ';
        html += 'al_jars="LWJGL/lwjgl.jar, LWJGL/jinput.jar, LWJGL/lwjgl_util.jar, ' + jarPath + '" ';
        html += 'al_windows="LWJGL/windows_natives.jar" ';
        html += 'al_linux="LWJGL/linux_natives.jar" ';
        html += 'al_mac="LWJGL/macosx_natives.jar" ';
        html += 'al_solaris="LWJGL/solaris_natives.jar" ';
        html += 'al_debug="false" ';
        html += 'al_version="2.11" ';
        html += 'separate_jvm="false" ';
        html += 'fix_arguments="-Dhttp.proxyHost=betacraft.uk -Dhttp.proxyPort=11702 -Dhttp.nonProxyHosts=api.betacraft.uk|files.betacraft.uk -Dsun.java2d.noddraw=true -Dsun.awt.noerasebackground=true -Dsun.java2d.d3d=false -Dsun.java2d.opengl=false -Dsun.java2d.pmoffscreen=false -Djava.net.useSystemProxies=false" ';
        html += 'java_arguments="-Xmx800M -XX:MaxDirectMemorySize=1024M -Djava.util.Arrays.useLegacyMergeSort=true -Dsun.java2d.uiScale.enabled=false -Dsun.java2d.dpiaware=false -Dorg.lwjgl.util.NoChecks=true" ';
        html += 'boxmessage="Minecraft started" ';
        html += 'boxbgcolor="#000000" ';
        html += 'image="favicon.png" ';
        html += 'al_bgcolor="000000" ';
        html += 'al_fgcolor="ffffff" ';
        html += 'al_errorcolor="ff0000" ';
        html += 'al_prepend_host="false" ';
        html += 'username="' + username + '" ';
        html += 'sessionid="' + sessionId + '" ';

        // 只有 classic_mp 且 IP 非空时才传入 server 与 port 属性
        if (config.type === 'classic_mp' && server !== '') {
            html += 'server="' + server + '" ';
            html += 'port="' + port + '" ';
        }

        html += '></embed>';

        // 页面解析期直接写入 DOM 流
        document.write(html);
    } else {
        document.write('<div style="padding: 100px 20px; background: rgba(0,0,0,0.4); color: #ccc; max-width: 854px; margin: 0 auto; border: 1px dashed #666;"><font face="微软雅黑" size="4">请在上方选择版本并点击【启动游戏】开始运行 Applet</font></div>');
    }
}

// 4. 填充版本下拉菜单与还原表单状态
function setupLauncher() {
    var select = document.getElementById('versionSelect');
    if (!select) return;
    select.innerHTML = '';
    
    var data = getVersionData();
    if (!data || Object.keys(data).length === 0) {
        console.warn('[启动拦截] 未检测到任何游戏版本配置，即将跳转至 noversion.html');
        window.location.href = 'noversion.html';
        return;
    }
    var urlParams = getUrlParams();
    var selectedVersion = urlParams.version || '';

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var opt = document.createElement('option');
            opt.value = key;
            opt.textContent = data[key].name || key;
            if (key === selectedVersion) {
                opt.selected = true;
            }
            select.appendChild(opt);
        }
    }

    if (urlParams.username) {
        document.getElementById('usernameInput').value = urlParams.username;
    }
    if (urlParams.server) {
        document.getElementById('serverInput').value = urlParams.server;
    }
    if (urlParams.port) {
        document.getElementById('portInput').value = urlParams.port;
    }

    onVersionChange();
}

// 5. 下拉菜单切换响应
function onVersionChange() {
    var select = document.getElementById('versionSelect');
    var selectedKey = select.value;
    var data = getVersionData();
    var config = data[selectedKey] || {};

    var serverInput = document.getElementById('serverInput');
    var portInput = document.getElementById('portInput');

    if (config.type === 'classic_mp') {
        serverInput.disabled = false;
        portInput.disabled = false;
    } else {
        serverInput.disabled = true;
        portInput.disabled = true;
    }

    updateControlsText(config);
}

// 6. 动态更新 Controls 提示文案
function updateControlsText(config) {
    var html = "WASD to move<br>Space to jump<br>R to respawn at the spawn point.<br>";
    
    if (config.has_set_spawn !== false) {
        html += "Enter to set a new spawn point.<br>";
    }
    if (config.has_human) {
        html += "G to spawn human<br>";
    }
    if (config.has_block_menu) {
        html += "B to open block menu<br>";
    }
    if (config.inventory_key) {
        html += config.inventory_key + " to open inventory<br>";
    }
    if (config.has_drop) {
        html += "Q to drop things<br>";
    }
    
    html += "F to toggle fog distance<br>" +
            "Escape to release mouse and open game menu<br>" +
            "1-9 or scrollwheel to change building block type<br>" +
            "Left mouse button to add a block<br>" +
            "Right mouse button to remove a block<br>" +
            "Middle mouse button to copy block type";

    var singleElem = document.getElementById('singleControls');
    if (singleElem) singleElem.innerHTML = html;

    var multiContainer = document.getElementById('multiControlsContainer');
    if (multiContainer) {
        multiContainer.style.display = (config.type === 'classic_mp') ? 'block' : 'none';
    }
}

// 7. 点击【启动游戏】：刷新 URL 带上 GET 参数
function launchGame() {
    var select = document.getElementById('versionSelect');
    var selectedKey = select.value;
    if (!selectedKey) return;

    var username = (document.getElementById('usernameInput').value || '').trim() || 'Guest';
    var server = (document.getElementById('serverInput').value || '').trim();
    var port = (document.getElementById('portInput').value || '').trim() || '25565';

    var query = '?version=' + encodeURIComponent(selectedKey) + '&username=' + encodeURIComponent(username);

    var data = getVersionData();
    var config = data[selectedKey];
    if (config && config.type === 'classic_mp' && server !== '') {
        query += '&server=' + encodeURIComponent(server) + '&port=' + encodeURIComponent(port);
    }

    window.location.href = window.location.pathname + query;
}

// 绑定事件
window.addEventListener('load', function() {
    var vSelect = document.getElementById('versionSelect');
    var lBtn = document.getElementById('launchBtn');
    if (vSelect) vSelect.addEventListener('change', onVersionChange);
    if (lBtn) lBtn.addEventListener('click', launchGame);
    setupLauncher();
});