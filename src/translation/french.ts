import { Strings } from './strings'

export class FrenchStrings implements Strings {
  //
  // D_Main.C
  //
  dDevstr = 'MODE DEVELOPPEMENT ON.\n'
  dCdrom = 'VERSION CD-ROM: DEFAULT.CFG DANS C:\\DOOMDATA\n'

  //
  // M_Menu.C
  //
  presskey = 'APPUYEZ SUR UNE TOUCHE.'
  pressyn = 'APPUYEZ SUR Y OU N'
  quitmsg = 'VOUS VOULEZ VRAIMENT\nQUITTER CE SUPER JEU?'
  loadnet = 'VOUS NE POUVEZ PAS CHARGER\nUN JEU EN RESEAU!\n\n' + this.presskey
  qloadnet = 'CHARGEMENT RAPIDE INTERDIT EN RESEAU!\n\n' + this.presskey
  qsavespot = 'VOUS N\'AVEZ PAS CHOISI UN EMPLACEMENT!\n\n' + this.presskey
  savedead = 'VOUS NE POUVEZ PAS SAUVER SI VOUS NE JOUEZ ' +
    'PAS!\n\n' + this.presskey
  qsprompt = 'SAUVEGARDE RAPIDE DANS LE FICHIER \n\n\'%s\'?\n\n' + this.pressyn
  qlprompt = 'VOULEZ-VOUS CHARGER LA SAUVEGARDE' +
    '\n\n\'%s\'?\n\n' + this.pressyn
  newgame = 'VOUS NE POUVEZ PAS LANCER\n' +
    'UN NOUVEAU JEU SUR RESEAU.\n\n' + this.presskey
  nightmare = 'VOUS CONFIRMEZ? CE NIVEAU EST\n' +
    'VRAIMENT IMPITOYABLE!n' + this.pressyn
  swstring = 'CECI EST UNE VERSION SHAREWARE DE DOOM.\n\n' +
    'VOUS DEVRIEZ COMMANDER LA TRILOGIE COMPLETE.\n\n' + this.presskey
  msgoff = 'MESSAGES OFF'
  msgon = 'MESSAGES ON'
  netend = 'VOUS NE POUVEZ PAS METTRE FIN A UN JEU SUR ' +
    'RESEAU!\n\n' + this.presskey
  endgame = 'VOUS VOULEZ VRAIMENT METTRE FIN AU JEU?\n\n' + this.pressyn

  dosy = '(APPUYEZ SUR Y POUR REVENIR AU OS.)'

  detailhi = 'GRAPHISMES MAXIMUM '
  detaillo = 'GRAPHISMES MINIMUM '
  gammalvl0 = 'CORRECTION GAMMA OFF'
  gammalvl1 = 'CORRECTION GAMMA NIVEAU 1'
  gammalvl2 = 'CORRECTION GAMMA NIVEAU 2'
  gammalvl3 = 'CORRECTION GAMMA NIVEAU 3'
  gammalvl4 = 'CORRECTION GAMMA NIVEAU 4'
  emptystring = 'EMPLACEMENT VIDE'

  //
  // P_inter.C
  //
  gotarmor = 'ARMURE RECUPEREE.'
  gotmega = 'MEGA-ARMURE RECUPEREE!'
  goththbonus = 'BONUS DE SANTE RECUPERE.'
  gotarmbonus = 'BONUS D\'ARMURE RECUPERE.'
  gotstim = 'STIMPACK RECUPERE.'
  gotmedineed = 'MEDIKIT RECUPERE. VOUS EN AVEZ VRAIMENT BESOIN!'
  gotmedikit = 'MEDIKIT RECUPERE.'
  gotsuper = 'SUPERCHARGE!'

  gotbluecard = 'CARTE MAGNETIQUE BLEUE RECUPEREE.'
  gotyelwcard = 'CARTE MAGNETIQUE JAUNE RECUPEREE.'
  gotredcard = 'CARTE MAGNETIQUE ROUGE RECUPEREE.'
  gotblueskul = 'CLEF CRANE BLEUE RECUPEREE.'
  gotyelwskul = 'CLEF CRANE JAUNE RECUPEREE.'
  gotredskull = 'CLEF CRANE ROUGE RECUPEREE.'

