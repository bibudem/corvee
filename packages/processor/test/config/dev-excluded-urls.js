export default [
    // Bib
    /^http:\/\/atrium\.umontreal\.ca\/primo-explore/i,
    /^http:\/\/pds\.bib\.umontreal\.ca\//i,
    /^http:\/\/atrium\.umontreal\.ca\//i,
    // 'http://www.bib.umontreal.ca/collections-nouvelle-ere/periodiques-essentiels.htm',
    // 'http://jupiter.bib.umontreal.ca/LSH-Interne/default.asp?db=lsh-interne.mrm',

    // UdeM
    'http://carte.umontreal.ca',
    'http://www.carte.umontreal.ca',
    // 'http://carrieres.umontreal.ca/une-carriere-a-ludem',
    // 'http://carrieres.umontreal.ca/accueil',
    // /^https:\/\/identification\.umontreal\.ca\/cas\/login\.ashx/i,
    // /^https?:\/\/www\.calendrier\.umontreal\.ca\/?\?com=/i,

    // Externes

    // - permaliens connus
    // /^https?:\/\/(www|[^\.]+\.on)\.worldcat\.org\/oclc\/\d+/i,

    //
    // 'http://bestpractice.bmj.com/best-practice/welcome.html',
    // 'http://accessmedicine.mhmedical.com/readings.aspx',
    // 'https://www.myendnoteweb.com',
    // /^https?:\/\/endnote\.com\/training\/?/,
    // 'https://itunes.apple.com/us/app/endnote-for-ipad/id593994211',
    // /^https?:\/\/onlinelibrary\.wiley\.com\/book\//,
    // 'http://search.proquest.com/pqdtglobal',
    // /^http:\/\/documentation\.antidote\.info/,
    // 'http://www5.statcan.gc.ca/olc-cel/olc.action?ObjId=92-154-X&ObjType=2&lang=fr&limit=0',
    // /^https:\/\/support\.office\.com\//,
    // 'http://www.baisserlesbarrieres.org/videos/BLB-film_1-Entreprises_et_stagiaires_BLB_%28Daniel%29-fra.mp4', // 503 dans le rapport
    // 'https://www.pinel.qc.ca/DocumentationCenter.aspx?NavID=64&CultureCode=fr-CA',
    // 'https://www.actualites.uqam.ca/2015/bibliotheques-revision-des-abonnements-aux-periodiques',
    // 'http://statisticsworldwide.com/data',
    // 'https://yearbook.enerdata.net',
    // /^http:\/\/res\.banq\.qc\.ca\/login/,
    // 'http://www.uitp.org/data-statistics',
    // /^http:\/\/content\.apa\.org\/books\//i,
    // '.jwpsrv.com',


    // À revoir
    // 'http://atrium.umontreal.ca/dossier',
    // 'http://guides.bib.umontreal.ca/disciplines/25-Droit-d-auteur', // retourne un http 307?
    // 'http://savoirsdesfemmes.org', // retourne un 500
    // 'http://psycnet.apa.org/index.cfm?fa=browsePBC.years',
    // 'http://ess.nsd.uib.no', // contient un <meta http-equiv="refresh">
    // 'http://www.censtatd.gov.hk', // redirection temporaire circulaire
    // 'http://www.unece.org/stats/stats_h.htm',
    // 'http://www.nyu.edu/gsas/dept/politics/data/bdm2s2/Logic.htm', // 403 au lieu de 404
    // 'https://maincategory=[droit%20international%20priv%c3%a9]&m=search&navdom=true', // url-invalid-url
    // 'http://www.menalib.de', // 403 au lieu de 200
    // 'http://digitalcomicmuseum.com', // 403 au lieu de 200

    // 
    'http://lib.myilibrary.com',
    'http://apps.webofknowledge.com/WOS_GeneralSearch_input.do?product=WOS&highlighted_tab=WOS&search_mode=GeneralSearch',
    /^http:\/\/web\.a\.ebscohost\.com\/ehost\/detail/i,
    'http://m.thomas%40umontreal.ca?Subject=fichier%20.bst%20en%20science%20politique',
    'http://raymonde.champagne%40umontreal.ca?Subject=',
    'http://jean-francois.durnin%40umontreal.ca?Subject=',
    'https://accesspharmacy.mhmedical.com/books.aspx?view=library',
    'https://tmp.bib.umontreal.ca',
    /^http:\/\/campus\.recit\.qc\.ca/i,
    "http://www.youtube.com/user/BibliothequesUdeM",
    'http://guides.bib.umontreal.ca/disciplines/23-LibX-la-barre-d-outils-Firefox-Atrium-PubMed-etc',
    'https://dataverse.scholarsportal.info/dataverse/montreal', // cv-timeout-error
    'https://bib.umontreal.ca/communications/nouvelles/nouvelle/pret-dordinateurs-surface-book-2-a-la-bibliotheque-damenagement', // cv-timeout-error
    'https://bib.umontreal.ca/activites/activite/news/eventDetail/Event/bar-a-bonbon-a-la-bibliotheque-de-droit', // cv-timeout-error
    'https://bib.umontreal.ca/soutien-recherche/soutien-recherche', // cv-timeout-error
    'https://bib.umontreal.ca/soutien-enseignement', // cv-timeout-error
    'https://www.taylorfrancis.com/books/9781315707693', // cv-timeout-error
    'http://e%20dossier%20r%c3%a9unit%20les%20diff%c3%a9rentes%20productions%20de%20radio-canada%20sur%20les%20autochtones%20%c3%a0%20la%20t%c3%a9l%c3%a9vision,%20%c3%a0%20la%20radio%20et%20sur%20le%20web,%20ainsi%20que%20des%20archives',
    'http://xn--autochtones%20relations%20avec%20l%27tat-ctd',
    'https://itunes.apple.com/us/app/endnote-for-ipad/id593994211',
    'http://carrefour.uquebec.ca/endnote/ipad',
    'http://carrefour.uquebec.ca/endnote',
    'http://endnote.com/training/guide/windows',

]