<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center text-overline">
        light-speed-calc
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="grey lighten-5">
        <v-row>
          <v-col cols="12">
            <v-text-field
              prepend-inner-icon="mdi-speedometer"
              label="Speed of light - Searched value, expected result of calculation/measure"
              v-model="distance.speedOfLightInSeconds"
              suffix="m/s"
              filled
              shaped
              dense
              hide-details
              background-color="grey lighten-1"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="4">
            <v-card outlined elevation="4" color="orange">
              <v-card-title
                >Emitter
                <v-spacer />
                <v-badge v-if="emitterLightStatus === 1" :content="emitterLightIndex" left color="orange">
                  <v-icon>mdi-lightbulb-outline</v-icon>
                </v-badge>
                <v-badge v-else-if="emitterLightStatus === 0" :content="emitterLightIndex" left color="orange">
                  <v-icon>mdi-lightbulb</v-icon>
                </v-badge>
                <v-icon v-else>mdi-minus</v-icon>
              </v-card-title>
              <v-card-text>
                <v-text-field
                  prepend-icon="mdi-lightbulb-outline"
                  label="Light time ON"
                  hint="How much time light is ON"
                  v-model="emitter.lightTimeOnInSeconds"
                  suffix="s"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-lightbulb"
                  label="Light time OFF"
                  hint="How much time light is OFF"
                  v-model="emitter.lightTimeOffInSeconds"
                  suffix="s"
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
                  suffix="m"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-map-marker-multiple"
                  label="Length change speed"
                  hint="How fast distance from emitter to gauge is changing"
                  v-model="distance.lengthChangeSpeedInSeconds"
                  suffix="m/s"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-map-marker"
                  label="Current distance length:"
                  hint="Current distance from emitter to gauge"
                  v-model="distance.lengthCurrent"
                  suffix="m"
                  readonly
                  disabled
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card outlined elevation="4" color="cyan">
              <v-card-title>
                <v-badge v-if="distanceLightStatus === 1" :content="distanceLightIndex" color="cyan">
                  <v-icon>mdi-lightbulb-outline</v-icon>
                </v-badge>
                <v-badge v-else-if="distanceLightStatus === 0" :content="distanceLightIndex" color="cyan">
                  <v-icon>mdi-lightbulb</v-icon>
                </v-badge>
                <v-icon v-else>mdi-minus</v-icon>
                <v-spacer />Gauge</v-card-title
              >
              <v-card-text>
                <v-text-field
                  prepend-icon="mdi-lightbulb-outline"
                  label="Measured light time ON"
                  hint="Measured how much time light is ON by emitter"
                  v-model="gauge.lightTimeOnInSeconds"
                  suffix="s"
                  readonly
                  disabled
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-lightbulb"
                  label="Measured light time OFF"
                  hint="Measured how much time light is OFF by emitter"
                  v-model="gauge.lightTimeOffInSeconds"
                  suffix="s"
                  readonly
                  disabled
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="12">
            <v-btn block @click="controllerActiveInactive" color="grey lighten-1">{{
              controller.state == 'INACTIVE' ? 'START CALCULATION' : 'STOP CALCULATION'
            }}</v-btn>
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
import Controller from './lib/Controller';
import Emitter from './lib/Emitter';
import Distance from './lib/Distance';
import Gauge from './lib/Gauge';
import { State } from './lib/State';
import Chart from './components/Chart';

export default {
  name: 'App',
  components: { Chart },
  data: () => ({
    controller: new Controller(),
    emitter: new Emitter(),
    distance: new Distance(),
    gauge: new Gauge(),
    emitterLightStatus: -1,
    emitterLightIndex: 0,
    distanceLightStatus: -1,
    distanceLightIndex: 0
    // lengthRatio: 0
  }),
  mounted: function() {
    this.$nextTick(function() {
      this.init();
    });
  },
  methods: {
    init() {
      //#region debuging
      this.emitter.lightTimeOnInSeconds = 0.1;
      this.emitter.lightTimeOffInSeconds = 0.1;
      this.distance.speedOfLightInSeconds = 0.1;
      this.distance.lengthTarget = 1000;
      this.distance.lengthChangeSpeedInSeconds = 250;
      this.$forceUpdate();
      //#endregion

      this.controller.connectElements(this.emitter, this.distance, this.gauge);
      this.controller.connect(Controller.EVENT_STATE, this.controllerStateListener);
      this.emitter.connect(Emitter.EVENT_LIGHT, this.emitterLightListener);
      this.distance.connect(Distance.EVENT_LIGHT, this.distanceLightListener);
      // this.distance.connect(Distance.EVENT_LENGTH, this.distanceLengthListener);
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
            this.controller.gaugeMeasuredLightDelayEvents,
          );
          break;
        case State.ACTIVE_SYNCHRONIZE:
          this.emitterLightIndex = 0;
          this.distanceLightIndex = 0;
          // this.lengthRatio = 0;
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
    // distanceLengthListener(lengthCurrent, lengthTarget, lengthRatio) {
    //   this.lengthRatio = lengthRatio;
    // },
    controllerActiveInactive() {
      this.controller.state = this.controller.state == State.INACTIVE ? State.ACTIVE_SYNCHRONIZE : State.INACTIVE;
    }
  }
};
</script>

<style lang="css">
.distanceAvatar {
  margin-left: -60px;
  margin-right: -60px;
  padding-left: 60px;
  padding-right: 60px;
}
</style>
