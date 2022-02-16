import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState } from "../render/core/controllerInput.js";

   let cx, cy, tx, ty, theta;

   export const init = async model => {
      cx = 0, cy = 1.5, tx = 0, ty = 0, theta = 0;

      model.control('a', 'left' , () => tx -= .1);
      model.control('s', 'down' , () => ty -= .1);
      model.control('d', 'right', () => tx += .1);
      model.control('w', 'up'   , () => ty += .1);

      model.control('l', 'controller left'  , () => cx -= .1);
      model.control('r', 'controller right' , () => cx += .1);

      model.control('f', 'rotate left'  , () => theta -= .1);
      model.control('g', 'rotate right' , () => theta += .1);

      // CREATE THE TARGET

      let target = model.add();
      target.add('cube').scale(1,1,.001);

      // CREATE THE LASER BEAMS FOR THE LEFT AND RIGHT CONTROLLERS

      let beamL = model.add();
      beamL.add('cube').color(0,0,1).move(.02,0,0).scale(.02,.005,.005);
      beamL.add('cube').color(0,1,0).move(0,.02,0).scale(.005,.02,.005);
      beamL.add('tubeZ').color(1,0,0).move(0,0,-10).scale(.001,.001,10);

      let beamR = model.add();
      beamR.add('cube').color(1,0,0).move(.02,0,0).scale(.02,.005,.005);
      beamR.add('cube').color(0,0,1).move(0,.02,0).scale(.005,.02,.005);
      beamR.add('tubeZ').color(0,1,0).move(0,0,-10).scale(.001,.001,10);
   }

   export const display = model => {
      model.animate(() => {

         // GET THE CURRENT MATRIX AND TRIGGER INFO FOR BOTH CONTROLLERS

         let matrixL  = controllerMatrix.left;
         let triggerL = buttonState.left[0].pressed;

         let matrixR  = controllerMatrix.right;
         let triggerR = buttonState.right[0].pressed;

	 // ANIMATE THE TARGET

         let target = model.child(0);
         target.identity()
               .move(tx, 1.5 + ty, 0)
               .turnY(theta)// + Math.sin(model.time))
               .scale(.3,.2,1);

         // PLACE THE LASER BEAMS TO EMANATE FROM THE CONTROLLERS
         // IF NOT IN VR MODE, PLACE THE BEAMS IN DEFAULT POSITIONS

         let LM = matrixL.length ? cg.mMultiply(matrixL, cg.mTranslate( .006,0,0)) : cg.mTranslate(cx-.2,cy,1);
         let RM = matrixR.length ? cg.mMultiply(matrixR, cg.mTranslate(-.001,0,0)) : cg.mTranslate(cx+.2,cy,1);

         model.child(1).setMatrix(LM);
         model.child(2).setMatrix(RM);

	 // CHECK TO SEE WHETHER EACH BEAM INTERSECTS WITH THE TARGET

         let hitL = cg.mHitRect(LM, target.getMatrix());
         let hitR = cg.mHitRect(RM, target.getMatrix());

	 // CHANGE TARGET COLOR DEPENDING ON WHICH BEAM(S) HIT IT AND WHAT TRIGGERS ARE PRESSED

         target.color(hitL && hitR ? triggerL || triggerR ? [0,0,1] : [.5,.5,1] :
                              hitL ? triggerL             ? [1,0,0] : [1,.5,.5] :
                              hitR ? triggerR             ? [0,1,0] : [.5,1,.5] : [1,1,1]);
      });
   }
