let DemoCube = function() {

   this.init = (clay) => {
      this.start = true;
      this.name = "cube";
      clay.model.move(0,1.5,0).scale(0.2);
      this.cube = clay.model.add('cube').color(1,1,1).texture('media/textures/brick.png');
   }

   this.display = () => {
      clay.model.blend().animate(() => {
         this.cube.identity().turnZ(0.5 * clay.model.time).turnX(0.5 * clay.model.time);
      });
   }
}

export let demoCube
 = new DemoCube();
