/*
   This demo shows how you can put a texture map onto a cube
   and also rotate the cube over time.
*/
export const init = async model => {
   let cube = model.add('cube').texture('media/textures/brick.png')
   model.move(0,1.5,0).scale(.3).animate(() => {
      cube.identity().turnZ(3 * model.time).turnX(model.time/2);
   });
}
