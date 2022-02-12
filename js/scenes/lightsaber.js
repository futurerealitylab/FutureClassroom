import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState } from "../render/core/controllerInput.js";

let lx, ly, lz, rx, ry, rz, tx, ty, theta;
let isAnimate = false, isRubber = false, t = 0;

export const init = async (model) => {
    lx = 0, ly = 1.5, lz = 1, rx = 0, ry = 1.5, rz = 1, tx = 0, ty = 0, theta = 0;

    model.control('a', 'left controller left' , () => lx += .1);
    model.control('s', 'left controller down' , () => ly -= .1);
    model.control('d', 'left controller right', () => lx -= .1);
    model.control('w', 'left controller up'   , () => ly += .1);
    model.control('q', 'left controller forward', () => lz += .1);
    model.control('e', 'left controller backward', () => lz -= .1);

    model.control('j', 'right controller left' , () => rx += .1);
    model.control('k', 'right controller down' , () => ry -= .1);
    model.control('l', 'right controller right', () => rx -= .1);
    model.control('i', 'right controller up'   , () => ry += .1);
    model.control('u', 'right controller forward', () => rz += .1);
    model.control('o', 'right controller backward', () => rz -= .1);
    
    model.control('t', 'animate', () => isAnimate = ! isAnimate);

    model.control('f', 'rotate left'  , () => theta -= 1);
    model.control('g', 'rotate right' , () => theta += .1);

    let target = model.add();
    target.add('cube').move(0, 1, 1).scale(.1,.1,.1);

    let saberL = model.add();
    //saberL.add('cube').color(0,0,1).move(.02,0,0).scale(.02,.005,.005);
    //saberL.add('cube').color(0,1,0).move(0,.02,0).scale(.005,.02,.005);
    saberL.add('tubeZ').color(0.9,1,1).move(0, 0, -1.8).scale(.003,.003,0.2);

    let saberR = model.add();
    //saberR.add('cube').color(1,0,0).move(.02,0,0).scale(.02,.005,.005);
    //saberR.add('cube').color(0,0,1).move(0,.02,0).scale(.005,.02,.005);
    saberR.add('tubeZ').color(0.8,1,0.4).move(0, 0, -1.8).scale(.003,.003,0.2);

    
}
 
 export const display = (model) => {
    model.animate(() => {
        model.setTable(false);

        let target = model.child(0);
         target.identity();
            //.turnY(theta+Math.sin(model.time))
            //.turnZ(Math.sin(model.time))
            ;

        // GET THE CURRENT MATRIX AND TRIGGER INFO FOR BOTH CONTROLLERS

        let matrixL  = controllerMatrix.left;
        let triggerL = buttonState.left[0].pressed;

        let matrixR  = controllerMatrix.right;
        let triggerR = buttonState.right[0].pressed;
        
        // PLACE THE LASER BEAMS TO EMANATE FROM THE CONTROLLERS
        // IF NOT IN VR MODE, PLACE THE BEAMS IN DEFAULT POSITIONS

        let LM = matrixL.length ? cg.mMultiply(matrixL, cg.mTranslate( .006,0,0)) : cg.mTranslate(lx+.1,ly,lz);
        let RM = matrixR.length ? cg.mMultiply(matrixR, cg.mTranslate(-.001,0,0)) : cg.mTranslate(rx-.1,ry,rz);

        model.child(1).setMatrix(LM);
        model.child(2).setMatrix(RM);

        
    // CHECK TO SEE WHETHER EACH BEAM INTERSECTS WITH THE TARGET

        let hitL = cg.mHitRect(LM, target.getMatrix());
        let hitR = cg.mHitRect(RM, target.getMatrix());


    
     });
 }