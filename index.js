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

async function getFilteredData(formData) {
  const res = await window.fetch(`${BASE_API}/search_products`, {
    body: formData,
    method: 'POST'
  });
  const listsWithProducts = await res.json();

  const ce = new CustomEvent('update-list-data', { detail: { lists: listsWithProducts } });
  $('.js-products').dispatchEvent(ce);
}

function createSideMenu() {
  const sideMenu = new Reef('#js-side-menu', {
    data: {
      items: []
    },
    template: function(props) {
      return `
        <form action="" id="js-side-menu-form" autocomplete="on">
          <section>
            <p>
              <label for="js-filter-product-name"> Nome do produto: </label>
              <br>
              <input id="js-filter-product-name" list="productSuggestion" name="search" type="search">
              <datalist id="productSuggestion">
                ${props.items.map((item) => {
                  return `
                    <option
                      reef-value="${item?.name}"
                    >
                      ${item?.escaped_value}
                    </option>
                  `
                }).join('')}
              </datalist>
            </p>

            <fieldset class="config-fieldset">
              <legend>Filtros</legend>
              <ul>
                <li>
                  <label for="is_low_amount_field">
                    <input id="is_low_amount_field" type="checkbox" name="is_low_amount" value="true">
                    Apenas em Baixa quantidade
                  </label>
                </li>
              </ul>
            </fieldset>

            <p>
              Compras:
            </p>

            <p>
              <label for="js-filter-product-initial-date"> Data Inicial: </label>
              <br>
              <input id="js-filter-product-initial-date" type="date" name="initial_date" id="datetime">
            </p>

            <p>
              <label for="js-filter-product-final-date"> Data Final: </label>
              <br>
              <input type="date" name="final_date" id="js-filter-product-final-date">
            </p>
          </section>

          <section>
            <p>
              <input type="submit" value="Buscar">
              <button id="js-close-side-menu"> Fechar </button>
              <button id="js-reset-side-menu"> Limpar </button>
              <p id="js-success-filter-message" class="hide success-message"> Busca concluida! </p>
            </p>
          </section>
        </form>
      `;
    }
  });

  $('#js-side-menu').addEventListener('update-suggestion-items', (e) => {
    const { items } = e.detail;
    sideMenu.data.items = items;
  });

  sideMenu.render();
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
          <h2 class="text-center"> ${props.buys[0]?.product} </h2>
          <table width="100%">
            <tr class="text-center">
              <th>Quantidade</th>
              <th> Data </th>
            </tr>
            ${props.buys.map((buy) => {
              const date = new Date(buy.created_at).toLocaleString();

              return `
                <tr class="text-center">
                  <td>${buy.quantity || '-'}</td>
                  <td>${date || '-'}</td>
                </tr>
                `
            }).join('')}
          <table>
        </div>
      `
    },
    allowHTML: true
  });

  window.historyComponent.render();
}

async function createMoveList() {
  window.moveListComponent = new Reef('.js-move-itens-list', {
    data: {
      lists: [],
    },
    template: function(props) {
      return `
        <form class="js-move-items-from-form hide">
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
          <p>
            <input type="submit" value="Confirmar">
            <button id="js-reset-selected-elements"> Cancelar </button>
          </p>
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
  const productsComponent = new Reef('.js-products', {
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
                    <a id="js-delete-list" data-no-poor-links data-list-id="${list.id}" href="#">Apagar</a>
                  </span>
                </li>
                
                ${list.products.map((product) => {
                  return `
                    <li>
                      <label for="js_move_to_other_list_${product.id}">
                        <input
                          type="checkbox"
                          class="move-to-other-list-element js-move-to-other-list-element hide"
                          id="js_move_to_other_list_${product.id}"
                          value="${product.id}"
                        >
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
                            <button data-product-id="${product.id}" class="js-delete-product text-alert" href="#">Apagar</button>
                            <button data-product-id="${product.id}" href="#" class="js-edit-product">Editar</button>
                            <button data-product-id="${product.id}" href="#" class="js-history-product">Compras</button>
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

  $('.js-products').addEventListener('update-list-data', (e) => {
    productsComponent.data.lists = e.detail.lists;
  });

  await updateProductsComponent();
}

async function updateProductsComponent() {
  if (!!sessionStorage.getItem('sideMenuFilter')) {
    const formData = new FormData();
    const filter = JSON.parse(sessionStorage.getItem('sideMenuFilter'));

    for (let item in filter) {
      formData.append(item, filter[item])
    }
    
    await getFilteredData(formData);

    return;
  }

  const listsResponse = await window.fetch(`${BASE_API}/get_lists`);
  const lists = await listsResponse.json();
  const updateEvent = new CustomEvent('update-list-data', { detail: { lists } });
  $('.js-products').dispatchEvent(updateEvent);
}

document.addEventListener('poorlinks:loaded:index', async () => {
  createBuyHistory();
  await createProductList();
  await createMoveList();
  createSideMenu();

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
      let transitionHandle = (e) => {
        $('#js-modal-product').classList.add('hide');
        $('body').classList.remove('overflow-hidden');
        $('#js-success-product-message').classList.remove('show');
        e.target.removeEventListener('transitionend', transitionHandle);
      }

      switch(e.submitter.id) {
        case 'js-submit-new-product':
          await window.fetch(`${BASE_API}/create_product`, { body: formData, method: 'POST' });
          await updateProductsComponent();
          $('#js-success-product-message').classList.add('show');
          $('#js-success-product-message').addEventListener('transitionend', transitionHandle);
          break;
        case 'js-submit-update-product':
          await window.fetch(`${BASE_API}/update_product`, { body: formData, method: 'PUT' });
          await updateProductsComponent();
          $('#js-success-product-message').classList.add('show');
          $('#js-success-product-message').addEventListener('transitionend', transitionHandle);
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
  let forcedScrollTop = false;

  const handler = (e) => {
    if (!runningScroll) {
      window.requestAnimationFrame(() => {
        runningScroll = false;

        if (!e.target.dataset.lastScrollTop) {
          e.target.dataset.lastScrollTop = e.target.scrollTop;
          return;
        }

        const listElementScrollTop = parseFloat(e.target.dataset.lastScrollTop || 0);

        if ((isNavVisible && e.target.scrollTop > listElementScrollTop) ||
          (!isNavVisible && e.target.scrollTop < listElementScrollTop)) {
          forcedScrollTop = false;
          window.scroll({
            top: window.scrollY + (e.target.scrollTop - listElementScrollTop),
            behavior: 'auto'
          });

          e.target.scrollTo(0, listElementScrollTop);
        }

        if (!forcedScrollTop && !isNavVisible && e.target.scrollTop > listElementScrollTop) {
          if (document.querySelector('.js-move-itens-list').clientHeight) {
            document.querySelector('.js-products-page').scrollIntoView();
          } else {
            e.target.scrollIntoView();
          }

          forcedScrollTop = true;
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
  }
});

document.addEventListener('poorlinks:loaded:index', () => {
  document.querySelector('.new-product').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.querySelector('#js-modal-product').classList.remove('hide');
    $('body').classList.add('overflow-hidden');
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
    $('body').classList.remove('overflow-hidden');
  });

  document.querySelector('#js-modal-product').addEventListener('click', (e) => {
    if (e.target.id === 'js-modal-product') {
      e.target.classList.add('hide');
      document.querySelector('#js-product-id-hidden-field').value = '';
      $('body').classList.remove('overflow-hidden');
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
    const registry = quantityStepRegistry[unit?.toLocaleLowerCase()] || 0;
    e.target.textContent = `-${registry}`;

    const decrementValue = parseInt($('#js-product-quantity-field').value) - registry;
    $('#js-product-quantity-field').value = decrementValue > 0 ? decrementValue : 0;
  });

  document.querySelector('.js-products').addEventListener('click', async (e) => {
    if (e.target.classList.contains('js-edit-product')) {
      e.preventDefault();
      document.querySelector('#js-modal-product').classList.remove('hide');
      $('body').classList.add('overflow-hidden');
      document.querySelector('#js-product-modal-title').scrollIntoView(false);
      document.querySelector('#js-product-modal-title').innerHTML = 'Editar Produto';

      $('#js-submit-new-product').classList.add('hide');
      $('#js-submit-update-product').classList.remove('hide');

      const productRequest = await window.fetch(`${BASE_API}/get_product/${e.target.dataset.productId}`);
      const product = await productRequest.json();

      const decrement = quantityStepRegistry[product?.unit?.toLocaleLowerCase()] || 0;

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

      const buysJson = await res.json();

      window.historyComponent.data.buys = buysJson;
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

    if (e.target.id === 'js-delete-list') {
      e.preventDefault();
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

      const productsToSend = allProductsChecked.map((productElement) => {
        productElement.checked = false;

        const productId = parseInt(productElement.value);

        const productMatch = products.find((product) => {
          return product.id === productId;
        });

        if (productMatch) {
          return {
            product: productMatch,
            quantity: 0,
            value: 0
          }
        }
      });

      window.visit('/new-buy.html', productsToSend);

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

  $('.js-move-itens-list').addEventListener('reef:render', () => {
    $('#js-reset-selected-elements').addEventListener('click', (e) => {
      e.preventDefault();
  
      [...document.querySelectorAll('input:checked')]
        .filter(checkbox => checkbox.id.includes('js_move_to_other_list'))
        .forEach((c) => {
          c.checked = false;
        });
  
      e.target.form.reset();
      $('.js-move-items-from-form').classList.add('hide');
    });
  });

  const toggleSideMenu = function(show) {
    if (show) {
      $('body').classList.add('overflow-hidden');
      $('.js-background-side-menu').classList.remove('hide');
      $('#js-side-menu').classList.add('side-menu-collapse');
      $('#js-side-menu').classList.remove('side-menu-hide');
    } else {
      $('body').classList.remove('overflow-hidden');
      $('.js-background-side-menu').classList.add('hide');
      $('#js-side-menu').classList.remove('side-menu-collapse');
      $('#js-side-menu').classList.add('side-menu-hide');
    }
  }

  $('.js-open-side-menu').addEventListener('click', () => {
    toggleSideMenu(true);
  });

  $('.js-background-side-menu').addEventListener('click', () => {
    toggleSideMenu(false);
  });

  $('#js-side-menu').addEventListener('reef:render', (e) => {
    e.target.style.setProperty('--aside-menu-width', `-${CSS.px(e.target.offsetWidth)}`);

    $('#js-close-side-menu').addEventListener('click', (e) => {
      e.preventDefault();

      toggleSideMenu(false);
    });

    $('#js-reset-side-menu').addEventListener('click', async (e) => {
      e.preventDefault();
      e.target.form.reset();

      sessionStorage.removeItem('sideMenuFilter');
      $('.js-remove-filter').classList.add('hide');

      await updateProductsComponent();
    });

    $('#js-side-menu-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      let saveFilter = {};

      formData.forEach((v, k) => saveFilter[k] = v);
    
      sessionStorage.setItem('sideMenuFilter', JSON.stringify(saveFilter));

      await getFilteredData(formData);
      $('.js-remove-filter').classList.remove('hide');
    });

    $('#js-filter-product-initial-date').addEventListener('change', (e) => {
      if (!$('#js-filter-product-final-date').value) {
        const initialDate = new Date(e.target.value);
        initialDate.setDate(initialDate.getDate() + 1);
        $('#js-filter-product-final-date').value = initialDate.toISOString().substr(0, 10);
      }
    });
  });

  $('.js-remove-filter').addEventListener('click', async (e) => {
    $('#js-side-menu-form').reset();

    sessionStorage.removeItem('sideMenuFilter');

    await updateProductsComponent();
    $('.js-remove-filter').classList.add('hide');
  });

  if (!sessionStorage.getItem('sideMenuFilter')) {
    $('.js-remove-filter').classList.add('hide');
  }

  let debounceSearch;

  $('#js-side-menu').addEventListener('input', async (e) => {
    if (e.target.id === 'js-filter-product-name') {
      if (!debounceSearch) {
        debounceSearch = true;

        setTimeout(async () => {
          if (e.target.value) {
            const res = await window.fetch(`${BASE_API}/get_products_by_name?query_name=${e.target.value}`);
            const products = await res.json();
    
            const ce = new CustomEvent('update-suggestion-items', { detail: { items: products } });
            $('#js-side-menu').dispatchEvent(ce);
          } else {
            const ce = new CustomEvent('update-suggestion-items', { detail: { items: [] } });
            $('#js-side-menu').dispatchEvent(ce);
          }

          debounceSearch = false;
        }, 500);
      }
    }
  });
});
