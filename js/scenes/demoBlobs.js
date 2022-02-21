export const init = async model => {
   let isAnimate = false, isRubber = false, isTable = true, t = 0;

   model.control('a', 'animate', () => isAnimate = ! isAnimate);
   model.control('r', 'rubber' , () => isRubber  = ! isRubber );
   model.control('t', 'table'  , () => isTable   = ! isTable  );

   model.move(0,1.5,0).scale(.3).blend(true);
   let shape1 = model.add('sphere').color(1,0,0);
   let shape2 = model.add('sphere').bevel(true);

   model.animate(() => {
      model.setTable(isTable);
      model.melt(isAnimate && ! isRubber);
      t += isAnimate ? model.deltaTime : 0;
      let s = 1 + .3 * Math.sin(t);
      shape1.identity().move(-s,0,0);
      shape2.identity().move( s,0,0);
   });
}
