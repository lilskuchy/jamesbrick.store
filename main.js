// js/main.js
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
    mobileToggle.addEventListener('click', () => {
      const visible = mainNav.style.display === 'block';
      mainNav.style.display = visible ? '' : 'block';
    });
  }

  // Order modal handlers
  const orderModal = document.getElementById('order-modal');
  const orderForm = document.getElementById('order-form');
  const orderProductInput = document.getElementById('order-product');
  const orderNowBtns = document.querySelectorAll('.order-now');
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

  orderNowBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const product = btn.dataset.product || '';
      openOrderModal(product);
    });
  });

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
});