  gotinvul = 'INVULNERABILITE!'
  gotberserk = 'BERSERK!'
  gotinvis = 'INVISIBILITE PARTIELLE '
  gotsuit = 'COMBINAISON ANTI-RADIATIONS '
  gotmap = 'CARTE INFORMATIQUE '
  gotvisor = 'VISEUR A AMPLIFICATION DE LUMIERE '
  gotmsphere = 'MEGASPHERE!'

  gotclip = 'CHARGEUR RECUPERE.'
  gotclipbox = 'BOITE DE BALLES RECUPEREE.'
  gotrocket = 'ROQUETTE RECUPEREE.'
  gotrockbox = 'CAISSE DE ROQUETTES RECUPEREE.'
  gotcell = 'CELLULE D\'ENERGIE RECUPEREE.'
  gotcellbox = 'PACK DE CELLULES D\'ENERGIE RECUPERE.'
  gotshells = '4 CARTOUCHES RECUPEREES.'
  gotshellbox = 'BOITE DE CARTOUCHES RECUPEREE.'
  gotbackpack = 'SAC PLEIN DE MUNITIONS RECUPERE!'

  gotbfg9000 = 'VOUS AVEZ UN BFG9000!  OH, OUI!'
  gotchaingun = 'VOUS AVEZ LA MITRAILLEUSE!'
  gotchainsaw = 'UNE TRONCONNEUSE!'
  gotlauncher = 'VOUS AVEZ UN LANCE-ROQUETTES!'
  gotplasma = 'VOUS AVEZ UN FUSIL A PLASMA!'
  gotshotgun = 'VOUS AVEZ UN FUSIL!'
  gotshotgun2 = 'VOUS AVEZ UN SUPER FUSIL!'

  //
  // P_Doors.C
  //
  pdBlueo = 'IL VOUS FAUT UNE CLEF BLEUE'
  pdRedo = 'IL VOUS FAUT UNE CLEF ROUGE'
  pdYellowo = 'IL VOUS FAUT UNE CLEF JAUNE'
  pdBluek = this.pdBlueo
  pdRedk = this.pdRedo
  pdYellowk = this.pdYellowo

  //
  // G_game.C
  //
  ggsaved = 'JEU SAUVEGARDE.'

  //
  // HU_stuff.C
  //
  hustrMsgu = '[MESSAGE NON ENVOYE]'

  hustrE1m1 = 'E1M1: HANGAR'
  hustrE1m2 = 'E1M2: USINE NUCLEAIRE '
  hustrE1m3 = 'E1M3: RAFFINERIE DE TOXINES '
  hustrE1m4 = 'E1M4: CENTRE DE CONTROLE '
  hustrE1m5 = 'E1M5: LABORATOIRE PHOBOS '
  hustrE1m6 = 'E1M6: TRAITEMENT CENTRAL '
  hustrE1m7 = 'E1M7: CENTRE INFORMATIQUE '
  hustrE1m8 = 'E1M8: ANOMALIE PHOBOS '
  hustrE1m9 = 'E1M9: BASE MILITAIRE '

  hustrE2m1 = 'E2M1: ANOMALIE DEIMOS '
  hustrE2m2 = 'E2M2: ZONE DE CONFINEMENT '
  hustrE2m3 = 'E2M3: RAFFINERIE'
  hustrE2m4 = 'E2M4: LABORATOIRE DEIMOS '
  hustrE2m5 = 'E2M5: CENTRE DE CONTROLE '
  hustrE2m6 = 'E2M6: HALLS DES DAMNES '
  hustrE2m7 = 'E2M7: CUVES DE REPRODUCTION '
  hustrE2m8 = 'E2M8: TOUR DE BABEL '
  hustrE2m9 = 'E2M9: FORTERESSE DU MYSTERE '

  hustrE3m1 = 'E3M1: DONJON DE L\'ENFER '
  hustrE3m2 = 'E3M2: BOURBIER DU DESESPOIR '
  hustrE3m3 = 'E3M3: PANDEMONIUM'
  hustrE3m4 = 'E3M4: MAISON DE LA DOULEUR '
  hustrE3m5 = 'E3M5: CATHEDRALE PROFANE '
  hustrE3m6 = 'E3M6: MONT EREBUS'
  hustrE3m7 = 'E3M7: LIMBES'
  hustrE3m8 = 'E3M8: DIS'
  hustrE3m9 = 'E3M9: CLAPIERS'

