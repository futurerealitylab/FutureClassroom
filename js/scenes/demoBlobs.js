let isAnimate = false, isRubber = false, isTable = true, t = 0;

export const init = async model => {
   model.control('a', 'animate', () => isAnimate = ! isAnimate);
   model.control('r', 'rubber' , () => isRubber  = ! isRubber );
   model.control('t', 'table'  , () => isTable   = ! isTable  );

   model.move(0,1.5,0).scale(.3).blend(true);
   model.add('sphere').color(1,0,0);
   model.add('sphere').bevel(true);
}

export const display = model => {
   model.animate(() => {
      model.setTable(isTable);

      model.melt(isAnimate && ! isRubber);
      t += isAnimate ? model.deltaTime : 0;
      let s = 1 + .3 * Math.sin(t);
      model.child(0).identity().move(-s,0,0);
      model.child(1).identity().move( s,0,0);
   });
}
