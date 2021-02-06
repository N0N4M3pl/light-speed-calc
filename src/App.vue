<template>
  <v-app>
    <v-app-bar app color="blue-grey darken-3">
      <v-icon large color="white">mdi-calculator-variant</v-icon>
      <span class="text-overline white--text ml-2">
        light-speed-calc
      </span>
      <v-spacer></v-spacer>
      <span class="text-caption white--text">
        By Mateusz Skafiriak
      </span>
      <v-btn icon href="https://www.linkedin.com/in/mateusz-skafiriak" target="_blank" class="ml-4"
        ><v-icon color="white">mdi-linkedin</v-icon></v-btn
      >
      <v-btn icon href="https://github.com/N0N4M3pl" target="_blank"><v-icon color="white">mdi-github</v-icon></v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="grey lighten-4">
        <v-row class="mb-4">
          <v-col cols="3"
            ><v-avatar color="blue-grey" size="34" class="mr-2 white--text"
              ><v-icon color="white">
                mdi-information-outline
              </v-icon></v-avatar
            ><span class="font-italic text-caption"><b>Info</b></span></v-col
          >
          <v-col cols="9">
            <p>
              Before using this calculator it is recommended to read this document:
              <a href="https://github.com/N0N4M3pl/light-speed-calc/blob/main/doc/theoretical-explanation-of-how-to-measure-the-speed-of-light-in-one-way.md" target="_blank">Theoretical explanation of how to measure the speed of light in one way</a>
            </p>
            <p>More tchnical information about this application can be found here: <a href="https://github.com/N0N4M3pl/light-speed-calc#readme" target="_blank">Readme</a></p>
          </v-col>
        </v-row>

        <v-row class="mb-4 grey lighten-2">
          <v-col cols="3"
            ><v-avatar color="blue-grey" size="34" class="mr-2 white--text">1</v-avatar
            ><span class="font-italic text-caption"
              ><b>Choose preset</b><br />Use already configured settings or configure it your way</span
            ></v-col
          >
          <v-col cols="9" class="d-flex flex-row">
            <v-btn @click="setupSimpleExample" color="blue-grey lighten-4" :disabled="isActive()" class="mr-4"
              >Preset: simple example</v-btn
            ><v-btn @click="setupRealExample" color="blue-grey lighten-4" :disabled="isActive()" class="mr-4"
              >Preset: real example</v-btn
            >
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="3"
            ><v-avatar color="blue-grey" size="34" class="mr-2 white--text">2</v-avatar
            ><span class="font-italic text-caption"
              ><b>Set <span class="text-decoration-underline">simulated</span> speed of light</b><br />This is searched
              value, expected result of calculation/measure<br />Must be set because
              <span class="light-green--text text--darken-2">Distance</span> element used this value for simulating
              delay time that light need to travel specified distance
            </span></v-col
          >
          <v-col cols="9">
            <v-text-field
              prepend-inner-icon="mdi-speedometer"
              label="Simulated speed of light"
              v-model="distance.speedOfLightInSeconds"
              :disabled="isActive()"
              suffix="m/s"
              solo
              hide-details
              color="blue-grey"
              background-color="blue-grey lighten-2"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="mb-4 grey lighten-2">
          <v-col cols="3"
            ><v-avatar color="blue-grey" size="34" class="mr-2 white--text">3</v-avatar
            ><span class="font-italic text-caption"
              ><b>Choose mode of setup</b><br />Automatic mode - will auto recognize end of calculation (but its based
              on code solution)<br />Manual mode - will stop calculation after emitting specified amout of light
              ON</span
            ></v-col
          >
          <v-col cols="9">
            <v-switch
              v-model="modeIsAutomatic"
              inset
              dense
              hide-details
              :label="'Automatic mode is ' + (modeIsAutomatic ? 'ON' : 'OFF')"
              :disabled="isActive()"
            ></v-switch>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="3"
            ><v-avatar color="blue-grey" size="34" class="mr-2 white--text">4</v-avatar
            ><span class="font-italic text-caption"><b>Setup simulation elements</b></span></v-col
          >
          <v-col cols="3">
            <v-card outlined elevation="4" color="orange lighten-2">
              <v-card-title
                >Emitter
                <v-spacer />
                <v-badge v-if="emitterLightStatus === 1" :content="emitterLightIndex" left color="orange lighten-2">
                  <v-icon>mdi-lightbulb-outline</v-icon>
                </v-badge>
                <v-badge
                  v-else-if="emitterLightStatus === 0"
                  :content="emitterLightIndex"
                  left
                  color="orange lighten-2"
                >
                  <v-icon>mdi-lightbulb</v-icon>
                </v-badge>
                <v-icon v-else>mdi-minus</v-icon>
              </v-card-title>
              <v-card-text>
                <v-text-field
                  prepend-icon="mdi-lightbulb-outline"
                  label="Light time ON"
                  hint="How much time light is ON"
                  v-model="lightOnTimeInSeconds"
                  :disabled="isActive()"
                  suffix="s"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-lightbulb"
                  label="Light time OFF"
                  hint="How much time light is OFF"
                  v-model="lightOffTimeInSeconds"
                  :disabled="isActive()"
                  suffix="s"
                ></v-text-field>
                <v-text-field
                  v-if="!controller.modeIsAutomatic"
                  prepend-icon="mdi-lightbulb"
                  label="Amount of lights ON"
                  hint="How many times light ON will be emitted"
                  v-model="emitter.lightOnAmount"
                  :disabled="isActive()"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3">
            <v-card outlined elevation="4" color="light-green lighten-4">
              <v-card-title><v-spacer />Distance<v-spacer /></v-card-title>
              <v-card-text>
                <v-text-field
                  prepend-icon="mdi-map-marker-distance"
                  label="Target distance length:"
                  hint="Target distance from emitter to gauge"
                  v-model="distance.lengthTarget"
                  :disabled="isActive()"
                  suffix="m"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-map-marker-multiple"
                  label="Length change speed"
                  hint="How fast distance from emitter to gauge is changing"
                  v-model="distance.lengthChangeSpeedInSeconds"
                  :disabled="isActive()"
                  suffix="m/s"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-map-marker"
                  label="Current distance length:"
                  hint="Current distance from emitter to gauge"
                  v-model="distance.lengthCurrent"
                  suffix="m"
                  readonly
                  :disabled="!isActive()"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3">
            <v-card outlined elevation="4" color="cyan lighten-2">
              <v-card-title>
                <v-badge v-if="distanceLightStatus === 1" :content="distanceLightIndex" color="cyan lighten-2">
                  <v-icon>mdi-lightbulb-outline</v-icon>
                </v-badge>
                <v-badge v-else-if="distanceLightStatus === 0" :content="distanceLightIndex" color="cyan lighten-2">
                  <v-icon>mdi-lightbulb</v-icon>
                </v-badge>
                <v-icon v-else>mdi-minus</v-icon>
                <v-spacer />Gauge</v-card-title
              >
              <v-card-text>
                <v-text-field
                  prepend-icon="mdi-lightbulb-outline"
                  :label="modeIsAutomatic ? 'Measured light time ON' : 'Light time ON'"
                  v-model="gauge.lightOnTimeInSeconds"
                  suffix="s"
                  readonly
                  hide-details
                  :disabled="!isActive()"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-lightbulb"
                  :label="modeIsAutomatic ? 'Measured light time OFF' : 'Light time OFF'"
                  v-model="gauge.lightOffTimeInSeconds"
                  suffix="s"
                  readonly
                  hide-details
                  :disabled="!isActive()"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-4 grey lighten-2">
          <v-col cols="3"
            ><v-avatar color="blue-grey" size="34" class="mr-2 white--text">5</v-avatar
            ><span class="font-italic text-caption"><b>Execute calculation</b></span></v-col
          >
          <v-col cols="9">
            <v-btn large @click="controllerActiveInactive" color="blue-grey lighten-2">{{
              !isActive() ? 'START CALCULATION' : 'STOP CALCULATION'
            }}</v-btn>
            <v-progress-linear
              v-show="isActive()"
              class="mt-2"
              color="blue-grey"
              height="8"
              :value="progressValue"
              striped
              rounded
            ></v-progress-linear>
            <v-alert
              v-show="!modeIsAutomatic && isActive() && progressValue == 100"
              dense
              outlined
              text
              type="warning"
              color="red"
              border="left"
              class="mt-2 mb-0"
              >Automatic mode is OFF - Stop calculation manually now</v-alert
            >
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="3"
            ><v-avatar color="blue-grey" size="34" class="mr-2 white--text">6</v-avatar
            ><span class="font-italic text-caption"
              ><b>Measured speed of light</b><br />Result of calculation/measure</span
            ></v-col
          >
          <v-col cols="9">
            <v-text-field
              prepend-inner-icon="mdi-speedometer"
              label="Measured speed of light"
              v-model="gauge.speedOfLightInSeconds"
              readonly
              suffix="m/s"
              solo
              dense
              hide-details
              color="blue-grey"
              background-color="blue-grey lighten-2"
            ></v-text-field>
            <v-alert
              v-show="!isActive() && speedOfLightResultDiff != 0"
              dense
              outlined
              text
              type="warning"
              color="red"
              border="left"
              class="mt-2 mb-0"
              >{{ speedOfLightResultDiff }} m/s - Differenece between the simulated value and result of
              calculation</v-alert
            >
          </v-col>
        </v-row>

        <v-row class="grey lighten-2">
          <v-col cols="12"
            ><v-avatar color="blue-grey" size="34" class="mr-2 grey--text"
              ><v-icon color="white" small>
                mdi-chart-line
              </v-icon></v-avatar
            ><span class="font-italic text-caption"><b>Charts for analysis</b></span>
            <chart ref="chartEle" />
          </v-col>
        </v-row>

        <v-row class="grey lighten-2 mb-4">
          <v-col cols="3">
            <v-avatar color="blue-grey" size="34" class="mr-2 grey--text">
              <v-icon color="white" small>
                mdi-filter
              </v-icon></v-avatar
            ><span class="font-italic text-caption"><b>Filters for chart data</b></span>
          </v-col>
          <v-col cols="9" class="font-italic text-caption">
            <v-btn-toggle v-model="chartFilter" mandatory group dense color="blue-grey darken-4">
              <v-btn @click="chartShowAllData" small>
                Show all
              </v-btn>
              <v-btn @click="chartShowOnlyLightOnOffData" small>
                Light ON/OFF
              </v-btn>
              <v-btn @click="chartShowOnlyDistanceLengthData" small>
                Distance length
              </v-btn>
              <v-btn @click="chartShowOnlyLightDelayData" small>
                Light delay
              </v-btn>
              <v-btn @click="chartShowOnlySpeedOfLightData" small>
                Speed of light
              </v-btn> </v-btn-toggle
            ><br />

            <v-alert v-if="chartFilter == 0" dense outlined text type="info" color="blue-grey" border="left"
              >Show all data on chart</v-alert
            >
            <v-alert v-else-if="chartFilter == 1" dense outlined text type="info" color="blue-grey" border="left"
              >This view shows flashes of light. During and after separation state - both lines should not
              overlap.</v-alert
            >
            <v-alert v-else-if="chartFilter == 2" dense outlined text type="info" color="blue-grey" border="left"
              >This view shows distance which is increasing during separation state.</v-alert
            >
            <v-alert v-else-if="chartFilter == 3" dense outlined text type="info" color="blue-grey" border="left"
              >This view shows light delays. Distance object is simulating time which light need to travel specific
              distance. Gauge object measure this delays.</v-alert
            >
            <v-alert v-else-if="chartFilter == 4" dense outlined text type="info" color="blue-grey" border="left"
              >This view shows calculated speed of light with data from which speed of light is calculated: distance and
              delay time (<code>distance / delay = speed</code>).</v-alert
            >
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="12" class="text-center">
            <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
              ><img
                alt="Creative Commons License"
                style="border-width:0"
                src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png"/></a
            ><br />This work is licensed under a
            <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
              >Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a
            >.
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { State } from './lib/State';
import Controller from './lib/Controller';
import Emitter from './lib/Emitter';
import Distance from './lib/Distance';
import Gauge from './lib/Gauge';
import Chart from './components/Chart';