  hustrE4m1 = 'E4M1: Hell Beneath'
  hustrE4m2 = 'E4M2: Perfect Hatred'
  hustrE4m3 = 'E4M3: Sever The Wicked'
  hustrE4m4 = 'E4M4: Unruly Evil'
  hustrE4m5 = 'E4M5: They Will Repent'
  hustrE4m6 = 'E4M6: Against Thee Wickedly'
  hustrE4m7 = 'E4M7: And Hell Followed'
  hustrE4m8 = 'E4M8: Unto The Cruel'
  hustrE4m9 = 'E4M9: Fear'

  hustr1 = 'NIVEAU 1: ENTREE '
  hustr2 = 'NIVEAU 2: HALLS SOUTERRAINS '
  hustr3 = 'NIVEAU 3: LE FEU NOURRI '
  hustr4 = 'NIVEAU 4: LE FOYER '
  hustr5 = 'NIVEAU 5: LES EGOUTS '
  hustr6 = 'NIVEAU 6: LE BROYEUR '
  hustr7 = 'NIVEAU 7: L\'HERBE DE LA MORT'
  hustr8 = 'NIVEAU 8: RUSES ET PIEGES '
  hustr9 = 'NIVEAU 9: LE PUITS '
  hustr10 = 'NIVEAU 10: BASE DE RAVITAILLEMENT '
  hustr11 = 'NIVEAU 11: LE CERCLE DE LA MORT!'

  hustr12 = 'NIVEAU 12: L\'USINE '
  hustr13 = 'NIVEAU 13: LE CENTRE VILLE'
  hustr14 = 'NIVEAU 14: LES ANTRES PROFONDES '
  hustr15 = 'NIVEAU 15: LA ZONE INDUSTRIELLE '
  hustr16 = 'NIVEAU 16: LA BANLIEUE'
  hustr17 = 'NIVEAU 17: LES IMMEUBLES'
  hustr18 = 'NIVEAU 18: LA COUR '
  hustr19 = 'NIVEAU 19: LA CITADELLE '
  hustr20 = 'NIVEAU 20: JE T\'AI EU!'

  hustr21 = 'NIVEAU 21: LE NIRVANA'
  hustr22 = 'NIVEAU 22: LES CATACOMBES '
  hustr23 = 'NIVEAU 23: LA GRANDE FETE '
  hustr24 = 'NIVEAU 24: LE GOUFFRE '
  hustr25 = 'NIVEAU 25: LES CHUTES DE SANG'
  hustr26 = 'NIVEAU 26: LES MINES ABANDONNEES '
  hustr27 = 'NIVEAU 27: CHEZ LES MONSTRES '
  hustr28 = 'NIVEAU 28: LE MONDE DE L\'ESPRIT '
  hustr29 = 'NIVEAU 29: LA LIMITE '
  hustr30 = 'NIVEAU 30: L\'ICONE DU PECHE '

  hustr31 = 'NIVEAU 31: WOLFENSTEIN'
  hustr32 = 'NIVEAU 32: LE MASSACRE'


  phustr1 = 'level 1: congo'
  phustr2 = 'level 2: well of souls'
  phustr3 = 'level 3: aztec'
  phustr4 = 'level 4: caged'
  phustr5 = 'level 5: ghost town'
  phustr6 = 'level 6: baron\'s lair'
  phustr7 = 'level 7: caughtyard'
  phustr8 = 'level 8: realm'
  phustr9 = 'level 9: abattoire'
  phustr10 = 'level 10: onslaught'
  phustr11 = 'level 11: hunted'

  phustr12 = 'level 12: speed'
  phustr13 = 'level 13: the crypt'
  phustr14 = 'level 14: genesis'
  phustr15 = 'level 15: the twilight'
  phustr16 = 'level 16: the omen'
  phustr17 = 'level 17: compound'
  phustr18 = 'level 18: neurosphere'
  phustr19 = 'level 19: nme'
  phustr20 = 'level 20: the death domain'

