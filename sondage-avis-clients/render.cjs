// Export du mini-sondage en PNG (1080 × 1350 et version HD 2160 × 2700)
// et contrôles de mise en page : débordements, texte coupé, chevauchements.
// Usage : NODE_PATH=$(npm root -g) node render.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dir = __dirname;
const page_html = 'file://' + path.join(dir, 'sondage.html');
const logo = path.join(dir, 'assets', 'logo-officiel.png');
const out = path.join(dir, 'export');
const nom = 'sondage-avis-clients-psp';

(async () => {
  const browser = await chromium.launch(
    fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {}
  );
  const defauts = [];

  for (const echelle of [1, 2]) {
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: echelle });
    const page = await ctx.newPage();
    await page.goto(page_html, { waitUntil: 'networkidle' });

    if (fs.existsSync(logo)) {
      const data = 'data:image/png;base64,' + fs.readFileSync(logo).toString('base64');
      await page.evaluate(src => {
        document.getElementById('logo-img').src = src;
        document.querySelector('.entete').classList.add('avec-logo');
      }, data);
    }
    await page.evaluate(() => document.fonts.ready);

    if (echelle === 1) {
      const r = await page.evaluate(() => {
        const pb = [];
        const box = el => el.getBoundingClientRect();
        // 1. Rien ne sort du cadre 1080 × 1350 (marge de sécurité 32 px)
        document.querySelectorAll('.carte, .signature span, h1, .accroche').forEach(el => {
          const b = box(el);
          if (b.left < 32 || b.right > 1048 || b.top < 32 || b.bottom > 1318)
            pb.push(`hors zone sûre : ${el.className || el.tagName} [${Math.round(b.left)},${Math.round(b.top)},${Math.round(b.right)},${Math.round(b.bottom)}]`);
        });
        // 2. Aucun texte ne déborde de son option ou de sa carte
        document.querySelectorAll('h1, .option, .carte, .carte-tete').forEach(el => {
          if (el.scrollWidth > el.clientWidth + 1)
            pb.push(`texte qui déborde : ${el.textContent.trim().slice(0, 50)}`);
        });
        // 3. La dernière carte ne touche pas la signature
        const q3 = box(document.querySelector('.q3'));
        const sig = box(document.querySelector('.signature span'));
        if (sig.top - q3.bottom < 24) pb.push(`signature trop proche : ${Math.round(sig.top - q3.bottom)} px`);
        // 4. Le logo, s'il est présent, ne chevauche pas le titre
        const lg = document.querySelector('.entete.avec-logo .logo');
        if (lg && box(lg).bottom > box(document.querySelector('h1')).top)
          pb.push('logo qui chevauche le titre');
        // 5. Polices effectivement chargées
        for (const f of ['800 84px "Inter Tight"', '500 26px Inter', '26px "Noto Color Emoji"'])
          if (!document.fonts.check(f)) pb.push(`police non chargée : ${f}`);
        return {
          pb,
          mesures: {
            espace_bas: Math.round(1350 - sig.bottom),
            ecart_q3_signature: Math.round(sig.top - q3.bottom),
            hauteur_zone_reponse: Math.round(box(document.querySelector('.zone-reponse')).height),
            lignes_option_longue: Math.round(box(document.querySelector('.option.large')).height),
          },
        };
      });
      defauts.push(...r.pb);
      console.log('Mesures :', r.mesures);
    }

    const fichier = path.join(out, echelle === 1 ? `${nom}-1080x1350.png` : `${nom}-HD-2160x2700.png`);
    await page.screenshot({ path: fichier, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log('Exporté :', path.relative(dir, fichier));
    await ctx.close();
  }

  await browser.close();
  if (defauts.length) {
    console.error('Défauts détectés :\n- ' + defauts.join('\n- '));
    process.exit(1);
  }
  console.log('Contrôles de mise en page : aucun défaut.');
})();
