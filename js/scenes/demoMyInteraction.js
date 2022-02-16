import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState, viewMatrix } from "../render/core/controllerInput.js";

let ishold = false;
let thetaY = 0;
let thetaX = 0;
let translateX = 0;
let translateY = 0;
let translateZ = 0;
let defaultcolor = [1, 1, 1];
let yellow = [0.7, 1, 0.1];
let blue = [0.1, 0.3, 1];
let grey = [0.5, 0.5, 0.3];
let red = [1, 0.1, 0.1];
let orange = [0.8, 0.3, 0.1];
let objcolor = red;
let scale = [0.3, 0.1, 0.1];

export const init = async (model) => {

    //test sphere
    let obj = model.add();
    let sphere = obj.add().move(0, 1.2, 0);
    sphere.add('cube').scale(0.3, 0.1, 0.1);

    // CREATE THE LASER BEAMS FOR THE LEFT AND RIGHT CONTROLLERS

    let beamL = model.add();
    beamL.add('cube').color(0, 0, 1).move(.02, 0, 0).scale(.02, .005, .005);
    beamL.add('cube').color(0, 1, 0).move(0, .02, 0).scale(.005, .02, .005);
    beamL.add('tubeZ').color(1, 0, 0).move(0, 0, -10).scale(.001, .001, 10);

    let beamR = model.add();
    beamR.add('cube').color(1, 0, 0).move(.02, 0, 0).scale(.02, .005, .005);
    beamR.add('cube').color(0, 0, 1).move(0, .02, 0).scale(.005, .02, .005);
    beamR.add('tubeZ').color(0, 1, 0).move(0, 0, -10).scale(.001, .001, 10);

    //set color board

    let yellowbox = model.add('cube').color(0.7, 1, 0.1).move(-1, 2, -2).scale(0.3, 0.3, 0.01);
    let bluebox = model.add('cube').color(0.1, 0.3, 1).move(0, 2, -2).scale(0.3, 0.3, 0.01);
    let greybox = model.add('cube').color(0.5, 0.5, 0.3).move(1, 2, -2).scale(0.3, 0.3, 0.01);
    let redbox = model.add('cube').color(1, 0.1, 0.1).move(2, 2, -2).scale(0.3, 0.3, 0.01);
    let orangebox = model.add('cube').color(0.8, 0.3, 0.1).move(-2, 2, -2).scale(0.3, 0.3, 0.01);

}




export const display = model => {
    model.animate(() => {

        // GET DATA FROM MY LEFT CONTROLLER

        let leftMatrix = controllerMatrix.left;
        let leftTrigger = buttonState.left[0].pressed;
        let leftSqueeze = buttonState.left[1].pressed;
        let leftJoyTouch = buttonState.left[3].touched;
        let leftJoyPress = buttonState.left[3].pressed;
        let X = buttonState.left[4].pressed;
        let Y = buttonState.left[5].pressed;
        let leftJoyX = joyStickState.left.x;
        let leftJoyY = joyStickState.left.y;

        // GET DATA FROM MY RIGHT CONTROLLER

        let rightMatrix = controllerMatrix.right;
        let rightTrigger = buttonState.right[0].pressed;
        let rightSqueeze = buttonState.right[1].pressed;
        let rightJoyTouch = buttonState.right[3].touched;
        let rightJoyPress = buttonState.right[3].pressed;
        let A = buttonState.right[4].pressed;
        let B = buttonState.right[5].pressed;
        let rightJoyX = joyStickState.right.x;
        let rightJoyY = joyStickState.right.y;

        let obj = model.child(0);
        let sphere = obj.child(0);
        let yellowbox = model.child(3);
        let bluebox = model.child(4);
        let greybox = model.child(5);
        let redbox = model.child(6);
        let orangebox = model.child(7);

        let LM = leftMatrix.length ? cg.mMultiply(leftMatrix, cg.mTranslate(.006, 0, 0)) : cg.mTranslate(-0.2, 1.5, 1);
        let RM = rightMatrix.length ? cg.mMultiply(rightMatrix, cg.mTranslate(-.001, 0, 0)) : cg.mTranslate(0.2, 1.5, 1);

        model.child(1).setMatrix(LM);
        model.child(2).setMatrix(RM);

        // CHECK TO SEE WHETHER EACH BEAM INTERSECTS WITH THE sphere

        let hitL = cg.mHitRect(LM, sphere.getMatrix());
        let hitR = cg.mHitRect(RM, sphere.getMatrix());
        let yellowhit = cg.mHitRect(RM, yellowbox.getMatrix());
        let bluehit = cg.mHitRect(RM, bluebox.getMatrix());
        let greyhit = cg.mHitRect(RM, greybox.getMatrix());
        let redhit = cg.mHitRect(RM, redbox.getMatrix());
        let orangehit = cg.mHitRect(RM, orangebox.getMatrix());

        if (!ishold && (hitL || hitR) && (leftTrigger || rightTrigger)) {
            ishold = !ishold;
        }
        else if (ishold && (leftTrigger || rightTrigger)) {
            ishold = !ishold;
        }

        if (ishold) {
            objcolor = defaultcolor;
            if (A) {
                thetaY += 0.5 * model.deltaTime;
            }
            if (B) {
                thetaY -= 0.5 * model.deltaTime;
            }
            if (X) {
                thetaX += 0.5 * model.deltaTime;
            }
            if (Y) {
                thetaX -= 0.5 * model.deltaTime;
            }
            translateX += rightJoyX * 0.002;
            translateY += leftJoyY * 0.002;
            translateZ += rightJoyY * 0.002;
        }
        else {
            if (yellowhit && rightTrigger) {
                objcolor = yellow;
            }
            else if (bluehit && rightTrigger) {
                objcolor = blue;
            }
            else if (greyhit && rightTrigger) {
                objcolor = grey;
            }
            else if (redhit && rightTrigger) {
                objcolor = red;
            }
            else if (orangehit && rightTrigger) {
                objcolor = orange;
            }
        }

        sphere.identity().move(0 + translateX, 1.2 + translateY, 0 + translateZ).turnY(thetaY).turnX(thetaX);
        sphere.color(objcolor);





        // sphere.color(hitL && hitR ? leftTrigger || rightTrigger ? [0, 0, 1] : [.5, .5, 1] :
        //     hitL ? leftTrigger ? [1, 0, 0] : [1, .5, .5] :
        //         hitR ? rightTrigger ? [0, 1, 0] : [.5, 1, .5] : [1, 1, 1]);


    });
}