  phustr21 = 'level 21: slayer'
  phustr22 = 'level 22: impossible mission'
  phustr23 = 'level 23: tombstone'
  phustr24 = 'level 24: the final frontier'
  phustr25 = 'level 25: the temple of darkness'
  phustr26 = 'level 26: bunker'
  phustr27 = 'level 27: anti-christ'
  phustr28 = 'level 28: the sewers'
  phustr29 = 'level 29: odyssey of noises'
  phustr30 = 'level 30: the gateway of hell'

  phustr31 = 'level 31: cyberden'
  phustr32 = 'level 32: go 2 it'

  thustr1 = 'level 1: system control'
  thustr2 = 'level 2: human bbq'
  thustr3 = 'level 3: power control'
  thustr4 = 'level 4: wormhole'
  thustr5 = 'level 5: hanger'
  thustr6 = 'level 6: open season'
  thustr7 = 'level 7: prison'
  thustr8 = 'level 8: metal'
  thustr9 = 'level 9: stronghold'
  thustr10 = 'level 10: redemption'
  thustr11 = 'level 11: storage facility'

  thustr12 = 'level 12: crater'
  thustr13 = 'level 13: nukage processing'
  thustr14 = 'level 14: steel works'
  thustr15 = 'level 15: dead zone'
  thustr16 = 'level 16: deepest reaches'
  thustr17 = 'level 17: processing area'
  thustr18 = 'level 18: mill'
  thustr19 = 'level 19: shipping/respawning'
  thustr20 = 'level 20: central processing'

  thustr21 = 'level 21: administration center'
  thustr22 = 'level 22: habitat'
  thustr23 = 'level 23: lunar mining project'
  thustr24 = 'level 24: quarry'
  thustr25 = 'level 25: baron\'s den'
  thustr26 = 'level 26: ballistyx'
  thustr27 = 'level 27: mount pain'
  thustr28 = 'level 28: heck'
  thustr29 = 'level 29: river styx'
  thustr30 = 'level 30: last call'

  thustr31 = 'level 31: pharaoh'
  thustr32 = 'level 32: caribbean'

  hustrChatmacro1 = 'JE SUIS PRET A LEUR EN FAIRE BAVER!'
  hustrChatmacro2 = 'JE VAIS BIEN.'
  hustrChatmacro3 = 'JE N\'AI PAS L\'AIR EN FORME!'
  hustrChatmacro4 = 'AU SECOURS!'
  hustrChatmacro5 = 'TU CRAINS!'
  hustrChatmacro6 = 'LA PROCHAINE FOIS, MINABLE...'
  hustrChatmacro7 = 'VIENS ICI!'
  hustrChatmacro8 = 'JE VAIS M\'EN OCCUPER.'
  hustrChatmacro9 = 'OUI'
  hustrChatmacro0 = 'NON'

  hustrTalktoself1 = 'VOUS PARLEZ TOUT SEUL '
  hustrTalktoself2 = 'QUI EST LA?'
  hustrTalktoself3 = 'VOUS VOUS FAITES PEUR '
  hustrTalktoself4 = 'VOUS COMMENCEZ A DELIRER '
  hustrTalktoself5 = 'VOUS ETES LARGUE...'

  hustrMessagesent = '[MESSAGE ENVOYE]'

  // The following should NOT be changed unless it seems
  // just AWFULLY necessary

  hustrPlrgreen = 'VERT: '
  hustrPlrindigo = 'INDIGO: '
  hustrPlrbrown = 'BRUN: '
  hustrPlrred = 'ROUGE: '

  // french key should be "V"
  hustrKeygreen = 'g'
  hustrKeyindigo = 'i'
  hustrKeybrown = 'b'
  hustrKeyred = 'r'

  //
  // AM_map.C
  //

  amstrFollowon = 'MODE POURSUITE ON'
  amstrFollowoff = 'MODE POURSUITE OFF'

  amstrGridon = 'GRILLE ON'
  amstrGridoff = 'GRILLE OFF'

  amstrMarkedspot = 'REPERE MARQUE '
  amstrMarkscleared = 'REPERES EFFACES '

