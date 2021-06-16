"use strict";

async function render(url) {
  const req = await window.fetch(url);
  const htmlPage = await req.text();

  const doc = document.createElement('html');
  doc.innerHTML = htmlPage;
  const newHead = doc.querySelector('head');
  const oldHead = document.head;
  const oldBody = document.body;
  const newBody = doc.querySelector('body');

  window.requestAnimationFrame(async () => {
    const noScriptOrStylesheetsOldHead = [...oldHead.children].filter((element) => {
      return !(elementIsScript(element) || elementIsStylesheet(element));
    });

    noScriptOrStylesheetsOldHead.forEach((element) => {
      oldHead.removeChild(element);
    });

    const scriptsAndStylesNew = [...newHead.children]
      .filter((element) => elementIsScript(element) || elementIsStylesheet(element))
      .filter((element) => ![...oldHead.children].map(c => c.outerHTML).includes(element.outerHTML));

    const loadScriptsPromises = [];
      
    scriptsAndStylesNew.forEach((element) => {
      if (element.tagName.toLowerCase() === 'script') {
        const script = document.createElement('script');
        script.textContent = element.textContent;
        script.defer = true;
        copyElementAttributes(script, element);
        oldHead.appendChild(script);
        const p = new Promise((resolve, rejected) => {
          script.addEventListener('load', resolve);
        });

        loadScriptsPromises.push(p);
      } else {
        oldHead.appendChild(element);
      }
    });

    const noScriptOrStylesheetsNewHead = [...newHead.children].filter((element) => {
      return !(elementIsScript(element) || elementIsStylesheet(element));
    });

    noScriptOrStylesheetsNewHead.forEach((element) => {
      oldHead.appendChild(element);
    });

    document.body.parentElement.replaceChild(newBody.cloneNode(true), oldBody);

    await Promise.all(loadScriptsPromises);
    history.pushState({},'', url);
    const pageName = oldHead.querySelector('[name="page-name"]');
    console.log(pageName);
    const event = new CustomEvent(`poorlinks:loaded:${pageName.content}`);
    document.dispatchEvent(event);
  });
}

function elementIsScript(element) {
  const tagName = element.tagName.toLowerCase();
  return tagName === "script";
}

function elementIsStylesheet(element) {
  const tagName = element.tagName.toLowerCase();
  return tagName === "style" || (tagName == "link" && element.getAttribute("rel") === "stylesheet");
}

function copyElementAttributes(destinationElement, sourceElement) {
  for (const { name, value } of [...sourceElement.attributes]) {
    destinationElement.setAttribute(name, value)
  }
}

window.addEventListener('click', async (e) => {
  if (e.target.tagName.toLowerCase() === 'a' && !e.defaultPrevented) {
    e.preventDefault();
    
    const url = e.target.href;
    render(url);
  }
});

window.addEventListener('popstate', () => {
  render(document.location.pathname);
});

window.addEventListener('DOMContentLoaded', (e) => {
  console.log('DOMContentLoaded');
  const pageNameMeta = document.querySelector('[name=page-name]')
  const event = new CustomEvent(`poorlinks:loaded:${pageNameMeta.content}`);
  document.dispatchEvent(event);
});
