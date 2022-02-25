/*
   This is a simple example of showing video from your camera.
   It won't work in your VR headset, only on your computer.

   When you enter Control mode by hitting the SPACE bar, and then
   hit CNTRL-h, the view of the video will toggle into a heads-up
   display (HUD).

   After you leave Control mode (by hitting the SPACE bar again)
   while in HUD mode, the video will follow you as you move your
   view around the scene.
*/
export const init = async model => {
    let isHUD = false;
    model.control('h', 'toggle HUD', () => isHUD = ! isHUD);
    let cube = model.add('cube').texture('camera');
    model.animate(() => {
       if (isHUD)
          cube.setMatrix(model.viewMatrix()).move(0,0,-1).turnY(Math.PI);
       else
          cube.identity().move(0,1.6,0);
       cube.scale(.7,.5,.01);
    });
 }
 
