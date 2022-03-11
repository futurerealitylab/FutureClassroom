/*
  If you are wearing your VR headset and are using handtracking,
  this demo shows how you can change the color of any of the
  fingers in the hand model.

  In particular, when your left hand moves to the right half
  of the scene, your left thumb turns green and the big cube
  over the table turns red.

  The ability to change finger color is useful for debugging
  recognition of hand gestures and poses.
*/

export const init = async model => {
   let hands = window.clay.handsWidget;
   let cube = model.add('cube');
   model.move(0,1.5,0).scale(.2).animate(() => {
      let m = hands.getMatrix('left', 0, 4);
      hands.setFingerColor('left', 0, m[12] < 0 ? [0,1,0] : null);
      cube.color(m[12] < 0 ? [1,0,0] : [1,1,1]);
   });
}

