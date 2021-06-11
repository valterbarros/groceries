import { BASE_API  } from './env_master';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register(new URL('/sw.js')).then(function(registration) {
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

async function createMoveList() {
  window.moveListComponent = new Reef('.js-move-itens-list', {
    data: {
      lists: []
    },
    template: function(props) {
      return `
        <form class="js-move-items-from-form hide padding-top-07em">
          <label>Selecione para onde deseja mover os itens</label>
          <br>
          <select name="list_destiny" id="js-list-destiny" required pattern="/d+">
            <option disabled value selected> Selecione uma opcão</option>
            <optgroup label="Outros">
              <option value="move_to_next_buy_feature"> Mover para Nova Compra</option>
            </optgroup>
            <optgroup label="Listas">
            ${props.lists.map((list) => {
                return `
                  <option value="${list.id}">${list.name}</option>
                `
              }).join('')
            }
            </optgroup>
          </select>
          <input type="submit" value="Confirmar">
        </form>
      `
    }
  });

  moveListComponent.render();

  const listsResponse = await window.fetch(`${BASE_API}/get_lists`);
  const lists = await listsResponse.json();
  moveListComponent.data.lists = lists;
}

async function createProductList() {
  window.productsComponent = new Reef('.js-products', {
    data: {
      lists: []
    },
    template: function(props) {
      return `
        <div class="products-list-container js-products-list-container">
          ${props.lists.map((list) => {
            return `
              <ul class="list-element">
                <li class="list-title flex space-between align-items-center">
                  <h4 class="no-margin inline-block">
                    ${list.name}
                    ${list.next_buy_list ? '(Lista: Proxima Compra)' : ''}
                    ${list.stock_list ? '(Lista: Estoque)' : ''}
                  </h4>
                  <span>
                    <a id="js-delete-list" data-list-id="${list.id}" href="#">Apagar</a>
                  </span>
                </li>
                
                ${list.products.map((product) => {
                  return `
                    <li>
                      <label for="js_move_to_other_list_${product.id}">
                        <input type="checkbox" class="move-to-other-list-element js-move-to-other-list-element hide" id="js_move_to_other_list_${product.id}" value="${product.id}">
                        <div class="item-product">
                          <p>${product.name}</p>
                          <div>
                          <span class="label-priority-${product.priority.split(' ')[0]} label-priority">${product.priority}</span>
                          ${product.is_low_amount ? '<span class="label-low-amount">Baixa Quantidade</span>' : ''}
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
          <ul class="list-element add-list-list-element">
            <section class="add-list js-add-list hidden">
              <div>
                <h3 class="inline-block add-list-title">Adicionar nova Lista</h3>
              </div>
        
              <form action="" id="js-form-list">
                <section>
                  <p>
                    <label for=""> Nome da Lista:* </label>
                    <br>
                    <input placeholder="Ex: Próxima Compra" type="text" name="name" required>
                  </p>
                </section>
        
                <section>
                  <fieldset class="config-fieldset">
                    <legend>Configurações</legend>

                    <ul class="config-list">
                      <li>
                        <label for="">
                          <input type="checkbox" name="next_buy_list">
                          Lista para Proximas Compras?
                        </label>
                      </li>

                      <li>
                        <label for="">
                          <input type="checkbox" name="stock_list">
                          Lista para Estoque?
                        </label>
                      </li>
                    </ul>
                  </fieldset>
                </section>
          
                <section>
                  <p>
                    <p id="js-success-list-message" class="hide success-message"> Lista criada com sucesso! </p>
                    <input type="submit" value="Salvar">
                  </p>
                </section>
              </form>
            </section>
          <ul>
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
  await createMoveList();

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

    try {
      switch(e.submitter.id) {
        case 'js-submit-new-product':
          await window.fetch(`${BASE_API}/create_product`, { body: formData, method: 'POST' });
          await updateProductsComponent();
          $('#js-success-product-message').classList.add('show');
          $('#js-success-product-message').classList.remove('hide');
  
          setTimeout(() => {
            $('#js-success-product-message').classList.remove('show');
            $('#js-success-product-message').classList.add('hide');
            $('#js-modal-product').classList.add('hide');
          }, 1000);
  
          break;
        case 'js-submit-update-product':
          await window.fetch(`${BASE_API}/update_product`, { body: formData, method: 'PUT' });
          await updateProductsComponent();
          $('#js-success-product-message').classList.add('show');
          $('#js-success-product-message').classList.remove('hide');
  
          setTimeout(() => {
            $('#js-success-product-message').classList.remove('show');
            $('#js-success-product-message').classList.add('hide');
            $('#js-modal-product').classList.add('hide');
          }, 1000);
          break;
      }
    } catch (err) {
      console.log(err);
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

  isNavVisible = true;
  let runningScroll = false;

  const handler = (e) => {
    if (!runningScroll) {
      window.requestAnimationFrame(() => {
        runningScroll = false;

        const listElementScrollTop = (e.target.dataset.lastScrollTop || 0);
        
        if (isNavVisible && e.target.scrollTop > listElementScrollTop) {
          window.scrollTo(0, window.scrollY - (e.target.scrollTop - listElementScrollTop) * -1);
          e.target.scrollTo(0, listElementScrollTop);
        }
        
        if (!isNavVisible && e.target.scrollTop < listElementScrollTop) {
          window.scrollTo(0, window.scrollY - (e.target.scrollTop - listElementScrollTop) * -1);
          e.target.scrollTo(0, listElementScrollTop);
        }

        e.target.dataset.lastScrollTop = e.target.scrollTop;
      });

      runningScroll = true;
    }
  }

  if (window.innerWidth < 900) {
    document.querySelectorAll('.list-element').forEach((listElement) => {
      listElement.addEventListener('scroll', handler);
    });
  }

  var options = {
    root: null,
    rootMargin: '0px',
    threshold: [0.00, 1.00]
  }
  
  var menuTopObserver = new IntersectionObserver((data) => {
    if (!data[0].isIntersecting && data[0].intersectionRatio === 0) {
      isNavVisible = false;
    }

    if (data[0].isIntersecting && data[0].intersectionRatio === 1) {
      isNavVisible = true;
    }
  }, options);

  menuTopObserver.observe(document.querySelector('.js-menu'));
});

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.new-product').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.querySelector('#js-modal-product').classList.remove('hide');
    document.querySelector('#js-product-modal-title').scrollIntoView(false);
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

  document.querySelector('#js-modal-product').addEventListener('click', (e) => {
    if (e.target.id === 'js-modal-product') {
      e.target.classList.add('hide');
      document.querySelector('#js-product-id-hidden-field').value = '';
    }
  });

  document.querySelector('.js-products').addEventListener('dblclick', async (e) => {
    if (e.target.id === 'js-delete-list') {
      e.preventDefault();
      const listId = e.target.dataset.listId;
      
      await window.fetch(`${BASE_API}/delete_list/${listId}`, { method: 'DELETE' });
      await updateProductsComponent();
    }

    if (e.target.classList.contains('js-delete-product')) {
      e.preventDefault();
      const productId = e.target.dataset.productId;
      
      await window.fetch(`${BASE_API}/delete_product/${productId}`, { method: 'DELETE' });
      await updateProductsComponent();
    }
  });

  const quantityStepRegistry = {
    unidade: 1.0,
    gramas: 100.0,
    kilogramas: 1.0,
    mililitro: 100.0,
    litro: 1.0
  };

  $('#js-product-decrease-quantity').addEventListener('click', (e) => {
    e.preventDefault();

    const unit = $('#js-product-unit-field').value;
    const registry = quantityStepRegistry[unit?.toLocaleLowerCase()];
    e.target.textContent = `-${registry}`;

    const decrementValue = parseInt($('#js-product-quantity-field').value) - registry;
    $('#js-product-quantity-field').value = decrementValue > 0 ? decrementValue : 0;
  });

  document.querySelector('.js-products').addEventListener('click', async (e) => {
    if (e.target.classList.contains('js-edit-product')) {
      e.preventDefault();
      document.querySelector('#js-modal-product').classList.remove('hide');
      document.querySelector('#js-product-modal-title').scrollIntoView(false);
      document.querySelector('#js-product-modal-title').innerHTML = 'Editar Produto';

      $('#js-submit-new-product').classList.add('hide');
      $('#js-submit-update-product').classList.remove('hide');

      const productRequest = await window.fetch(`${BASE_API}/get_product/${e.target.dataset.productId}`);
      const product = await productRequest.json();

      const decrement = quantityStepRegistry[product?.unit?.toLocaleLowerCase()];

      $('#js-product-name-field').value = product.name;
      $('#js-product-quantity-field').value = product.quantity;
      $('#js-product-decrease-quantity').textContent = `-${decrement}`
      $('#js-product-quantity-alert-field').value = product.quantity_alert;
      $('#js-product-unit-field').value = product.unit;
      $('#js-product-priority-field').value = product.priority;
      $('#js_list_selection').value = product.list_id;
      // $('#js-product-value-field').value = product.value;
      $('#js-product-is_it_over-field').checked = product.is_it_over;
      $('#js-product-move_to_next_buy-field').checked = product.move_to_next_buy;

      document.querySelector('#js-product-id-hidden-field').value = e.target.dataset.productId;
    }

    if (e.target.classList.contains('js-history-product')) {
      e.preventDefault();

      const productId = e.target.dataset.productId;

      const res = await window.fetch(`${BASE_API}/get_product_buys/${productId}`);
      const buys = await res.json();

      window.historyComponent.data.buys = buys;
      $('.js-history-modal').classList.remove('hide');
    }

    if (e.target.classList.contains('js-move-to-other-list-element')) {
      const moreThanZeroElementIsChecked = [...document.querySelectorAll('input:checked')]
        .filter(checkbox => checkbox.id.includes('js_move_to_other_list')).length > 0;

      if (moreThanZeroElementIsChecked) {
        $('.js-move-items-from-form').classList.remove('hide');
      } else {
        $('.js-move-items-from-form').classList.add('hide');
      }
    }
  });

  $('.js-history-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('js-history-modal')) {
      $('.js-history-modal').classList.add('hide');
    }
  }, false);

  $('.js-products').addEventListener('submit', async (e) => {
    if (e.target.id === 'js-form-list') {
      e.preventDefault();
  
      const formData = new FormData(e.target);

      try {
        await window.fetch(`${BASE_API}/create_list`, { body: formData, method: 'POST' });
        $('#js-success-list-message').classList.remove('hide');
        setTimeout(() => {
          $('#js-success-list-message').classList.add('hide');
        }, 1000);
        await updateProductsComponent();
      } catch (err) {
        console.log(err);
      }
    }
  });

  document.querySelector('.js-move-itens-list').addEventListener('submit', async (e) => {
    e.preventDefault();

    const allProductsChecked = [...document.querySelectorAll('input:checked')]
      .filter(checkbox => checkbox.id.includes('js_move_to_other_list'));

    if ($('#js-list-destiny').value === 'move_to_next_buy_feature') {
      const res = await window.fetch(`${BASE_API}/get_products`);
      const products = await res.json();

      allProductsChecked.forEach((productElement) => {
        productElement.checked = false;

        const productId = parseInt(productElement.value);

        const productMatch = products.find((product) => {
          return product.id === productId;
        });

        if (productMatch) {
          window.buyItemComponent.data.items.push({
            product: productMatch,
            quantity: 0,
            value: 0
          });
        }
      });

      $('.js-move-items-from-form').classList.add('hide');
      e.target.reset();

      return;
    }
    
    const formData = new FormData(e.target);
    allProductsChecked.forEach((product) => {
      formData.append(`products[]`, product.value)
    });

    await window.fetch(`${BASE_API}/move_products_from_list`, { body: formData, method: 'PUT' });
    e.target.reset();
    updateProductsComponent();
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
          const productInput = item.product ? `<input
            type="text"
            name="buys[]product_id"
            list="productSuggestion"
            required
            value="${item?.product?.id} - ${item?.product?.name} : ${item?.product?.unit}"
          >` : `<input
            type="text"
            name="buys[]product_id"
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
                      return `<option> ${product?.id} - ${product?.name} : ${product?.unit} </option>`
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
          ${props.items.length ? `
            <div class="text-center">
              <button class="success" id="js-finish-buy-button">Finalizar Compra</button>
            </div>` : ''
          }
        </form>
      `
    }
  });

  const res = await window.fetch(`${BASE_API}/get_products`);
  const products = await res.json();

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
