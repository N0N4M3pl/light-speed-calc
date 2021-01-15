<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center text-overline">
        light-speed-calc
      </div>
    </v-app-bar>

    <v-main>
      <v-container class="grey lighten-5">
        <v-row>
          <v-col cols="3">
            <v-card outlined>
              <v-card-title>Emitter</v-card-title>
              <v-card-text>
                On time: {{ this.emitter.lightOnTime }}<br />
                Off time: {{ this.emitter.lightOffTime }}
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="1" align-self="center" class="text-center">
            <v-icon v-if="emitterDistanceStatus === 'disconnected'" large color="red">mdi-transit-connection</v-icon>
            <v-icon v-else-if="emitterDistanceStatus === 'connected'" large color="green"
              >mdi-transit-connection-horizontal</v-icon
            >
            <v-badge v-else-if="emitterDistanceStatus === 'lightOn'" :content="emitterDistanceIndex" bordered left>
              <v-icon large>mdi-motion-outline</v-icon>
            </v-badge>
            <v-badge v-else-if="emitterDistanceStatus === 'lightOff'" :content="emitterDistanceIndex" bordered left>
              <v-icon large>mdi-motion</v-icon>
            </v-badge>
          </v-col>
          <v-col cols="4">
            <v-card outlined>
              <v-card-title>Distance</v-card-title>
              <v-card-text>
                Current length: {{ this.distance.length }}<br />
                Target length: {{ this.distance.length }}
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="1" align-self="center" class="text-center">
            <v-icon v-if="distanceGaugeStatus === 'disconnected'" large color="red">mdi-transit-connection</v-icon>
            <v-icon v-else-if="distanceGaugeStatus === 'connected'" large color="green"
              >mdi-transit-connection-horizontal</v-icon
            >
            <v-badge v-else-if="distanceGaugeStatus === 'lightOn'" :content="distanceGaugeIndex" bordered left>
              <v-icon large>mdi-motion-outline</v-icon>
            </v-badge>
            <v-badge v-else-if="distanceGaugeStatus === 'lightOff'" :content="distanceGaugeIndex" bordered left>
              <v-icon large>mdi-motion</v-icon>
            </v-badge>
          </v-col>
          <v-col cols="3">
            <v-card outlined>
              <v-card-title>Gauge</v-card-title>
              <v-card-text>
                On time: {{ this.gauge.lightOnTime.toFixed(2) }}<br />
                Off time: {{ this.gauge.lightOffTime.toFixed(2) }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12"><v-btn block @click="connect" :disabled="elementsAreConnected">Connect all elements</v-btn></v-col>
        </v-row>
        <v-row>
          <v-col cols="6"><v-btn block @click="synchronizeStart">Synchronize START</v-btn></v-col>
          <v-col cols="6"><v-btn block @click="synchronizeStop">Synchronize STOP</v-btn></v-col>
        </v-row>
        <v-row>
          <v-col cols="6"><v-btn block @click="measureStart" :disabled="elementsAreConnected">Measure START</v-btn></v-col>
          <v-col cols="6"><v-btn block @click="measureStop" :disabled="elementsAreConnected">Measure STOP</v-btn></v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Emitter from './lib/Emitter';
import { EmitterState } from './lib/EmitterState';
import Distance from './lib/Distance';
import Gauge from './lib/Gauge';
import { GaugeState } from './lib/GaugeState';

export default {
  name: 'App',
  data: () => ({
    emitter: new Emitter(1000, 100),
    distance: new Distance(),
    gauge: new Gauge(),
    elementsAreConnected: false,
    emitterDistanceStatus: 'disconnected',
    distanceGaugeStatus: 'disconnected',
    emitterDistanceIndex: 0,
    distanceGaugeIndex: 0
  }),
  methods: {
    connect() {
      this.distance.connectToEmmitter(this.emitter);
      this.gauge.connectToDistance(this.distance);
      this.elementsAreConnected = (this.distance.isConnectedToEmmiter && this.gauge.isConnectedToDistance);
      this.emitterDistanceStatus = this.distance.isConnectedToEmmiter ? 'connected' : 'disconnected';
      this.distanceGaugeStatus = this.gauge.isConnectedToDistance ? 'connected' : 'disconnected';
      this.emitter.connect(this.emitterListener);
      this.distance.connect(this.distanceListener);
      this.gauge.connect(this.gaugeListener);
    },
    emitterListener(lightEvent) {
      this.emitterDistanceStatus = lightEvent.isOn ? 'lightOn' : 'lightOff';
      this.emitterDistanceIndex = lightEvent.index;
    },
    distanceListener(lightEvent) {
      this.distanceGaugeStatus = lightEvent.isOn ? 'lightOn' : 'lightOff';
      this.distanceGaugeIndex = lightEvent.index;
    },
    gaugeListener() {},
    synchronizeStart() {
      this.distance.length = 0; // change to state
      this.gauge.state = GaugeState.ACTIVE_SYNCHRONIZE;
      this.emitter.state = EmitterState.ACTIVE;
    },
    synchronizeStop() {
      this.distance.length = 0; // change to state
      this.gauge.state = GaugeState.INACTIVE;
      this.emitter.state = EmitterState.INACTIVE;
    },
    measureStart() {

    },
    measureStop() {
      
    }
  }
};
</script>
