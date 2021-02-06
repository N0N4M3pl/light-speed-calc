# light-speed-calc

Project is divided into two parts:

- Document
- Web application

## Document

Before using application it is recommended to read this document:  

[Theoretical explanation of how to measure the speed of light in one way](/doc/theoretical-explanation-of-how-to-measure-the-speed-of-light-in-one-way.md)

## Web aplication

Working online application: [light-speed-calc](http://bfbxrcu.cluster028.hosting.ovh.net/light-speed-calc/)  

Web aplication is only simulation tool.  

It wass created to proove yourself that theoretical model is devised, checked in detail and probably feasible.

Result of calculation will never be correct because application is executed in web environmet.  
All timers depends on CPU time and they are "liquid" / not stable.
If more code will be added to stabilize calculation then more missed will be timers.

### CLI commands

```
npm install
npm run serve
npm run build
npm run lint
```
### Libs used in application

- [Vue.js](https://vuejs.org/)
- [Vuetify.js](https://vuetifyjs.com/)
- [Signal.js](https://github.com/JosephClay/signal-js)
- [Chart.js](https://www.chartjs.org/)

## Licence

[License](LICENSE.md) 
