const BASE_API = 'http://192.168.0.103:3000';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log(registration);
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const $ = function(query) {
  return document.querySelector(query);
}

function createBuyHistory() {
  window.historyComponent = new Reef('.js-history-container', {
    data: {
      buys: []
    },
    template: function(props) {
      if (!props.buys.length) {
        return `<div> Esse produto ainda não possui historico</div>`;
      }

      return `
        <div>
          ${props.buys.map((buy) => {
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
            `
          }).join('')}
        </div>
      `
    }
  });

  window.historyComponent.render();
}

async function createProductList() {
  window.productsComponent = new Reef('.js-products', {
    data: {
      lists: []
    },
    template: function(props) {
      return `
        <h3 class="text-center js-products-main-title">
          Produtos
          <br>
          <button id="js-show-list-options"> Mostrar Opções de Lista </button>
        </h3>
        
        <form class="js-move-items-from-form hide">
          <span id="js-move-items-from-list" href="#">Mover Itens Para a Lista?</span>
          <select name="list_destiny">
            <option>Selecione uma Lista</option>
            ${props.lists.map((list) => {
                return `
                  <option value="${list.id}">${list.name}</option>
                `
              }).join('')
            }
          </select>
          <input type="submit" value="Confirmar">
          <hr>
        </form>

        <div class="products-list-container js-products-list-container hidden">
          ${props.lists.map((list) => {
            return `
              <ul class="list-element">
                <li class="list-title">
                  <h4 class="no-margin">
                    ${list.name}
                    ${list.next_buy_list ? '(Lista para produtos da proxima compra)' : ''}
                    ${list.stock_list ? '(Lista para produtos em estoque)' : ''}
                  </h4>
                  <p class="margin-8-0">
                    <a id="js-delete-list" data-list-id="${list.id}" href="#">Apagar</a>
                    <a id="js-view-list" href="#">Visão Simplificada</a>
                  </p>
                </li>
                
                ${list.products.map((product) => {
                  return `
                    <li>
                      <label for="js_move_to_other_list_${product.id}">
                        <input type="checkbox" class="move-to-other-list-element hide" id="js_move_to_other_list_${product.id}" value="${product.id}">
                        <div class="item-product">
                          <p>${product.name}</p>
                          <div>
                          <span class="label-priority-${product.priority.split(' ')[0]} label-priority">${product.priority}</span>
                          ${product.is_low_amount ? '<span class="label-low-amount">Low Amount</span>' : ''}
                          ${product.is_it_over ? '<span class="label-out-of-stock">Fora de Estoque</span>' : ''}
                          </div>
                          <span class="${product.is_it_over ? 'hide' : ''}">${product.quantity} ${product.unit}</span>
                          <span>R$ ${product.last_buy_value}</span>
                          <p>
                            <a data-product-id="${product.id}" class="js-delete-product" href="#">Apagar</a>
                            <a data-product-id="${product.id}" href="#" class="js-edit-product">Editar</a>
                            <a data-product-id="${product.id}" href="#" class="js-history-product">Historico de Compras</a>
                          </p>

                          <div class="item-product-bar" style="width: ${product.percentage}%"></div>
                        </div>
                      </label>
                    </li>
                  `
                }).join('')}
              </ul>
            `
          }).join('')}
        <div>
      `
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

  // document.querySelectorAll('#js-modal-product').forEach((element) => {
  //   element.addEventListener('keypress', (e) => {
  //     console.log(e.key);
  //     if (e.key === 'Enter') {
  //       console.log(e.target.form);
  //       const submit = new Event('submit');
  //       e.target.form.dispatchEvent(submit);
  //     }
  //   });
  // });

  document.querySelector('#js-form-product').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    switch(e.submitter.id) {
      case 'js-submit-new-product':
        await window.fetch(`${BASE_API}/create_product`, { body: formData, method: 'POST' });
        await updateProductsComponent();
        $('#js-success-product-message').classList.add('show');
        $('#js-success-product-message').classList.remove('hide');

        setTimeout(() => {
          $('#js-success-product-message').classList.remove('show');
          $('#js-success-product-message').classList.add('hide');
        }, 1000);

        return;
      case 'js-submit-update-product':
        await window.fetch(`${BASE_API}/update_product`, { body: formData, method: 'PUT' });
        await updateProductsComponent();
        $('#js-success-product-message').classList.add('show');
        $('#js-success-product-message').classList.remove('hide');

        setTimeout(() => {
          $('#js-success-product-message').classList.remove('show');
          $('#js-success-product-message').classList.add('hide');
        }, 1000);
        return
    }
  });

  const listsResponse = await window.fetch(`${BASE_API}/get_lists`);
  const lists = await listsResponse.json();

  lists.forEach((list) => {
    const opt = document.createElement('option');

    opt.value = list.id;
    opt.innerHTML = list.name;

    document.querySelector('#js_list_selection').append(opt);
  });
});

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.new-product').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.querySelector('#js-modal-product').classList.remove('hide');
    $('#js-product-modal-title').innerHTML = 'Criar Novo Produto';
    $('#js-submit-new-product').classList.remove('hide');
    $('#js-submit-update-product').classList.add('hide');

    $('#js-form-product').reset();
  });

  document.querySelector('#js-close-modal-new-product').addEventListener('click', (e) => {
    e.preventDefault();

    document.querySelector('#js-modal-product').classList.add('hide');
    document.querySelector('#js-product-id-hidden-field').value = '';
  });

  document.querySelector('.js-products').addEventListener('click', async (e) => {
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
      
      await window.fetch(`${BASE_API}/delete_list/${listId}`, { method: 'DELETE' });
      await updateProductsComponent();
    }

    if (e.target.id === 'js-view-list') {
      // window.scroll({top: 160, behavior: 'smooth'});
      $('.js-menu').classList.toggle('hide');
      $('.js-products-main-title').classList.toggle('hide');
      $('.js-add-list').classList.toggle('hide');
      $('.js-products-list-container').classList.toggle('collapse');
    }

    if (e.target.classList.contains('js-delete-product')) {
      e.preventDefault();
      const productId = e.target.dataset.productId;
      
      await window.fetch(`${BASE_API}/delete_product/${productId}`, { method: 'DELETE' });
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

    if (e.target.id === 'js-show-list-options') {
      $('.js-move-items-from-form').classList.toggle('hide');
    }
  });

  $('.js-history-modal').addEventListener('click', (e) => {
    if(e.target.classList.contains('js-history-modal')) {
      $('.js-history-modal').classList.add('hide');
    }
  }, false);

  $('.js-products').addEventListener('submit', async (e) => {
    if (e.target.classList.contains('js-move-items-from-form')) {
      e.preventDefault();
      
      const allProductsChecked = [...document.querySelectorAll('input:checked')]
        .filter(checkbox => checkbox.id.includes('js_move_to_other_list'));
      
      const formData = new FormData(e.target);
      allProductsChecked.forEach((product) => {
        formData.append(`products[]`, product.value)
      });

      await window.fetch(`${BASE_API}/move_products_from_list`, { body: formData, method: 'PUT' });
      updateProductsComponent();
    }
  });

  $('#js-form-list').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    await window.fetch(`${BASE_API}/create_list`, { body: formData, method: 'POST' });
    await updateProductsComponent();
  });

  $('.js-close-create-list-section').addEventListener('click', (e) => {
    e.preventDefault();

    $('.js-add-list').classList.add('hidden');
  });

  $('.js-open-create-list-section').addEventListener('click', (e) => {
    e.preventDefault();

    $('.js-add-list').classList.remove('hidden');
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
        ${props.items.map((item, index) => {
          return `
            <form class="js-buy-section-form">
              <section class="buy-section flex space-between wrap">
                <p>
                  <label> Produto:* </label>
                  <br>
                  <input type="text" name="buys[]product_id" list="productSuggestion">
                  <datalist id="productSuggestion">
                    ${props.products.map((product) => {
                      return `<option> ${product.id} - ${product.name} : ${product.unit} </option>`
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
                    class="js-remove-buy-action"
                    data-index="${index}"
                  >
                    Remover
                  </button>
                </p>
              </section>
          `
        }).join('')}
          <div class="text-center">
            <button class="success" id="js-finish-buy-button">Finalizar Compra</button>
          </div>
        </form>
      `
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
    window.buyItemComponent.data.items.push({ product: null, quantity: 0, value: 0 });
  });

  $('#js-buy-item').addEventListener('click', (e) => {
    if (e.target.classList.contains('js-remove-buy-action')) {
      e.preventDefault();
      const index = e.target.dataset.index;
      window.buyItemComponent.data.items.splice(index, 1);
    }
  });

  $('#js-buy-item').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (e.target.classList.contains('js-buy-section-form')) {
      const formData = new FormData(e.target);

      try {
        await window.fetch(`${BASE_API}/create_buy`, { method: 'POST', body: formData });
        await updateProductsComponent();
        window.buyItemComponent.data.items = [];
        $('#js-success-buy-message').classList.add('show');
        $('#js-success-buy-message').classList.remove('hide');
        console.log($('#js-success-buy-message').classList);
        setTimeout(() => {
          $('#js-success-buy-message').classList.remove('show');
          $('#js-success-buy-message').classList.add('hide');
        }, 1000)
      } catch (err) {
        console.log(err);
      }
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
