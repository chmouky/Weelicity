async function loadAirtableDataIfNeeded() {
  const keys = [
    'tags', 'places', 'tour', 'themetour',
    'quartiers', 'gastro', 'brands', 'around',
    'street', 'parametre', 'ToursPerso'
  ];

  const isReady = keys.every(key => {
    const item = sessionStorage.getItem(key);
    return item && item !== 'null' && item !== '[]' && item !== '{}';
  });

  if (isReady) {
    console.log("✅ Données déjà présentes dans sessionStorage.");
    document.getElementById('loadingOverlay')?.remove();
    document.body.style.pointerEvents = 'auto';
    return;
  }

  try {
    const res = await fetch('https://airtable-all-table2.samueltoledano94.workers.dev');
    const data = await res.json();

    sessionStorage.setItem('tags', JSON.stringify(data.Tag));
    sessionStorage.setItem('places', JSON.stringify(data.Lieu));
    sessionStorage.setItem('tour', JSON.stringify(data.Tour));
    sessionStorage.setItem('themetour', JSON.stringify(data.ThemeTour));
    sessionStorage.setItem('quartiers', JSON.stringify(data.Quartier));
    sessionStorage.setItem('gastro', JSON.stringify(data.Gastro));
    sessionStorage.setItem('brands', JSON.stringify(data.Brands));
    sessionStorage.setItem('around', JSON.stringify(data.Around));
    sessionStorage.setItem('street', JSON.stringify(data.Street));
    sessionStorage.setItem('parametre', JSON.stringify(data.Parametre));
    sessionStorage.setItem('ToursPerso', JSON.stringify(data.ToursPerso)); // ✅ fix ici

    console.log("📦 Données Airtable chargées.");
  } catch (err) {
    console.error("❌ Erreur de chargement Airtable :", err);
  }

  document.getElementById('loadingOverlay')?.remove();
  document.body.style.pointerEvents = 'auto';
}

loadAirtableDataIfNeeded().catch(err =>
  console.error('❌ Erreur dans le chargement initial :', err)
);
