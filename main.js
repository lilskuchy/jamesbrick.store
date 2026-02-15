// - main.js
// - Sticky header on scroll
// - Mobile menu toggle
// - Order modal open/close and mailto form submission
// - Contact form mailto builder
// Note: Replace STORE_EMAIL and PHONE_NUMBER placeholders with actual values.

document.addEventListener('DOMContentLoaded', () => {
  // Set dynamic year in footer
  const yearEls = document.querySelectorAll('#year, #year-2, #year-3, #year-4');
  const y = new Date().getFullYear();
  yearEls.forEach(el => { if (el) el.textContent = y; });

  // Sticky header shadow toggle on scroll
  const header = document.getElementById('site-header');
  const toggleHeaderScrolled = () => {
    if (window.scrollY > 16) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  toggleHeaderScrolled();
  window.addEventListener('scroll', toggleHeaderScrolled, { passive: true });

  // Mobile menu - simple toggle (reveals main-nav temporarily)
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    // Use an accessible expanded state and a body class to control nav display.
    mobileToggle.setAttribute('aria-expanded', mobileToggle.getAttribute('aria-expanded') || 'false');
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      document.body.classList.toggle('nav-open', !isOpen);
    });

    // Close mobile nav when a link is clicked (improves UX)
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')){
          document.body.classList.remove('nav-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // --- Products: attempt to load editable products.json; fallback to generated defaults ---
  const totalProducts = 144;
  const itemsPerPage = 12; // 12 items per page
  let currentPage = 1;
  let products = [];

  function generateDefaultProducts() {
    products = Array.from({ length: totalProducts }, (_, i) => {
      const id = `product-${i + 1}`;
      const price = `$${(10 + ((i * 7) % 290))}.00`;
      return {
        id,
        name: `Product ${i + 1}`,
        price,
        image: `/assets/products/product-${i + 1}.jpg`
      };
    });
  }

  function renderProducts(page = 1) {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const pageItems = products.slice(start, start + itemsPerPage);
    pageItems.forEach(p => {
      const article = document.createElement('article');
      article.className = 'product-card';
      article.id = p.id;
      // Force local asset path under /assets/products/ using product id (scalable)
      const idNum = (p.id || '').toString().split('-').pop();
      const imgSrc = p.image || `/assets/products/product-${idNum}.jpg`;
      article.innerHTML = `
        <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'><rect fill=\'%23eee\' width=\'100%25\' height=\'100%25\'/><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23888\' font-family=\'Arial\' font-size=\'20\'>No%20image</text></svg>'">
        <div class="product-body">
          <h3>${p.name}</h3>
          <p class="price">${p.price}</p>
          <button class="btn btn-primary order-now" data-product="${p.name}" data-price="${p.price}">Order Now</button>
        </div>
      `;
      grid.appendChild(article);
    });
    renderPagination();
  }

  function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    container.innerHTML = '';
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.textContent = 'Prev';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderProducts(currentPage);
      }
    });
    container.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn';
      if (i === currentPage) btn.classList.add('active');
      btn.textContent = String(i);
      btn.addEventListener('click', () => {
        currentPage = i;
        renderProducts(currentPage);
      });
      container.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.textContent = 'Next';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage += 1;
        renderProducts(currentPage);
      }
    });
    container.appendChild(next);
  }

  // Try to fetch products.json (editable). If not available, generate defaults.
  function loadProductsJson() {
    fetch('products.json', { cache: 'no-cache' })
      .then(resp => {
        if (!resp.ok) throw new Error('products.json not found');
        return resp.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize entries to ensure id/name/price/image exist
          products = data.map((p, idx) => ({
              id: p.id || `product-${idx + 1}`,
              name: p.name || `Product ${idx + 1}`,
              price: p.price || `$${(10 + ((idx * 7) % 290))}.00`,
              // Prefer the `image` field from products.json; normalize leading slash if necessary
              image: p.image ? (p.image.startsWith('/') ? p.image : `/${p.image}`) : `/assets/products/product-${idx + 1}.jpg`
            }));
        } else {
          generateDefaultProducts();
        }
        renderProducts(currentPage);
        // Populate featured carousel once products are available
        renderFeaturedCarousel();
      })
      .catch(() => {
        generateDefaultProducts();
        renderProducts(currentPage);
        // Ensure carousel is populated with defaults when fetch fails
        renderFeaturedCarousel();
      });
  }

  loadProductsJson();

  // --- Featured carousel (homepage) ---
  const featuredIds = ['product-84','product-79','product-73','product-64','product-63','product-50','product-54','product-41','product-47','product-48','product-29','product-1'];

  function renderFeaturedCarousel() {
    const container = document.getElementById('featured-carousel');
    if (!container) return;
    const track = container.querySelector('.carousel-track');
    const viewport = container.querySelector('.carousel-viewport');
    const dotsContainer = container.querySelector('.carousel-dots');
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    const items = featuredIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (items.length === 0) return;

    // Build slides with cloned heads and tails for seamless looping
    const originalSlides = items.map(p => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.setAttribute('role','listitem');
      slide.innerHTML = `
        <article class="product-card">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'><rect fill=\'%23eee\' width=\'100%25\' height=\'100%25\'/><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23888\' font-family=\'Arial\' font-size=\'20\'>No%20image</text></svg>'">
          <div class="product-body">
            <h3>${p.name}</h3>
            <p class="price">${p.price}</p>
            <a class="btn btn-outline" href="shop.html">View</a>
          </div>
        </article>
      `;
      return slide;
    });

    // Prepend a full copy, then originals, then append a full copy
    const frag = document.createDocumentFragment();
    // clones before
    originalSlides.forEach(s => frag.appendChild(s.cloneNode(true)));
    // originals
    originalSlides.forEach(s => frag.appendChild(s));
    // clones after
    originalSlides.forEach(s => frag.appendChild(s.cloneNode(true)));
    track.appendChild(frag);

    // Carousel behavior
    const base = items.length; // number of originals (we prepended one full copy)
    let index = base; // start at the first original (after the prepended clones)
    let autoTimer = null;

    function getVisibleCount(){
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 900) return 2;
      if (w < 1200) return 3;
      return 4;
    }

    function updateDots(){
      dotsContainer.innerHTML = '';
      const visible = getVisibleCount();
      const pages = Math.max(1, Math.ceil(items.length / visible));
      for(let i=0;i<pages;i++){
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        // Map current index to logical original index
        const logical = ((index - base) % items.length + items.length) % items.length;
        if (i === Math.floor(logical / visible)) dot.classList.add('active');
        dot.addEventListener('click', ()=>{
          // set logical page then convert to physical index
          const targetLogical = i * visible;
          index = base + (targetLogical % items.length);
          goTo(index);
          restartAuto();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(i){
      const slides = track.querySelectorAll('.carousel-slide');
      if (!slides.length) return;
      // clamp within physical slide count
      index = Math.max(0, Math.min(i, slides.length - 1));
      const slide = slides[index];
      const left = slide.offsetLeft - track.offsetLeft;
      // Center the slide in the viewport (account for viewport width)
      const centerOffset = left - (viewport.clientWidth - slide.clientWidth) / 2;

      // Apply transform with transition
      track.style.transition = '';
      // allow any previous immediate reset to take effect
      requestAnimationFrame(()=>{
        track.style.transform = `translateX(-${centerOffset}px)`;
        track.classList.add('animating');
      });

      // Apply cover-flow 3D transforms: rotateY + translateZ, small translateX offset
      const visible = getVisibleCount();
      slides.forEach((s, idx) => {
        const d = idx - index;
        const ad = Math.abs(d);
        const rotateY = d * -18; // angle for side cards
        const tz = -Math.min(220, ad * 140); // recede into screen
        const tx = d * 22; // slight horizontal offset to accentuate depth
        const scale = Math.max(0.78, 1 - ad * 0.08);
        s.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${rotateY}deg) scale(${scale})`;
        s.style.opacity = ad > Math.max(visible,1) ? '0.08' : String(Math.max(0.28, 1 - ad * 0.28));
        s.style.zIndex = String(999 - ad);
        s.classList.toggle('inactive', ad > Math.max(visible,2));
        s.style.transitionDelay = `${Math.min(200, ad * 50)}ms`;
      });

      // After transition end, if we're in a cloned region, jump to the equivalent original index without transition
      const onEnd = () => {
        const slidesNow = track.querySelectorAll('.carousel-slide');
        // If we've moved past the originals on the right
        if (index >= base + items.length) {
          index = index - items.length;
          const jumpSlide = slidesNow[index];
          const jumpLeft = jumpSlide.offsetLeft - track.offsetLeft;
          const jumpCenter = jumpLeft - (viewport.clientWidth - jumpSlide.clientWidth) / 2;
          // jump without transition
          track.style.transition = 'none';
          track.style.transform = `translateX(-${jumpCenter}px)`;
        }
        // If we've moved before the originals on the left
        if (index < base) {
          index = index + items.length;
          const jumpSlide = slidesNow[index];
          const jumpLeft = jumpSlide.offsetLeft - track.offsetLeft;
          const jumpCenter = jumpLeft - (viewport.clientWidth - jumpSlide.clientWidth) / 2;
          track.style.transition = 'none';
          track.style.transform = `translateX(-${jumpCenter}px)`;
        }
        // remove animating class and temporary delays
        track.classList.remove('animating');
        slidesNow.forEach(s => { s.style.transitionDelay = ''; });
        track.removeEventListener('transitionend', onEnd);
        // restore default transition style after next frame
        requestAnimationFrame(()=>{ track.style.transition = ''; });
        updateDots();
      };
      track.addEventListener('transitionend', onEnd);
    }

    function next(){
      const slides = track.querySelectorAll('.carousel-slide');
      index = (index + 1) % slides.length;
      goTo(index);
    }

    function prev(){
      const slides = track.querySelectorAll('.carousel-slide');
      index = (index - 1 + slides.length) % slides.length;
      goTo(index);
    }

    // Controls
    const prevBtn = container.querySelector('.carousel-arrow.prev');
    const nextBtn = container.querySelector('.carousel-arrow.next');
    prevBtn.onclick = ()=>{ prev(); restartAuto(); };
    nextBtn.onclick = ()=>{ next(); restartAuto(); };

    // Auto-scroll
    function startAuto(){
      stopAuto();
      autoTimer = setInterval(()=> next(), 2200);
    }
    function stopAuto(){ if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function restartAuto(){ stopAuto(); startAuto(); }

    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);

    // Recompute on resize
    let resizeTimer = null;
    window.addEventListener('resize', ()=>{
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(()=>{
        updateDots();
        goTo(index);
      }, 150);
    });

    // Init
    updateDots();
    goTo(0);
    startAuto();
  }

  // Order modal handlers
  const orderModal = document.getElementById('order-modal');
  const orderForm = document.getElementById('order-form');
  const orderProductInput = document.getElementById('order-product');
  const orderModalClose = document.getElementById('order-modal-close');
  const orderCancel = document.getElementById('order-cancel');

  const openOrderModal = (productName) => {
    if(!orderModal) return;
    orderModal.setAttribute('aria-hidden', 'false');
    orderProductInput.value = productName || '';
    // focus first input
    const nameInput = document.getElementById('customer-name');
    if(nameInput) nameInput.focus();
  };
  const closeOrderModal = () => {
    if(!orderModal) return;
    orderModal.setAttribute('aria-hidden', 'true');
    // reset form
    if(orderForm) orderForm.reset();
  };

  // Use event delegation so dynamically-rendered buttons work across pages.
  const gridEl = document.getElementById('shop-grid');
  if (gridEl) {
    gridEl.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.order-now');
      if (!btn) return;
      const product = btn.dataset.product || '';
      openOrderModal(product);
    });
  }

  if(orderModalClose) orderModalClose.addEventListener('click', closeOrderModal);
  if(orderCancel) orderCancel.addEventListener('click', closeOrderModal);

  // Close modal on backdrop click
  const modalBackdrop = document.querySelector('.modal-backdrop');
  if(modalBackdrop) modalBackdrop.addEventListener('click', closeOrderModal);

  // Build mailto link and open default email client for Order form
  if(orderForm){
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Build email content
      const storeEmail = 'polo.b.theman@gmail.com'; // Replace with actual store email (e.g., hello@jamesbrick.store)
      const name = encodeURIComponent(orderForm.name.value || '');
      const email = encodeURIComponent(orderForm.email.value || '');
      const product = encodeURIComponent(orderForm.product.value || '');
      const quantity = encodeURIComponent(orderForm.quantity.value || '1');
      const message = encodeURIComponent(orderForm.message.value || '');
      const subject = encodeURIComponent(`Order Request — ${product}`);
      const body = encodeURIComponent(
        `Name: ${orderForm.name.value}\nEmail: ${orderForm.email.value}\nProduct: ${orderForm.product.value}\nQuantity: ${orderForm.quantity.value}\n\nMessage:\n${orderForm.message.value}`
      );

      // mailto link
      const mailto = `mailto:${storeEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
      // Optionally close modal after triggering mail client
      closeOrderModal();
    });
  }

  // Contact form: similar mailto behavior
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const storeEmail = 'polo.b.theman@gmail.com'; // Replace with actual store email
      const name = encodeURIComponent(contactForm.name.value || '');
      const email = encodeURIComponent(contactForm.email.value || '');
      const message = encodeURIComponent(contactForm.message.value || '');
      const subject = encodeURIComponent(`Contact: ${contactForm.name.value}`);
      const body = encodeURIComponent(`Name: ${contactForm.name.value}\nEmail: ${contactForm.email.value}\n\n${contactForm.message.value}`);
      const mailto = `mailto:${storeEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
    });
  }

  // Enhance product card hover animation for accessibility: reduce motion support
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reduceMotion.matches){
    document.documentElement.style.setProperty('--transition', '50ms linear');
  }

  // Animate counters on about page
  const animateCounter = (id, target, duration = 2000) => {
    const element = document.getElementById(id);
    if (!element) return;
    let current = 0;
    const increment = target / (duration / 50);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 50);
  };

  // Start counters when about page is loaded
  if (document.querySelector('.about-page')) {
    setTimeout(() => {
      animateCounter('order-counter', 1500); // Example: 1500 orders
      animateCounter('customer-counter', 1200); // Example: 1200 customers
      animateCounter('years-counter', 5); // Example: 5 years
    }, 500); // Delay to start animation
  }
});
