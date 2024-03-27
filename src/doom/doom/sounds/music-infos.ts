import { Mus } from './mus'

//
// MusicInfo struct.
//
export class MusicInfo {
  // lump number of music
  lumpNum = 0

  // music data
  data: Mus | null = null

  handle: unknown

  constructor(
    // up to 6-character name
    public name: string,
  ) { }
}

//
// Information about all the music
//
export const musicInfos: readonly MusicInfo[] = [
  new MusicInfo(''),
  new MusicInfo('e1m1'),
  new MusicInfo('e1m2'),
  new MusicInfo('e1m3'),
  new MusicInfo('e1m4'),
  new MusicInfo('e1m5'),
  new MusicInfo('e1m6'),
  new MusicInfo('e1m7'),
  new MusicInfo('e1m8'),
  new MusicInfo('e1m9'),
  new MusicInfo('e2m1'),
  new MusicInfo('e2m2'),
  new MusicInfo('e2m3'),
  new MusicInfo('e2m4'),
  new MusicInfo('e2m5'),
  new MusicInfo('e2m6'),
  new MusicInfo('e2m7'),
  new MusicInfo('e2m8'),
  new MusicInfo('e2m9'),
  new MusicInfo('e3m1'),
  new MusicInfo('e3m2'),
  new MusicInfo('e3m3'),
  new MusicInfo('e3m4'),
  new MusicInfo('e3m5'),
  new MusicInfo('e3m6'),
  new MusicInfo('e3m7'),
  new MusicInfo('e3m8'),
  new MusicInfo('e3m9'),
  new MusicInfo('inter'),
  new MusicInfo('intro'),
  new MusicInfo('bunny'),
  new MusicInfo('victor'),
  new MusicInfo('introa'),
  new MusicInfo('runnin'),
  new MusicInfo('stalks'),
  new MusicInfo('countd'),
  new MusicInfo('betwee'),
  new MusicInfo('doom'),
  new MusicInfo('the_da'),
  new MusicInfo('shawn'),
  new MusicInfo('ddtblu'),
  new MusicInfo('in_cit'),
  new MusicInfo('dead'),
  new MusicInfo('stlks2'),
  new MusicInfo('theda2'),
  new MusicInfo('doom2'),
  new MusicInfo('ddtbl2'),
  new MusicInfo('runni2'),
  new MusicInfo('dead2'),
  new MusicInfo('stlks3'),
  new MusicInfo('romero'),
  new MusicInfo('shawn2'),
  new MusicInfo('messag'),
  new MusicInfo('count2'),
  new MusicInfo('ddtbl3'),
  new MusicInfo('ampie'),
  new MusicInfo('theda3'),
  new MusicInfo('adrian'),
  new MusicInfo('messg2'),
  new MusicInfo('romer2'),
  new MusicInfo('tense'),
  new MusicInfo('shawn3'),
  new MusicInfo('openin'),
  new MusicInfo('evil'),
  new MusicInfo('ultima'),
  new MusicInfo('read_m'),
  new MusicInfo('dm2ttl'),
  new MusicInfo('dm2int'),
]
