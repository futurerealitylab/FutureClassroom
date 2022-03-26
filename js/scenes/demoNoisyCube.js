/*
   This demo shows the beginnings of a procedural texture feature.

   For now the texture is implemented in js/render/core/renderer.js
   (search for 'uProcedure' in that source file). Eventually
   you will be able to specify the procedural texture right here.

   I am giving this to you in its current unfinished state so
   that you can start to play with procedural textures without
   having to wait for the final version.
*/

import * as cg from "../render/core/cg.js";

export const init = async model => {
   let cube = model.add('cube').texture('media/textures/brick.png')
   model.animate(() => {
      model.customShader(`
         opacity = sign(noise(2. * vAPos + vec3(uTime)));
      `);
      cube.identity().move(0,1.5,0).scale(.3)
   });
}
