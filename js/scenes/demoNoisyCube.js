
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
