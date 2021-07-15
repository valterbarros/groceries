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

const $ = function(query) {
  return document.querySelector(query);
}

function addBuyItem() {
  const buyItemComponent = new Reef('#js-buy-item', {
    data: {
      items: []
    },
    template: function (props) {
      return `
      <form class="js-buy-section-form">
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
            >`;
          } else {
            productInput = `<input
              type="search"
              name="buys[]product_id"
              class="js-product-query-search"
              list="productSuggestion"
              required
              data-index="${index}"
              value=""
            >`;
          }

          return `
            <section class="buy-section flex space-between wrap" id="list-id-index-${item.index}">
              <p>
                <label> Produto:* </label>
                <br>
                ${productInput}
                <div id="product-component"> </div>
              </p>
              <p>
                <label> Quantidade:* </label>
                <br>
                <input type="number" name="buys[]quantity" step="0.01" required>
              </p>
              <p>
                <label> Valor:* </label>
                <br>
                <input type="number" name="buys[]value" step="0.01" required>$
              </p>
              <p>
                <label>
                  <input type="checkbox" name="buys[]is_move_to_stock" checked value="true">
                  Mover para Estoque?*
                </label>
              </p>
              <p>
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
            <div class="text-center">
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
    buyItemComponent.data.items.push(item);
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