export default {
  name: 'App',
  components: { Chart },
  data: () => ({
    controller: new Controller(),
    emitter: new Emitter(),
    distance: new Distance(),
    gauge: new Gauge(),
    modeIsAutomatic: true,
    progressValue: 0,
    lightOnTimeInSeconds: 0,
    lightOffTimeInSeconds: 0,
    emitterLightStatus: -1,
    emitterLightIndex: 0,
    distanceLightStatus: -1,
    distanceLightIndex: 0,
    speedOfLightResultDiff: 0,
    chartFilter: null
  }),
  watch: {
    modeIsAutomatic: function(newValue) {
      if (this.controller.modeIsAutomatic != newValue) {
        this.controller.modeIsAutomatic = newValue;
        if (this.modeIsAutomatic.modeIsAutomatic) {
          this.gauge.lightOnTimeInSeconds = 0;
          this.gauge.lightOffTimeInSeconds = 0;
        } else {
          this.gauge.lightOnTimeInSeconds = this.emitter.lightOnTimeInSeconds;
          this.gauge.lightOffTimeInSeconds = this.emitter.lightOffTimeInSeconds;
        }
      }
    },
    lightOnTimeInSeconds: function(newValue) {
      this.emitter.lightOnTimeInSeconds = newValue;
      if (!this.modeIsAutomatic.modeIsAutomatic) {
        this.gauge.lightOnTimeInSeconds = newValue;
      }
    },
    lightOffTimeInSeconds: function(newValue) {
      this.emitter.lightOffTimeInSeconds = newValue;
      if (!this.modeIsAutomatic.modeIsAutomatic) {
        this.gauge.lightOffTimeInSeconds = newValue;
      }
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.init();
    });
  },
  methods: {
    init() {
      this.setupSimpleExample();
      this.modeIsAutomatic = this.controller.modeIsAutomatic;
      this.lightOnTimeInSeconds = this.emitter.lightOnTimeInSeconds;
      this.lightOffTimeInSeconds = this.emitter.lightOffTimeInSeconds;
      this.controller.connectElements(this.emitter, this.distance, this.gauge);
      this.controller.connect(Controller.EVENT_STATE, this.controllerStateListener);
      this.emitter.connect(Emitter.EVENT_LIGHT, this.emitterLightListener);
      this.distance.connect(Distance.EVENT_LIGHT, this.distanceLightListener);
    },
    isActive() {
      return this.controller.state != State.INACTIVE;
    },
    controllerStateListener(state) {
      switch (state) {
        case State.INACTIVE:
          this.emitterLightStatus = -1;
          this.distanceLightStatus = -1;
          break;
        case State.ACTIVE_START:
          this.progressValue = 0;
          this.emitterLightIndex = 0;
          this.distanceLightIndex = 0;
          this.speedOfLightResultDiff = 0;
          break;
        case State.ACTIVE_SYNCHRONIZE:
          if (this.modeIsAutomatic) {
            this.progressValue = 20;
          }
          break;
        case State.ACTIVE_SEPARATION:
          if (this.modeIsAutomatic) {
            this.progressValue = 40;
          }
          break;
        case State.ACTIVE_COLLECTING:
          if (this.modeIsAutomatic) {
            this.progressValue = 60;
          }
          break;
        case State.ACTIVE_MEASURE:
          if (this.modeIsAutomatic) {
            this.progressValue = 80;
          }
          break;
        case State.ACTIVE_STOP:
          this.progressValue = 100;
          this.speedOfLightResultDiff = (
            this.gauge.speedOfLightInSeconds - this.distance.speedOfLightInSeconds
          ).toFixed(0);
          this.$refs.chartEle.updateData(
            this.controller.stateEvents,
            this.controller.emitterLightEvents,
            this.controller.distanceLengthEvents,
            this.controller.distanceLightDelayEvents,
            this.controller.gaugeLightEvents,
            this.controller.gaugeMeasuredLightDelayEvents,
            this.controller.gaugeMeasuredSpeedOfLightEvents
          );
          break;
      }
    },
    emitterLightListener(lightIsOn) {
      if (lightIsOn) {
        this.emitterLightStatus = 1;
        this.emitterLightIndex++;
      } else {
        this.emitterLightStatus = 0;
      }
    },
    distanceLightListener(lightIsOn) {
      if (lightIsOn) {
        this.distanceLightStatus = 1;
        this.distanceLightIndex++;
        if (!this.modeIsAutomatic) {
          this.progressValue = (this.distanceLightIndex / this.emitter.lightOnAmount) * 100;
        }
      } else {
        this.distanceLightStatus = 0;
      }
    },
    controllerActiveInactive() {
      this.controller.state = this.controller.state == State.INACTIVE ? State.ACTIVE_START : State.ACTIVE_STOP;
    },
    setupSimpleExample() {
      this.emitter.lightOnTimeInSeconds = 0.1;
      this.emitter.lightOffTimeInSeconds = 0.1;
      this.emitter.lightOnAmount = 25;
      this.distance.speedOfLightInSeconds = 0.1;
      this.distance.lengthTarget = 1000;
      this.distance.lengthChangeSpeedInSeconds = 250;
      this.gauge.lightOnTimeInSeconds = this.emitter.lightOnTimeInSeconds;
      this.gauge.lightOffTimeInSeconds = this.emitter.lightOffTimeInSeconds;
      this.lightOnTimeInSeconds = this.emitter.lightOnTimeInSeconds;
      this.lightOffTimeInSeconds = this.emitter.lightOffTimeInSeconds;
      this.$forceUpdate();
    },
    setupRealExample() {
      this.emitter.lightOnTimeInSeconds = 1;
      this.emitter.lightOffTimeInSeconds = 1;
      this.emitter.lightOnAmount = 30;
      this.distance.speedOfLightInSeconds = 299792458;
      this.distance.lengthTarget = 2997924580;
      this.distance.lengthChangeSpeedInSeconds = 299792458;
      this.gauge.lightOnTimeInSeconds = this.emitter.lightOnTimeInSeconds;
      this.gauge.lightOffTimeInSeconds = this.emitter.lightOffTimeInSeconds;
      this.lightOnTimeInSeconds = this.emitter.lightOnTimeInSeconds;
      this.lightOffTimeInSeconds = this.emitter.lightOffTimeInSeconds;
      this.$forceUpdate();
    },
    chartShowAllData() {
      this.$refs.chartEle.lightOnOffDataIsHidden(false);
      this.$refs.chartEle.distanceLengthDataIsHidden(false);
      this.$refs.chartEle.lightDelayDataIsHidden(false, false);
      this.$refs.chartEle.speedOfLightDataIsHidden(false);
      this.$refs.chartEle.resetZoom();
    },
    chartShowOnlyLightOnOffData() {
      this.$refs.chartEle.lightOnOffDataIsHidden(false);
      this.$refs.chartEle.distanceLengthDataIsHidden(true);
      this.$refs.chartEle.lightDelayDataIsHidden(true, true);
      this.$refs.chartEle.speedOfLightDataIsHidden(true);
    },
    chartShowOnlyDistanceLengthData() {
      this.$refs.chartEle.lightOnOffDataIsHidden(true);
      this.$refs.chartEle.distanceLengthDataIsHidden(false);
      this.$refs.chartEle.lightDelayDataIsHidden(true, true);
      this.$refs.chartEle.speedOfLightDataIsHidden(true);
    },
    chartShowOnlyLightDelayData() {
      this.$refs.chartEle.lightOnOffDataIsHidden(true);
      this.$refs.chartEle.distanceLengthDataIsHidden(true);
      this.$refs.chartEle.lightDelayDataIsHidden(false, false);
      this.$refs.chartEle.speedOfLightDataIsHidden(true);
    },
    chartShowOnlySpeedOfLightData() {
      this.$refs.chartEle.lightOnOffDataIsHidden(true);
      this.$refs.chartEle.distanceLengthDataIsHidden(false);
      this.$refs.chartEle.lightDelayDataIsHidden(true, false);
      this.$refs.chartEle.speedOfLightDataIsHidden(false);
    }
  }
};
</script>

<style lang="css"></style>
