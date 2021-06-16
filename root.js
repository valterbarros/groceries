
// (
//   async () => {
//     const req = await window.fetch('/index.html');
//     const htmlPage = await req.text();
    
//     const doc = document.createElement('html');
//     doc.innerHTML = htmlPage;
    
//     window.requestAnimationFrame(() => {
//       const links = [...doc.querySelector('head').children].filter((item) => {
//         const tagName = item.tagName.toLowerCase();
//         return tagName === 'script' || (tagName === 'style' || (tagName === 'link' && item.getAttribute('rel') === 'stylesheet'))
//       });
      
//       links.forEach((element) => {
//         if (element.tagName.toLowerCase() === 'script') {
//           const script = document.createElement('script');
//           script.textContent = element.textContent;
//           script.async = false;
//           script.src = element.src;
//           document.head.appendChild(script);
//           return;
//         } else {
//           document.head.appendChild(element);
//         }
//       });

//       document.body.parentElement.replaceChild(doc.querySelector('body').cloneNode(true), document.body);

//       const event = new CustomEvent('page:loaded');
//       document.dispatchEvent(event);
//     });
//   }
// )();
