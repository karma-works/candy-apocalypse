import { Strings } from './strings'

export class EnglishStrings implements Strings {

  //
  // D_Main.C
  //
  dDevstr = 'Development mode ON.\n'
  dCdrom = 'CD-ROM Version: default.cfg from c:\\doomdata\n'

  //
  // M_Menu.C
  //
  presskey = 'press a key.'
  pressyn = 'press y or n.'
  quitmsg = 'are you sure you want to\nquit this great game?'
  loadnet = 'you can\'t do load while in a net game!\n\n' + this.presskey
  qloadnet = 'you can\'t quickload during a netgame!\n\n' + this.presskey
  qsavespot = 'you haven\'t picked a quicksave slot yet!\n\n' + this.presskey
  savedead = 'you can\'t save if you aren\'t playing!\n\n' + this.presskey
  qsprompt = (s: string): string => `quicksave over your game named\n\n'${s}'?\n\n` + this.pressyn
  qlprompt = (s: string): string => `do you want to quickload the game named\n\n'${s}'?\n\n` + this.pressyn

  newgame =
    'you can\'t start a new game\n' +
    'while in a network game.\n\n' + this.presskey

  nightmare =
    'are you sure? this skill level\n' +
    'isn\'t even remotely fair.\n\n' + this.pressyn

  swstring =
    'this is the shareware version of doom.\n\n' +
    'you need to order the entire trilogy.\n\n' + this.presskey

  msgoff = 'Messages OFF'
  msgon = 'Messages ON'
  netend = 'you can\'t end a netgame!\n\n' + this.presskey
  endgame = 'are you sure you want to end the game?\n\n' + this.pressyn

  endmsg = [
    // DOOM1
    this.quitmsg,
    'please don\'t leave, there\'s more\ndemons to toast!',
    'let\'s beat it -- this is turning\ninto a bloodbath!',
    'i wouldn\'t leave if i were you.\ndos is much worse.',
    'you\'re trying to say you like dos\nbetter than me, right?',
    'don\'t leave yet -- there\'s a\ndemon around that corner!',
    'ya know, next time you come in here\ni\'m gonna toast ya.',
    'go ahead and leave. see if i care.',

    // QuitDOOM II messages
    'you want to quit?\nthen, thou hast lost an eighth!',
    'don\'t go now, there\'s a \ndimensional shambler waiting\nat the dos prompt!',
    'get outta here and go back\nto your boring programs.',
    'if i were your boss, i\'d \n deathmatch ya in a minute!',
    'look, bud. you leave now\nand you forfeit your body count!',
    'just leave. when you come\nback, i\'ll be waiting with a bat.',
    'you\'re lucky i don\'t smack\nyou for thinking about leaving.',

    // FinalDOOM?
    'fuck you, pussy!\nget the fuck out!',
    'you quit and i\'ll jizz\nin your cystholes!',
    'if you leave, i\'ll make\nthe lord drink my jizz.',
    'hey, ron! can we say\n\'fuck\' in the game?',
    'i\'d leave: this is just\nmore monsters and levels.\nwhat a load.',
    'suck it down, asshole!\nyou\'re a fucking wimp!',
    'don\'t quit now! we\'re \nstill spending your money!',

    // Internal debug. Different style, too.
    'THIS IS NO MESSAGE!\nPage intentionally left blank.',
  ]
  numQuitMessages = 22

  dosy = '(press y to quit)'

  detailhi = 'High detail'
  detaillo = 'Low detail'
  gammalvl0 = 'Gamma correction OFF'
  gammalvl1 = 'Gamma correction level 1'
  gammalvl2 = 'Gamma correction level 2'
  gammalvl3 = 'Gamma correction level 3'
  gammalvl4 = 'Gamma correction level 4'
  emptystring = 'empty slot'

  //
  // P_inter.C
  //
  gotarmor = 'Picked up the armor.'
  gotmega = 'Picked up the MegaArmor!'
  goththbonus = 'Picked up a health bonus.'
  gotarmbonus = 'Picked up an armor bonus.'
  gotstim = 'Picked up a stimpack.'
  gotmedineed = 'Picked up a medikit that you REALLY need!'
  gotmedikit = 'Picked up a medikit.'
  gotsuper = 'Supercharge!'

