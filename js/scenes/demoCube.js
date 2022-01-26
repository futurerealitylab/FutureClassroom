let DemoCube = function() {

   this.init = (model) => {
      this.start = true;
      this.name = "cube";
      this.model = model;
      this.model.move(0,1.5,0).scale(0.2);
      this.cube = this.model.add('cube').color(1,1,1).texture('media/textures/brick.png');
   }

   this.display = () => {
      this.model.animate(() => {
         this.cube.identity().turnZ(0.5 * this.model.time).turnX(0.5 * this.model.time);
      });
   }
}

export let demoCube
 = new DemoCube();
