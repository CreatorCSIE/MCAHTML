/**
 * MCAHTML 版本管理页面逻辑控制 (js/manager.js)
 * 支持：Node.js (硬盘直写模式) 与 SWS (LocalStorage 模式) 智能环境隔离
 */

var currentJSON = {};
var isNodeServer = false; // 环境隔离标识
var isJarUserEdited = false;
var isNameUserEdited  = false;
var isTitleUserEdited = false;

// 1. 自动探测当前运行环境 (Node.js 还是 SWS)
function detectEnvironment(callback) {
    fetch('/api/env')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data && data.isNode) {
                isNodeServer = true;
                console.log('[环境隔离] 检测到 Node.js 环境：开启【硬盘直写模式】');
            }
            callback();
        })
        .catch(function() {
            isNodeServer = false;
            console.log('[环境隔离] 检测到 SWS / 静态服务器环境：开启【LocalStorage 缓存模式】');
            callback();
        });
}

// 2. 初始化根据环境执行隔离读取
function initManager() {
    detectEnvironment(function() {
        if (isNodeServer) {
            // Node.js 模式：强制清除 localStorage 干扰，直接读取磁盘最新文件
            localStorage.removeItem('MCAHTML_VERSION_JSON');
            loadFromDiskFile();
        } else {
            // SWS / 静态模式：优先读取 localStorage
            var localSaved = localStorage.getItem('MCAHTML_VERSION_JSON');
            if (localSaved) {
                try {
                    currentJSON = JSON.parse(localSaved);
                    renderAll();
                    setupJarInputListener();
                    return;
                } catch (e) {}
            }
            loadFromDiskFile();
        }
    });
    setupJarInputListener();
}

// 直接从磁盘 config/version.json 加载 (带时间戳防止 HTTP 缓存)
function loadFromDiskFile() {
    fetch('config/version.json?t=' + Date.now())
        .then(function(res) { return res.json(); })
        .then(function(data) {
            currentJSON = data;
            renderAll();
        })
        .catch(function(err) {
            if (window.VERSIONS_DATA) {
                currentJSON = window.VERSIONS_DATA;
                renderAll();
            }
        });
}

// 3. 保存逻辑环境隔离
function saveConfigData(shouldAlert) {
    var jsonStr = JSON.stringify(currentJSON, null, 2);

    if (isNodeServer) {
        // A. Node.js 模式：直接发送 POST 写入磁盘 config/version.json，不污染 localStorage
        fetch('/api/save-version', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStr
        })
        .then(function(res) { return res.json(); })
        .then(function(res) {
            if (res.success) {
                renderAll();
                if (shouldAlert) {
                    alert('配置已直接成功写入磁盘 config/version.json！');
                }
            }
        });
    } else {
        // B. SWS / 静态模式：保存到 localStorage
        localStorage.setItem('MCAHTML_VERSION_JSON', jsonStr);
        renderAll();
        if (shouldAlert) {
            alert('配置已保存到本地浏览器缓存 (SWS 模式)！\n如需永久覆盖源文件，请点击【下载 version.json 文件】。');
        }
    }
}

// 恢复为默认 config/version.json
function restoreDefaultJSON() {
    if (confirm('确定要恢复为默认的 config/version.json 配置文件吗？')) {
        localStorage.removeItem('MCAHTML_VERSION_JSON');
        loadFromDiskFile();
    }
}

// 拖拽重排后自动触发隔离保存
function reorderJSONKeys(newKeyOrder) {
    var newJSON = {};
    for (var i = 0; i < newKeyOrder.length; i++) {
        var k = newKeyOrder[i];
        if (currentJSON.hasOwnProperty(k)) {
            newJSON[k] = currentJSON[k];
        }
    }
    currentJSON = newJSON;
    saveConfigData(false); // 拖拽后自动按当前环境保存
}

// 映射阶段对应的文件夹名字
function getStageFolder(type) {
    if (type === 'classic_mp' || type === 'classic') {
        return 'classic';
    }
    return type;
}

function onJarInput() {
    isJarUserEdited = true;
}

function onNameInput() {
    isNameUserEdited = true;
}

function onTitleInput() {
    isTitleUserEdited = true;
}

function onTypePresetChange() {
    var type = document.getElementById('v_type').value;
    var mainClassInput = document.getElementById('v_main_class');

    if (type === 'classic_mp' || type === 'classic') {
        mainClassInput.value = "com.mojang.minecraft.MinecraftApplet";
    } else if (type === 'isom') {
        mainClassInput.value = "net.minecraft.isom.IsomPreviewApplet";
    } else {
        mainClassInput.value = "net.minecraft.client.MinecraftApplet";
    }

    autoSuggestPaths();
}

