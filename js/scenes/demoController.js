import { buttonState,controllerMatrix } from "../render/core/controllerInput.js";
let DemoController = function() {

   this.init = (model) => {
      this.start = true;
      this.name = "cube";
      this.model = model;
      this.model.move(0,1.5,0).scale(0.1);
      this.controller = this.model.add();
      this.controller.add('donut').color(1,1,1).move(0,-0.6,-1).scale(1,1,0.6);
      this.controller.add('tubeZ').color(1,1,1).scale(0.38,0.28,0.8); // 0,0.3,2
      this.trigger = this.controller.add('cube').scale(0.2).move(0,1.,-2.);
      this.squeeze = this.controller.add('cube').scale(0.1,0.1,0.2).move(-4,.5,-2);
   }

   this.display = () => {
      this.model.animate(() => {
         if(window.vr) {
            this.model.setMatrix(controllerMatrix['right']);
            this.controller.identity().scale(0.1);
            if(buttonState['right'][0]) this.trigger.color(1,0,0); else this.trigger.color(1,1,1);
            if(buttonState['right'][1]) this.squeeze.color(1,0,0); else this.squeeze.color(1,1,1);
         }
      });
   }
}

export let demoController
 = new DemoController();
