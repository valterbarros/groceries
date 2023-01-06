import { BASE_API  } from './env_master';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register(new URL(`${location.origin}/sw.js`)).then(function(registration) {
      // console.log(registration);
      // Registration was successful
      // console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      // console.log('ServiceWorker registration failed: ', err);
    });
  });
}

/**
 * query elements
 * @param {string} query 
 * @returns Element
 */
const $ = function(query) {
  return document.querySelector(query);
}

/**
 * 
 * @param {string} eventName 
 * @param {string} queryElement 
 * @param {{}} detail 
 */
const dispatchHelper = (eventName, queryElement, detail) => {
  const ce = new CustomEvent(eventName, { detail });
  $(queryElement).dispatchEvent(ce);
}

const formatDateForDateTimeInput = (date) => date.toISOString().replace(/(?<=T[0-9]+:[0-9]+):.+/gi, '')

function addBuyItem() {
  const buyItemComponent = new Reef('#js-buy-item', {
    data: {
      items: []
    },
    template: function (props) {
      return `
      <form class="js-buy-section-form">
        <div class="buy-header">
          <div>
            <label for="buy-date">Data:</label>
            <input id="buy-date" type="datetime-local" name="buy_at" class="js-buy-data">
          </div>
        </div>

        <hr/>

        ${props.items.map((item, index) => {
          let productInput = '';

          if (item.product) {
            productInput = `<input
              type="search"
              name="buys[]product_id"
              class="js-product-query-search"
              list="productSuggestion"
              required
              data-index="${index}"
              reef-value="${item?.product?.id} - ${item?.product?.name} : ${item?.product?.unit}"
              data-section-id="${item.index}"
            />`;
          } else {
            productInput = `<input
              type="search"
              name="buys[]product_id"
              class="js-product-query-search"
              list="productSuggestion"
              required
              data-index="${index}"
              value=""
              data-section-id="${item.index}"
            />`;
          }
          
          const quantityStepRegistry = {
            unidade: 'Unidade',
            gramas: 'Gramas',
            kilogramas: 'Kilogramas',
            mililitro: 'Mililitro',
            litro: 'Litro'
          };

          const keys = Object.keys(quantityStepRegistry);

          return `
            <div id="product-component"></div>

            <section class="buy-section flex space-between wrap" id="list-id-index-${item.index}">
              <p>
                <label> Produto:<abbr class="required">*</abbr> </label>
                <br/>
                ${productInput}
              </p>
              <p id="js-container-unit-select" class="container-unit-select ${item.disableUnit ? 'invisible' : ''}">
                <label for="js-unit-select"> Unidade:<abbr class="required">*</abbr> </label>
                <br/>
                <select name="buys[]unit" id="js-unit-select">
                  <option selected value="">-</option>
                  ${keys.map(item => {
                    return `<option value="${quantityStepRegistry[item]}">${quantityStepRegistry[item]}</option>`
                  }).join('')}
                </select>
              </p>
              <p>
                <label> Quantidade:<abbr class="required">*</abbr> </label>
                <br/>
                <input type="number" name="buys[]quantity" step="0.01" required>
              </p>
              <p class="move-to-stock-container">
                <label for="js-move_to_stock" class="stock-label"> Mover para Estoque?<abbr class="required">*</abbr></label>
                <input type="checkbox" name="buys[]is_move_to_stock" checked value="true" id="js-move_to_stock" class="stock-input">
              </p>
              <p class="new-product-item">
                <button
                  href="#"
                  class="js-remove-buy-action alert"
                  data-index="${index}"
                >
                  Remover
                </button>
              </p>
            </section>
          `
        }).join('')}
          ${props.items.length ? `
            <div class="text-center footer-buy padding-10">
              <button class="success" id="js-finish-buy-button">Finalizar Compra</button>
            </div>` : ''
          }
        </form>
      `
    },
    allowHTML: true
  });

  const productComponent = new Reef('#product-component', {
    data: {
      products: []
    },
    template: function(props) {
      return `
        <datalist id="productSuggestion">
          ${props.products.map((product) => {
            return `
              <option
                reef-value="${product?.id} - ${product?.name} : ${product?.unit}"
              >
                ${product?.escaped_value}
              </option>
            `
          }).join('')}
        </datalist>
      `
    },
    attachTo: buyItemComponent
  });

  buyItemComponent.render();

  $('#js-buy-item').addEventListener('update-product-data', (e) => {
    productComponent.data.products = e.detail.products;
  });

  $('#js-buy-item').addEventListener('update-buy-component-items-data', (e) => {
    const { items } = e.detail;
    buyItemComponent.data.items = items;
  });

  $('#js-buy-item').addEventListener('remove-buy-component-items-data', (e) => {
    const { index } = e.detail;
    buyItemComponent.data.items.splice(index, 1);
  });

  $('#js-buy-item').addEventListener('append-buy-component-items-data', (e) => {
    const { item } = e.detail;
    buyItemComponent.data.items.unshift(item);
  });

  $('#js-buy-item').addEventListener('update-buy-component-item-data', (e) => {
    const { index, data } = e.detail;
    
    const buyItem = buyItemComponent.data.items
      .find((item) => item.index === parseInt(index));

    Object.assign(buyItem, data);
  });
}

