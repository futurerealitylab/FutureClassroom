import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState } from "../render/core/controllerInput.js";
import { squaredDistance } from "../third-party/gl-matrix/src/gl-matrix/vec3.js";

   class ControllerEvents {
      constructor() {
         this.triggerDown = false;
         this.triggerUp   = false;
         this.btn1Down    = false;
         this.btn1Up      = false;
      }
   }

   const xor = (a, b) => (a || b) && !(a && b);
   const vsub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
   const vadd = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
   const getPos = (matrix) => matrix.slice(-4, -1);
   const sqCenterDist = (m1, m2) => {
      const m1Pos = getPos(m1);
      const m2Pos = getPos(m2);
      // squared distance formula
      return vsub(m1Pos, m2Pos).reduce((acc, v) => acc + v*v, 0);
   }

   let cx, cy, tx, ty, tz, theta;
   let isSelectedLeft, isSelectedRight, isTriggerPressed, isButtonPressed;
   let leftEvents, rightEvents;
   let prevTriggerL, prevTriggerR;
   let temp = true;
   let grabbed = false;
   let moveDir = [0,0,0];
   const grabDistance = .3;
   const speedMultiplier = 4;
   const resetMoveDir = () => moveDir = [0,0,0];
   

   export const init = async model => {
      isSelectedLeft = isSelectedRight = isTriggerPressed = isButtonPressed = false;
      leftEvents = new ControllerEvents();
      rightEvents = new ControllerEvents();
      cx = 0, cy = 1.5, tx = 0, ty = 1.5, tz = 0, theta = 0;

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
      target.add('cube').texture('media/textures/brick.png');
      target.move(0, 1.5, 0);

      // CREATE THE LASER BEAMS FOR THE LEFT AND RIGHT CONTROLLERS

      let beamL = model.add();
      beamL.add('cube').color(0,0,1).move(.02,0,0).scale(.02,.005,.005);
      beamL.add('cube').color(0,1,0).move(0,.02,0).scale(.005,.02,.005);
      beamL.add('cube').color(1,0,0).move(0,0,.02).scale(.005,.005,.02);
      beamL.add('tubeZ').color(1,0,0).move(0,0,-10).scale(.001,.001,10); // RED

      let beamR = model.add();
      beamR.add('cube').color(0,0,1).move(.02,0,0).scale(.02,.005,.005);
      beamR.add('cube').color(0,1,0).move(0,.02,0).scale(.005,.02,.005);
      beamR.add('cube').color(1,0,0).move(0,0,.02).scale(.005,.005,.02);
      beamR.add('tubeZ').color(0,1,0).move(0,0,-10).scale(.001,.001,10); // GREEN

      let grabSphere = model.add()
      grabSphere.add('sphere').color(1,1,1).move(1,1.5,0).scale(.3, .3, .3);
   }

   export const display = model => {
      model.animate(() => {
         // use model.deltaTime for time-based animation
         // GET THE CURRENT MATRIX AND TRIGGER INFO FOR BOTH CONTROLLERS

         let matrixL  = controllerMatrix.left;
         // console.log(matrixL);
         let triggerL = buttonState.left[0].pressed;
         // if (!leftEvents.triggerDown && triggerL) {
         //    // console.log("TRIGGER PRESSED");
         //    console.log(buttonState.left[0]);
         // } 

         let matrixR  = controllerMatrix.right;
         let triggerR = buttonState.right[0].pressed;
         let trigger2R  = buttonState.right[1].pressed;
         // trigger2 = 1
         // A = 4
         // B = 5
         let btnA = buttonState.right[4].pressed;
         let btnB = buttonState.right[5].pressed;

         // set controller events here
         // left trigger
         // false ^ false = false
         // true  ^ false = false
         // false ^ true  = true
         // true  ^ true  = false

         let LM = matrixL.length ? cg.mMultiply(matrixL, cg.mTranslate( .006,0,0)) : cg.mTranslate(cx-.2,cy,1);
         let RM = matrixR.length ? cg.mMultiply(matrixR, cg.mTranslate(-.001,0,0)) : cg.mTranslate(cx+1,cy,1);
         // ANIMATE THE TARGET
         

         let target = model.child(0);
         if (grabbed) {
            target.setMatrix(RM).scale(.1, .1, .1);
            const cpos = RM.slice(-4, -1);
            tx = cpos[0];
            ty = cpos[1];
            tz = cpos[2];
         } else {
            target.identity().move(tx, ty, tz).scale(.1, .1, .1);
            // .move(tx, ty, tz)
            // .move(cpos[0], cpos[1], cpos[2]-.2)
            // .turnY(1)// + Math.sin(model.time))
         }

         if (model.time % 10 == 0) {
            console.log(target.getMatrix());
         }

         // PLACE THE LASER BEAMS TO EMANATE FROM THE CONTROLLERS
         // IF NOT IN VR MODE, PLACE THE BEAMS IN DEFAULT POSITIONS


         model.child(1).setMatrix(LM);
         model.child(2).setMatrix(RM);

	 // CHECK TO SEE WHETHER EACH BEAM INTERSECTS WITH THE TARGET

         let hitL = cg.mHitRect(LM, target.getMatrix());
         let hitR = cg.mHitRect(RM, target.getMatrix());

	 // CHANGE TARGET COLOR DEPENDING ON WHICH BEAM(S) HIT IT AND WHAT TRIGGERS ARE PRESSED
    // When the beam intersects the block and I press the trigger down then the block is selected
   // block is deselected when I release the trigger
         // set selected
         // only one controller can select the target at a time
         if  (hitL && triggerL && !isSelectedRight) isSelectedLeft = true;
         else if (hitR && triggerR && !isSelectedLeft) isSelectedRight = true;

         // set deselected
         if (!triggerL) isSelectedLeft = false;
         if (!triggerR) isSelectedRight = false;

         if (isSelectedLeft) target.color(1,0,0);
         else if (isSelectedRight) target.color(0,1,0);
         else target.color(1,1,1);

         // sx 0 0 tx
         // 0 sy 0 ty
         // 0 0 sz tz
         // x y z 1

         if (isSelectedRight && triggerR) {
            // A->B = B-A
            // target to controller = controller - target
            const targetPos = getPos(target.getMatrix());
            const controllerPos = getPos(RM);
            moveDir = cg.normalize(vsub(controllerPos, targetPos));
         }
         if (btnA) {
            // target - controller to make it move backwards
            moveDir = cg.normalize(vsub(getPos(target.getMatrix()), getPos(RM)));
         }

         const distance = cg.scale(moveDir, speedMultiplier * model.deltaTime);
            tx += distance[0];
            ty += distance[1];
            tz += distance[2];

         if (trigger2R && sqCenterDist(RM, target.getMatrix()) < grabDistance * grabDistance) {
            resetMoveDir();
            grabbed = true;
         }
         if (!trigger2R) {
            grabbed = false;
         }

         if (btnB) resetMoveDir();

         // if trigger2 and target is in box in front of the controller then stop the target


         // need to be able to grab the object
         


         // target.color(hitL && hitR ? triggerL || triggerR ? [0,0,1] : [.5,.5,1] :
         //                      hitL ? triggerL             ? [1,0,0] : [1,.5,.5] :
         //                      hitR ? triggerR             ? [0,1,0] : [.5,1,.5] : [1,1,1]);
      });
   }
