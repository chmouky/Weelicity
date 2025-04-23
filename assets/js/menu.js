// /assets/js/menu.js
async function main() {
    // Charger le footer
    await loadFooter();
  }
  
  async function loadFooter() {
    try {
      const res = await fetch('/assets/components/footer.html');
      if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status} ${res.statusText}`);
      }
      const html = await res.text();
      const placeholder = document.getElementById('footer-placeholder');
      if (placeholder) {
        placeholder.innerHTML = html;
        console.log('✅ Footer chargé !');
      } else {
        console.warn('⚠️ #footer-placeholder non trouvé');
      }
    } catch (err) {
      console.error('❌ Erreur chargement footer :', err);
    }
  }
  
  main().catch(err => {
    console.error('❌ Erreur principale :', err);
    loadFooter(); // Charger le footer même en cas d'erreur
  });