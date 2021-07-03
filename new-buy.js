import { BASE_API  } from './env_master';

const $ = function(query) {
  return document.querySelector(query);
}

async function addBuyItem() {
  window.buyItemComponent = new Reef('#js-buy-item', {
    store: window.masterStore,
    template: function (props) {
      return `
        ${props.buyComponentItems.map((item, index) => {
          const productInput = item.product ? `<input
            type="search"
            name="buys[]product_id"
            class="js-product-query-search"
            list="productSuggestion"
            required
            value="${item?.product?.id} - ${item?.product?.name} : ${item?.product?.unit}"
          >` : `<input
            type="search"
            name="buys[]product_id"
            class="js-product-query-search"
            list="productSuggestion"
            required
            value=""
          >`

          return `
            <form class="js-buy-section-form">
              <section class="buy-section flex space-between wrap">
                <p>
                  <label> Produto:* </label>
                  <br>
                  ${productInput}
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
          ${props.buyComponentItems.length ? `
            <div class="text-center">
              <button class="success" id="js-finish-buy-button">Finalizar Compra</button>
            </div>` : ''
          }
        </form>
      `
    }
  });

  window.addEventListener('update-product-data', (e) => {
    window.masterStore.data.products = e.detail.products;
  });

  window.buyItemComponent.render();
}

async function updateProductList() {
  const res = await window.fetch(`${BASE_API}/get_products`);
  const products = await res.json();
  window.masterStore.data.products = products;
}

document.addEventListener('poorlinks:loaded:new-buy', async () => {
  const selectedProducts = history.state;

  window.masterStore = new Reef.Store({
    data: {
      products: [],
      lists: [],
      buyComponentItems: []
    }
  });

  if (Object.keys(selectedProducts).length) {
    window.masterStore.data.buyComponentItems = selectedProducts;
  }

  await addBuyItem();

  $('#js-add-new-item-button').addEventListener('click', () => {
    window.masterStore.data.buyComponentItems.push({ product: null, quantity: 0, value: 0 });
  });

  $('#js-buy-item').addEventListener('click', (e) => {
    if (e.target.classList.contains('js-remove-buy-action')) {
      e.preventDefault();
      const index = e.target.dataset.index;
      window.masterStore.data.buyComponentItems.splice(index, 1);
    }
  });

  $('#js-buy-item').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (e.target.classList.contains('js-buy-section-form')) {
      const formData = new FormData(e.target);

      try {
        await window.fetch(`${BASE_API}/create_buy`, { method: 'POST', body: formData });
        window.masterStore.data.buyComponentItems = [];
        $('#js-success-buy-message').classList.add('show');
        $('#js-success-buy-message').classList.remove('hide');
        setTimeout(() => {
          $('#js-success-buy-message').classList.remove('show');
          $('#js-success-buy-message').classList.add('hide');
        }, 1000)
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
            const res = await window.fetch(`${BASE_API}/get_products_by_name/${e.target.value}`);
            const products = await res.json();
    
            const ce = new CustomEvent('update-product-data', { detail: { products } });
            window.dispatchEvent(ce);
          } else {
            const ce = new CustomEvent('update-product-data', { detail: { products: [] } });
            window.dispatchEvent(ce);
          }

          debounceSearch = false;
        }, 500);
      }
    }
  });
});
