import Doom from './Doom';
import { Params } from '../doom/doom/params';
import { RenderingMode } from '../doom/rendering/rendering-interface';
import { useSearchParams } from 'react-router-dom';

type paramsTranslateFunc = (v: string, props: Partial<Params>) => void;

const paramsTranslates: {[k: string]: paramsTranslateFunc} = {
  renderer: (v: string, props: Partial<Params>) => {
    switch (v) {
    case 'legacy':
      props.renderingMode = RenderingMode.Legacy;
      break;
    case 'webgl':
      props.renderingMode = RenderingMode.WebGL;
      break;
    }
  },
  config: (v, props) => props.config = v,
  episode: (v, props) => v && (props.episode = parseInt(v)),
  map: (v, props) => v && (props.map = parseInt(v)),
  skill: (v, props) => v && (props.skill = parseInt(v)),

  debug: (_, props) => props.debug = true,
}


export default function DoomFromRouter(props?: Partial<Params>) {
  const propsCopy = { ...props }
  const [ searchParams ] = useSearchParams();
  for (const [ key, value ] of searchParams) {
    if (key in paramsTranslates) {
      paramsTranslates[key](value, propsCopy)
    }
  }

  return <Doom {...propsCopy} />;
}