function autoSuggestPaths() {
    var key = document.getElementById('v_key').value.trim();
    var type = document.getElementById('v_type').value;
    var stageFolder = getStageFolder(type);

    // A. 自动补全 JAR 相对路径（未手动改动过时）
    var jarInput = document.getElementById('v_jar');
    if (!isJarUserEdited) {
        jarInput.value = key ? ("bin/" + stageFolder + "/" + key + ".jar") : "";
    }

    // B. 自动补全显示名称 Display Name（未手动改动过时）
    var nameInput = document.getElementById('v_name');
    if (!isNameUserEdited) {
        nameInput.value = key ? key : "";
    }

    // C. 自动补全 Applet 标题 al_title（未手动改动过时）
    var titleInput = document.getElementById('v_title');
    if (!isTitleUserEdited) {
        titleInput.value = key ? ("Minecraft_" + key.replace(/[^a-zA-Z0-9_]/g, '_')) : "";
    }
}

function toggleInventorySelect() {
    var isChecked = document.getElementById('v_has_inventory').checked;
    document.getElementById('v_inventory_key').disabled = !isChecked;
}

function buildVersionObjectFromForm() {
    var key = document.getElementById('v_key').value.trim();
    if (!key) {
        alert('请填写版本 Key！');
        return null;
    }

    var obj = {
        "name": document.getElementById('v_name').value.trim() || key,
        "type": document.getElementById('v_type').value,
        "title": document.getElementById('v_title').value.trim() || key,
        "main_class": document.getElementById('v_main_class').value.trim() || "com.mojang.minecraft.MinecraftApplet",
        "jar": document.getElementById('v_jar').value.trim() || ("bin/classic/" + key + ".jar"),
        "width": parseInt(document.getElementById('v_width').value) || 854,
        "height": parseInt(document.getElementById('v_height').value) || 480
    };

    if (document.getElementById('v_has_15a_patch').checked) obj["has_15a_patch"] = true;
    if (document.getElementById('v_dpi_fix').checked) obj["dpi_fix"] = true;
    if (document.getElementById('v_haspaid').checked) obj["haspaid"] = true;

    if (document.getElementById('v_has_human').checked) obj["has_human"] = true;
    if (document.getElementById('v_has_block_menu').checked) obj["has_block_menu"] = true;
    if (!document.getElementById('v_has_set_spawn').checked) obj["has_set_spawn"] = false;

    if (document.getElementById('v_has_inventory').checked) {
        obj["inventory_key"] = document.getElementById('v_inventory_key').value || "I";
    }

    if (document.getElementById('v_has_drop').checked) obj["has_drop"] = true;
    if (document.getElementById('v_has_sneak').checked) obj["has_sneak"] = true;

    return { key: key, data: obj };
}

function addOrUpdateVersion() {
    var res = buildVersionObjectFromForm();
    if (!res) return;

    currentJSON[res.key] = res.data;
    saveConfigData(true);
}

function setupJarInputListener() {
    var jarInput = document.getElementById('v_jar');
    if (jarInput) {
        jarInput.addEventListener('input', onJarInput);
    }
}

function editExistingVersion(key) {
    var data = currentJSON[key];
    if (!data) return;

    // 锁定所有标志
    isJarUserEdited   = true;
    isNameUserEdited  = true;
    isTitleUserEdited = true;

    document.getElementById('v_key').value = key;
    document.getElementById('v_name').value = data.name || '';
    document.getElementById('v_type').value = data.type || 'classic';
    document.getElementById('v_title').value = data.title || '';
    document.getElementById('v_main_class').value = data.main_class || 'com.mojang.minecraft.MinecraftApplet';
    document.getElementById('v_jar').value = data.jar || '';
    document.getElementById('v_width').value = data.width || 854;
    document.getElementById('v_height').value = data.height || 480;

    // 复选框回显
    document.getElementById('v_has_15a_patch').checked = !!data.has_15a_patch;
    document.getElementById('v_dpi_fix').checked = !!data.dpi_fix;
    document.getElementById('v_haspaid').checked = !!data.haspaid;
    document.getElementById('v_has_human').checked = !!data.has_human;
    document.getElementById('v_has_block_menu').checked = !!data.has_block_menu;
    document.getElementById('v_has_set_spawn').checked = (data.has_set_spawn !== false);

    if (data.inventory_key) {
        document.getElementById('v_has_inventory').checked = true;
        document.getElementById('v_inventory_key').value = data.inventory_key;
        document.getElementById('v_inventory_key').disabled = false;
    } else {
        document.getElementById('v_has_inventory').checked = false;
        document.getElementById('v_inventory_key').value = 'I';
        document.getElementById('v_inventory_key').disabled = true;
    }

    document.getElementById('v_has_drop').checked = !!data.has_drop;
    document.getElementById('v_has_sneak').checked = !!data.has_sneak;
}

