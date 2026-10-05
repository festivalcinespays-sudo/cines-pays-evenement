/* =====================================================================
   CINÉS-PAYS — tout le JavaScript du site.
   Il était auparavant écrit dans index.html ; il est ici pour que la
   politique de sécurité (CSP) puisse interdire tout script dans la page.
   ===================================================================== */
(function () {
  'use strict';

  /* Les affiches sont lues dans le dossier  affiches/  — le nom du fichier vient
     de la colonne « affiche » de programme.csv, ou du titre du film si elle est
     vide. Si l'image manque ou n'est pas exploitable, l'affiche dessinée aux
     couleurs du festival reste visible : rien ne casse jamais. */
  function afficheOk(img) {
    if (img.naturalWidth < 60 || img.naturalWidth > img.naturalHeight * 1.05) img.remove();
  }
  /* remplace les anciens attributs onload / onerror, que la CSP interdit */
  function brancherAffiches(zone) {
    zone.querySelectorAll('img[data-affiche]').forEach(function (img) {
      if (img.complete) {
        if (img.naturalWidth > 0) afficheOk(img); else img.remove();
        return;
      }
      img.addEventListener('load', function () { afficheOk(img); });
      img.addEventListener('error', function () { img.remove(); });
    });
  }

  /* vrai seulement pour une clé écrite dans l'objet lui-même : un titre de
     film ou un nom de cinéma comme « constructor » ne doit rien casser */
  function aCle(objet, cle) { return Object.prototype.hasOwnProperty.call(objet, cle); }

  // ===================================================================
  //  RÉSEAUX SOCIAUX DES CINÉMAS — un seul endroit à modifier.
  //  Laissez "" si le cinéma n'a pas de page : le bouton ne s'affiche pas.
  // ===================================================================
  var RESEAUX = {
    bobine:   { facebook:"", instagram:"" },
    montal:   { facebook:"", instagram:"https://www.instagram.com/cinemontal/" },
    cane:     { facebook:"", instagram:"" },
    hermine:  { facebook:"", instagram:"" },
    korrigan: { facebook:"", instagram:"" },
    celtic:   { facebook:"https://www.facebook.com/stmeenleceltic/",
                instagram:"https://www.instagram.com/stmeenleceltic/" }
  };
  var SITES = {
    bobine:   { site:"https://www.cinelabobine35.fr/", allocine:"https://www.allocine.fr/seance/salle_gen_csalle=P6865.html", nom:"La Bobine" },
    montal:   { site:"https://cine-montal.jimdofree.com/", allocine:"https://www.allocine.fr/seance/salle_gen_csalle=P3072.html", nom:"Ciné-Montal" },
    cane:     { site:"https://www.cinemalacane.fr/", allocine:"https://www.allocine.fr/seance/salle_gen_csalle=P9364.html", nom:"La Cane" },
    // ⚠️ l'ancienne fiche AlloCiné (W0425) était celle de L'Hermine de MAXENT,
    //    une autre salle : P9286 est bien celle de Plélan-le-Grand.
    hermine:  { site:"https://cinema-hermine.fr/", allocine:"https://www.allocine.fr/seance/salle_gen_csalle=P9286.html", nom:"L'Hermine" },
    korrigan: { site:"https://www.cinekorrigan-romille.fr/", allocine:"https://www.allocine.fr/seance/salle_gen_csalle=P9860.html", nom:"Le Korrigan" },
    celtic:   { site:"https://www.le-celtic.com/", allocine:"https://www.allocine.fr/seance/salle_gen_csalle=P5913.html", nom:"Le Celtic" }
  };

  var douceur = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches:false };
  function sobre() { return douceur.matches === true; }

  /* --------------------------------------------------- menu mobile */
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  function fermerMenu() {
    menu.classList.remove('ouvert');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', function () {
    var ouvert = menu.classList.toggle('ouvert');
    burger.setAttribute('aria-expanded', String(ouvert));
    burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = ouvert ? 'hidden' : '';
  });
  /* Un lien du menu : on referme D'ABORD (le menu mobile verrouille le
     défilement de la page), puis on va à la section à la frame suivante.
     Sans cela, le navigateur calcule le saut pendant que la page est figée
     et s'arrête au mauvais endroit. */
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var cible = (a.getAttribute('href') || '').charAt(0) === '#'
        ? document.getElementById(a.getAttribute('href').slice(1)) : null;
      fermerMenu();
      if (!cible) return;
      e.preventDefault();
      requestAnimationFrame(function () {
        cible.scrollIntoView({ behavior: sobre() ? 'auto' : 'smooth', block: 'start' });
        try { if (window.history && history.replaceState) history.replaceState(null, '', a.getAttribute('href')); }
        catch (err) { /* fichier ouvert en local : sans importance */ }
      });
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('ouvert')) { fermerMenu(); burger.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 820 && menu.classList.contains('ouvert')) fermerMenu();
  });

  /* --------------------------------------------------- défilement : bandeau,
     bouton « haut » et barre de progression (sens de lecture inclus) */
  var bandeau = document.getElementById('bandeau'),
      haut = document.getElementById('haut'),
      barre = document.getElementById('progression'),
      jauge = document.getElementById('progression-jauge'),
      tete = document.getElementById('progression-tete'),
      dernierY = window.scrollY || window.pageYOffset || 0,
      tic = false;

  function majDefilement() {
    var y = window.scrollY || window.pageYOffset || 0;
    var course = document.documentElement.scrollHeight - window.innerHeight;
    var part = course > 0 ? Math.min(1, Math.max(0, y / course)) : 0;

    bandeau.classList.toggle('colle', y > 40);
    haut.classList.toggle('vu', y > 520);
    barre.classList.toggle('active', y > 24);
    jauge.style.transform = 'scaleX(' + part.toFixed(4) + ')';
    tete.style.left = (part * 100).toFixed(2) + '%';

    if (Math.abs(y - dernierY) > 3) {
      barre.classList.toggle('monte', y < dernierY);
      dernierY = y;
    }
  }
  function surDefilement() {
    if (tic) return;
    tic = true;
    window.requestAnimationFrame(function () { majDefilement(); tic = false; });
  }
  window.addEventListener('scroll', surDefilement, { passive: true });
  window.addEventListener('resize', surDefilement);
  haut.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: sobre() ? 'auto' : 'smooth' });
  });
  majDefilement();

  /* ===================================================================
     PROGRAMME — TOUT VIENT DU FICHIER  programme.csv
     -------------------------------------------------------------------
     Le code ci-dessous ne contient aucune séance : il lit le fichier
     programme.csv posé à côté de index.html et construit à partir de lui
     les onglets des cinémas, les jours, les séances, la grille des films,
     les compteurs et les fiches.

     POUR METTRE À JOUR LE FESTIVAL, il n'y a que deux choses à faire :
       1. remplacer  programme.csv  (enregistré en « CSV UTF-8 » depuis Excel) ;
       2. remplacer les images du dossier  affiches/ .

     Colonnes attendues dans programme.csv (l'ordre n'a pas d'importance) :
       cinema   — bobine, montal, cane, hermine, korrigan ou celtic
       jour     — 2026-10-21  ou  21/10/2026
       heure    — 20h30  (ou 20:30)
       film     — le titre exact, écrit partout de la même façon
       salle    — Salle 1, Salle 2… (vide si la salle est unique)
       mention  — vide, ou sn / avp / cj / vost / renc / stage,
                  plusieurs séparées par une barre verticale |
                  et un texte sur mesure après deux-points : cj:Mon Petit Ciné
       affiche  — nom du fichier image, ex. karma.jpg
                  (vide = le nom est déduit du titre du film)
       jeune    — « oui » pour la pastille Jeune public sur l'affiche
     =================================================================== */

  /* Un seul repère à retenir : la 18ᵉ édition s'est tenue en 2026.
     Tout le reste — année affichée, numéro d'édition, dates, compte à rebours —
     est déduit des dates de programme.csv. Il n'y a donc rien à changer ici
     d'une année sur l'autre : on remplace le fichier, et la page suit.
     (Si une année saute, corrigez simplement ces deux nombres.) */
  var EDITION = { annee: 2026, numero: 18 };

  var FESTIVAL = { annee: EDITION.annee };   // s'affiche en bas des affiches dessinées
  var EDITION_ORD = EDITION.numero + 'ᵉ';

  /* Coordonnées des salles : cela ne change presque jamais, c'est donc ici
     et non dans le tableau. L'identifiant (bobine, montal…) est celui que
     vous écrivez dans la colonne « cinema » de programme.csv. */
  var CINEMAS = {
    bobine:   { nom:"La Bobine",  ville:"Bréal-sous-Montfort",
                infos:"2 salles · classé Art & Essai · label Jeune public du CNC",
                adresse:"30 rue de la Petite Motte, 35310 Bréal-sous-Montfort", tel:"02 23 41 19 62" },
    montal:   { nom:"Ciné-Montal", ville:"Montauban-de-Bretagne",
                infos:"1 salle de 143 places · classé Art & Essai · boucle magnétique",
                adresse:"28 rue du Perry, 35360 Montauban-de-Bretagne", tel:"02 99 06 44 30" },
    cane:     { nom:"La Cane", ville:"Montfort-sur-Meu",
                infos:"1 salle de 264 fauteuils · classé Art & Essai",
                adresse:"13 boulevard Carnot, 35160 Montfort-sur-Meu", tel:"02 99 09 09 37" },
    hermine:  { nom:"L’Hermine", ville:"Plélan-le-Grand",
                infos:"Salle d’Art & Essai · accès PMR · boucle magnétique",
                adresse:"Rue de l’Hermine, 35380 Plélan-le-Grand", tel:"02 99 06 89 58" },
    korrigan: { nom:"Le Korrigan", ville:"Romillé",
                infos:"209 places dont 6 PMR · classé Art & Essai · 60 bénévoles",
                adresse:"3 rue de la Vaunoise, 35850 Romillé", tel:"" },
    celtic:   { nom:"Le Celtic", ville:"Saint-Méen-le-Grand",
                infos:"2 salles (240 et 68 places) · audio-description · Art & Essai",
                adresse:"Rue Théodore Botrel, 35290 Saint-Méen-le-Grand", tel:"02 99 09 49 21" }
  };
  var ORDRE_CINEMAS = ['bobine','montal','cane','hermine','korrigan','celtic'];

  /* ------------------------------------------------- lecture du fichier CSV */

  /* Excel français sépare les colonnes par des points-virgules, Excel anglais
     par des virgules : on regarde la première ligne et on s'adapte. */
  function separateurCSV(texte) {
    var l = texte.split(/\r?\n/)[0] || '', n = { ',':0, ';':0, '\t':0 }, g = false, i;
    for (i = 0; i < l.length; i++) {
      var c = l.charAt(i);
      if (c === '"') g = !g;
      else if (!g && n.hasOwnProperty(c)) n[c]++;
    }
    if (n[';'] >= n[','] && n[';'] >= n['\t'] && n[';'] > 0) return ';';
    if (n['\t'] > n[','] && n['\t'] > 0) return '\t';
    return ',';
  }

  function analyserCSV(texte) {
    texte = String(texte).replace(/^﻿/, '');     // marque invisible ajoutée par Excel
    var sep = separateurCSV(texte), lignes = [], ligne = [], champ = '', g = false, i;
    for (i = 0; i < texte.length; i++) {
      var c = texte.charAt(i);
      if (g) {
        if (c === '"') { if (texte.charAt(i + 1) === '"') { champ += '"'; i++; } else g = false; }
        else champ += c;
      }
      else if (c === '"') g = true;
      else if (c === sep) { ligne.push(champ); champ = ''; }
      else if (c === '\n') { ligne.push(champ); lignes.push(ligne); ligne = []; champ = ''; }
      else if (c !== '\r') champ += c;
    }
    if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
    return lignes.filter(function (l) { return l.join('').trim() !== ''; });
  }

  /* noms de colonnes acceptés, accents et majuscules indifférents */
  var COLONNES = {
    cinema:  ['cinema','salle cinema','lieu'],
    jour:    ['jour','date'],
    heure:   ['heure','horaire'],
    film:    ['film','titre'],
    salle:   ['salle','ecran'],
    mention: ['mention','mentions','tag','tags'],
    affiche: ['affiche','image','poster'],
    jeune:   ['jeune','jeune public','public'],
    interdiction: ['interdiction','interdit','classification','restriction']
  };
  function cleColonne(brut) {
    var v = sansAccent(brut).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(), k;
    for (k in COLONNES) {
      if (COLONNES.hasOwnProperty(k) && COLONNES[k].indexOf(v) > -1) return k;
    }
    return null;
  }

  /* ------------------------------------------------- lecture d'une valeur */
  var JOURS_FR = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  var MOIS_FR  = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  var MOIS_LONG = ['janvier','février','mars','avril','mai','juin','juillet','août',
                   'septembre','octobre','novembre','décembre'];
  function capitale(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function dateDe(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }

  /* accepte 2026-10-21, 21/10/2026, 21-10-2026, 21/10/26 */
  function lireJour(v) {
    var t = String(v || '').trim(), m, a, mo, j;
    if ((m = t.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/)))      { a = +m[1]; mo = +m[2]; j = +m[3]; }
    else if ((m = t.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/))) { a = +m[3]; mo = +m[2]; j = +m[1]; }
    else if ((m = t.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2})$/))) { a = 2000 + +m[3]; mo = +m[2]; j = +m[1]; }
    else return '';
    var d = new Date(a, mo - 1, j);
    if (d.getFullYear() !== a || d.getMonth() !== mo - 1 || d.getDate() !== j) return '';
    return a + '-' + (mo < 10 ? '0' : '') + mo + '-' + (j < 10 ? '0' : '') + j;
  }

  /* accepte 20h30, 20:30, 20h, 20 */
  function lireHeure(v) {
    var t = String(v || '').replace(/\s/g, ''), m;
    if ((m = t.match(/^(\d{1,2})[h:.](\d{0,2})$/i))) { }
    else if ((m = t.match(/^(\d{1,2})$/))) { m = [t, m[1], '']; }
    else return null;
    var h = +m[1], mn = m[2] === '' ? 0 : +m[2];
    if (h > 23 || mn > 59) return null;
    return { texte: h + 'h' + (mn < 10 ? '0' : '') + mn, minutes: h * 60 + mn };
  }

  /* mentions : code court, phrase courante, ou « code:texte sur mesure » */
  var MENTION_DEFAUT = { sn:'Sortie nationale', avp:'Avant-première', cj:'Ciné-Jeunes',
                         vost:'VOST', renc:'Rencontre' };
  var MENTION_ALIAS = {
    'sn':'sn', 'sortie nationale':'sn',
    'avp':'avp', 'avant premiere':'avp', 'avantpremiere':'avp',
    'cj':'cj', 'cine jeunes':'cj', 'cinejeunes':'cj', 'jeune public':'cj',
    'mon petit cine':'cj', 'seance enfants':'cj',
    'vost':'vost', 'vo':'vost', 'version originale':'vost',
    'renc':'renc', 'rencontre':'renc', 'debat':'renc',
    'stage':'stage', 'atelier':'stage'
  };
  function lireMentions(v) {
    var out = { stage:false, tags:[] };
    String(v || '').split('|').forEach(function (brut) {
      var t = brut.trim();
      if (!t) return;
      var i = t.indexOf(':'), code = '', texte = t;
      var cleAlias = i > -1 ? sansAccent(t.slice(0, i)) : sansAccent(t).replace(/[_-]+/g, ' ');
      code = aCle(MENTION_ALIAS, cleAlias) ? MENTION_ALIAS[cleAlias] : '';
      if (i > -1) texte = t.slice(i + 1).trim();
      if (code === 'stage') { out.stage = true; return; }
      if (!code) { out.tags.push({ classe:'', texte:t }); return; }
      if (i === -1) texte = MENTION_DEFAUT[code];
      out.tags.push({ classe:code, texte:texte });
    });
    return out;
  }

  /* interdiction aux mineurs, fixée par le visa du film (colonne « interdiction ») :
     -12, 12, « -12 ans », « interdit aux moins de 16 ans », avertissement…
     Vide ou « tous publics » : rien n'est affiché.
     Renvoie null si rien à afficher, false si la valeur est illisible. */
  function lireInterdiction(v) {
    var t = sansAccent(v), m;
    if (!t || /^(tous publics?|tp|non|-|aucune?)$/.test(t)) return null;
    if (/avert/.test(t)) return { court:'Avertissement', long:'Avertissement à la sortie du film' };
    if ((m = t.match(/(10|12|16|18)/))) {
      return { court:'-' + m[1], long:'Interdit aux moins de ' + m[1] + ' ans' };
    }
    return false;
  }

  /* nom de fichier déduit du titre, comme les affiches déjà en place */
  function slugFilm(t) {
    return sansAccent(t).replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
  }
  function cheminAffiche(valeur, titre) {
    var v = String(valeur || '').trim().replace(/^.*[\\\/]/, '');
    if (!v) v = slugFilm(titre) + '.jpg';
    else if (!/\.(jpe?g|png|webp|avif|gif)$/i.test(v)) v += '.jpg';
    return 'affiches/' + encodeURIComponent(v);
  }
  /* couleur de l'affiche dessinée : stable pour un même titre */
  function paletteFilm(t) {
    var n = 0, i;
    for (i = 0; i < t.length; i++) n = (n * 31 + t.charCodeAt(i)) % 100000;
    return (n % 6) + 1;
  }
  function tailleTitre(t) {
    var n = t.length;
    return n <= 7 ? '1.45' : n <= 14 ? '1.20' : n <= 22 ? '1.02' : n <= 33 ? '0.90' : '0.80';
  }

  /* ------------------------------------------------- mise en forme du fichier */
  var SEANCES = [], FILMS = [], JOURS = [], ERREURS = [];

  function preparer(lignes) {
    if (!lignes.length) { ERREURS.push('Le fichier est vide.'); return; }
    var entetes = lignes[0].map(cleColonne), pos = {}, i;
    entetes.forEach(function (c, n) { if (c && !(c in pos)) pos[c] = n; });
    ['cinema','jour','heure','film'].forEach(function (c) {
      if (!(c in pos)) ERREURS.push('Colonne « ' + c + ' » introuvable dans la première ligne du fichier.');
    });
    if (ERREURS.length) return;

    function val(l, c) { return (c in pos && l[pos[c]] !== undefined) ? String(l[pos[c]]).replace(/ /g, ' ').trim() : ''; }
    var parFilm = Object.create(null);

    for (i = 1; i < lignes.length; i++) {
      var l = lignes[i], numero = i + 1;
      var cine = sansAccent(val(l, 'cinema')).replace(/\s+/g, '');
      var titre = val(l, 'film').replace(/\s+/g, ' ');
      var jour = lireJour(val(l, 'jour'));
      var heure = lireHeure(val(l, 'heure'));

      if (!cine && !titre && !jour) continue;
      if (!aCle(CINEMAS, cine))  { ERREURS.push('ligne ' + numero + ' : cinéma inconnu « ' + val(l, 'cinema') +' »'); continue; }
      if (!titre)          { ERREURS.push('ligne ' + numero + ' : titre du film manquant'); continue; }
      if (!jour)           { ERREURS.push('ligne ' + numero + ' : date illisible « ' + val(l, 'jour') + ' »'); continue; }
      if (!heure)          { ERREURS.push('ligne ' + numero + ' : heure illisible « ' + val(l, 'heure') + ' »'); continue; }

      var m = lireMentions(val(l, 'mention'));
      var cle = sansAccent(titre);
      var f = parFilm[cle];
      if (!f) {
        f = parFilm[cle] = { titre:titre, cle:cle, affiche:'', jeune:false, seances:0, interdiction:null };
        FILMS.push(f);
      }
      if (!f.affiche && val(l, 'affiche')) f.affiche = val(l, 'affiche');
      if (/^(oui|o|x|1|vrai|yes)$/i.test(val(l, 'jeune'))) f.jeune = true;
      if (!m.stage) f.seances++;
      var interdit = lireInterdiction(val(l, 'interdiction'));
      if (interdit === false) ERREURS.push('ligne ' + numero + ' : interdiction illisible « ' + val(l, 'interdiction') +
                                           ' » (écrire -12, -16, -18 ou avertissement)');
      else if (interdit && !f.interdiction) f.interdiction = interdit;

      SEANCES.push({ cine:cine, jour:jour, heure:heure, titre:titre, cle:cle,
                     salle:val(l, 'salle'), stage:m.stage, tags:m.tags });
      if (JOURS.indexOf(jour) === -1) JOURS.push(jour);
    }

    /* l'interdiction vaut pour le film : chaque séance la reprend, même si
       elle n'est écrite que sur une seule ligne du fichier */
    SEANCES.forEach(function (s) { s.interdiction = parFilm[s.cle].interdiction; });

    JOURS.sort();
    SEANCES.sort(function (a, b) {
      var d = ORDRE_CINEMAS.indexOf(a.cine) - ORDRE_CINEMAS.indexOf(b.cine);
      if (d) return d;
      if (a.jour !== b.jour) return a.jour < b.jour ? -1 : 1;
      return a.heure.minutes - b.heure.minutes;
    });
    /* un film qui n'a plus que des stages ne mérite pas de carte */
    FILMS = FILMS.filter(function (f) { return f.seances > 0; });
    FILMS.sort(function (a, b) { return a.cle < b.cle ? -1 : a.cle > b.cle ? 1 : 0; });
  }

  /* ------------------------------------------------- construction de la page */
  function tagsHTML(s) {
    var h = '';
    if (s.interdiction) h += tagInterdiction(s.interdiction);
    if (s.salle) h += '<span class="tag tag--salle">' + echap(s.salle) + '</span>';
    s.tags.forEach(function (t) {
      h += '<span class="tag' + (t.classe ? ' tag--' + t.classe : '') + '">' + echap(t.texte) + '</span>';
    });
    return h ? '<span class="tags">' + h + '</span>' : '';
  }

  function tagInterdiction(it) {
    return '<span class="tag tag--int">' + echap(it.court) +
           (it.court !== it.long ? '<span class="sr"> : ' + echap(it.long) + '</span>' : '') + '</span>';
  }

  /* Tout ce qui dépend de l'année ou des dates est réécrit ici, à partir
     du premier et du dernier jour trouvés dans programme.csv. */
  function appliquerEdition() {
    if (!JOURS.length) return;
    var d1 = dateDe(JOURS[0]), d2 = dateDe(JOURS[JOURS.length - 1]);
    var annee = d1.getFullYear();

    FESTIVAL.annee = annee;
    EDITION_ORD = (EDITION.numero + (annee - EDITION.annee)) + 'ᵉ';

    function pose(id, texte) {
      var el = document.getElementById(id);
      if (el) el.textContent = texte;
    }
    /* « du mercredi 21 au mardi 27 octobre » — le mois n'est répété
       que si le festival chevauche deux mois. */
    function periode() {
      return 'du ' + JOURS_FR[d1.getDay()] + ' ' + d1.getDate() +
             (d1.getMonth() !== d2.getMonth() ? ' ' + MOIS_LONG[d1.getMonth()] : '') +
             ' au ' + JOURS_FR[d2.getDay()] + ' ' + d2.getDate() + ' ' +
             MOIS_LONG[d2.getMonth()] + ' ' + annee;
    }

    pose('titre-annee', annee);
    pose('marque-edition', EDITION_ORD + ' édition · ' + annee);
    pose('billet-edition', EDITION_ORD + ' édition du festival');
    pose('films-sous', 'De l’animation pour les tout-petits au grand film du soir, voici toute ' +
         'la sélection ' + annee + '. Cliquez sur une affiche pour voir où et quand le film passe.');
    pose('pied-edition', 'Festival Cinés-Pays · ' + EDITION_ORD + ' édition · ' + d1.getDate() +
         (d1.getMonth() !== d2.getMonth() ? ' ' + MOIS_LONG[d1.getMonth()] : '') +
         ' → ' + d2.getDate() + ' ' + MOIS_LONG[d2.getMonth()] + ' ' + annee +
         ' · Brocéliande, Ille-et-Vilaine');

    var z = document.getElementById('dates-festival');
    if (z) {
      z.innerHTML = 'Du <b>' + JOURS_FR[d1.getDay()] + ' ' + d1.getDate() +
        (d1.getMonth() !== d2.getMonth() ? ' ' + MOIS_LONG[d1.getMonth()] : '') +
        '</b> au <b>' + JOURS_FR[d2.getDay()] + ' ' + d2.getDate() + ' ' +
        MOIS_LONG[d2.getMonth()] + ' ' + annee + '</b> · vacances de la Toussaint';
    }

    document.title = 'Cinés-Pays ' + annee + ' — ' + EDITION_ORD +
                     ' édition | Festival de 6 cinémas de Brocéliande';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', EDITION_ORD + ' festival Cinés-Pays, ' + periode() +
        ' : ' + SEANCES.filter(function (s) { return !s.stage; }).length + ' séances, ' +
        FILMS.length + ' films, 6 cinémas associatifs en Brocéliande.');
    }

    /* le compte à rebours suit le programme : 9h le premier jour, 23h30 le dernier.
       Dates construites en heure locale : le passage à l'heure d'hiver, qui tombe
       souvent pendant le festival, est géré tout seul par le navigateur. */
    DEBUT = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 9, 0).getTime();
    FIN   = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 23, 30).getTime();
  }

  /* Les trois listes de la rubrique « Les animations » sont elles aussi
     construites depuis le CSV : rien à recopier à la main. */
  function construireAnimations() {
    function jourHeure(s) {
      var d = dateDe(s.jour);
      return capitale(JOURS_FR[d.getDay()]) + ' ' + d.getDate() + ' ' +
             MOIS_LONG[d.getMonth()] + ' · ' + s.heure.texte;
    }
    function parDate(a, b) {
      if (a.jour !== b.jour) return a.jour < b.jour ? -1 : 1;
      return a.heure.minutes - b.heure.minutes;
    }
    function salle(s) { return CINEMAS[s.cine] || { nom: s.cine, ville: '' }; }

    /* une ligne = un titre en gras, un sous-titre, puis la date */
    function lignes(id, liste, gras, sous) {
      var ul = document.getElementById(id);
      if (!ul) return;
      ul.innerHTML = liste.sort(parDate).map(function (s) {
        return '<li><b>' + echap(gras(s)) + '</b><span>' + echap(sous(s)) +
               '</span><em>' + echap(jourHeure(s)) + '</em></li>';
      }).join('');
    }

    var stages = [], cj = [], avp = [];
    SEANCES.forEach(function (s) {
      if (s.stage) { stages.push(s); return; }
      var codes = s.tags.map(function (t) { return t.classe; });
      if (codes.indexOf('cj')  > -1) cj.push(s);
      if (codes.indexOf('avp') > -1) avp.push(s);
    });

    /* stages : la salle en gras ; l'atelier adultes est signalé au passage */
    lignes('anim-stage', stages,
           function (s) { return salle(s).nom; },
           function (s) {
             var v = salle(s).ville;
             return /adulte/i.test(s.titre) ? v + ' · atelier adultes' : v;
           });

    /* ciné-jeunes et avant-premières : le film en gras, la salle en dessous */
    function filmPuisSalle(id, liste) {
      lignes(id, liste,
             function (s) { return s.titre; },
             function (s) { return salle(s).nom + ' · ' + salle(s).ville; });
    }
    filmPuisSalle('anim-cj', cj);
    filmPuisSalle('anim-avp', avp);
  }

  function construire() {
    appliquerEdition();
    construireAnimations();
    var cinesUtilises = ORDRE_CINEMAS.filter(function (id) {
      return SEANCES.some(function (s) { return s.cine === id; });
    });

    /* onglets */
    document.getElementById('onglets').innerHTML = cinesUtilises.map(function (id) {
      var c = CINEMAS[id];
      return '<button class="onglet" id="onglet-' + id + '" role="tab" aria-controls="panneau-' + id +
             '" aria-selected="false" data-cine="' + id + '"><span>' + echap(c.nom) +
             '</span><small>' + echap(c.ville) + '</small></button>';
    }).join('');

    /* boutons de jour */
    document.getElementById('filtres-jours').innerHTML =
      '<b>Jour&nbsp;:</b>' +
      '<button class="fj" data-jour="tous" aria-pressed="true">Toute la semaine</button>' +
      JOURS.map(function (j) {
        var d = dateDe(j);
        return '<button class="fj" data-jour="' + j + '" aria-pressed="false">' +
               capitale(JOURS_FR[d.getDay()].slice(0, 3)) + ' ' + d.getDate() + '</button>';
      }).join('');

    /* panneaux, un par cinéma */
    document.getElementById('panneaux').innerHTML = cinesUtilises.map(function (id) {
      var c = CINEMAS[id], s = SITES[id] || {};
      var mesSeances = SEANCES.filter(function (x) { return x.cine === id; });
      var nb = mesSeances.filter(function (x) { return !x.stage; }).length;
      var tel = c.tel ? '<p><svg class="ic" aria-hidden="true"><use href="#i-tel"></use></svg> <a href="tel:+33' +
                        c.tel.replace(/\D/g, '').replace(/^0/, '') + '">' + echap(c.tel) + '</a></p>' : '';
      var jours = JOURS.map(function (j) {
        var d = dateDe(j);
        var duJour = mesSeances.filter(function (x) { return x.jour === j; });
        return '<div class="jour" data-jour="' + j + '">' +
               '<h4 class="jour__titre"><span>' + capitale(JOURS_FR[d.getDay()]) + '</span><b>' +
               d.getDate() + ' ' + MOIS_FR[d.getMonth()] + '</b></h4><ul class="seances">' +
               duJour.map(function (x) {
                 return '<li class="seance' + (x.stage ? ' seance--stage' : '') + '">' +
                        '<span class="seance__h">' + echap(x.heure.texte) + '</span>' +
                        '<span class="seance__d"><span class="seance__t">' + echap(x.titre) + '</span>' +
                        tagsHTML(x) + '</span></li>';
               }).join('') + '</ul></div>';
      }).join('');
      return '<div class="panneau" id="panneau-' + id + '" role="tabpanel" aria-labelledby="onglet-' + id +
             '" tabindex="0" hidden><div class="salle-tete"><div class="salle-tete__id">' +
             '<p class="salle-tete__ville">' + echap(c.ville) + '</p>' +
             '<h3 class="salle-tete__nom">' + echap(c.nom) + '</h3>' +
             '<p class="salle-tete__infos">' + echap(c.infos) + '</p></div>' +
             '<div class="salle-tete__meta">' +
             '<p><svg class="ic" aria-hidden="true"><use href="#i-pin"></use></svg> ' + echap(c.adresse) + '</p>' +
             tel +
             '<p class="salle-tete__nb"><b>' + nb + '</b> séance' + (nb > 1 ? 's' : '') + ' pendant le festival</p>' +
             '</div><div class="salle-tete__liens" data-liens="' + id + '"></div></div>' +
             '<div class="jours">' + jours + '</div></div>';
    }).join('');

    /* grille des films */
    var grille = document.getElementById('films-grille');
    grille.innerHTML = FILMS.map(function (f) {
      var chip = f.jeune ? '<span class="affiche__chip">Jeune public</span>' : '';
      return '<figure class="film reveal"' + (f.interdiction ? ' data-int="' + echap(f.interdiction.long) + '"' : '') +
             '><div class="film__aff">' +
             '<div class="affiche" data-pal="' + paletteFilm(f.titre) + '" style="--fs:' + tailleTitre(f.titre) +
             'rem" aria-hidden="true"><span class="affiche__init">' + echap(f.titre.charAt(0).toUpperCase()) +
             '</span>' + chip + '<span class="affiche__t">' + echap(f.titre) +
             '</span><span class="affiche__p">Cinés-Pays ' + FESTIVAL.annee + '</span></div>' +
             '<img src="' + cheminAffiche(f.affiche, f.titre) + '" alt="Affiche du film ' + echap(f.titre) +
             '" loading="lazy" decoding="async" data-affiche></div>' +
             '<figcaption><span class="film__nom">' + echap(f.titre) + '</span>' +
             '<span class="film__nb">' + f.seances + ' séance' + (f.seances > 1 ? 's' : '') + '</span>' +
             (f.interdiction ? '<span class="film__int">' + echap(f.interdiction.long) + '</span>' : '') +
             '</figcaption></figure>';
    }).join('');
    brancherAffiches(grille);

    /* la légende « -12 / -16 » n'apparaît que si un film est concerné */
    var legInt = document.getElementById('legende-int');
    if (legInt) legInt.hidden = !FILMS.some(function (f) { return f.interdiction; });

    /* les trois affiches empilées de la page d'accueil : les films les plus
       programmés de l'édition, pour qu'elles se renouvellent d'elles-mêmes */
    var pile = document.getElementById('pile-affiches');
    if (pile) {
      pile.innerHTML = FILMS.slice().sort(function (a, b) { return b.seances - a.seances; })
        .slice(0, 3).map(function (f, n) {
          var chip = f.jeune ? '<span class="affiche__chip">Jeune public</span>' : '';
          var fs = [1.56, 1.04, 1.04][n] || 1.04;
          return '<div class="pile__a"><div class="affiche" data-pal="' + paletteFilm(f.titre) +
                 '" style="--fs:' + fs + 'rem" aria-hidden="true"><span class="affiche__init">' +
                 echap(f.titre.charAt(0).toUpperCase()) + '</span>' + chip +
                 '<span class="affiche__t">' + echap(f.titre) + '</span>' +
                 '<span class="affiche__p">Cinés-Pays ' + FESTIVAL.annee + '</span></div>' +
                 '<img src="' + cheminAffiche(f.affiche, f.titre) + '" alt="" loading="lazy" ' +
                 'decoding="async" data-affiche></div>';
        }).join('');
      brancherAffiches(pile);
    }

    /* chiffres et titres qui découlent du programme */
    var nbSeances = SEANCES.filter(function (s) { return !s.stage; }).length;
    majChiffre('chiffre-cinemas', cinesUtilises.length);
    majChiffre('chiffre-seances', nbSeances);
    majChiffre('chiffre-films',   FILMS.length);
    majChiffre('chiffre-jours',   JOURS.length);

    var t = document.getElementById('films-titre');
    if (t) t.textContent = 'Les ' + FILMS.length + ' films de la semaine';

    var sous = document.getElementById('programme-sous');
    if (sous && JOURS.length) {
      var d1 = dateDe(JOURS[0]), d2 = dateDe(JOURS[JOURS.length - 1]);
      sous.textContent = JOURS.length + ' jours de séances, du ' + JOURS_FR[d1.getDay()] + ' ' + d1.getDate() +
                         (d1.getMonth() !== d2.getMonth() ? ' ' + MOIS_LONG[d1.getMonth()] : '') +
                         ' au ' + JOURS_FR[d2.getDay()] + ' ' + d2.getDate() + ' ' +
                         MOIS_LONG[d2.getMonth()] + ' ' + d2.getFullYear() + '.';
    }
    /* nombre de séances sur les cartes de la rubrique « Les six cinémas » */
    document.querySelectorAll('.carte-cine').forEach(function (carte) {
      var id = carte.getAttribute('data-goto'),
          n = SEANCES.filter(function (s) { return s.cine === id && !s.stage; }).length,
          z = carte.querySelector('.carte-cine__nb');
      if (z) z.textContent = n + ' séance' + (n > 1 ? 's' : '');
    });
  }
  function majChiffre(id, n) {
    var el = document.getElementById(id);
    if (el) { el.setAttribute('data-n', n); el.textContent = n; }
  }

  /* ------------------------------------------------- messages d'anomalie */
  function avertir(titre, detail) {
    var z = document.getElementById('programme-alerte');
    if (!z) return;
    z.innerHTML = '<b>' + echap(titre) + '</b>' + (detail ? '<span>' + echap(detail) + '</span>' : '');
    z.hidden = false;
  }

  /* ------------------------------------------------- chargement */
  function chargerProgramme() {
    if (!window.fetch) {
      avertir('Votre navigateur est trop ancien pour afficher le programme.',
              'Essayez avec une version récente de Chrome, Firefox, Edge ou Safari.');
      return;
    }
    fetch('programme.csv', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('fichier introuvable (' + r.status + ')');
        return r.text();
      })
      .then(function (texte) {
        preparer(analyserCSV(texte));
        if (!SEANCES.length) {
          avertir('Le programme n’a pas pu être lu.',
                  ERREURS.length ? ERREURS.slice(0, 4).join(' · ') : 'Le fichier programme.csv ne contient aucune séance.');
          return;
        }
        construire();
        demarrer();
        if (ERREURS.length) {
          avertir(ERREURS.length + (ERREURS.length > 1 ? ' problèmes dans programme.csv' : ' problème dans programme.csv') +
                  ' : les lignes concernées sont à corriger.',
                  ERREURS.slice(0, 6).join(' · ') + (ERREURS.length > 6 ? ' …' : ''));
        }
      })
      .catch(function (e) {
        avertir('Le programme n’a pas pu être chargé.',
                location.protocol === 'file:'
                  ? 'Cette page doit être ouverte depuis son adresse internet, pas depuis un fichier sur l’ordinateur.'
                  : 'Vérifiez que le fichier programme.csv est bien déposé à côté de index.html. (' + e.message + ')');
      });
  }

  /* ===================================================================
     THÈME CINÉMA : compte à rebours, faisceau, poussières, fiches films
     =================================================================== */
  var finePointe = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  function sansAccent(t) {
    return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00a0\s]+/g, ' ').replace(/[’']/g, "'").toLowerCase().trim();
  }
  function echap(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; });
  }

  /* --------------------------------------------------- compte à rebours */
  var decompte = document.getElementById('decompte'), decompteTxt = document.getElementById('decompte-txt');
  var DEBUT = 0, FIN = 0;   /* renseignés par appliquerEdition(), depuis programme.csv */
  function majDecompte() {
    var now = Date.now();
    if (now < DEBUT) {
      var m = Math.floor((DEBUT - now) / 60000), j = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mn = m % 60;
      decompteTxt.innerHTML = 'Lever de rideau dans <span class="decompte__n"><span><b>' + j + '</b><small>j</small></span>' +
        '<span><b>' + (h < 10 ? '0' : '') + h + '</b><small>h</small></span><span><b>' + (mn < 10 ? '0' : '') + mn + '</b><small>min</small></span></span>';
    } else if (now <= FIN) {
      decompteTxt.textContent = 'Le festival bat son plein : bonne séance !';
    } else {
      decompteTxt.textContent = 'Merci d’avoir fait vivre la ' + EDITION_ORD + ' édition. À l’année prochaine !';
    }
    decompte.hidden = false;
  }
  /* démarré à la fin de demarrer(), une fois les dates du CSV connues */

  /* --------------------------------------------------- faisceau + poussières */
  var une = document.querySelector('.une'), faisceau = document.querySelector('.une__faisceau');
  if (une && faisceau && finePointe && !sobre()) {
    une.addEventListener('pointermove', function (e) {
      var k = e.clientX / window.innerWidth - .5;
      faisceau.style.setProperty('--incl', (k * 7).toFixed(2) + 'deg');
    });
    une.addEventListener('pointerleave', function () { faisceau.style.setProperty('--incl', '0deg'); });
  }
  var toile = document.querySelector('.une__poussiere');
  if (toile && toile.getContext && !sobre()) {
    var ctx = toile.getContext('2d'), grains = [], L = 0, H = 0, visible = true, anim = null;
    function taille() {
      var r = une.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      L = r.width; H = r.height;
      toile.width = Math.round(L * d); toile.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    function grain() {
      return { x: Math.random() * L, y: Math.random() * H, r: .5 + Math.random() * 1.6,
               vx: (Math.random() - .5) * .18, vy: -.05 - Math.random() * .16, p: Math.random() * 6.28 };
    }
    taille();
    for (var g = 0; g < (L < 700 ? 22 : 48); g++) grains.push(grain());
    function dessine() {
      ctx.clearRect(0, 0, L, H);
      var axe = L * (L < 1000 ? .6 : .72);
      grains.forEach(function (q) {
        q.x += q.vx; q.y += q.vy; q.p += .025;
        if (q.y < -5) { q.y = H + 5; q.x = Math.random() * L; }
        if (q.x < -5) q.x = L + 5; else if (q.x > L + 5) q.x = -5;
        var lum = Math.max(0, 1 - Math.abs(q.x - axe) / (L * .38)) * (.35 + .35 * Math.sin(q.p));
        if (lum <= .02) return;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(255,226,160,' + lum.toFixed(3) + ')'; ctx.fill();
      });
      anim = (visible && !document.hidden) ? requestAnimationFrame(dessine) : null;
    }
    function relance() { if (!anim && visible && !document.hidden) anim = requestAnimationFrame(dessine); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; relance(); }).observe(une);
    }
    document.addEventListener('visibilitychange', relance);
    window.addEventListener('resize', function () { taille(); });
    relance();
  }

  /* ===================================================================
     APPARITIONS AU DÉFILEMENT — lancées tout de suite, SANS attendre
     programme.csv : si le fichier ne se charge pas, la présentation, les
     cinémas et les tarifs restent visibles.
     =================================================================== */
  var observateur = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('dedans');
      observateur.unobserve(e.target);
      if (e.target.classList.contains('pellicule')) compter(e.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' }) : null;

  function apparitions(liste) {
    Array.prototype.slice.call(liste).forEach(function (el) {
      var freres = Array.prototype.slice.call(el.parentNode.children).indexOf(el);
      el.style.transitionDelay = (Math.max(0, freres) % 6) * 55 + 'ms';
      if (observateur) observateur.observe(el);
      else {
        el.classList.add('dedans');
        if (el.classList.contains('pellicule')) compter(el);
      }
    });
  }

  /* --------------------------------------------------- compteurs de la pellicule
     La cible est relue à chaque image : si le programme arrive pendant
     l'animation, le compteur finit sur le bon chiffre. */
  function compter(zone) {
    zone.querySelectorAll('[data-n]').forEach(function (el, i) {
      function cible() { return parseInt(el.getAttribute('data-n'), 10); }
      if (isNaN(cible())) return;
      if (sobre()) { el.textContent = cible(); return; }
      var duree = 1000, depart = null;
      setTimeout(function () {
        requestAnimationFrame(function anime(t) {
          if (depart === null) depart = t;
          var k = Math.min(1, (t - depart) / duree);
          el.textContent = Math.round(cible() * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(anime);
        });
      }, i * 80);
    });
  }

  /* ===================================================================
     Tout ce qui suit a besoin du programme : ces fonctions ne démarrent
     qu'une fois programme.csv lu et la page construite.
     =================================================================== */
  function demarrer() {
  /* --------------------------------------------------- compte à rebours */
  if (decompte && DEBUT) { majDecompte(); setInterval(majDecompte, 30000); }

  /* --------------------------------------------------- apparitions au scroll
     (les affiches des films, créées à partir du programme) */
  apparitions(document.querySelectorAll('#films-grille .reveal'));

  /* --------------------------------------------------- liens des salles */
  function lien(url, icone, texte) {
    if (!/^https:\/\/[^\s"'<>]+$/.test(url)) return '';          // n'accepte que des liens https propres
    return '<a class="bt bt--v bt--s" href="' + url + '" target="_blank" rel="noopener noreferrer">' +
           '<svg class="ic" aria-hidden="true"><use href="#' + icone + '"></use></svg> ' + texte + '</a>';
  }
  document.querySelectorAll('[data-liens]').forEach(function (zone) {
    var id = zone.getAttribute('data-liens'), r = RESEAUX[id] || {}, s = SITES[id] || {}, sortie = '';
    if (s.site) sortie += lien(s.site, 'i-web', 'Site du cinéma');
    if (r.facebook) sortie += lien(r.facebook, 'i-fb', 'Facebook');
    if (r.instagram) sortie += lien(r.instagram, 'i-ig', 'Instagram');
    if (s.allocine) sortie += lien(s.allocine, 'i-film', 'Horaires sur AlloCiné');
    sortie += '<a class="bt bt--p bt--s" href="https://pass.culture.fr/" target="_blank" rel="noopener noreferrer">' +
              '<svg class="ic" aria-hidden="true"><use href="#i-ticket"></use></svg> Pass Culture</a>';
    zone.innerHTML = sortie;
  });

  /* --------------------------------------------------- onglets des cinémas */
  var onglets = Array.prototype.slice.call(document.querySelectorAll('.onglet'));
  var panneaux = Array.prototype.slice.call(document.querySelectorAll('.panneau'));
  var ids = onglets.map(function (o) { return o.getAttribute('data-cine'); });

  function ouvrir(id, options) {
    options = options || {};
    if (ids.indexOf(id) === -1) id = ids[0];
    onglets.forEach(function (o) {
      var actif = o.getAttribute('data-cine') === id;
      o.setAttribute('aria-selected', String(actif));
      o.tabIndex = actif ? 0 : -1;
    });
    panneaux.forEach(function (p) {
      var actif = p.id === 'panneau-' + id;
      p.hidden = !actif;
      if (actif && options.anime && !sobre()) {
        p.classList.remove('entre');
        void p.offsetWidth;          // relance l'animation
        p.classList.add('entre');
      }
    });
    if (options.memoriser && window.history && history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
    if (options.defiler) {
      document.getElementById('programme').scrollIntoView({ behavior: sobre() ? 'auto' : 'smooth', block: 'start' });
    }
  }

  onglets.forEach(function (o, i) {
    o.addEventListener('click', function () {
      ouvrir(o.getAttribute('data-cine'), { anime: true, memoriser: true });
    });
    o.addEventListener('keydown', function (e) {
      var pas = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!pas) return;
      e.preventDefault();
      var suivant = onglets[(i + pas + onglets.length) % onglets.length];
      suivant.focus();
      ouvrir(suivant.getAttribute('data-cine'), { anime: true, memoriser: true });
    });
  });

  document.querySelectorAll('[data-goto]').forEach(function (carte) {
    carte.addEventListener('click', function (e) {
      e.preventDefault();
      ouvrir(carte.getAttribute('data-goto'), { anime: true, memoriser: true, defiler: true });
    });
  });

  ouvrir((location.hash || '').replace('#', ''), {});

  /* --------------------------------------------------- filtre par jour */
  var boutonsJour = Array.prototype.slice.call(document.querySelectorAll('.fj'));
  boutonsJour.forEach(function (b) {
    b.addEventListener('click', function () {
      var jour = b.getAttribute('data-jour');
      boutonsJour.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('.jour').forEach(function (bloc) {
        bloc.hidden = (jour !== 'tous' && bloc.getAttribute('data-jour') !== jour);
      });
    });
  });

  /* --------------------------------------------------- séances de chaque film,
     lues directement dans le programme (une seule source de vérité) */
  var ORDRE_JOURS = JOURS;          // les jours réellement présents dans programme.csv
  var seancesParFilm = Object.create(null);
  panneaux.forEach(function (p) {
    var cine = p.id.replace('panneau-', ''),
        nom = (p.querySelector('.salle-tete__nom') || {}).textContent || cine,
        ville = (p.querySelector('.salle-tete__ville') || {}).textContent || '';
    p.querySelectorAll('.jour').forEach(function (bloc) {
      var jour = bloc.getAttribute('data-jour'),
          lib = bloc.querySelector('.jour__titre span').textContent + ' ' + bloc.querySelector('.jour__titre b').textContent;
      bloc.querySelectorAll('.seance').forEach(function (li) {
        if (li.classList.contains('seance--stage')) return;
        var cle = sansAccent(li.querySelector('.seance__t').textContent), h = li.querySelector('.seance__h').textContent;
        var tags = li.querySelector('.tags');
        (seancesParFilm[cle] = seancesParFilm[cle] || []).push({
          cine: cine, nom: nom, ville: ville, jour: jour, lib: lib, h: h,
          tri: ORDRE_JOURS.indexOf(jour) * 10000 + parseInt(h, 10) * 100 + (parseInt(h.split('h')[1], 10) || 0),
          tags: tags ? tags.innerHTML : ''
        });
      });
      // jour sans séance : message clair plutôt qu'un bloc vide
      if (!bloc.querySelector('.seance')) {
        var ul = bloc.querySelector('.seances');
        if (ul) ul.insertAdjacentHTML('afterend', '<p class="jour__vide">Pas de séance ce jour-là dans cette salle.</p>');
      }
    });
  });

  /* --------------------------------------------------- cartes des films */
  var cartes = Array.prototype.slice.call(document.querySelectorAll('.films .film'));
  cartes.forEach(function (fig) {
    var titre = fig.querySelector('.film__nom').textContent.replace(/\u00a0/g, ' '),
        cle = sansAccent(titre), liste = seancesParFilm[cle] || [], aff = fig.querySelector('.film__aff');
    fig.setAttribute('data-cle', cle);
    if (fig.querySelector('.affiche__chip')) fig.setAttribute('data-jeune', '1');
    liste.forEach(function (x) {
      if (x.tags.indexOf('tag--avp') > -1) fig.setAttribute('data-avp', '1');
      if (x.tags.indexOf('tag--sn') > -1) fig.setAttribute('data-sn', '1');
    });
    aff.insertAdjacentHTML('beforeend', '<span class="film__reflet" aria-hidden="true"></span><span class="film__voir" aria-hidden="true">Voir les séances</span>');
    fig.insertAdjacentHTML('beforeend', '<button type="button" class="film__ouvrir" aria-haspopup="dialog" aria-label="' +
      echap('Voir les séances : ' + titre) + '"></button>');
    fig.querySelector('.film__ouvrir').addEventListener('click', function () { ouvrirFiche(fig, titre, liste); });

    if (finePointe && !sobre()) {
      fig.addEventListener('pointermove', function (e) {
        var r = aff.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        aff.classList.add('suit');
        aff.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
        aff.style.setProperty('--rx', ((.5 - y) * 11).toFixed(2) + 'deg');
        aff.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        aff.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      fig.addEventListener('pointerleave', function () {
        aff.classList.remove('suit');
        aff.style.setProperty('--ry', '0deg'); aff.style.setProperty('--rx', '0deg');
      });
    }
  });

  /* --------------------------------------------------- filtres + recherche */
  var puces = Array.prototype.slice.call(document.querySelectorAll('.puce')),
      champ = document.getElementById('cherche-film'),
      compteur = document.getElementById('films-nb'),
      vide = document.getElementById('films-vide'),
      filtre = 'tous';
  puces.forEach(function (b) {
    var f = b.getAttribute('data-filtre');
    var n = f === 'tous' ? cartes.length : cartes.filter(function (c) { return c.hasAttribute('data-' + f); }).length;
    b.insertAdjacentHTML('beforeend', '<small>' + n + '</small>');
    if (n === 0 && f !== 'tous') b.hidden = true;
    b.addEventListener('click', function () {
      filtre = f;
      puces.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      filtrer();
    });
  });
  function filtrer() {
    var q = sansAccent(champ ? champ.value : ''), n = 0;
    cartes.forEach(function (c) {
      var ok = (filtre === 'tous' || c.hasAttribute('data-' + filtre)) && (!q || c.getAttribute('data-cle').indexOf(q) > -1);
      c.hidden = !ok;
      if (ok) { n++; c.classList.add('dedans'); }
    });
    compteur.textContent = n === cartes.length ? cartes.length + ' films à l’affiche' : n + (n > 1 ? ' films affichés' : ' film affiché') + ' sur ' + cartes.length;
    vide.hidden = n > 0;
  }
  if (champ) champ.addEventListener('input', filtrer);
  if (compteur) filtrer();

  /* --------------------------------------------------- fiche film */
  var fiche = document.getElementById('fiche'), dernierDeclencheur = null, versProgramme = false;
  function fermerFiche() { if (fiche.open) fiche.close(); }
  function ouvrirFiche(fig, titre, liste) {
    if (!fiche || typeof fiche.showModal !== 'function') {
      // navigateur très ancien : on renvoie simplement vers le programme
      document.getElementById('programme').scrollIntoView();
      return;
    }
    dernierDeclencheur = fig.querySelector('.film__ouvrir');
    var zoneAff = document.getElementById('fiche-aff'), img = fig.querySelector('.film__aff img');
    zoneAff.innerHTML = '';
    if (img && img.complete && img.naturalWidth > 0) {
      var copie = document.createElement('img');
      copie.referrerPolicy = 'no-referrer';
      copie.src = img.currentSrc || img.src; copie.alt = img.alt;
      zoneAff.appendChild(copie);
    } else {
      var dessin = fig.querySelector('.affiche');
      if (dessin) zoneAff.appendChild(dessin.cloneNode(true));
    }
    document.getElementById('fiche-titre').textContent = titre;
    var cines = {};
    liste.forEach(function (x) { cines[x.cine] = 1; });
    var nbCines = Object.keys(cines).length;
    var badges = (fig.hasAttribute('data-int') ? '<span class="tag tag--int">' + echap(fig.getAttribute('data-int')) + '</span>' : '') +
                 (fig.hasAttribute('data-jeune') ? '<span class="tag tag--cj">Jeune public</span>' : '') +
                 (fig.hasAttribute('data-avp') ? '<span class="tag tag--avp">Avant-première</span>' : '') +
                 (fig.hasAttribute('data-sn') ? '<span class="tag tag--sn">Sortie nationale</span>' : '');
    document.getElementById('fiche-resume').innerHTML = badges + liste.length + (liste.length > 1 ? ' séances' : ' séance') +
      ' dans ' + nbCines + (nbCines > 1 ? ' cinémas' : ' cinéma') + ' pendant le festival.';
    var html = '', jourPrec = '';
    liste.slice().sort(function (a, b) { return a.tri - b.tri; }).forEach(function (x) {
      if (x.jour !== jourPrec) { html += '<p class="fiche__jour">' + echap(x.lib) + '</p>'; jourPrec = x.jour; }
      html += '<div class="fiche__ligne"><b>' + echap(x.h) + '</b><span>' + echap(x.nom) + ' <small>· ' + echap(x.ville) + '</small>' +
              (x.tags ? '<span class="tags">' + x.tags + '</span>' : '') + '</span>' +
              '<button type="button" class="fiche__go" data-cine="' + x.cine + '" data-jour="' + x.jour + '">Voir la salle</button></div>';
    });
    document.getElementById('fiche-liste').innerHTML = html || '<p class="fiche__resume">Horaires bientôt disponibles.</p>';

    /* --- « Où acheter sa place ? » ---------------------------------------
       Cinés-Pays ne vend pas de billets : chaque cinéma garde sa billetterie.
       On le dit noir sur blanc et on donne le lien de chaque salle qui passe
       CE film, pour que personne n'ait à chercher. */
    var zoneOu = document.getElementById('fiche-ou');
    if (zoneOu) {
      var salles = Object.keys(cines), boutons = '', manquants = [];
      salles.forEach(function (id) {
        var s = SITES[id] || {}, nom = s.nom || id, url = s.site || s.allocine || '';
        if (url && /^https:\/\/[^\s"'<>]+$/.test(url)) {
          boutons += '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' +
                     '<svg class="ic" aria-hidden="true"><use href="#' + (s.site ? 'i-web' : 'i-film') + '"></use></svg>' +
                     echap(nom) + '</a>';
        } else {
          manquants.push(nom);
        }
      });

      zoneOu.innerHTML =
        '<h4><svg class="ic" aria-hidden="true"><use href="#i-ticket"></use></svg> Où acheter sa place&nbsp;?</h4>' +
        '<p>Les billets ne se prennent pas sur ce site&nbsp;: chaque cinéma gère ses propres places. ' +
        'Pour assister à l’une de ces séances, rendez-vous sur le site du cinéma concerné, ' +
        'ou directement à la caisse de la salle avant la séance.</p>' +
        (boutons ? '<div class="fiche__salles">' + boutons + '</div>' : '') +
        (manquants.length
          ? '<p class="fiche__sansliens">' + echap(manquants.join(', ')) +
            (manquants.length > 1 ? ' n’ont pas de site&nbsp;: rendez-vous sur place ou appelez la salle (coordonnées dans la rubrique « Les six cinémas »).'
                                  : ' n’a pas de site&nbsp;: rendez-vous sur place ou appelez la salle (coordonnées dans la rubrique « Les six cinémas »).') +
            '</p>'
          : '');
      zoneOu.hidden = salles.length === 0;
    }

    fiche.showModal();
    document.body.classList.add('fige');
    fiche.querySelector('.fiche__txt').scrollTop = 0;
  }
  if (fiche) {
    document.getElementById('fiche-fermer').addEventListener('click', fermerFiche);
    fiche.addEventListener('click', function (e) {
      if (e.target === fiche) { fermerFiche(); return; }          // clic sur le fond sombre
      var go = e.target.closest ? e.target.closest('.fiche__go') : null;
      if (!go) return;
      versProgramme = true;
      fermerFiche();
      var bJour = document.querySelector('.fj[data-jour="' + go.getAttribute('data-jour') + '"]');
      if (bJour) bJour.click();
      ouvrir(go.getAttribute('data-cine'), { anime: true, memoriser: true, defiler: true });
    });
    fiche.addEventListener('close', function () {
      document.body.classList.remove('fige');
      var retour = !versProgramme; versProgramme = false;
      if (retour && dernierDeclencheur && document.contains(dernierDeclencheur)) {
        try { dernierDeclencheur.focus({ preventScroll: true }); } catch (err) { dernierDeclencheur.focus(); }
      }
    });
  }  }

  apparitions(document.querySelectorAll('.reveal'));
  chargerProgramme();

})();