  gotbluecard = 'Picked up a blue keycard.'
  gotyelwcard = 'Picked up a yellow keycard.'
  gotredcard = 'Picked up a red keycard.'
  gotblueskul = 'Picked up a blue skull key.'
  gotyelwskul = 'Picked up a yellow skull key.'
  gotredskull = 'Picked up a red skull key.'

  gotinvul = 'Invulnerability!'
  gotberserk = 'Berserk!'
  gotinvis = 'Partial Invisibility'
  gotsuit = 'Radiation Shielding Suit'
  gotmap = 'Computer Area Map'
  gotvisor = 'Light Amplification Visor'
  gotmsphere = 'MegaSphere!'

  gotclip = 'Picked up a clip.'
  gotclipbox = 'Picked up a box of bullets.'
  gotrocket = 'Picked up a rocket.'
  gotrockbox = 'Picked up a box of rockets.'
  gotcell = 'Picked up an energy cell.'
  gotcellbox = 'Picked up an energy cell pack.'
  gotshells = 'Picked up 4 shotgun shells.'
  gotshellbox = 'Picked up a box of shotgun shells.'
  gotbackpack = 'Picked up a backpack full of ammo!'

  gotbfg9000 = 'You got the BFG9000!  Oh, yes.'
  gotchaingun = 'You got the chaingun!'
  gotchainsaw = 'A chainsaw!  Find some meat!'
  gotlauncher = 'You got the rocket launcher!'
  gotplasma = 'You got the plasma gun!'
  gotshotgun = 'You got the shotgun!'
  gotshotgun2 = 'You got the super shotgun!'

  //
  // P_Doors.C
  //
  pdBlueo = 'You need a blue key to activate this object'
  pdRedo = 'You need a red key to activate this object'
  pdYellowo = 'You need a yellow key to activate this object'
  pdBluek = 'You need a blue key to open this door'
  pdRedk = 'You need a red key to open this door'
  pdYellowk = 'You need a yellow key to open this door'

  //
  // G_game.C
  //
  ggsaved = 'game saved.'

  //
  // HU_stuff.C
  //
  hustrMsgu = '[Message unsent]'

  hustrE1m1 = 'E1M1: Hangar'
  hustrE1m2 = 'E1M2: Nuclear Plant'
  hustrE1m3 = 'E1M3: Toxin Refinery'
  hustrE1m4 = 'E1M4: Command Control'
  hustrE1m5 = 'E1M5: Phobos Lab'
  hustrE1m6 = 'E1M6: Central Processing'
  hustrE1m7 = 'E1M7: Computer Station'
  hustrE1m8 = 'E1M8: Phobos Anomaly'
  hustrE1m9 = 'E1M9: Military Base'

  hustrE2m1 = 'E2M1: Deimos Anomaly'
  hustrE2m2 = 'E2M2: Containment Area'
  hustrE2m3 = 'E2M3: Refinery'
  hustrE2m4 = 'E2M4: Deimos Lab'
  hustrE2m5 = 'E2M5: Command Center'
  hustrE2m6 = 'E2M6: Halls of the Damned'
  hustrE2m7 = 'E2M7: Spawning Vats'
  hustrE2m8 = 'E2M8: Tower of Babel'
  hustrE2m9 = 'E2M9: Fortress of Mystery'

  hustrE3m1 = 'E3M1: Hell Keep'
  hustrE3m2 = 'E3M2: Slough of Despair'
  hustrE3m3 = 'E3M3: Pandemonium'
  hustrE3m4 = 'E3M4: House of Pain'
  hustrE3m5 = 'E3M5: Unholy Cathedral'
  hustrE3m6 = 'E3M6: Mt. Erebus'
  hustrE3m7 = 'E3M7: Limbo'
  hustrE3m8 = 'E3M8: Dis'
  hustrE3m9 = 'E3M9: Warrens'

