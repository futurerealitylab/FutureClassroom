let DemoCube = function() {

   this.init = (model) => {
      this.start = true;
      this.name = "earth";
      this.model = model;
      this.model.move(0,1.5,0).scale(0.2);
      this.earth = this.model.add('sphere').scale(100).color(1,1,1).texture('media/textures/earth.png');
   }

   this.display = () => {
      this.model.animate(() => {
         this.earth.identity().turnY(0.2 * this.model.time);
      });
   }
}

export let demoCube
 = new DemoCube();
