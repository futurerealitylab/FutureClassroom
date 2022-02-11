export const init = async (model) => {
   model.move(0,1.5,0).scale(.3)
        .add('cube').color(1,1,1).texture('media/textures/brick.png');
}

export const display = (model) => {
   model.animate(() => {
      model.child(0).identity().turnZ(model.time).turnX(model.time/2);
   });
}