  hustrE4m1 = 'E4M1: Hell Beneath'
  hustrE4m2 = 'E4M2: Perfect Hatred'
  hustrE4m3 = 'E4M3: Sever The Wicked'
  hustrE4m4 = 'E4M4: Unruly Evil'
  hustrE4m5 = 'E4M5: They Will Repent'
  hustrE4m6 = 'E4M6: Against Thee Wickedly'
  hustrE4m7 = 'E4M7: And Hell Followed'
  hustrE4m8 = 'E4M8: Unto The Cruel'
  hustrE4m9 = 'E4M9: Fear'

  hustr1 = 'level 1: entryway'
  hustr2 = 'level 2: underhalls'
  hustr3 = 'level 3: the gantlet'
  hustr4 = 'level 4: the focus'
  hustr5 = 'level 5: the waste tunnels'
  hustr6 = 'level 6: the crusher'
  hustr7 = 'level 7: dead simple'
  hustr8 = 'level 8: tricks and traps'
  hustr9 = 'level 9: the pit'
  hustr10 = 'level 10: refueling base'
  hustr11 = 'level 11: \'o\' of destruction!'

  hustr12 = 'level 12: the factory'
  hustr13 = 'level 13: downtown'
  hustr14 = 'level 14: the inmost dens'
  hustr15 = 'level 15: industrial zone'
  hustr16 = 'level 16: suburbs'
  hustr17 = 'level 17: tenements'
  hustr18 = 'level 18: the courtyard'
  hustr19 = 'level 19: the citadel'
  hustr20 = 'level 20: gotcha!'

  hustr21 = 'level 21: nirvana'
  hustr22 = 'level 22: the catacombs'
  hustr23 = 'level 23: barrels o\' fun'
  hustr24 = 'level 24: the chasm'
  hustr25 = 'level 25: bloodfalls'
  hustr26 = 'level 26: the abandoned mines'
  hustr27 = 'level 27: monster condo'
  hustr28 = 'level 28: the spirit world'
  hustr29 = 'level 29: the living end'
  hustr30 = 'level 30: icon of sin'

  hustr31 = 'level 31: wolfenstein'
  hustr32 = 'level 32: grosse'

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

  hustrChatmacro1 = 'I\'m ready to kick butt!'
  hustrChatmacro2 = 'I\'m OK.'
  hustrChatmacro3 = 'I\'m not looking too good!'
  hustrChatmacro4 = 'Help!'
  hustrChatmacro5 = 'You suck!'
  hustrChatmacro6 = 'Next time, scumbag...'
  hustrChatmacro7 = 'Come here!'
  hustrChatmacro8 = 'I\'ll take care of it.'
  hustrChatmacro9 = 'Yes'
  hustrChatmacro0 = 'No'

  hustrTalktoself1 = 'You mumble to yourself'
  hustrTalktoself2 = 'Who\'s there?'
  hustrTalktoself3 = 'You scare yourself'
  hustrTalktoself4 = 'You start to rave'
  hustrTalktoself5 = 'You\'ve lost it...'

  hustrMessagesent = '[Message Sent]'

  // The following should NOT be changed unless it seems
  // just AWFULLY necessary

  hustrPlrgreen = 'Green: '
  hustrPlrindigo = 'Indigo: '
  hustrPlrbrown = 'Brown: '
  hustrPlrred = 'Red: '

  hustrKeygreen = 'g'
  hustrKeyindigo = 'i'
  hustrKeybrown = 'b'
  hustrKeyred = 'r'

  //
  // AM_map.C
  //

  amstrFollowon = 'Follow Mode ON'
  amstrFollowoff = 'Follow Mode OFF'

  amstrGridon = 'Grid ON'
  amstrGridoff = 'Grid OFF'

  amstrMarkedspot = 'Marked Spot'
  amstrMarkscleared = 'All Marks Cleared'

  //
  // ST_stuff.C
  //

  ststrMus = 'Music Change'
  ststrNomus = 'IMPOSSIBLE SELECTION'
  ststrDqdon = 'Degreelessness Mode On'
  ststrDqdoff = 'Degreelessness Mode Off'

  ststrKfaadded = 'Very Happy Ammo Added'
  ststrFaadded = 'Ammo (no keys) Added'