  //
  // ST_stuff.C
  //

  ststrMus = 'CHANGEMENT DE MUSIQUE '
  ststrNomus = 'IMPOSSIBLE SELECTION'
  ststrDqdon = 'INVULNERABILITE ON '
  ststrDqdoff = 'INVULNERABILITE OFF'

  ststrKfaadded = 'ARMEMENT MAXIMUM! '
  ststrFaadded = 'ARMES (SAUF CLEFS) AJOUTEES'

  ststrNcon = 'BARRIERES ON'
  ststrNcoff = 'BARRIERES OFF'

  ststrBehold = ' inVuln, Str, Inviso, Rad, Allmap, or Lite-amp'
  ststrBeholdx = 'AMELIORATION ACTIVEE'

  ststrChoppers = '... DOESN\'T SUCK - GM'
  ststrClev = 'CHANGEMENT DE NIVEAU...'

  //
  // F_Finale.C
  //
  e1text = 'APRES AVOIR VAINCU LES GROS MECHANTS\n' +
    'ET NETTOYE LA BASE LUNAIRE, VOUS AVEZ\n' +
    'GAGNE, NON? PAS VRAI? OU EST DONC VOTRE\n' +
    ' RECOMPENSE ET VOTRE BILLET DE\n' +
    'RETOUR? QU\'EST-QUE CA VEUT DIRE?CE' +
    'N\'EST PAS LA FIN ESPEREE!\n' +
    '\n' +
    'CA SENT LA VIANDE PUTREFIEE, MAIS\n' +
    'ON DIRAIT LA BASE DEIMOS. VOUS ETES\n' +
    'APPAREMMENT BLOQUE AUX PORTES DE L\'ENFER.\n' +
    'LA SEULE ISSUE EST DE L\'AUTRE COTE.\n' +
    '\n' +
    'POUR VIVRE LA SUITE DE DOOM, JOUEZ\n' +
    'A \'AUX PORTES DE L\'ENFER\' ET A\n' +
    'L\'EPISODE SUIVANT, \'L\'ENFER\'!\n'

  e2text = 'VOUS AVEZ REUSSI. L\'INFAME DEMON\n' +
    'QUI CONTROLAIT LA BASE LUNAIRE DE\n' +
    'DEIMOS EST MORT, ET VOUS AVEZ\n' +
    'TRIOMPHE! MAIS... OU ETES-VOUS?\n' +
    'VOUS GRIMPEZ JUSQU\'AU BORD DE LA\n' +
    'LUNE ET VOUS DECOUVREZ L\'ATROCE\n' +
    'VERITE.\n' +
    '\n' +
    'DEIMOS EST AU-DESSUS DE L\'ENFER!\n' +
    'VOUS SAVEZ QUE PERSONNE NE S\'EN\n' +
    'EST JAMAIS ECHAPPE, MAIS CES FUMIERS\n' +
    'VONT REGRETTER DE VOUS AVOIR CONNU!\n' +
    'VOUS REDESCENDEZ RAPIDEMENT VERS\n' +
    'LA SURFACE DE L\'ENFER.\n' +
    '\n' +
    'VOICI MAINTENANT LE CHAPITRE FINAL DE\n' +
    'DOOM! -- L\'ENFER.'

  e3text = 'LE DEMON ARACHNEEN ET REPUGNANT\n' +
    'QUI A DIRIGE L\'INVASION DES BASES\n' +
    'LUNAIRES ET SEME LA MORT VIENT DE SE\n' +
    'FAIRE PULVERISER UNE FOIS POUR TOUTES.\n' +
    '\n' +
    'UNE PORTE SECRETE S\'OUVRE. VOUS ENTREZ.\n' +
    'VOUS AVEZ PROUVE QUE VOUS POUVIEZ\n' +
    'RESISTER AUX HORREURS DE L\'ENFER.\n' +
    'IL SAIT ETRE BEAU JOUEUR, ET LORSQUE\n' +
    'VOUS SORTEZ, VOUS REVOYEZ LES VERTES\n' +
    'PRAIRIES DE LA TERRE, VOTRE PLANETE.\n' +
    '\n' +
    'VOUS VOUS DEMANDEZ CE QUI S\'EST PASSE\n' +
    'SUR TERRE PENDANT QUE VOUS AVEZ\n' +
    'COMBATTU LE DEMON. HEUREUSEMENT,\n' +
    'AUCUN GERME DU MAL N\'A FRANCHI\n' +
    'CETTE PORTE AVEC VOUS...'

