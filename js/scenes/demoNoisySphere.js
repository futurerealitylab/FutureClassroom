export const init = async model => {
   let screen = model.add('cube');
   model.animate(() => {
      let m = views[0]._viewMatrix;
      model.setMatrix([m[0],m[4],m[8],0,m[1],m[5],m[9],0,m[2],m[6],m[10],0,0,1.5,0,1]);
      model.customShader(`
         float r = sqrt(dot(vAPos.xy, vAPos.xy));
	 opacity = r < 1. ? 1. : 0.;
         float fl = -1. / uProj[3].z; // FOCAL LENGTH OF VIRTUAL CAMERA
	 vec4 p = vec4(vAPos.xy,sqrt(1.-r*r)-fl,0.) * uView;
	 float s = .1 + .9 * max(dot(vAPos,vec3(.5)),0.);
	 float n1 = 1., n2 = 1., f = .7;
	 for (int i = 0 ; i < 5 ; i++) {
	    n1 += noise(f * (p.xyz + 1.)) / f;
	    n2 += noise(f * (2.*p.xyz - (.06 + .002 * abs(n1-1.)) * uTime)) / f;
	    f *= 2.;
         }
	 color = s * (n1 < 1. ? vec3(.3,.7,1.) : vec3(.5,.3,.1) * pow(n1,3.));
	 color = s * mix(color, vec3(1.), max(0.,n2 - .8));
      `);
      screen.identity().scale(.2,.2,.001);
   });
}