  ststrNcon = 'No Clipping Mode ON'
  ststrNcoff = 'No Clipping Mode OFF'

  ststrBehold = 'inVuln, Str, Inviso, Rad, Allmap, or Lite-amp'
  ststrBeholdx = 'Power-up Toggled'

  ststrChoppers = '... doesn\'t suck - GM'
  ststrClev = 'Changing Level...'

  //
  // F_Finale.C
  //
  e1text =
    'Once you beat the big badasses and\n' +
    'clean out the moon base you\'re supposed\n' +
    'to win, aren\'t you? Aren\'t you? Where\'s\n' +
    'your fat reward and ticket home? What\n' +
    'the hell is this? It\'s not supposed to\n' +
    'end this way!\n' +
    '\n' +
    'It stinks like rotten meat, but looks\n' +
    'like the lost Deimos base.  Looks like\n' +
    'you\'re stuck on The Shores of Hell.\n' +
    'The only way out is through.\n' +
    '\n' +
    'To continue the DOOM experience, play\n' +
    'The Shores of Hell and its amazing\n' +
    'sequel, Inferno!\n'


  e2text =
    'You\'ve done it! The hideous cyber-\n' +
    'demon lord that ruled the lost Deimos\n' +
    'moon base has been slain and you\n' +
    'are triumphant! But ... where are\n' +
    'you? You clamber to the edge of the\n' +
    'moon and look down to see the awful\n' +
    'truth.\n' +
    '\n' +
    'Deimos floats above Hell itself!\n' +
    'You\'ve never heard of anyone escaping\n' +
    'from Hell, but you\'ll make the bastards\n' +
    'sorry they ever heard of you! Quickly,\n' +
    'you rappel down to  the surface of\n' +
    'Hell.\n' +
    '\n' +
    'Now, it\'s on to the final chapter of\n' +
    'DOOM! -- Inferno.'


  e3text =
    'The loathsome spiderdemon that\n' +
    'masterminded the invasion of the moon\n' +
    'bases and caused so much death has had\n' +
    'its ass kicked for all time.\n' +
    '\n' +
    'A hidden doorway opens and you enter.\n' +
    'You\'ve proven too tough for Hell to\n' +
    'contain, and now Hell at last plays\n' +
    'fair -- for you emerge from the door\n' +
    'to see the green fields of Earth!\n' +
    'Home at last.\n' +
    '\n' +
    'You wonder what\'s been happening on\n' +
    'Earth while you were battling evil\n' +
    'unleashed. It\'s good that no Hell-\n' +
    'spawn could have come through that\n' +
    'door with you ...'


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

  c1text =
    'YOU HAVE ENTERED DEEPLY INTO THE INFESTED\n' +
    'STARPORT. BUT SOMETHING IS WRONG. THE\n' +
    'MONSTERS HAVE BROUGHT THEIR OWN REALITY\n' +
    'WITH THEM, AND THE STARPORT\'S TECHNOLOGY\n' +
    'IS BEING SUBVERTED BY THEIR PRESENCE.\n' +
    '\n' +
    'AHEAD, YOU SEE AN OUTPOST OF HELL, A\n' +
    'FORTIFIED ZONE. IF YOU CAN GET PAST IT,\n' +
    'YOU CAN PENETRATE INTO THE HAUNTED HEART\n' +
    'OF THE STARBASE AND FIND THE CONTROLLING\n' +
    'SWITCH WHICH HOLDS EARTH\'S POPULATION\n' +
    'HOSTAGE.'

  // After level 11, put this:

