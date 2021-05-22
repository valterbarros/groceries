const BASE_API = 'http://localhost:3000';

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

window.addEventListener('DOMContentLoaded', async () => {
  const listsResponse = await window.fetch(`${BASE_API}/get_lists`);
  const lists = await listsResponse.json();

  lists.forEach((list) => {
    const ul = document.createElement('ul');
    const liTitle = document.createElement('li');
    const h4 = document.createElement('h4');
    h4.textContent = list.name;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.id = 'js-delete-list';
    a.dataset.listId = list.id;
    a.textContent = 'Apagar';
    a.href = '#'

    p.append(a);
    liTitle.append(h4);
    liTitle.append(p);
    ul.append(liTitle);

    list.products.forEach((product) => {
      const liProduct = document.createElement('li');
      const div = document.createElement('div');
      div.classList.add('item-product');
  
      const pName = document.createElement('p');
      pName.textContent = product.name;
      const spPriority = document.createElement('span');
      spPriority.textContent = product.priority;
      spPriority.classList.add(`label-priority-${product.priority.split(' ')[0]}`);
      spPriority.classList.add('label-priority');
      const pQuantityUnit = document.createElement('p');
      pQuantityUnit.textContent = `${product.quantity} ${product.unit}`;
  
      const pActions = document.createElement('p');
      const aDeleteProduct = document.createElement('a');
      aDeleteProduct.textContent = 'Apagar';
      aDeleteProduct.classList = 'js-delete-product';
      aDeleteProduct.href = '#';
      const aEditProduct = document.createElement('a');
      aEditProduct.textContent = 'Editar';
      aEditProduct.dataset.productId = product.id;
      aEditProduct.href = '#'
      aEditProduct.classList.add('js-edit-product');
      pActions.append(aDeleteProduct);
      pActions.append(aEditProduct);
  
      div.append(pName);
      div.append(spPriority);
      div.append(pQuantityUnit);
      div.append(pActions);
  
      liProduct.append(div);
      ul.append(liProduct);
    });

    document.querySelector('.products').append(ul);
  });

  document.querySelector('#js-form-product').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    switch(e.submitter.id) {
      case 'js-submit-new-product':
        return await window.fetch(`${BASE_API}/create_product`, { body: formData, method: 'POST' });
      case 'js-submit-update-product':
        return await window.fetch(`${BASE_API}/update_product`, { body: formData, method: 'PUT' });
    }
  });

  lists.forEach((list) => {
    const opt = document.createElement('option');

    opt.value = list.id;
    opt.innerHTML = list.name;

    document.querySelector('#js_list_selection').append(opt);
  })
});

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.new-product').addEventListener('click', () => {
    document.querySelector('#js-modal-product').classList.remove('hide');
    $('#js-product-modal-title').innerHTML = 'Criar Novo Produto';

    $('#js-product-name-field').value = '';
    $('#js-product-quantity-field').value = '';
    $('#js-product-quantity-alert-field').value = '';
    $('#js-product-unit-field').value = '';
    $('#js-product-priority-field').value = '';
    $('#js_list_selection').value = '';
    $('#js-product-value-field').value = '';
    $('#js-product-is_it_over-field').checked = false;
    $('#js-product-move_to_next_buy-field').checked = false;
  });

  document.querySelector('#js-close-modal-new-product').addEventListener('click', (e) => {
    e.preventDefault();

    document.querySelector('#js-modal-product').classList.add('hide');
    document.querySelector('#js-product-id-hidden-field').value = '';
  });

  document.querySelector('.products').addEventListener('click', async (e) => {
    if (e.target.classList.contains('js-edit-product')) {
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
      $('#js-product-value-field').value = product.value;
      $('#js-product-is_it_over-field').checked = product.is_it_over;
      $('#js-product-move_to_next_buy-field').checked = product.move_to_next_buy;

      document.querySelector('#js-product-id-hidden-field').value = e.target.dataset.productId;
    }

    if (e.target.id === 'js-delete-list') {
      e.preventDefault();

      const listId = e.target.dataset.listId;
      
      await window.fetch(`${BASE_API}/delete_list/${listId}`, { method: 'DELETE' });
    }
  });

  $('#js-form-list').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    await window.fetch(`${BASE_API}/create_list`, { body: formData, method: 'POST' });
  })
});
