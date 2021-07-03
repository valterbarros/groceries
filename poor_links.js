"use strict";

async function render(url, shouldPushState = true, data = {}) {
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
    if (shouldPushState) {
      history.pushState(data, url.replace('.html', ''), url);
    }
    const pageName = oldHead.querySelector('[name="page-name"]');
    console.log(url);
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
  if (e.target.tagName.toLowerCase() === 'a' && !e.defaultPrevented && !Object.keys(e.target.dataset).includes('noPoorLinks')) {
    e.preventDefault();
    
    const url = e.target.href;
    render(url);
  }
});

window.addEventListener('popstate', (e) => {
  render(document.location.pathname, false);
});

window.visit = (url, data) => {
  render(url, true, data);
}

window.addEventListener('DOMContentLoaded', (e) => {
  const pageNameMeta = document.querySelector('[name=page-name]');
  const event = new CustomEvent(`poorlinks:loaded:${pageNameMeta.content}`);
  document.dispatchEvent(event);
});