document.addEventListener('poorlinks:loaded:new-buy', async () => {
  addBuyItem();

  const selectedProducts = history.state;

  if (Object.keys(selectedProducts).length) {
    const ce = new CustomEvent('update-buy-component-items-data',
      { detail: { items: selectedProducts } });
    $('#js-buy-item').dispatchEvent(ce);
  }

  // Set current date
  const currentDateTime = formatDateForDateTimeInput(new Date());
  $('.js-buy-data').value = currentDateTime.replace('Z', '');

  $('#js-add-new-item-button').addEventListener('click', () => {
    const index = Date.now();
    const item = {
      product: null,
      quantity: 0,
      value: 0,
      index
    };

    const ce = new CustomEvent('append-buy-component-items-data',
      { detail: { item } });
    $('#js-buy-item').dispatchEvent(ce);
  });

  $('#js-buy-item').addEventListener('click', (e) => {
    if (e.target.classList.contains('js-remove-buy-action')) {
      e.preventDefault();
      const index = e.target.dataset.index;
      const ce = new CustomEvent('remove-buy-component-items-data',
        { detail: { index } });
      $('#js-buy-item').dispatchEvent(ce);
    }
  });

  $('#js-buy-item').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (e.target.classList.contains('js-buy-section-form')) {
      const formData = new FormData(e.target);

      try {
        await window.fetch(`${BASE_API}/create_buy`, { method: 'POST', body: formData });
        const ce = new CustomEvent('update-buy-component-items-data',
          { detail: { items: [] } });
        $('#js-buy-item').dispatchEvent(ce);
        $('#js-success-buy-message').classList.add('show');
        $('#js-success-buy-message').classList.remove('hide');
        setTimeout(() => {
          $('#js-success-buy-message').classList.remove('show');
          $('#js-success-buy-message').classList.add('hide');
        }, 500)
      } catch (err) {
        console.log(err);
      }
    }
  });

  $('#js-buy-item').addEventListener('change', function(e) {
    if (e.target.classList.contains('js-product-query-search')) {
      const { sectionId: buyItemIndex } = e.target.dataset;
      console.log(buyItemIndex);

      // input: 70 - Asa de frango : Gramas
      // matchs "70 -"  
      const matchIfProductFromRemote = /^[0-9]+\s-/;

      if (matchIfProductFromRemote.test(e.target.value)) {
        const data = { index: buyItemIndex, data: { disableUnit: true } }
        dispatchHelper('update-buy-component-item-data', '#js-buy-item', data);
      } else {
        const ce = new CustomEvent('update-buy-component-item-data', { detail: { index: buyItemIndex, data: { disableUnit: false } } });
        $('#js-buy-item').dispatchEvent(ce);
      }
    }
  });

  let debounceSearch = false;

  $('#js-buy-item').addEventListener('input', async (e) => {
    if (e.target.classList.contains('js-product-query-search')) {
      if (!debounceSearch) {
        debounceSearch = true;

        setTimeout(async () => {
          if (e.target.value) {
            const res = await window.fetch(`${BASE_API}/get_products_by_name?query_name=${e.target.value}`);
            const products = await res.json();
    
            const ce = new CustomEvent('update-product-data', { detail: { products } });
            $('#js-buy-item').dispatchEvent(ce);
          } else {
            const ce = new CustomEvent('update-product-data', { detail: { products: [] } });
            $('#js-buy-item').dispatchEvent(ce);
          }

          debounceSearch = false;
        }, 500);
      }
    }
  });
});