  c2text =
    'YOU HAVE WON! YOUR VICTORY HAS ENABLED\n' +
    'HUMANKIND TO EVACUATE EARTH AND ESCAPE\n' +
    'THE NIGHTMARE.  NOW YOU ARE THE ONLY\n' +
    'HUMAN LEFT ON THE FACE OF THE PLANET.\n' +
    'CANNIBAL MUTATIONS, CARNIVOROUS ALIENS,\n' +
    'AND EVIL SPIRITS ARE YOUR ONLY NEIGHBORS.\n' +
    'YOU SIT BACK AND WAIT FOR DEATH, CONTENT\n' +
    'THAT YOU HAVE SAVED YOUR SPECIES.\n' +
    '\n' +
    'BUT THEN, EARTH CONTROL BEAMS DOWN A\n' +
    'MESSAGE FROM SPACE: "SENSORS HAVE LOCATED\n' +
    'THE SOURCE OF THE ALIEN INVASION. IF YOU\n' +
    'GO THERE, YOU MAY BE ABLE TO BLOCK THEIR\n' +
    'ENTRY.  THE ALIEN BASE IS IN THE HEART OF\n' +
    'YOUR OWN HOME CITY, NOT FAR FROM THE\n' +
    'STARPORT." SLOWLY AND PAINFULLY YOU GET\n' +
    'UP AND RETURN TO THE FRAY.'


  // After level 20, put this:

  c3text =
    'YOU ARE AT THE CORRUPT HEART OF THE CITY,\n' +
    'SURROUNDED BY THE CORPSES OF YOUR ENEMIES.\n' +
    'YOU SEE NO WAY TO DESTROY THE CREATURES\'\n' +
    'ENTRYWAY ON THIS SIDE, SO YOU CLENCH YOUR\n' +
    'TEETH AND PLUNGE THROUGH IT.\n' +
    '\n' +
    'THERE MUST BE A WAY TO CLOSE IT ON THE\n' +
    'OTHER SIDE. WHAT DO YOU CARE IF YOU\'VE\n' +
    'GOT TO GO THROUGH HELL TO GET TO IT?'


  // After level 29, put this:

  c4text =
    'THE HORRENDOUS VISAGE OF THE BIGGEST\n' +
    'DEMON YOU\'VE EVER SEEN CRUMBLES BEFORE\n' +
    'YOU, AFTER YOU PUMP YOUR ROCKETS INTO\n' +
    'HIS EXPOSED BRAIN. THE MONSTER SHRIVELS\n' +
    'UP AND DIES, ITS THRASHING LIMBS\n' +
    'DEVASTATING UNTOLD MILES OF HELL\'S\n' +
    'SURFACE.\n' +
    '\n' +
    'YOU\'VE DONE IT. THE INVASION IS OVER.\n' +
    'EARTH IS SAVED. HELL IS A WRECK. YOU\n' +
    'WONDER WHERE BAD FOLKS WILL GO WHEN THEY\n' +
    'DIE, NOW. WIPING THE SWEAT FROM YOUR\n' +
    'FOREHEAD YOU BEGIN THE LONG TREK BACK\n' +
    'HOME. REBUILDING EARTH OUGHT TO BE A\n' +
    'LOT MORE FUN THAN RUINING IT WAS.\n'


  // Before level 31, put this:

  c5text =
    'CONGRATULATIONS, YOU\'VE FOUND THE SECRET\n' +
    'LEVEL! LOOKS LIKE IT\'S BEEN BUILT BY\n' +
    'HUMANS, RATHER THAN DEMONS. YOU WONDER\n' +
    'WHO THE INMATES OF THIS CORNER OF HELL\n' +
    'WILL BE.'


  // Before level 32, put this:

  c6text =
    'CONGRATULATIONS, YOU\'VE FOUND THE\n' +
    'SUPER SECRET LEVEL!  YOU\'D BETTER\n' +
    'BLAZE THROUGH THIS ONE!\n'


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
  ccZombie = 'ZOMBIEMAN'
  ccShotgun = 'SHOTGUN GUY'
  ccHeavy = 'HEAVY WEAPON DUDE'
  ccImp = 'IMP'
  ccDemon = 'DEMON'
  ccLost = 'LOST SOUL'
  ccCaco = 'CACODEMON'
  ccHell = 'HELL KNIGHT'
  ccBaron = 'BARON OF HELL'
  ccArach = 'ARACHNOTRON'
  ccPain = 'PAIN ELEMENTAL'
  ccReven = 'REVENANT'
  ccMancu = 'MANCUBUS'
  ccArch = 'ARCH-VILE'
  ccSpider = 'THE SPIDER MASTERMIND'
  ccCyber = 'THE CYBERDEMON'
  ccHero = 'OUR HERO'
}
