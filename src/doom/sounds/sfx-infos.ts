//
// SoundFX struct.
//
export class SfxInfo {
  // sound data
  data: Uint8Array | null = null

  // this is checked every second to see if sound
  // can be thrown out (if 0, then decrement, if -1,
  // then throw out, if > 0, then it is in use)
  usefulness = 0

  // lump number of sfx
  lumpNum = 0

  constructor(
    // up to 6-character name
    public name: string,

    // Sfx singularity (only one at a time)
    public singularity: boolean,

    // Sfx priority
    public priority: number,

    // referenced sound if a link
    public link: SfxInfo | null,

    // pitch if a link
    public pitch: number,

    // volume if a link
    public volume: number,
  ) { }
}

//
// Information about all the sfx
//
const pistolInfo = new SfxInfo('pistol', false, 64, null, -1, -1)

export const sfxInfos: readonly SfxInfo[] = [
  // S_sfx[0] needs to be a dummy for odd reasons.
  new SfxInfo('none', false, 0, null, -1, -1),

  pistolInfo,
  new SfxInfo('shotgn', false, 64, null, -1, -1),
  new SfxInfo('sgcock', false, 64, null, -1, -1),
  new SfxInfo('dshtgn', false, 64, null, -1, -1),
  new SfxInfo('dbopn', false, 64, null, -1, -1),
  new SfxInfo('dbcls', false, 64, null, -1, -1),
  new SfxInfo('dbload', false, 64, null, -1, -1),
  new SfxInfo('plasma', false, 64, null, -1, -1),
  new SfxInfo('bfg', false, 64, null, -1, -1),
  new SfxInfo('sawup', false, 64, null, -1, -1),
  new SfxInfo('sawidl', false, 118, null, -1, -1),
  new SfxInfo('sawful', false, 64, null, -1, -1),
  new SfxInfo('sawhit', false, 64, null, -1, -1),
  new SfxInfo('rlaunc', false, 64, null, -1, -1),
  new SfxInfo('rxplod', false, 70, null, -1, -1),
  new SfxInfo('firsht', false, 70, null, -1, -1),
  new SfxInfo('firxpl', false, 70, null, -1, -1),
  new SfxInfo('pstart', false, 100, null, -1, -1),
  new SfxInfo('pstop', false, 100, null, -1, -1),
  new SfxInfo('doropn', false, 100, null, -1, -1),
  new SfxInfo('dorcls', false, 100, null, -1, -1),
  new SfxInfo('stnmov', false, 119, null, -1, -1),
  new SfxInfo('swtchn', false, 78, null, -1, -1),
  new SfxInfo('swtchx', false, 78, null, -1, -1),
  new SfxInfo('plpain', false, 96, null, -1, -1),
  new SfxInfo('dmpain', false, 96, null, -1, -1),
  new SfxInfo('popain', false, 96, null, -1, -1),
  new SfxInfo('vipain', false, 96, null, -1, -1),
  new SfxInfo('mnpain', false, 96, null, -1, -1),
  new SfxInfo('pepain', false, 96, null, -1, -1),
  new SfxInfo('slop', false, 78, null, -1, -1),
  new SfxInfo('itemup', true, 78, null, -1, -1),
  new SfxInfo('wpnup', true, 78, null, -1, -1),
  new SfxInfo('oof', false, 96, null, -1, -1),
  new SfxInfo('telept', false, 32, null, -1, -1),
  new SfxInfo('posit1', true, 98, null, -1, -1),
  new SfxInfo('posit2', true, 98, null, -1, -1),
  new SfxInfo('posit3', true, 98, null, -1, -1),
  new SfxInfo('bgsit1', true, 98, null, -1, -1),
  new SfxInfo('bgsit2', true, 98, null, -1, -1),
  new SfxInfo('sgtsit', true, 98, null, -1, -1),
  new SfxInfo('cacsit', true, 98, null, -1, -1),
  new SfxInfo('brssit', true, 94, null, -1, -1),
  new SfxInfo('cybsit', true, 92, null, -1, -1),
  new SfxInfo('spisit', true, 90, null, -1, -1),
  new SfxInfo('bspsit', true, 90, null, -1, -1),
  new SfxInfo('kntsit', true, 90, null, -1, -1),
  new SfxInfo('vilsit', true, 90, null, -1, -1),
  new SfxInfo('mansit', true, 90, null, -1, -1),
  new SfxInfo('pesit', true, 90, null, -1, -1),
  new SfxInfo('sklatk', false, 70, null, -1, -1),
  new SfxInfo('sgtatk', false, 70, null, -1, -1),
  new SfxInfo('skepch', false, 70, null, -1, -1),
  new SfxInfo('vilatk', false, 70, null, -1, -1),
  new SfxInfo('claw', false, 70, null, -1, -1),
  new SfxInfo('skeswg', false, 70, null, -1, -1),
  new SfxInfo('pldeth', false, 32, null, -1, -1),
  new SfxInfo('pdiehi', false, 32, null, -1, -1),
  new SfxInfo('podth1', false, 70, null, -1, -1),
  new SfxInfo('podth2', false, 70, null, -1, -1),
  new SfxInfo('podth3', false, 70, null, -1, -1),
  new SfxInfo('bgdth1', false, 70, null, -1, -1),
  new SfxInfo('bgdth2', false, 70, null, -1, -1),
  new SfxInfo('sgtdth', false, 70, null, -1, -1),
  new SfxInfo('cacdth', false, 70, null, -1, -1),
  new SfxInfo('skldth', false, 70, null, -1, -1),
  new SfxInfo('brsdth', false, 32, null, -1, -1),
  new SfxInfo('cybdth', false, 32, null, -1, -1),
  new SfxInfo('spidth', false, 32, null, -1, -1),
  new SfxInfo('bspdth', false, 32, null, -1, -1),
  new SfxInfo('vildth', false, 32, null, -1, -1),
  new SfxInfo('kntdth', false, 32, null, -1, -1),
  new SfxInfo('pedth', false, 32, null, -1, -1),
  new SfxInfo('skedth', false, 32, null, -1, -1),
  new SfxInfo('posact', true, 120, null, -1, -1),
  new SfxInfo('bgact', true, 120, null, -1, -1),
  new SfxInfo('dmact', true, 120, null, -1, -1),
  new SfxInfo('bspact', true, 100, null, -1, -1),
  new SfxInfo('bspwlk', true, 100, null, -1, -1),
  new SfxInfo('vilact', true, 100, null, -1, -1),
  new SfxInfo('noway', false, 78, null, -1, -1),
  new SfxInfo('barexp', false, 60, null, -1, -1),
  new SfxInfo('punch', false, 64, null, -1, -1),
  new SfxInfo('hoof', false, 70, null, -1, -1),
  new SfxInfo('metal', false, 70, null, -1, -1),
  new SfxInfo('chgun', false, 64, pistolInfo, 150, 0),
  new SfxInfo('tink', false, 60, null, -1, -1),
  new SfxInfo('bdopn', false, 100, null, -1, -1),
  new SfxInfo('bdcls', false, 100, null, -1, -1),
  new SfxInfo('itmbk', false, 100, null, -1, -1),
  new SfxInfo('flame', false, 32, null, -1, -1),
  new SfxInfo('flamst', false, 32, null, -1, -1),
  new SfxInfo('getpow', false, 60, null, -1, -1),
  new SfxInfo('bospit', false, 70, null, -1, -1),
  new SfxInfo('boscub', false, 70, null, -1, -1),
  new SfxInfo('bossit', false, 70, null, -1, -1),
  new SfxInfo('bospn', false, 70, null, -1, -1),
  new SfxInfo('bosdth', false, 70, null, -1, -1),
  new SfxInfo('manatk', false, 70, null, -1, -1),
  new SfxInfo('mandth', false, 70, null, -1, -1),
  new SfxInfo('sssit', false, 70, null, -1, -1),
  new SfxInfo('ssdth', false, 70, null, -1, -1),
  new SfxInfo('keenpn', false, 70, null, -1, -1),
  new SfxInfo('keendt', false, 70, null, -1, -1),
  new SfxInfo('skeact', false, 70, null, -1, -1),
  new SfxInfo('skesit', false, 70, null, -1, -1),
  new SfxInfo('skeatk', false, 70, null, -1, -1),
  new SfxInfo('radio', false, 60, null, -1, -1),
]
