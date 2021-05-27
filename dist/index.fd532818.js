// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function(modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function(id, exports) {
    modules[id] = [
      function(require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function() {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"A7H4y":[function(require,module,exports) {
var HMR_HOST = null;
var HMR_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d751713988987e9331980363e24189ce";
module.bundle.HMR_BUNDLE_ID = "62d5dab885897b04655082d4fd532818";
// @flow
/*global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE*/
/*::
import type {
HMRAsset,
HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
(string): mixed;
cache: {|[string]: ParcelModule|};
hotData: mixed;
Module: any;
parent: ?ParcelRequire;
isParcelRequire: true;
modules: {|[string]: [Function, {|[string]: string|}]|};
HMR_BUNDLE_ID: string;
root: ParcelRequire;
}
interface ParcelModule {
hot: {|
data: mixed,
accept(cb: (Function) => void): void,
dispose(cb: (mixed) => void): void,
// accept(deps: Array<string> | string, cb: (Function) => void): void,
// decline(): void,
_acceptCallbacks: Array<(Function) => void>,
_disposeCallbacks: Array<(mixed) => void>,
|};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
*/
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || (function () {}));
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = undefined;
}
module.bundle.Module = Module;
var checkedAssets, /*: {|[string]: boolean|}*/
acceptedAssets, /*: {|[string]: boolean|}*/
/*: {|[string]: boolean|}*/
assetsToAccept;
function getHostname() {
  return HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
  return HMR_PORT || location.port;
}
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = getHostname();
  var port = getPort();
  var protocol = HMR_SECURE || location.protocol == 'https:' && !(/localhost|127.0.0.1|0.0.0.0/).test(hostname) ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
  // $FlowFixMe
  ws.onmessage = function (event) /*: {data: string, ...}*/
  {
    checkedAssets = {
      /*: {|[string]: boolean|}*/
    };
    acceptedAssets = {
      /*: {|[string]: boolean|}*/
    };
    assetsToAccept = [];
    var data = /*: HMRMessage*/
    JSON.parse(event.data);
    if (data.type === 'update') {
      // Remove error overlay if there is one
      removeErrorOverlay();
      let assets = data.assets.filter(asset => asset.envHash === HMR_ENV_HASH);
      // Handle HMR Update
      var handled = false;
      assets.forEach(asset => {
        var didAccept = asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        if (didAccept) {
          handled = true;
        }
      });
      if (handled) {
        console.clear();
        assets.forEach(function (asset) {
          hmrApply(module.bundle.root, asset);
        });
        for (var i = 0; i < assetsToAccept.length; i++) {
          var id = assetsToAccept[i][1];
          if (!acceptedAssets[id]) {
            hmrAcceptRun(assetsToAccept[i][0], id);
          }
        }
      } else {
        window.location.reload();
      }
    }
    if (data.type === 'error') {
      // Log parcel errors to console
      for (let ansiDiagnostic of data.diagnostics.ansi) {
        let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
        console.error('🚨 [parcel]: ' + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
      }
      // Render the fancy html overlay
      removeErrorOverlay();
      var overlay = createErrorOverlay(data.diagnostics.html);
      // $FlowFixMe
      document.body.appendChild(overlay);
    }
  };
  ws.onerror = function (e) {
    console.error(e.message);
  };
  ws.onclose = function (e) {
    if (undefined !== 'test') {
      console.warn('[parcel] 🚨 Connection to the HMR server was lost');
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
    console.log('[parcel] ✨ Error resolved');
  }
}
function createErrorOverlay(diagnostics) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
  for (let diagnostic of diagnostics) {
    let stack = diagnostic.codeframe ? diagnostic.codeframe : diagnostic.stack;
    errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>
          ${stack}
        </pre>
        <div>
          ${diagnostic.hints.map(hint => '<div>' + hint + '</div>').join('')}
        </div>
      </div>
    `;
  }
  errorHTML += '</div>';
  overlay.innerHTML = errorHTML;
  return overlay;
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]>*/
{
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push([bundle, k]);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function updateLink(link) {
  var newLink = link.cloneNode();
  newLink.onload = function () {
    if (link.parentNode !== null) {
      // $FlowFixMe
      link.parentNode.removeChild(link);
    }
  };
  newLink.setAttribute('href', // $FlowFixMe
  link.getAttribute('href').split('?')[0] + '?' + Date.now());
  // $FlowFixMe
  link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
  if (cssTimeout) {
    return;
  }
  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      // $FlowFixMe[incompatible-type]
      var href = /*: string*/
      links[i].getAttribute('href');
      var hostname = getHostname();
      var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
      var absolute = (/^https?:\/\//i).test(href) && href.indexOf(window.location.origin) !== 0 && !servedFromHMRServer;
      if (!absolute) {
        updateLink(links[i]);
      }
    }
    cssTimeout = null;
  }, 50);
}
function hmrApply(bundle, /*: ParcelRequire*/
asset) /*:  HMRAsset*/
{
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (asset.type === 'css') {
    reloadCSS();
    return;
  }
  let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
  if (deps) {
    var fn = new Function('require', 'module', 'exports', asset.output);
    modules[asset.id] = [fn, deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, /*: ParcelRequire*/
id, /*: ParcelRequire*/
/*: string*/
depsByBundle) /*: ?{ [string]: { [string]: string } }*/
{
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
    // If we reached the root bundle without finding where the asset should go,
    // there's nothing to do. Mark as "accepted" so we don't reload the page.
    if (!bundle.parent) {
      return true;
    }
    return hmrAcceptCheck(bundle.parent, id, depsByBundle);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(module.bundle.root, id).some(function (v) {
    return hmrAcceptCheck(v[0], v[1], null);
  });
}
function hmrAcceptRun(bundle, /*: ParcelRequire*/
id) /*: string*/
{
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached && cached.hot) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      var assetsToAlsoAccept = cb(function () {
        return getParents(module.bundle.root, id);
      });
      if (assetsToAlsoAccept && assetsToAccept.length) {
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
      }
    });
  }
  acceptedAssets[id] = true;
}

},{}],"4ee1I":[function(require,module,exports) {
const BASE_API = 'http://localhost:3000';
if (('serviceWorker' in navigator)) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(require("/sw.js")).then(function (registration) {
      console.log(registration);
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
const $ = function (query) {
  return document.querySelector(query);
};
function createBuyHistory() {
  window.historyComponent = new Reef('.js-history-container', {
    data: {
      buys: []
    },
    template: function (props) {
      if (!props.buys.length) {
        return `<div> Esse produto ainda não possui historico</div>`;
      }
      return `
        <div>
          ${props.buys.map(buy => {
        console.log(buy);
        return `
              <table>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th colspan="2">Valor</th>
                </tr>
                <tr>
                  <td>${buy.product}</td>
                  <td>${buy.quantity || '-'}</td>
                  <td>R$ ${buy.value || '-'}</td>
                </tr>
              <table>
            `;
      }).join('')}
        </div>
      `;
    }
  });
  window.historyComponent.render();
}
async function createProductList() {
  window.productsComponent = new Reef('.js-products', {
    data: {
      lists: []
    },
    template: function (props) {
      return `
        <h3 class="text-center"> Produtos </h3>
        
        <form class="js-move-items-from-form">
          <span id="js-move-items-from-list" href="#">Mover Itens Para a Lista?</span>
          <select name="list_destiny">
            <option>Selecione uma Lista</option>
            ${props.lists.map(list => {
        return `
                  <option value="${list.id}">${list.name}</option>
                `;
      }).join('')}
          </select>
          <input type="submit" value="Confirmar">
        </form>

        ${props.lists.map(list => {
        return `
            <ul>
              <li>
                <h4>
                  ${list.name}
                  ${list.next_buy_list ? '(Lista para produtos da proxima compra)' : ''}
                  ${list.stock_list ? '(Lista para produtos em estoque)' : ''}
                </h4>
                <p>
                  <a id="js-delete-list" data-list-id="${list.id}" href="#">Apagar</a>
                </p>
              </li>
              
              ${list.products.map(product => {
          return `
                  <li>
                    <label for="js_move_to_other_list_${product.id}">
                      <input type="checkbox" class="move-to-other-list-element hide" id="js_move_to_other_list_${product.id}" value="${product.id}">
                      <div class="item-product">
                        <p>${product.name}</p>
                        <span class="label-priority-${product.priority.split(' ')[0]} label-priority">${product.priority}</span>
                        ${product.is_low_amount ? '<span class="label-low-amount">Low Amount</span>' : ''}
                        ${product.is_it_over ? '<span class="label-out-of-stock">Fora de Estoque</span>' : ''}
                        <p class="${product.is_it_over ? 'hide' : ''}">${product.quantity} ${product.unit}</p>
                        <p>R$ ${product.last_buy_value}</p>
                        <p>
                          <a data-product-id="${product.id}" class="js-delete-product" href="#">Apagar</a>
                          <a data-product-id="${product.id}" href="#" class="js-edit-product">Editar</a>
                          <a data-product-id="${product.id}" href="#" class="js-history-product">Historico de Compras</a>
                        </p>

                        <div class="item-product-bar" style="width: ${product.percentage}%"></div>
                      </div>
                    </label>
                  </li>
                `;
        }).join('')}
            </ul>
          `;
      }).join('')}
      `;
    }
  });
  productsComponent.render();
  const listsResponse = await window.fetch(`${BASE_API}/get_lists`);
  const lists = await listsResponse.json();
  productsComponent.data.lists = lists;
}
async function updateProductsComponent() {
  const listsResponse = await window.fetch(`${BASE_API}/get_lists`);
  const lists = await listsResponse.json();
  window.productsComponent.data.lists = lists;
}
window.addEventListener('DOMContentLoaded', async () => {
  createBuyHistory();
  await createProductList();
  document.querySelector('#js-form-product').addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    switch (e.submitter.id) {
      case 'js-submit-new-product':
        await window.fetch(`${BASE_API}/create_product`, {
          body: formData,
          method: 'POST'
        });
        await updateProductsComponent();
        return;
      case 'js-submit-update-product':
        await window.fetch(`${BASE_API}/update_product`, {
          body: formData,
          method: 'PUT'
        });
        await updateProductsComponent();
        return;
    }
  });
  const listsResponse = await window.fetch(`${BASE_API}/get_lists`);
  const lists = await listsResponse.json();
  lists.forEach(list => {
    const opt = document.createElement('option');
    opt.value = list.id;
    opt.innerHTML = list.name;
    document.querySelector('#js_list_selection').append(opt);
  });
});
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.new-product').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('#js-modal-product').classList.remove('hide');
    $('#js-product-modal-title').innerHTML = 'Criar Novo Produto';
    $('#js-submit-new-product').classList.remove('hide');
    $('#js-submit-update-product').classList.add('hide');
    $('#js-form-product').reset();
  });
  document.querySelector('#js-close-modal-new-product').addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('#js-modal-product').classList.add('hide');
    document.querySelector('#js-product-id-hidden-field').value = '';
  });
  document.querySelector('.js-products').addEventListener('click', async e => {
    if (e.target.classList.contains('js-edit-product')) {
      e.preventDefault();
      document.querySelector('#js-modal-product').classList.remove('hide');
      document.querySelector('#js-product-modal-title').innerHTML = 'Editar Produto';
      $('#js-submit-new-product').classList.add('hide');
      $('#js-submit-update-product').classList.remove('hide');
      const productRequest = await window.fetch(`${BASE_API}/get_product/${e.target.dataset.productId}`);
      const product = await productRequest.json();
      $('#js-product-name-field').value = product.name;
      $('#js-product-quantity-field').value = product.quantity;
      $('#js-product-quantity-alert-field').value = product.quantity_alert;
      $('#js-product-unit-field').value = product.unit;
      $('#js-product-priority-field').value = product.priority;
      $('#js_list_selection').value = product.list_id;
      // $('#js-product-value-field').value = product.value;
      $('#js-product-is_it_over-field').checked = product.is_it_over;
      $('#js-product-move_to_next_buy-field').checked = product.move_to_next_buy;
      document.querySelector('#js-product-id-hidden-field').value = e.target.dataset.productId;
    }
    if (e.target.id === 'js-delete-list') {
      e.preventDefault();
      const listId = e.target.dataset.listId;
      await window.fetch(`${BASE_API}/delete_list/${listId}`, {
        method: 'DELETE'
      });
      await updateProductsComponent();
    }
    if (e.target.classList.contains('js-delete-product')) {
      e.preventDefault();
      const productId = e.target.dataset.productId;
      await window.fetch(`${BASE_API}/delete_product/${productId}`, {
        method: 'DELETE'
      });
      await updateProductsComponent();
    }
    if (e.target.classList.contains('js-history-product')) {
      e.preventDefault();
      const productId = e.target.dataset.productId;
      const res = await window.fetch(`${BASE_API}/get_product_buys/${productId}`);
      const buys = await res.json();
      window.historyComponent.data.buys = buys;
      $('.js-history-modal').classList.remove('hide');
    }
  });
  $('.js-history-modal').addEventListener('click', e => {
    if (e.target.classList.contains('js-history-modal')) {
      $('.js-history-modal').classList.add('hide');
    }
  }, false);
  $('.js-products').addEventListener('submit', async e => {
    if (e.target.classList.contains('js-move-items-from-form')) {
      e.preventDefault();
      const allProductsChecked = [...document.querySelectorAll('input:checked')].filter(checkbox => checkbox.id.includes('js_move_to_other_list'));
      const formData = new FormData(e.target);
      allProductsChecked.forEach(product => {
        formData.append(`products[]`, product.value);
      });
      await window.fetch(`${BASE_API}/move_products_from_list`, {
        body: formData,
        method: 'PUT'
      });
      updateProductsComponent();
    }
  });
  $('#js-form-list').addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await window.fetch(`${BASE_API}/create_list`, {
      body: formData,
      method: 'POST'
    });
    await updateProductsComponent();
  });
});
async function addBuyItem() {
  window.buyItemComponent = new Reef('#js-buy-item', {
    data: {
      items: [],
      products: []
    },
    template: function (props) {
      return `
        ${props.items.map(item => {
        return `
            <form class="js-buy-section-form">
              <section class="buy-section flex space-between wrap">
                  <p>
                    <label> Produto:* </label>
                    <select name="buys[]product_id">
                      <option> Escolha um Produto </option>
                      ${props.products.map(product => {
          return `<option value="${product.id}"> ${product.name} : ${product.unit} </option>`;
        }).join('')}
                    </select>
                  </p>
                  <p>
                    <label> Quantidade:* </label>
                    <input type="number" name="buys[]quantity" step="0.01">
                  </p>
                  <p>
                    <label> Valor:* </label>
                    <input type="number" name="buys[]value" step="0.01">$
                  </p>
                  <p>
                    <label>
                      <input type="checkbox" name="buys[]is_move_to_stock" checked value="true">
                      Mover para Estoque?*
                    </label>
                  </p>
              </section>
          `;
      }).join('')}

          <div class="text-center">
            <button class="success" id="js-finish-buy-button">Finalizar Compra</button>
          </div>
        </form>
      `;
    }
  });
  const res = await window.fetch(`${BASE_API}/get_products`);
  const products = await res.json();
  console.log(products);
  window.buyItemComponent.data.products = products;
  window.buyItemComponent.render();
}
window.addEventListener('DOMContentLoaded', async () => {
  await addBuyItem();
  console.log($('.js-buy-section-form'));
  $('#js-add-new-item-button').addEventListener('click', () => {
    window.buyItemComponent.data.items.push({
      product: null,
      quantity: 0,
      value: 0
    });
  });
  $('#js-buy-item').addEventListener('submit', async e => {
    e.preventDefault();
    if (e.target.classList.contains('js-buy-section-form')) {
      const formData = new FormData(e.target);
      await window.fetch(`${BASE_API}/create_buy`, {
        method: 'POST',
        body: formData
      });
      await updateProductsComponent();
    }
  });
  $('#js-new-buy-link').addEventListener('click', () => {
    $('.js-products-page').classList.add('hide');
    $('.js-buy-page').classList.remove('hide');
  });
  $('#js-products-link').addEventListener('click', () => {
    $('.js-products-page').classList.remove('hide');
    $('.js-buy-page').classList.add('hide');
  });
});

},{"/sw.js":"11bTB"}],"11bTB":[function(require,module,exports) {
module.exports = require('./bundle-url').getBundleURL() + "sw.js"
},{"./bundle-url":"3seVR"}],"3seVR":[function(require,module,exports) {
"use strict";

/* globals document:readonly */
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/, '$1') + '/';
} // TODO: Replace uses with `new URL(url).origin` when ie11 is no longer supported.


function getOrigin(url) {
  let matches = ('' + url).match(/(https?|file|ftp):\/\/[^/]+/);

  if (!matches) {
    throw new Error('Origin not found');
  }

  return matches[0];
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
exports.getOrigin = getOrigin;
},{}]},["A7H4y","4ee1I"], "4ee1I", "parcelRequire21f9")

//# sourceMappingURL=index.fd532818.js.map
