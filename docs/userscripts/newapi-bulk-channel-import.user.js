// ==UserScript==
// @name         NewAPI Bulk Channel Importer
// @namespace    https://github.com/QuantumNous/new-api
// @version      0.2.0
// @description  Bulk-create NewAPI channels from provider keys using the built-in /api/channel API, compatible with NewAPI v0.13.2 and v1.x.
// @match        http://*/channels*
// @match        https://*/channels*
// @match        http://*/channel*
// @match        https://*/channel*
// @match        http://*/*channel*
// @match        https://*/*channel*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const SCRIPT_ID = 'nai-bulk-channel-importer';
  const STORAGE_KEY = 'nai:bulk-channel-importer:v1';

  const CHANNEL_TYPES = [
    [1, 'OpenAI'],
    [14, 'Anthropic'],
    [33, 'AWS'],
    [24, 'Gemini'],
    [43, 'DeepSeek'],
    [3, 'Azure'],
    [41, 'Vertex AI'],
    [48, 'xAI'],
    [58, 'Advanced Custom'],
    [42, 'Mistral'],
    [34, 'Cohere'],
    [20, 'OpenRouter'],
    [4, 'Ollama'],
    [40, 'SiliconFlow'],
    [27, 'Perplexity'],
    [25, 'Moonshot'],
    [17, 'Ali'],
    [26, 'Zhipu V4'],
    [15, 'Baidu'],
    [46, 'Baidu V2'],
    [23, 'Tencent'],
    [18, 'Xunfei'],
    [45, 'VolcEngine'],
    [31, 'LingYiWanWu'],
    [35, 'MiniMax'],
    [49, 'Coze'],
    [8, 'Custom'],
    [57, 'ChatGPT Subscription (Codex)'],
  ];

  const DEFAULT_SETTING_JSON = JSON.stringify({
    force_format: false,
    thinking_to_content: false,
    proxy: '',
    pass_through_body_enabled: false,
    system_prompt: '',
    system_prompt_override: false,
  });

  const DEFAULT_CONFIG = {
    apiRoot: '/api/channel',
    typePreset: '14',
    customType: '14',
    baseUrl: '',
    prefix: 'Anthropic-',
    suffix: '',
    nameTemplate: '{prefix}{num}{suffix}',
    numberStart: '1',
    numberPad: '2',
    alphaStart: 'A',
    models: '',
    group: 'default',
    modelMapping: '',
    priority: '0',
    weight: '0',
    tag: '',
    remark: '',
    status: true,
    autoBan: true,
    delayMs: '250',
    dedupeKeys: true,
    continueOnError: false,
    allowServiceTier: false,
    allowInferenceGeo: false,
    allowSpeed: false,
    claudeBetaQuery: false,
    settingJson: DEFAULT_SETTING_JSON,
    settingsJson: '{}',
    paramOverride: '',
    headerOverride: '',
    statusCodeMapping: '',
    other: '',
  };

  const state = {
    open: false,
    running: false,
    nameSeedKey: '',
    nameTimestamp: '',
    nameDate: '',
    randomCodes: new Map(),
  };

  const fieldIds = [
    'apiRoot',
    'typePreset',
    'customType',
    'baseUrl',
    'prefix',
    'suffix',
    'nameTemplate',
    'numberStart',
    'numberPad',
    'alphaStart',
    'models',
    'group',
    'modelMapping',
    'priority',
    'weight',
    'tag',
    'remark',
    'delayMs',
    'settingJson',
    'settingsJson',
    'paramOverride',
    'headerOverride',
    'statusCodeMapping',
    'other',
  ];

  const checkboxIds = [
    'status',
    'autoBan',
    'dedupeKeys',
    'continueOnError',
    'allowServiceTier',
    'allowInferenceGeo',
    'allowSpeed',
    'claudeBetaQuery',
  ];

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_CONFIG };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  function saveConfig(config) {
    const sanitized = { ...config };
    delete sanitized.keys;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  }

  function injectStyles() {
    if (document.getElementById(`${SCRIPT_ID}-style`)) return;
    const style = document.createElement('style');
    style.id = `${SCRIPT_ID}-style`;
    style.textContent = `
      .nai-bulk-button {
        position: fixed;
        right: 22px;
        bottom: 24px;
        z-index: 2147483646;
        border: 1px solid rgba(255, 255, 255, .16);
        border-radius: 8px;
        background: #f6f4ef;
        color: #1d1b19;
        font: 600 14px/1.2 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 11px 14px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, .28);
        cursor: pointer;
      }

      .nai-bulk-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        width: min(720px, calc(100vw - 40px));
        max-height: calc(100vh - 40px);
        overflow: hidden;
        display: none;
        color: #efeeeb;
        background: #191817;
        border: 1px solid rgba(255, 255, 255, .12);
        border-radius: 10px;
        box-shadow: 0 24px 72px rgba(0, 0, 0, .44);
        font: 14px/1.45 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .nai-bulk-panel[data-open="true"] {
        display: flex;
        flex-direction: column;
      }

      .nai-bulk-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, .1);
      }

      .nai-bulk-title {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .nai-bulk-title strong {
        font-size: 16px;
        letter-spacing: 0;
      }

      .nai-bulk-title span {
        color: #aaa7a1;
        font-size: 12px;
      }

      .nai-bulk-close,
      .nai-bulk-small-button,
      .nai-bulk-action {
        border: 1px solid rgba(255, 255, 255, .14);
        border-radius: 7px;
        background: #2a2927;
        color: #efeeeb;
        cursor: pointer;
        font: inherit;
      }

      .nai-bulk-close {
        width: 34px;
        height: 34px;
        font-size: 18px;
      }

      .nai-bulk-body {
        overflow: auto;
        padding: 14px 16px 16px;
      }

      .nai-bulk-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 12px;
      }

      .nai-bulk-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }

      .nai-bulk-field label,
      .nai-bulk-check span,
      .nai-bulk-section-title {
        color: #d7d4cf;
        font-weight: 650;
        font-size: 12px;
      }

      .nai-bulk-field small,
      .nai-bulk-help {
        color: #9a9690;
        font-size: 12px;
      }

      .nai-bulk-field input,
      .nai-bulk-field select,
      .nai-bulk-field textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, .12);
        border-radius: 7px;
        background: #242321;
        color: #efeeeb;
        outline: none;
        padding: 9px 10px;
        font: 13px/1.35 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .nai-bulk-field textarea {
        min-height: 88px;
        resize: vertical;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }

      .nai-bulk-field input:focus,
      .nai-bulk-field select:focus,
      .nai-bulk-field textarea:focus {
        border-color: rgba(232, 112, 70, .72);
        box-shadow: 0 0 0 2px rgba(232, 112, 70, .18);
      }

      .nai-span-2 { grid-column: span 2; }
      .nai-span-3 { grid-column: span 3; }
      .nai-span-4 { grid-column: span 4; }
      .nai-span-5 { grid-column: span 5; }
      .nai-span-6 { grid-column: span 6; }
      .nai-span-7 { grid-column: span 7; }
      .nai-span-8 { grid-column: span 8; }
      .nai-span-12 { grid-column: span 12; }

      .nai-bulk-section {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid rgba(255, 255, 255, .1);
      }

      .nai-bulk-inline {
        display: flex;
        gap: 8px;
        align-items: end;
      }

      .nai-bulk-inline .nai-bulk-field {
        flex: 1;
      }

      .nai-bulk-small-button {
        height: 36px;
        padding: 0 10px;
        white-space: nowrap;
      }

      .nai-bulk-small-button:hover,
      .nai-bulk-close:hover,
      .nai-bulk-action:hover {
        background: #34322f;
      }

      .nai-bulk-checks {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
      }

      .nai-bulk-check {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 30px;
      }

      .nai-bulk-check input {
        width: 16px;
        height: 16px;
        accent-color: #e87046;
      }

      .nai-bulk-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px 16px;
        border-top: 1px solid rgba(255, 255, 255, .1);
        background: #171615;
      }

      .nai-bulk-action {
        min-height: 38px;
        padding: 0 14px;
      }

      .nai-bulk-action-primary {
        background: #e87046;
        color: #1d100a;
        border-color: #e87046;
        font-weight: 700;
      }

      .nai-bulk-action-primary:hover {
        background: #f07f55;
      }

      .nai-bulk-action:disabled,
      .nai-bulk-small-button:disabled {
        opacity: .52;
        cursor: not-allowed;
      }

      .nai-bulk-preview {
        max-height: 220px;
        overflow: auto;
        border: 1px solid rgba(255, 255, 255, .1);
        border-radius: 8px;
      }

      .nai-bulk-preview table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }

      .nai-bulk-preview th,
      .nai-bulk-preview td {
        text-align: left;
        padding: 8px 9px;
        border-bottom: 1px solid rgba(255, 255, 255, .08);
        vertical-align: top;
      }

      .nai-bulk-preview th {
        position: sticky;
        top: 0;
        background: #20201e;
        color: #cfcac2;
      }

      .nai-bulk-log {
        min-height: 92px;
        max-height: 180px;
        overflow: auto;
        white-space: pre-wrap;
        border: 1px solid rgba(255, 255, 255, .1);
        border-radius: 8px;
        background: #11100f;
        color: #c9d6d0;
        padding: 10px;
        font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }

      .nai-bulk-muted {
        color: #aaa7a1;
      }

      .nai-bulk-ok { color: #77d1a1; }
      .nai-bulk-error { color: #ff9a8c; }

      details.nai-bulk-details summary {
        cursor: pointer;
        color: #d7d4cf;
        font-weight: 650;
        font-size: 12px;
        margin-bottom: 10px;
      }

      @media (max-width: 720px) {
        .nai-bulk-panel {
          top: 10px;
          right: 10px;
          width: calc(100vw - 20px);
          max-height: calc(100vh - 20px);
        }
        .nai-span-2,
        .nai-span-3,
        .nai-span-4,
        .nai-span-5,
        .nai-span-6,
        .nai-span-7,
        .nai-span-8 {
          grid-column: span 12;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderTypeOptions(selected) {
    const options = CHANNEL_TYPES.map(([value, label]) => {
      const isSelected = String(value) === String(selected) ? ' selected' : '';
      return `<option value="${value}"${isSelected}>${escapeHtml(label)} (${value})</option>`;
    });
    const customSelected = selected === 'custom' ? ' selected' : '';
    options.push(`<option value="custom"${customSelected}>自定义类型编号</option>`);
    return options.join('');
  }

  function panelHtml(config) {
    return `
      <div class="nai-bulk-header">
        <div class="nai-bulk-title">
          <strong>NewAPI 批量添加渠道</strong>
          <span>直接调用 /api/channel，兼容 v0.13.2 和 v1.x 登录态。</span>
        </div>
        <button type="button" class="nai-bulk-close" data-nai-close aria-label="关闭">x</button>
      </div>
      <div class="nai-bulk-body">
        <div class="nai-bulk-grid">
          <div class="nai-bulk-field nai-span-6">
            <label for="nai-apiRoot">API 路径</label>
            <input id="nai-apiRoot" data-nai-field="apiRoot" value="${escapeHtml(config.apiRoot)}">
          </div>
          <div class="nai-bulk-field nai-span-3">
            <label for="nai-typePreset">类型</label>
            <select id="nai-typePreset" data-nai-field="typePreset">${renderTypeOptions(config.typePreset)}</select>
          </div>
          <div class="nai-bulk-field nai-span-3">
            <label for="nai-customType">自定义类型编号</label>
            <input id="nai-customType" data-nai-field="customType" inputmode="numeric" value="${escapeHtml(config.customType)}">
          </div>
          <div class="nai-bulk-field nai-span-6">
            <label for="nai-baseUrl">API 地址</label>
            <input id="nai-baseUrl" data-nai-field="baseUrl" placeholder="留空使用 NewAPI 内置默认地址" value="${escapeHtml(config.baseUrl)}">
          </div>
          <div class="nai-bulk-field nai-span-6">
            <label for="nai-group">分组</label>
            <input id="nai-group" data-nai-field="group" placeholder="default 或 default,vip" value="${escapeHtml(config.group)}">
          </div>
          <div class="nai-bulk-field nai-span-12">
            <label for="nai-keys">API key，一行一个</label>
            <textarea id="nai-keys" data-nai-sensitive placeholder="sk-ant-..."></textarea>
            <small>key 不会被保存；创建时每行会生成一个独立渠道。</small>
          </div>
        </div>

        <div class="nai-bulk-section">
          <div class="nai-bulk-grid">
            <div class="nai-bulk-field nai-span-3">
              <label for="nai-prefix">名称前缀</label>
              <input id="nai-prefix" data-nai-field="prefix" value="${escapeHtml(config.prefix)}">
            </div>
            <div class="nai-bulk-field nai-span-3">
              <label for="nai-suffix">名称后缀</label>
              <input id="nai-suffix" data-nai-field="suffix" value="${escapeHtml(config.suffix)}">
            </div>
            <div class="nai-bulk-field nai-span-6">
              <label for="nai-nameTemplate">名称模板</label>
              <input id="nai-nameTemplate" data-nai-field="nameTemplate" value="${escapeHtml(config.nameTemplate)}">
            </div>
            <div class="nai-bulk-field nai-span-2">
              <label for="nai-numberStart">数字起始</label>
              <input id="nai-numberStart" data-nai-field="numberStart" inputmode="numeric" value="${escapeHtml(config.numberStart)}">
            </div>
            <div class="nai-bulk-field nai-span-2">
              <label for="nai-numberPad">数字位数</label>
              <input id="nai-numberPad" data-nai-field="numberPad" inputmode="numeric" value="${escapeHtml(config.numberPad)}">
            </div>
            <div class="nai-bulk-field nai-span-2">
              <label for="nai-alphaStart">字母起始</label>
              <input id="nai-alphaStart" data-nai-field="alphaStart" value="${escapeHtml(config.alphaStart)}">
            </div>
            <div class="nai-bulk-field nai-span-6">
              <label>可用占位符</label>
              <div class="nai-bulk-help">{prefix} {suffix} {num} {index} {alpha} {rand6} {ts} {date} {key8}</div>
            </div>
          </div>
        </div>

        <div class="nai-bulk-section">
          <div class="nai-bulk-inline">
            <div class="nai-bulk-field">
              <label for="nai-templateId">从样板渠道读取模型/映射</label>
              <input id="nai-templateId" inputmode="numeric" placeholder="渠道 ID">
            </div>
            <button type="button" class="nai-bulk-small-button" data-nai-load-id>读取 ID</button>
            <button type="button" class="nai-bulk-small-button" data-nai-load-latest>读取同类型最新</button>
          </div>
        </div>

        <div class="nai-bulk-section">
          <div class="nai-bulk-grid">
            <div class="nai-bulk-field nai-span-12">
              <label for="nai-models">模型</label>
              <textarea id="nai-models" data-nai-field="models" placeholder="claude-sonnet-4-20250514,claude-opus-4-20250514">${escapeHtml(config.models)}</textarea>
              <small>支持逗号或换行；提交前会去重并转换成逗号分隔。</small>
            </div>
            <div class="nai-bulk-field nai-span-12">
              <label for="nai-modelMapping">模型映射 JSON</label>
              <textarea id="nai-modelMapping" data-nai-field="modelMapping" placeholder='{"claude-sonnet-4": "claude-sonnet-4-20250514"}'>${escapeHtml(config.modelMapping)}</textarea>
              <small>留空表示不配置。NewAPI 要求值必须是字符串。</small>
            </div>
          </div>
        </div>

        <div class="nai-bulk-section">
          <div class="nai-bulk-grid">
            <div class="nai-bulk-field nai-span-2">
              <label for="nai-priority">优先级</label>
              <input id="nai-priority" data-nai-field="priority" inputmode="numeric" value="${escapeHtml(config.priority)}">
            </div>
            <div class="nai-bulk-field nai-span-2">
              <label for="nai-weight">权重</label>
              <input id="nai-weight" data-nai-field="weight" inputmode="numeric" value="${escapeHtml(config.weight)}">
            </div>
            <div class="nai-bulk-field nai-span-3">
              <label for="nai-tag">标签</label>
              <input id="nai-tag" data-nai-field="tag" value="${escapeHtml(config.tag)}">
            </div>
            <div class="nai-bulk-field nai-span-3">
              <label for="nai-delayMs">提交间隔 ms</label>
              <input id="nai-delayMs" data-nai-field="delayMs" inputmode="numeric" value="${escapeHtml(config.delayMs)}">
            </div>
            <div class="nai-bulk-field nai-span-2">
              <label for="nai-remark">备注</label>
              <input id="nai-remark" data-nai-field="remark" value="${escapeHtml(config.remark)}">
            </div>
            <div class="nai-span-12 nai-bulk-checks">
              ${checkboxHtml('status', '启用', config.status)}
              ${checkboxHtml('autoBan', '自动禁用', config.autoBan)}
              ${checkboxHtml('dedupeKeys', 'key 去重', config.dedupeKeys)}
              ${checkboxHtml('continueOnError', '遇错继续', config.continueOnError)}
              ${checkboxHtml('allowServiceTier', '允许 service_tier', config.allowServiceTier)}
              ${checkboxHtml('allowInferenceGeo', '允许 inference_geo', config.allowInferenceGeo)}
              ${checkboxHtml('allowSpeed', '允许 speed', config.allowSpeed)}
              ${checkboxHtml('claudeBetaQuery', 'Claude beta query', config.claudeBetaQuery)}
            </div>
          </div>
        </div>

        <div class="nai-bulk-section">
          <details class="nai-bulk-details">
            <summary>高级 JSON 字段</summary>
            <div class="nai-bulk-grid">
              <div class="nai-bulk-field nai-span-6">
                <label for="nai-settingJson">setting JSON</label>
                <textarea id="nai-settingJson" data-nai-field="settingJson">${escapeHtml(config.settingJson)}</textarea>
              </div>
              <div class="nai-bulk-field nai-span-6">
                <label for="nai-settingsJson">settings JSON</label>
                <textarea id="nai-settingsJson" data-nai-field="settingsJson">${escapeHtml(config.settingsJson)}</textarea>
              </div>
              <div class="nai-bulk-field nai-span-6">
                <label for="nai-paramOverride">param_override JSON</label>
                <textarea id="nai-paramOverride" data-nai-field="paramOverride">${escapeHtml(config.paramOverride)}</textarea>
              </div>
              <div class="nai-bulk-field nai-span-6">
                <label for="nai-headerOverride">header_override JSON</label>
                <textarea id="nai-headerOverride" data-nai-field="headerOverride">${escapeHtml(config.headerOverride)}</textarea>
              </div>
              <div class="nai-bulk-field nai-span-6">
                <label for="nai-statusCodeMapping">status_code_mapping JSON</label>
                <textarea id="nai-statusCodeMapping" data-nai-field="statusCodeMapping">${escapeHtml(config.statusCodeMapping)}</textarea>
              </div>
              <div class="nai-bulk-field nai-span-6">
                <label for="nai-other">other</label>
                <textarea id="nai-other" data-nai-field="other">${escapeHtml(config.other)}</textarea>
              </div>
            </div>
          </details>
        </div>

        <div class="nai-bulk-section">
          <div class="nai-bulk-section-title">预览</div>
          <div id="nai-preview" class="nai-bulk-preview"></div>
        </div>

        <div class="nai-bulk-section">
          <div class="nai-bulk-section-title">日志</div>
          <div id="nai-log" class="nai-bulk-log">Ready.</div>
        </div>
      </div>
      <div class="nai-bulk-actions">
        <button type="button" class="nai-bulk-action" data-nai-preview>刷新预览</button>
        <button type="button" class="nai-bulk-action" data-nai-copy-payload>复制首条 payload</button>
        <button type="button" class="nai-bulk-action nai-bulk-action-primary" data-nai-run>开始添加</button>
      </div>
    `;
  }

  function checkboxHtml(id, label, checked) {
    return `
      <label class="nai-bulk-check">
        <input id="nai-${id}" type="checkbox" data-nai-check="${id}"${checked ? ' checked' : ''}>
        <span>${escapeHtml(label)}</span>
      </label>
    `;
  }

  function mount() {
    if (document.getElementById(SCRIPT_ID)) return;
    injectStyles();

    const config = loadConfig();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nai-bulk-button';
    button.textContent = '批量渠道';
    button.addEventListener('click', () => togglePanel(true));

    const panel = document.createElement('div');
    panel.id = SCRIPT_ID;
    panel.className = 'nai-bulk-panel';
    panel.setAttribute('data-open', 'false');
    panel.innerHTML = panelHtml(config);

    document.body.append(button, panel);
    bindPanel(panel);
    refreshPreview();
  }

  function bindPanel(panel) {
    qs('[data-nai-close]', panel).addEventListener('click', () => togglePanel(false));
    qs('[data-nai-preview]', panel).addEventListener('click', refreshPreview);
    qs('[data-nai-run]', panel).addEventListener('click', runImport);
    qs('[data-nai-copy-payload]', panel).addEventListener('click', copyFirstPayload);
    qs('[data-nai-load-id]', panel).addEventListener('click', loadTemplateById);
    qs('[data-nai-load-latest]', panel).addEventListener('click', loadLatestTemplate);

    qsa('[data-nai-field], [data-nai-check]', panel).forEach((el) => {
      el.addEventListener('input', () => {
        saveConfig(collectConfig(false));
        refreshPreview();
      });
      el.addEventListener('change', () => {
        saveConfig(collectConfig(false));
        refreshPreview();
      });
    });

    qs('#nai-keys', panel).addEventListener('input', refreshPreview);
  }

  function togglePanel(open) {
    state.open = open;
    const panel = document.getElementById(SCRIPT_ID);
    if (panel) panel.setAttribute('data-open', String(open));
  }

  function collectConfig(includeKeys = true) {
    const panel = document.getElementById(SCRIPT_ID);
    const config = { ...DEFAULT_CONFIG };
    for (const id of fieldIds) {
      const el = qs(`[data-nai-field="${id}"]`, panel);
      if (el) config[id] = el.value;
    }
    for (const id of checkboxIds) {
      const el = qs(`[data-nai-check="${id}"]`, panel);
      if (el) config[id] = el.checked;
    }
    if (includeKeys) {
      config.keys = qs('#nai-keys', panel)?.value || '';
    }
    return config;
  }

  function getChannelType(config) {
    const value = config.typePreset === 'custom' ? config.customType : config.typePreset;
    const type = Number.parseInt(value, 10);
    if (!Number.isInteger(type) || type < 0) {
      throw new Error('类型编号无效');
    }
    return type;
  }

  function parseKeys(raw, dedupe) {
    const keys = String(raw || '')
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!dedupe) return keys;
    return Array.from(new Set(keys));
  }

  function normalizeList(raw) {
    return Array.from(
      new Set(
        String(raw || '')
          .split(/[,\n]/)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    ).join(',');
  }

  function parseOptionalJsonObject(raw, label) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) return null;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      throw new Error(`${label} 不是有效 JSON: ${error.message}`);
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${label} 必须是 JSON 对象`);
    }
    return parsed;
  }

  function normalizeOptionalJsonString(raw, label) {
    const parsed = parseOptionalJsonObject(raw, label);
    return parsed ? JSON.stringify(parsed) : null;
  }

  function normalizeModelMapping(raw) {
    const parsed = parseOptionalJsonObject(raw, '模型映射');
    if (!parsed) return null;
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'string') {
        throw new Error(`模型映射 ${key} 的值必须是字符串`);
      }
    }
    return JSON.stringify(parsed);
  }

  function numberToken(config, index) {
    const start = Number.parseInt(config.numberStart || '1', 10);
    const pad = Math.max(0, Number.parseInt(config.numberPad || '0', 10) || 0);
    const value = (Number.isFinite(start) ? start : 1) + index;
    return String(value).padStart(pad, '0');
  }

  function alphaToIndex(value) {
    const text = String(value || 'A').trim();
    const first = text[0] || 'A';
    const code = first.toUpperCase().charCodeAt(0);
    if (code < 65 || code > 90) return 0;
    return code - 65;
  }

  function indexToAlpha(index, uppercase) {
    let value = Math.max(0, index);
    let output = '';
    do {
      output = String.fromCharCode(65 + (value % 26)) + output;
      value = Math.floor(value / 26) - 1;
    } while (value >= 0);
    return uppercase ? output : output.toLowerCase();
  }

  function randomCode(length = 6) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
  }

  function timestampToken(date = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      '-',
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('');
  }

  function dateToken(date = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  }

  function keyPreview(key) {
    if (!key) return '';
    if (key.length <= 12) return `${key.slice(0, 4)}...`;
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
  }

  function ensureNameSeed(config, keys) {
    const seedKey = JSON.stringify({
      keys,
      prefix: config.prefix,
      suffix: config.suffix,
      nameTemplate: config.nameTemplate,
      numberStart: config.numberStart,
      numberPad: config.numberPad,
      alphaStart: config.alphaStart,
    });
    if (state.nameSeedKey === seedKey) return;
    state.nameSeedKey = seedKey;
    state.nameTimestamp = timestampToken();
    state.nameDate = dateToken();
    state.randomCodes = new Map();
  }

  function stableRandomCode(key, index) {
    const cacheKey = `${index}:${key}`;
    if (!state.randomCodes.has(cacheKey)) {
      state.randomCodes.set(cacheKey, randomCode(6));
    }
    return state.randomCodes.get(cacheKey);
  }

  function makeName(config, key, index) {
    const alphaStart = String(config.alphaStart || 'A');
    const uppercase = alphaStart[0] !== alphaStart[0]?.toLowerCase();
    const alpha = indexToAlpha(alphaToIndex(alphaStart) + index, uppercase);
    const replacements = {
      prefix: config.prefix || '',
      suffix: config.suffix || '',
      num: numberToken(config, index),
      index: String(index + 1),
      alpha,
      rand6: stableRandomCode(key, index),
      ts: state.nameTimestamp || timestampToken(),
      date: state.nameDate || dateToken(),
      key8: String(key || '').slice(0, 8),
    };
    return String(config.nameTemplate || '{prefix}{num}{suffix}').replace(
      /\{([a-zA-Z0-9_]+)\}/g,
      (match, token) => (token in replacements ? replacements[token] : match)
    );
  }

  function buildRows(config) {
    const keys = parseKeys(config.keys, config.dedupeKeys);
    ensureNameSeed(config, keys);
    return keys.map((key, index) => ({
      index,
      key,
      name: makeName(config, key, index),
    }));
  }

  function validateConfig(config, rows) {
    getChannelType(config);
    if (!rows.length) throw new Error('请先粘贴至少一个 API key');
    if (!normalizeList(config.models)) throw new Error('模型不能为空');
    if (!String(config.group || '').trim()) throw new Error('分组不能为空');
    normalizeModelMapping(config.modelMapping);
    normalizeOptionalJsonString(config.settingJson, 'setting JSON');
    normalizeOptionalJsonString(config.settingsJson, 'settings JSON');
    normalizeOptionalJsonString(config.paramOverride, 'param_override JSON');
    normalizeOptionalJsonString(config.headerOverride, 'header_override JSON');
    normalizeOptionalJsonString(config.statusCodeMapping, 'status_code_mapping JSON');
  }

  function refreshPreview() {
    const preview = qs('#nai-preview');
    if (!preview) return;
    let rows = [];
    let error = '';
    try {
      const config = collectConfig(true);
      rows = buildRows(config);
      validateConfig({ ...config, keys: rows.map((row) => row.key).join('\n') }, rows);
    } catch (err) {
      error = err.message;
    }

    if (!rows.length) {
      preview.innerHTML = `<div class="nai-bulk-help" style="padding: 10px;">粘贴 key 后显示预览。</div>`;
      return;
    }

    const visibleRows = rows.slice(0, 50);
    const body = visibleRows
      .map(
        (row) => `
          <tr>
            <td>${row.index + 1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(keyPreview(row.key))}</td>
          </tr>
        `
      )
      .join('');

    const suffix =
      rows.length > visibleRows.length
        ? `<div class="nai-bulk-help" style="padding: 8px 9px;">只显示前 ${visibleRows.length} 条，共 ${rows.length} 条。</div>`
        : '';
    const errorHtml = error
      ? `<div class="nai-bulk-error" style="padding: 8px 9px;">${escapeHtml(error)}</div>`
      : `<div class="nai-bulk-ok" style="padding: 8px 9px;">预览 ${rows.length} 条，可提交。</div>`;

    preview.innerHTML = `
      ${errorHtml}
      <table>
        <thead><tr><th>#</th><th>渠道名</th><th>key</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
      ${suffix}
    `;
  }

  function buildSettingJson(config) {
    const setting = parseOptionalJsonObject(config.settingJson, 'setting JSON') || {};
    return JSON.stringify({
      force_format: setting.force_format === true,
      thinking_to_content: setting.thinking_to_content === true,
      proxy: typeof setting.proxy === 'string' ? setting.proxy : '',
      pass_through_body_enabled: setting.pass_through_body_enabled === true,
      system_prompt: typeof setting.system_prompt === 'string' ? setting.system_prompt : '',
      system_prompt_override: setting.system_prompt_override === true,
    });
  }

  function buildOtherSettingsJson(config, type) {
    const settings = parseOptionalJsonObject(config.settingsJson, 'settings JSON') || {};

    if (type === 1 || type === 14) {
      settings.allow_service_tier = config.allowServiceTier === true;
    } else {
      delete settings.allow_service_tier;
    }

    if (type === 14) {
      settings.allow_inference_geo = config.allowInferenceGeo === true;
      settings.allow_speed = config.allowSpeed === true;
      settings.claude_beta_query = config.claudeBetaQuery === true;
    } else {
      delete settings.allow_speed;
      delete settings.claude_beta_query;
      if (type !== 1) delete settings.allow_inference_geo;
    }

    if (!('disable_task_polling_sleep' in settings)) {
      settings.disable_task_polling_sleep = false;
    }

    return JSON.stringify(settings);
  }

  function numberOrNull(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function buildPayload(row, config) {
    const type = getChannelType(config);
    const modelMapping = normalizeModelMapping(config.modelMapping);
    const payload = {
      mode: 'single',
      channel: {
        name: row.name,
        type,
        base_url: String(config.baseUrl || '').trim().replace(/\/+$/, '') || null,
        key: row.key,
        openai_organization: null,
        models: normalizeList(config.models),
        group: normalizeList(config.group),
        model_mapping: modelMapping,
        priority: numberOrNull(config.priority),
        weight: numberOrNull(config.weight),
        test_model: null,
        auto_ban: config.autoBan ? 1 : 0,
        status: config.status ? 1 : 2,
        status_code_mapping: normalizeOptionalJsonString(config.statusCodeMapping, 'status_code_mapping JSON'),
        tag: String(config.tag || '').trim() || null,
        remark: String(config.remark || ''),
        setting: buildSettingJson(config),
        param_override: normalizeOptionalJsonString(config.paramOverride, 'param_override JSON'),
        header_override: normalizeOptionalJsonString(config.headerOverride, 'header_override JSON'),
        settings: buildOtherSettingsJson(config, type),
        other: String(config.other || ''),
      },
    };
    return payload;
  }

  function getApiRoot(config) {
    const root = String(config.apiRoot || '/api/channel').trim() || '/api/channel';
    return root.replace(/\/+$/, '');
  }

  function apiUrl(config, suffix = '') {
    const root = getApiRoot(config);
    return `${root}${suffix}`;
  }

  function normalizeUserId(value) {
    const text = String(value ?? '').trim();
    if (!text || text === 'null' || text === 'undefined') return '';
    return text;
  }

  function getUserId() {
    try {
      const uid = normalizeUserId(localStorage.getItem('uid'));
      if (uid) return uid;
    } catch {
      /* fall through to old UI storage */
    }

    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return '';
      const user = JSON.parse(rawUser);
      return (
        normalizeUserId(user?.id) ||
        normalizeUserId(user?.user?.id) ||
        normalizeUserId(user?.data?.id)
      );
    } catch {
      return '';
    }
  }

  async function apiRequest(url, options = {}) {
    const uid = getUserId();
    const headers = {
      Accept: 'application/json',
      'Cache-Control': 'no-store',
      ...options.headers,
    };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (uid) {
      headers['New-Api-User'] = uid;
    }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { success: false, message: text || response.statusText };
    }
    if (!response.ok) {
      const message = data?.message || `${response.status} ${response.statusText}`;
      throw new Error(message);
    }
    return data;
  }

  function normalizeChannelResult(result) {
    const data = result?.data ?? result;
    if (!data || typeof data !== 'object') return null;
    return data.channel || data.item || data;
  }

  function firstChannelFromListResult(result) {
    const data = result?.data ?? result;
    const lists = [
      data?.items,
      data?.channels,
      data?.list,
      data?.rows,
      result?.items,
      result?.channels,
      Array.isArray(data) ? data : null,
    ];

    for (const list of lists) {
      if (Array.isArray(list) && list.length > 0) return list[0];
    }
    return null;
  }

  function appendLog(message, kind = '') {
    const log = qs('#nai-log');
    if (!log) return;
    const time = new Date().toLocaleTimeString();
    const line = `[${time}] ${message}`;
    log.textContent = log.textContent === 'Ready.' ? line : `${log.textContent}\n${line}`;
    log.scrollTop = log.scrollHeight;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setRunning(running) {
    state.running = running;
    qsa('[data-nai-run], [data-nai-load-id], [data-nai-load-latest], [data-nai-preview], [data-nai-copy-payload]').forEach(
      (button) => {
        button.disabled = running;
      }
    );
    const runButton = qs('[data-nai-run]');
    if (runButton) runButton.textContent = running ? '添加中...' : '开始添加';
  }

  async function runImport() {
    if (state.running) return;
    const config = collectConfig(true);
    const rows = buildRows(config);
    try {
      validateConfig(config, rows);
    } catch (err) {
      appendLog(err.message, 'error');
      refreshPreview();
      return;
    }

    const uid = getUserId();
    if (!uid) {
      appendLog('未读取到登录用户 ID。新版需 localStorage.uid，v0.13.2 需 localStorage.user.id；请确认已登录并刷新页面。', 'error');
      return;
    }

    const ok = window.confirm(`准备创建 ${rows.length} 个渠道。确认继续？`);
    if (!ok) return;

    setRunning(true);
    appendLog(`开始创建 ${rows.length} 个渠道。`);
    const delay = Math.max(0, Number.parseInt(config.delayMs || '0', 10) || 0);
    let successCount = 0;

    try {
      for (const row of rows) {
        const payload = buildPayload(row, config);
        try {
          const result = await apiRequest(apiUrl(config), {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (!result?.success) {
            throw new Error(result?.message || 'NewAPI 返回 success=false');
          }
          successCount += 1;
          appendLog(`OK ${row.index + 1}/${rows.length}: ${row.name} (${keyPreview(row.key)})`);
        } catch (err) {
          appendLog(`FAIL ${row.index + 1}/${rows.length}: ${row.name} - ${err.message}`, 'error');
          if (!config.continueOnError) break;
        }
        if (delay > 0 && row.index < rows.length - 1) {
          await sleep(delay);
        }
      }
    } finally {
      setRunning(false);
      appendLog(`完成：成功 ${successCount}/${rows.length}。`);
    }
  }

  async function copyFirstPayload() {
    const config = collectConfig(true);
    const rows = buildRows(config);
    try {
      validateConfig(config, rows);
      const payload = buildPayload(rows[0], config);
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      appendLog('已复制首条 payload。');
    } catch (err) {
      appendLog(err.message, 'error');
    }
  }

  function applyTemplateChannel(channel) {
    if (!channel) throw new Error('没有读取到渠道数据');
    setField('typePreset', CHANNEL_TYPES.some(([value]) => value === channel.type) ? String(channel.type) : 'custom');
    setField('customType', String(channel.type ?? '14'));
    setField('baseUrl', channel.base_url || '');
    setField('models', channel.models || '');
    setField('group', channel.group || 'default');
    setField('modelMapping', prettyJsonString(channel.model_mapping));
    setField('priority', String(channel.priority ?? 0));
    setField('weight', String(channel.weight ?? 0));
    setField('tag', channel.tag || '');
    setField('remark', channel.remark || '');
    setField('settingJson', prettyJsonString(channel.setting) || DEFAULT_SETTING_JSON);
    setField('settingsJson', prettyJsonString(channel.settings) || '{}');
    setField('paramOverride', prettyJsonString(channel.param_override));
    setField('headerOverride', prettyJsonString(channel.header_override));
    setField('statusCodeMapping', prettyJsonString(channel.status_code_mapping));
    setField('other', channel.other || '');
    setCheck('status', channel.status === 1);
    setCheck('autoBan', channel.auto_ban !== 0);

    try {
      const settings = channel.settings ? JSON.parse(channel.settings) : {};
      setCheck('allowServiceTier', settings.allow_service_tier === true);
      setCheck('allowInferenceGeo', settings.allow_inference_geo === true);
      setCheck('allowSpeed', settings.allow_speed === true);
      setCheck('claudeBetaQuery', settings.claude_beta_query === true);
    } catch {
      /* keep current checkboxes */
    }

    saveConfig(collectConfig(false));
    refreshPreview();
  }

  function prettyJsonString(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return trimmed;
    }
  }

  function setField(id, value) {
    const el = qs(`[data-nai-field="${id}"]`);
    if (el) el.value = value;
  }

  function setCheck(id, checked) {
    const el = qs(`[data-nai-check="${id}"]`);
    if (el) el.checked = checked;
  }

  async function loadTemplateById() {
    const config = collectConfig(false);
    const id = String(qs('#nai-templateId')?.value || '').trim();
    if (!id) {
      appendLog('请输入样板渠道 ID。', 'error');
      return;
    }
    try {
      const result = await apiRequest(apiUrl(config, `/${encodeURIComponent(id)}`));
      if (!result?.success) throw new Error(result?.message || '读取失败');
      applyTemplateChannel(normalizeChannelResult(result));
      appendLog(`已读取渠道 #${id} 的模型/映射。`);
    } catch (err) {
      appendLog(`读取渠道 #${id} 失败：${err.message}`, 'error');
    }
  }

  async function loadLatestTemplate() {
    const config = collectConfig(false);
    let type;
    try {
      type = getChannelType(config);
    } catch (err) {
      appendLog(err.message, 'error');
      return;
    }
    const params = new URLSearchParams({
      p: '1',
      page_size: '1',
      type: String(type),
      id_sort: 'true',
    });
    try {
      const result = await apiRequest(apiUrl(config, `?${params.toString()}`));
      if (!result?.success) throw new Error(result?.message || '读取失败');
      const channel = firstChannelFromListResult(result);
      if (!channel) throw new Error(`没有找到 type=${type} 的渠道`);
      applyTemplateChannel(channel);
      appendLog(`已读取同类型最新渠道 #${channel.id} 的模型/映射。`);
    } catch (err) {
      appendLog(`读取同类型最新渠道失败：${err.message}`, 'error');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