  e4text =
    'the spider mastermind must have sent forth\n' +
    'its legions of hellspawn before your\n' +
    'final confrontation with that terrible\n' +
    'beast from hell.  but you stepped forward\n' +
    'and brought forth eternal damnation and\n' +
    'suffering upon the horde as a true hero\n' +
    'would in the face of something so evil.\n' +
    '\n' +
    'besides, someone was gonna pay for what\n' +
    'happened to daisy, your pet rabbit.\n' +
    '\n' +
    'but now, you see spread before you more\n' +
    'potential pain and gibbitude as a nation\n' +
    'of demons run amok among our cities.\n' +
    '\n' +
    'next stop, hell on earth!'


  // after level 6, put this:

  c1text = 'VOUS ETES AU PLUS PROFOND DE L\'ASTROPORT\n' +
    'INFESTE DE MONSTRES, MAIS QUELQUE CHOSE\n' +
    'NE VA PAS. ILS ONT APPORTE LEUR PROPRE\n' +
    'REALITE, ET LA TECHNOLOGIE DE L\'ASTROPORT\n' +
    'EST AFFECTEE PAR LEUR PRESENCE.\n' +
    '\n' +
    'DEVANT VOUS, VOUS VOYEZ UN POSTE AVANCE\n' +
    'DE L\'ENFER, UNE ZONE FORTIFIEE. SI VOUS\n' +
    'POUVEZ PASSER, VOUS POURREZ PENETRER AU\n' +
    'COEUR DE LA BASE HANTEE ET TROUVER \n' +
    'L\'INTERRUPTEUR DE CONTROLE QUI GARDE LA \n' +
    'POPULATION DE LA TERRE EN OTAGE.'

  // After level 11, put this:

  c2text = 'VOUS AVEZ GAGNE! VOTRE VICTOIRE A PERMIS\n' +
    'A L\'HUMANITE D\'EVACUER LA TERRE ET \n' +
    'D\'ECHAPPER AU CAUCHEMAR. VOUS ETES \n' +
    'MAINTENANT LE DERNIER HUMAIN A LA SURFACE \n' +
    'DE LA PLANETE. VOUS ETES ENTOURE DE \n' +
    'MUTANTS CANNIBALES, D\'EXTRATERRESTRES \n' +
    'CARNIVORES ET D\'ESPRITS DU MAL. VOUS \n' +
    'ATTENDEZ CALMEMENT LA MORT, HEUREUX \n' +
    'D\'AVOIR PU SAUVER VOTRE RACE.\n' +
    'MAIS UN MESSAGE VOUS PARVIENT SOUDAIN\n' +
    'DE L\'ESPACE: "NOS CAPTEURS ONT LOCALISE\n' +
    'LA SOURCE DE L\'INVASION EXTRATERRESTRE.\n' +
    'SI VOUS Y ALLEZ, VOUS POURREZ PEUT-ETRE\n' +
    'LES ARRETER. LEUR BASE EST SITUEE AU COEUR\n' +
    'DE VOTRE VILLE NATALE, PRES DE L\'ASTROPORT.\n' +
    'VOUS VOUS RELEVEZ LENTEMENT ET PENIBLEMENT\n' +
    'ET VOUS REPARTEZ POUR LE FRONT.'

  // After level 20, put this:

  c3text = 'VOUS ETES AU COEUR DE LA CITE CORROMPUE,\n' +
    'ENTOURE PAR LES CADAVRES DE VOS ENNEMIS.\n' +
    'VOUS NE VOYEZ PAS COMMENT DETRUIRE LA PORTE\n' +
    'DES CREATURES DE CE COTE. VOUS SERREZ\n' +
    'LES DENTS ET PLONGEZ DANS L\'OUVERTURE.\n' +
    '\n' +
    'IL DOIT Y AVOIR UN MOYEN DE LA FERMER\n' +
    'DE L\'AUTRE COTE. VOUS ACCEPTEZ DE\n' +
    'TRAVERSER L\'ENFER POUR LE FAIRE?'

