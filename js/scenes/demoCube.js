export const init = async model => {
   let cube = model.add('cube').texture('media/textures/brick.png')
   model.move(0,1.5,0).scale(.3).animate(() => {
      cube.identity().turnZ(model.time).turnX(model.time/2);
   });
}
