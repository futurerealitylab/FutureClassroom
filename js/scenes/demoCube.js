let DemoCube = function() {

   this.init = (model) => {
      this.start = true;
      this.name = "cube";
      this.model = model;
      model.move(0,1.5,0);
      let c = model.add();
      model.scale(.1);
      this.cube = c.add('cube').color(1,1,1).texture('media/textures/brick.png');
   }

   this.display = model => {
      model.animate(() => {
         let c = model.child(0);
         c.scale(1 + model.deltaTime * Math.sin(model.time));
         this.cube.identity().turnZ(0.5 * model.time).turnX(0.5 * model.time);
      });
   }
}

export let demoCube = new DemoCube();