  // After level 29, put this:

  c4text = 'LE VISAGE HORRIBLE D\'UN DEMON D\'UNE\n' +
    'TAILLE INCROYABLE S\'EFFONDRE DEVANT\n' +
    'VOUS LORSQUE VOUS TIREZ UNE SALVE DE\n' +
    'ROQUETTES DANS SON CERVEAU. LE MONSTRE\n' +
    'SE RATATINE, SES MEMBRES DECHIQUETES\n' +
    'SE REPANDANT SUR DES CENTAINES DE\n' +
    'KILOMETRES A LA SURFACE DE L\'ENFER.\n' +
    '\n' +
    'VOUS AVEZ REUSSI. L\'INVASION N\'AURA.\n' +
    'PAS LIEU. LA TERRE EST SAUVEE. L\'ENFER\n' +
    'EST ANEANTI. EN VOUS DEMANDANT OU IRONT\n' +
    'MAINTENANT LES DAMNES, VOUS ESSUYEZ\n' +
    'VOTRE FRONT COUVERT DE SUEUR ET REPARTEZ\n' +
    'VERS LA TERRE. SA RECONSTRUCTION SERA\n' +
    'BEAUCOUP PLUS DROLE QUE SA DESTRUCTION.\n'

  // Before level 31, put this:

  c5text = 'FELICITATIONS! VOUS AVEZ TROUVE LE\n' +
    'NIVEAU SECRET! IL SEMBLE AVOIR ETE\n' +
    'CONSTRUIT PAR LES HUMAINS. VOUS VOUS\n' +
    'DEMANDEZ QUELS PEUVENT ETRE LES\n' +
    'HABITANTS DE CE COIN PERDU DE L\'ENFER.'

  // Before level 32, put this:

  c6text = 'FELICITATIONS! VOUS AVEZ DECOUVERT\n' +
    'LE NIVEAU SUPER SECRET! VOUS FERIEZ\n' +
    'MIEUX DE FONCER DANS CELUI-LA!\n'


  // after map 06

  p1text =
    'You gloat over the steaming carcass of the\n' +
    'Guardian.  With its death, you\'ve wrested\n' +
    'the Accelerator from the stinking claws\n' +
    'of Hell.  You relax and glance around the\n' +
    'room.  Damn!  There was supposed to be at\n' +
    'least one working prototype, but you can\'t\n' +
    'see it. The demons must have taken it.\n' +
    '\n' +
    'You must find the prototype, or all your\n' +
    'struggles will have been wasted. Keep\n' +
    'moving, keep fighting, keep killing.\n' +
    'Oh yes, keep living, too.'


  // after map 11

  p2text =
    'Even the deadly Arch-Vile labyrinth could\n' +
    'not stop you, and you\'ve gotten to the\n' +
    'prototype Accelerator which is soon\n' +
    'efficiently and permanently deactivated.\n' +
    '\n' +
    'You\'re good at that kind of thing.'


  // after map 20

  p3text =
    'You\'ve bashed and battered your way into\n' +
    'the heart of the devil-hive.  Time for a\n' +
    'Search-and-Destroy mission, aimed at the\n' +
    'Gatekeeper, whose foul offspring is\n' +
    'cascading to Earth.  Yeah, he\'s bad. But\n' +
    'you know who\'s worse!\n' +
    '\n' +
    'Grinning evilly, you check your gear, and\n' +
    'get ready to give the bastard a little Hell\n' +
    'of your own making!'

  // after map 30

  p4text =
    'The Gatekeeper\'s evil face is splattered\n' +
    'all over the place.  As its tattered corpse\n' +
    'collapses, an inverted Gate forms and\n' +
    'sucks down the shards of the last\n' +
    'prototype Accelerator, not to mention the\n' +
    'few remaining demons.  You\'re done. Hell\n' +
    'has gone back to pounding bad dead folks \n' +
    'instead of good live ones.  Remember to\n' +
    'tell your grandkids to put a rocket\n' +
    'launcher in your coffin. If you go to Hell\n' +
    'when you die, you\'ll need it for some\n' +
    'final cleaning-up ...'

