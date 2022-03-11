/*
   This demo is meant to be run on a computer (not a VR headset).
   It shows how you can mix computer graphics objects with a live
   video feed from your computer's built-in camera.

   After selecting DemoZoom, you should hit the ESC key to turn
   on the video from the camera. If you have a green screen, then
   you will see the virtual lab behind the video of you. If you
   don't have a green screen, then you should hit the '`' key
   and make sure there is a white wall behind you. The program
   will then run a "white screen" algorithm to show you in the
   foreground and the virtual lab in the background.

   In any case, to cycle through the demo, first hit the SPACE
   bar and then keep hitting CNTRL-a.
*/
export const init = async model => {
   let state = 0, a = 0, b = 0, c = 0;
   model.control('a', 'advance', () => state = (state + 1) % 7);
   let things = model.add();
   let ball = things.add('sphere').color(1,0,0);
   let text = things.add('label').color(0,0,1).flag('uTransparentTexture');
   let diagram = things.add('cube').texture('media/textures/truncated_icosahedron.jpg')
                                   .color(0,.5,0).flag('uTransparentTexture');
   model.animate(() => {
      model.hud();

      things.identity().scale(.2);

      ball.scale(0);
      text.scale(0);
      diagram.scale(0);

      let T = new Date();
      let pad = s => s > 9 ? s : '0' + s;
      text.info('The time is ' + T.getHours() + ':' + pad(T.getMinutes()) + ':' + pad(T.getSeconds()));

      if (state > 5) c += model.deltaTime;
      if (state > 4) diagram.identity().move(-.5,.3,-.2).turnZ(.3 * Math.sin(5 * c)).scale(.25,.25,.0001);
      if (state > 3) b += model.deltaTime;
      if (state > 2) text.identity().move(.4,.2 * Math.sin(2 * b) + .3,0).scale(.05);
      if (state > 1) a += model.deltaTime;
      if (state > 0) ball.identity().move(.2 * Math.sin(4 * a),-.3,0).scale(.2,.2,.15);
   });
}

