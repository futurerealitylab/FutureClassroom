import { ControllerBeam } from "../render/core/controllerInput.js";

export const init = async model => {
   let target = model.add('cube'),
       cbL = new ControllerBeam(model, 'left'),
       cbR = new ControllerBeam(model, 'right');
   model.animate(() => {
      cbL.update();
      cbR.update();
      let L = cbL.hitRect(target.getMatrix()),
          R = cbR.hitRect(target.getMatrix());
      target.identity().move(0,1.5,0).scale(.3,.2,.001)
            .color(L && R ? [1,0,0] : L || R ? [1,.5,.5] : [1,1,1]);
   });
}