  // before map 31

  p5text =
    'You\'ve found the second-hardest level we\n' +
    'got. Hope you have a saved game a level or\n' +
    'two previous.  If not, be prepared to die\n' +
    'aplenty. For master marines only.'

  // before map 32

  p6text =
    'Betcha wondered just what WAS the hardest\n' +
    'level we had ready for ya?  Now you know.\n' +
    'No one gets out alive.'


  t1text =
    'You\'ve fought your way out of the infested\n' +
    'experimental labs.   It seems that UAC has\n' +
    'once again gulped it down.  With their\n' +
    'high turnover, it must be hard for poor\n' +
    'old UAC to buy corporate health insurance\n' +
    'nowadays..\n' +
    '\n' +
    'Ahead lies the military complex, now\n' +
    'swarming with diseased horrors hot to get\n' +
    'their teeth into you. With luck, the\n' +
    'complex still has some warlike ordnance\n' +
    'laying around.'


  t2text =
    'You hear the grinding of heavy machinery\n' +
    'ahead.  You sure hope they\'re not stamping\n' +
    'out new hellspawn, but you\'re ready to\n' +
    'ream out a whole herd if you have to.\n' +
    'They might be planning a blood feast, but\n' +
    'you feel about as mean as two thousand\n' +
    'maniacs packed into one mad killer.\n' +
    '\n' +
    'You don\'t plan to go down easy.'


  t3text =
    'The vista opening ahead looks real damn\n' +
    'familiar. Smells familiar, too -- like\n' +
    'fried excrement. You didn\'t like this\n' +
    'place before, and you sure as hell ain\'t\n' +
    'planning to like it now. The more you\n' +
    'brood on it, the madder you get.\n' +
    'Hefting your gun, an evil grin trickles\n' +
    'onto your face. Time to take some names.'

  t4text =
    'Suddenly, all is silent, from one horizon\n' +
    'to the other. The agonizing echo of Hell\n' +
    'fades away, the nightmare sky turns to\n' +
    'blue, the heaps of monster corpses start \n' +
    'to evaporate along with the evil stench \n' +
    'that filled the air. Jeeze, maybe you\'ve\n' +
    'done it. Have you really won?\n' +
    '\n' +
    'Something rumbles in the distance.\n' +
    'A blue light begins to glow inside the\n' +
    'ruined skull of the demon-spitter.'


  t5text =
    'What now? Looks totally different. Kind\n' +
    'of like King Tut\'s condo. Well,\n' +
    'whatever\'s here can\'t be any worse\n' +
    'than usual. Can it?  Or maybe it\'s best\n' +
    'to let sleeping gods lie..'


  t6text =
    'Time for a vacation. You\'ve burst the\n' +
    'bowels of hell and by golly you\'re ready\n' +
    'for a break. You mutter to yourself,\n' +
    'Maybe someone else can kick Hell\'s ass\n' +
    'next time around. Ahead lies a quiet town,\n' +
    'with peaceful flowing water, quaint\n' +
    'buildings, and presumably no Hellspawn.\n' +
    '\n' +
    'As you step off the transport, you hear\n' +
    'the stomp of a cyberdemon\'s iron shoe.'


  //
  // Character cast strings F_FINALE.C
  //
  ccZombie = 'ZOMBIE'
  ccShotgun = 'TYPE AU FUSIL'
  ccHeavy = 'MEC SUPER-ARME'
  ccImp = 'DIABLOTIN'
  ccDemon = 'DEMON'
  ccLost = 'AME PERDUE'
  ccCaco = 'CACODEMON'
  ccHell = 'CHEVALIER DE L\'ENFER'
  ccBaron = 'BARON DE L\'ENFER'
  ccArach = 'ARACHNOTRON'
  ccPain = 'ELEMENTAIRE DE LA DOULEUR'
  ccReven = 'REVENANT'
  ccMancu = 'MANCUBUS'
  ccArch = 'ARCHI-INFAME'
  ccSpider = 'L\'ARAIGNEE CERVEAU'
  ccCyber = 'LE CYBERDEMON'
  ccHero = 'NOTRE HEROS'
}
