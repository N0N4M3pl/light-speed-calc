<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-icon large color="grey darken-1">mdi-calculator-variant</v-icon>
      <div class="text-overline">
        light-speed-calc
      </div>
      <v-spacer></v-spacer>
      <v-switch
        v-model="modeIsAutomatic"
        inset
        dense
        hide-details
        :label="'Automatic mode is ' + (modeIsAutomatic ? 'ON' : 'OFF')"
        :disabled="isActive()"
      ></v-switch>
    </v-app-bar>

    <v-main>
      <v-container fluid class="grey lighten-5">
        <v-row>
          <v-col cols="6">
            <v-btn block @click="setupSimpleExample" color="grey lighten-1" :disabled="isActive()"
              >Setup simple example</v-btn
            >
          </v-col>
          <v-col cols="6">
            <v-btn block @click="setupRealExample" color="grey lighten-1" :disabled="isActive()"
              >Setup real example</v-btn
            >
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field
              prepend-inner-icon="mdi-speedometer"
              label="Simulated speed of light - searched value, expected result of calculation/measure"
              v-model="distance.speedOfLightInSeconds"
              :disabled="isActive()"
              suffix="m/s"
              outlined
              dense
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="4">
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
          <v-col cols="4">
            <v-card outlined elevation="4" color="light-green lighten-4">
              <v-card-title> <v-spacer />Distance <v-spacer /></v-card-title>
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
          <v-col cols="4">
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

        <v-row class="mb-4">
          <v-col cols="12">
            <v-btn block @click="controllerActiveInactive" color="grey lighten-1">{{
              !isActive() ? 'START CALCULATION' : 'STOP CALCULATION'
            }}</v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field
              prepend-inner-icon="mdi-speedometer"
              label="Measured speed of light - result of calculation/measure"
              v-model="gauge.speedOfLightInSeconds"
              readonly
              suffix="m/s"
              outlined
              dense
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <chart ref="chartEle" />
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
    lightOnTimeInSeconds: 0,
    lightOffTimeInSeconds: 0,
    emitterLightStatus: -1,
    emitterLightIndex: 0,
    distanceLightStatus: -1,
    distanceLightIndex: 0
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
          this.$refs.chartEle.updateData(
            this.controller.stateEvents,
            this.controller.emitterLightEvents,
            this.controller.distanceLengthEvents,
            this.controller.distanceLightDelayEvents,
            this.controller.gaugeLightEvents,
            this.controller.gaugeMeasuredLightTimeEvents,
            this.controller.gaugeMeasuredSpeedOfLightEvents
          );
          break;
        case State.ACTIVE:
          this.emitterLightIndex = 0;
          this.distanceLightIndex = 0;
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
      } else {
        this.distanceLightStatus = 0;
      }
    },
    controllerActiveInactive() {
      this.controller.state = this.controller.state == State.INACTIVE ? State.ACTIVE : State.INACTIVE;
    },
    setupSimpleExample() {
      this.lightOnTimeInSeconds = 0.1;
      this.lightOffTimeInSeconds = 0.1;
      this.emitter.lightOnAmount = 25;
      this.distance.speedOfLightInSeconds = 0.1;
      this.distance.lengthTarget = 1000;
      this.distance.lengthChangeSpeedInSeconds = 250;
      this.$forceUpdate();
    },
    setupRealExample() {
      this.lightOnTimeInSeconds = 1;
      this.lightOffTimeInSeconds = 1;
      this.emitter.lightOnAmount = 30;
      this.distance.speedOfLightInSeconds = 299792458;
      this.distance.lengthTarget = 2997924580;
      this.distance.lengthChangeSpeedInSeconds = 299792458;
      this.$forceUpdate();
    }
  }
};
</script>

<style lang="css"></style>
