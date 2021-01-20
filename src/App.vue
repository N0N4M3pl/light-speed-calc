<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center text-overline">
        light-speed-calc
      </div>
    </v-app-bar>

    <v-main>
      <v-container class="grey lighten-5">
        <v-row class="mt-6 mb-4" no-gutters>
          <v-col cols="12">
            <v-avatar color="orange" size="60" tile style="z-index: 1;">E</v-avatar>
            <v-avatar
              color="light-green lighten-4"
              tile
              size="40"
              class="distanceAvatar"
              :style="'width: ' + (eventDistanceLengthPercent * 100) + '%;'"
              v-if="isSynchronized"
              >D</v-avatar
            >
            <v-avatar color="cyan" size="60" tile>G</v-avatar>
          </v-col>
        </v-row>
        <v-row class="mt-6 mb-4">
          <v-col cols="3">
            <v-card outlined elevation="4" color="orange">
              <v-card-title>Emitter</v-card-title>
              <v-card-text>
                Light time ON: {{ this.emitter.lightTimeOn }}<br />
                Light time OFF: {{ this.emitter.lightTimeOff }}
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="1" align-self="center" class="text-center">
            <v-badge v-if="eventEmitterStatus === 1" :content="eventEmitterIndex" bordered left>
              <v-icon large>mdi-motion-outline</v-icon>
            </v-badge>
            <v-badge v-else-if="eventEmitterStatus === 0" :content="eventEmitterIndex" bordered left>
              <v-icon large>mdi-motion</v-icon>
            </v-badge>
            <v-icon v-else large>mdi-minus</v-icon>
          </v-col>
          <v-col cols="4">
            <v-card outlined color="light-green lighten-4">
              <v-card-title>Distance</v-card-title>
              <v-card-text>
                Current length: {{ this.distance.lengthCurrent }}<br />
                Target length: {{ this.distance.lengthTarget }}
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="1" align-self="center" class="text-center">
            <v-badge v-if="eventDistanceStatus === 1" :content="eventDistanceIndex" bordered left>
              <v-icon large>mdi-motion-outline</v-icon>
            </v-badge>
            <v-badge v-else-if="eventDistanceStatus === 0" :content="eventDistanceIndex" bordered left>
              <v-icon large>mdi-motion</v-icon>
            </v-badge>
            <v-icon v-else large>mdi-minus</v-icon>
          </v-col>
          <v-col cols="3">
            <v-card outlined elevation="4" color="cyan">
              <v-card-title>Gauge</v-card-title>
              <v-card-text>
                Light time ON: {{ this.gauge.lightTimeOn.toFixed(2) }}<br />
                Light time OFF: {{ this.gauge.lightTimeOff.toFixed(2) }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="mt-8 mb-4">
          <v-col cols="6"> <span class="text--secondary">Information</span></v-col>
          <v-col cols="6">
            <v-text-field label="Speed of light" suffix="m/s" v-model="inputSpeedOfLight"></v-text-field>
          </v-col>
        </v-row>
        <v-row class="mb-4" v-show="isConnected">
          <v-col cols="6"> <span class="text--secondary">2</span></v-col>
          <v-col cols="6">
            <v-text-field label="Light time ON" suffix="ms" v-model="inputLightTimeOn"></v-text-field>
            <v-text-field label="Light time OFF" suffix="ms" v-model="inputLightTimeOff"></v-text-field>
            <v-btn block @click="synchronizeStartStop">Synchronize {{ isSynchronizing ? 'STOP' : 'START' }}</v-btn>
          </v-col>
        </v-row>
        <v-row class="mb-4" v-show="isConnected && isSynchronized">
          <v-col cols="6"> <span class="text--secondary">3</span></v-col>
          <v-col cols="6">
            <v-text-field label="Target length" value="100.00" suffix="m" v-model="inputLengthTarget"></v-text-field>
            <v-text-field label="Length change speed" value="1" suffix="m/s" v-model="inputLengthChangeSpeed"></v-text-field>
            <v-text-field
              label="Length change acceleration"
              value="1"
              suffix="m/s²"
              v-model="inputLengthChangeAcceleration"
            ></v-text-field>
            <v-btn block @click="measureStartStop">Measure {{ isMeasuring ? 'STOP' : 'START' }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Emitter from './lib/Emitter';
import Distance from './lib/Distance';
import Gauge from './lib/Gauge';
import { State } from './lib/State';

export default {
  name: 'App',
  data: () => ({
    isConnected: false,
    isSynchronizing: false,
    isSynchronized: false,
    isMeasuring: false,
    isMeasured: false,
    inputLightTimeOn: 1,
    inputLightTimeOff: 1,
    inputSpeedOfLight: 1,
    inputLengthTarget: 1,
    inputLengthChangeSpeed: 1,
    inputLengthChangeAcceleration: 1,
    emitter: new Emitter(),
    distance: new Distance(),
    gauge: new Gauge(),
    eventEmitterStatus: -1,
    eventEmitterIndex: 0,
    eventDistanceStatus: -1,
    eventDistanceIndex: 0,
    eventDistanceLengthCurrent: 0,
    eventDistanceLengthTarget: 0,
    eventDistanceLengthPercent: 0,
  }),
  mounted: function() {
    this.$nextTick(function() {
      this.inputLightTimeOn = this.emitter.lightTimeOn;
      this.inputLightTimeOff = this.emitter.lightTimeOff;
      this.inputSpeedOfLight = this.distance.speedOfLight;
      this.inputLengthTarget = this.distance.lengthTarget;
      this.inputLengthChangeSpeed = this.distance.lengthChangeSpeed;
      this.inputLengthChangeAcceleration = this.distance.lengthChangeAcceleration;
      this.connect();
    });
  },
  methods: {
    connect() {
      this.distance.connectToEmmitter(this.emitter);
      this.gauge.connectToDistance(this.distance);
      this.isConnected = this.distance.isConnectedToEmmiter && this.gauge.isConnectedToDistance;
      this.emitter.connect(Emitter.EVENT_LIGHT, this.emitterLightListener);
      this.distance.connect(Distance.EVENT_LIGHT, this.distanceLightListener);
      this.distance.connect(Distance.EVENT_LENGTH, this.distanceLengthListener);
    },
    emitterLightListener(lightIsOn) {
      this.eventEmitterStatus = lightIsOn ? 1 : 0;
      this.eventEmitterIndex ++;
    },
    distanceLightListener(lightIsOn) {
      this.eventDistanceStatus = lightIsOn ? 1 : 0;
      this.eventDistanceIndex ++;
    },
    distanceLengthListener(lengthCurrent, lengthTarget) {
      this.eventDistanceLengthCurrent = lengthCurrent;
      this.eventDistanceLengthTarget = lengthTarget;
      this.eventDistanceLengthPercent = (this.eventDistanceLengthTarget > 0) ? (lengthCurrent / lengthTarget) : 0;
    },
    synchronizeStartStop() {
      this.isSynchronizing ? this.synchronizeStop() : this.synchronizeStart();
    },
    synchronizeStart() {
      this.eventEmitterIndex = 0;
      this.eventDistanceIndex = 0;
      this.emitter.lightTimeOn = this.inputLightTimeOn;
      this.emitter.lightTimeOff = this.inputLightTimeOff;
      this.gauge.state = State.ACTIVE_SYNCHRONIZE;
      this.distance.state = State.ACTIVE_SYNCHRONIZE;
      this.emitter.state = State.ACTIVE_SYNCHRONIZE;
      this.eventDistanceLengthPercent = 0;
      this.isSynchronizing = true;
    },
    synchronizeStop() {
      this.setInactive();
      this.isSynchronizing = false;
      this.isSynchronized = this.gauge.isSynchronized;
    },
    measureStartStop() {
      this.isMeasuring ? this.measureStop() : this.measureStart();
    },
    measureStart() {
      this.distance.speedOfLight = this.inputSpeedOfLight;
      this.distance.lengthTarget = this.inputLengthTarget;
      this.distance.lengthChangeSpeed = this.inputLengthChangeSpeed;
      this.distance.lengthChangeAcceleration = this.inputLengthChangeAcceleration;
      this.gauge.state = State.ACTIVE_MEASURE;
      this.distance.state = State.ACTIVE_MEASURE;
      this.emitter.state = State.ACTIVE_MEASURE;
      this.isMeasuring = true;
    },
    measureStop() {
      this.setInactive();
      this.isMeasuring = false;
    },
    setInactive() {
      this.gauge.state = State.INACTIVE;
      this.distance.state = State.INACTIVE;
      this.emitter.state = State.INACTIVE;
      this.eventEmitterStatus = -1;
      this.eventDistanceStatus = -1;
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