function setupFormInputListeners() {
    var jarInput   = document.getElementById('v_jar');
    var nameInput  = document.getElementById('v_name');
    var titleInput = document.getElementById('v_title');

    if (jarInput)   jarInput.addEventListener('input', onJarInput);
    if (nameInput)  nameInput.addEventListener('input', onNameInput);
    if (titleInput) titleInput.addEventListener('input', onTitleInput);
}

function renderAll() {
    document.getElementById('jsonOutput').value = JSON.stringify(currentJSON, null, 2);

    var listContainer = document.getElementById('versionTagList');
    listContainer.innerHTML = '';

    var keys = Object.keys(currentJSON);
    if (keys.length === 0) {
        listContainer.innerHTML = '<span style="color:#666; font-size:12px;">暂无配置数据</span>';
        return;
    }

    var draggedKey = null;
    var isDragging = false;

    for (var i = 0; i < keys.length; i++) {
        (function(k) {
            var tag = document.createElement('span');
            tag.className = 'version-tag';
            tag.textContent = k;
            tag.title = '单击编辑 ' + k + ' | 按住可拖拽排序';
            
            tag.setAttribute('draggable', 'true');
            tag.setAttribute('data-key', k);

            tag.addEventListener('click', function(e) {
                if (isDragging) {
                    isDragging = false;
                    return;
                }
                editExistingVersion(k);
            });

            tag.addEventListener('dragstart', function(e) {
                isDragging = true;
                draggedKey = k;
                e.dataTransfer.setData('text/plain', k);
                this.classList.add('dragging');
            });

            tag.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });

            tag.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });

            tag.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                var targetKey = this.getAttribute('data-key');

                if (draggedKey && targetKey && draggedKey !== targetKey) {
                    var currentKeys = Object.keys(currentJSON);
                    var dragIdx = currentKeys.indexOf(draggedKey);
                    var targetIdx = currentKeys.indexOf(targetKey);

                    if (dragIdx > -1 && targetIdx > -1) {
                        currentKeys.splice(dragIdx, 1);
                        currentKeys.splice(targetIdx, 0, draggedKey);
                        reorderJSONKeys(currentKeys);
                    }
                }
            });

            tag.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                setTimeout(function() { isDragging = false; }, 50);

                var overTags = document.querySelectorAll('.version-tag.drag-over');
                for (var j = 0; j < overTags.length; j++) {
                    overTags[j].classList.remove('drag-over');
                }
            });

            listContainer.appendChild(tag);
        })(keys[i]);
    }
}

function resetForm() {
    isJarUserEdited   = false;
    isNameUserEdited  = false;
    isTitleUserEdited = false;

    document.getElementById('v_key').value = '';
    document.getElementById('v_name').value = '';
    document.getElementById('v_title').value = '';
    document.getElementById('v_jar').value = '';
    document.getElementById('v_type').value = 'classic';
    document.getElementById('v_has_15a_patch').checked = false;
    document.getElementById('v_dpi_fix').checked = false;
    document.getElementById('v_haspaid').checked = false;
    document.getElementById('v_has_human').checked = false;
    document.getElementById('v_has_set_spawn').checked = false;
    document.getElementById('v_has_block_menu').checked = false;

    document.getElementById('v_has_inventory').checked = false;
    document.getElementById('v_inventory_key').value = 'I';
    document.getElementById('v_inventory_key').disabled = true;

    document.getElementById('v_has_drop').checked = false;
    document.getElementById('v_has_sneak').checked = false;
    onTypePresetChange();
}

function downloadJSONFile() {
    var jsonStr = JSON.stringify(currentJSON, null, 2);
    var blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "version.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyJSONToClipboard() {
    var textarea = document.getElementById('jsonOutput');
    textarea.select();
    try {
        document.execCommand('copy');
        alert('已成功复制完整 JSON 配置到剪贴板！');
    } catch (e) {
        alert('请手动选择右侧文本框内容进行复制。');
    }
}

window.addEventListener('load', initManager);