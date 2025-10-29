
try{
  const sr = ScrollReveal({ distance: '24px', duration: 700, easing: 'ease-out', origin: 'bottom', interval: 100 });
  sr.reveal('.reveal');
}catch(e){ console.warn('ScrollReveal not loaded', e); }

document.addEventListener('click', (e)=>{
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  const el = document.querySelector(a.getAttribute('href'));
  if(el){
    e.preventDefault();
    el.scrollIntoView({ behavior:'smooth', block:'start' });
  }
});
