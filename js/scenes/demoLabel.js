export const init = async model => {
   let isAnimate = 0, isItalic = 0;
   model.control('a', 'animate', () => isAnimate = ! isAnimate);
   model.control('i', 'italic' , () => isItalic  = ! isItalic );

   model.move(0,1.5,0).scale(.1).color(1,.75,.25);

   let text = `Now is the time   \nfor all good men  \nto come to the aid\nof their party.   ` .split('\n');
   let label = model.add();

   for (let line = 0 ; line < text.length ; line++)
      label.add('label').move(0,-line,0).scale(.5);

   model.animate(() => {
      label.identity().turnY(isAnimate ? Math.sin(model.time) : 0);
      label.color([1,1,.5 + .5 * Math.sin(10 * model.time)]);
      for (let line = 0 ; line < text.length ; line++)
         label.child(line).info((isItalic ? '<i>' : '') + text[line]);
   });
}
