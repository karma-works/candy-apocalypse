import { WebGLProgramParametersWithUniforms } from 'three';

type shaderPatch =
  ({ vertex: string; } | { fragment: string; }) &
  ({ after: string; } | { replace: string; });

export function patchShader(
  shader: WebGLProgramParametersWithUniforms,
  patch: shaderPatch,
) {
  let from: string
  let to: string
  let candidate: keyof WebGLProgramParametersWithUniforms
  if ('vertex' in patch) {
    candidate = 'vertexShader'
    to = patch.vertex
  } else {
    candidate = 'fragmentShader'
    to = patch.fragment
  }

  if ('after' in patch) {
    from = patch.after
    to = `${from} ${to}`
  } else {
    from = patch.replace
  }
  if (shader[candidate].indexOf(from) < 0) {
    throw `Can't patch shader. '${from}' not found`
  }

  shader[candidate] = shader[candidate].replace(from, to)
}
