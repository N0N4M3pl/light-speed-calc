<template>
  <canvas ref="chartEle" width="100" height="25"></canvas>
</template>

<script>
import Chart from 'chart.js';
import colors from 'vuetify/lib/util/colors';
import ChartPluginZoom from 'chartjs-plugin-zoom';
ChartPluginZoom;

export default {
  name: 'chart',
  data: () => ({
    chart: null,
    config: {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'State of calculation',
            borderColor: colors.grey.lighten1,
            borderWidth: 1,
            // backgroundColor: colors.grey.lighten1,
            order: 0,
            xAxisID: 'time-x-axis',
            yAxisID: 'state-y-axis',
            lineTension: 0,
            fill: true,
            data: []
          },
          {
            label: 'Light released by Emitter',
            borderColor: colors.orange.lighten2,
            order: 1,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Light received by Gauge',
            borderColor: colors.cyan.lighten2,
            order: 2,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Distance length',
            borderColor: colors.lightGreen.lighten2,
            order: 3,
            xAxisID: 'time-x-axis',
            yAxisID: 'distance-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Light delay simulated by Distance',
            borderColor: colors.lightGreen.darken3,
            order: 4,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-delay-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Light delay measured by Gauge',
            borderColor: colors.cyan.darken3,
            order: 5,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-delay-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Speed of light measured by Gauge',
            borderColor: colors.cyan.darken4,
            order: 6,
            xAxisID: 'time-x-axis',
            yAxisID: 'speed-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          }
        ]
      },
      options: {
        legend: {
          onClick: null
        },
        scales: {
          xAxes: [
            {
              id: 'time-x-axis',
              type: 'linear',
              beginAtZero: true
            }
          ],
          yAxes: [
            {
              id: 'light-y-axis',
              type: 'category',
              position: 'left',
              labels: ['ON', 'OFF']
            },
            {
              id: 'state-y-axis',
              type: 'category',
              position: 'left',
              labels: ['STOP', 'MEASURE', 'COLLECTING', 'SEPARATION', 'SYNCHRONIZE', 'START', 'INACTIVE']
            },
            {
              id: 'distance-y-axis',
              position: 'right',
              min: 0
            },
            {
              id: 'light-delay-y-axis',
              position: 'right',
              min: 0
            },
            {
              id: 'speed-y-axis',
              position: 'right',
              min: 0
            }
          ]
        },
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              rangeMin: {
                x: -1000
              },
              rangeMax: {
                x: 1000
              },
              speed: 20,
              threshold: 10
            },
            zoom: {
              enabled: true,
              drag: false,
              mode: 'x',
              rangeMin: {
                x: -1000
              },
              rangeMax: {
                x: 1000
              },
              speed: 0.1,
              threshold: 2,
              sensitivity: 3
            }
          }
        }
      }
    }
  }),
  mounted: function() {
    this.$nextTick(function() {
      this.config.options.legend.onClick = this._onLegenClick;
      this.chart = new Chart(this.$refs.chartEle, this.config);
    });
  },
  methods: {
    _onLegenClick(e, legendItem) {
      var index = legendItem.datasetIndex;
      var meta = this.chart.getDatasetMeta(index);

      // See controller.isDatasetVisible comment
      meta.hidden = meta.hidden === null ? !this.chart.data.datasets[index].hidden : null;

      // We hid a dataset ... rerender the chart
      this.chart.update();
    },
    updateData(
      stateEvents,
      emitterLightEvents,
      distanceLengthEvents,
      distanceLightDelayEvents,
      gaugeLightEvents,
      gaugeMeasuredLightDelayEvents,
      gaugeMeasuredSpeedOfLightEvents
    ) {
      const rangeMaxX = (stateEvents.length > 0 ? stateEvents[stateEvents.length - 1].x : 0) + 1000;
      this.config.options.plugins.zoom.pan.rangeMax.x = rangeMaxX;
      this.config.options.plugins.zoom.zoom.rangeMax.x = rangeMaxX;
      this.config.data.datasets[0].data = stateEvents;
      this.config.data.datasets[1].data = emitterLightEvents;
      this.config.data.datasets[2].data = gaugeLightEvents;
      this.config.data.datasets[3].data = distanceLengthEvents;
      this.config.data.datasets[4].data = distanceLightDelayEvents;
      this.config.data.datasets[5].data = gaugeMeasuredLightDelayEvents;
      this.config.data.datasets[6].data = gaugeMeasuredSpeedOfLightEvents;
      this.chart.update();
    },
    lightOnOffDataIsHidden(value) {
      this.chart.getDatasetMeta(1).hidden = value;
      this.chart.getDatasetMeta(2).hidden = value;
      this.chart.options.scales.yAxes[0].display = !value;
      this.chart.update();
    },
    distanceLengthDataIsHidden(value) {
      this.chart.getDatasetMeta(3).hidden = value;
      this.chart.options.scales.yAxes[2].display = !value;
      this.chart.update();
    },
    lightDelayDataIsHidden(distanceValue, gaugeValue) {
      this.chart.getDatasetMeta(4).hidden = distanceValue;
      this.chart.getDatasetMeta(5).hidden = gaugeValue;
      this.chart.options.scales.yAxes[3].display = !(distanceValue && gaugeValue);
      this.chart.update();
    },
    speedOfLightDataIsHidden(value) {
      this.chart.getDatasetMeta(6).hidden = value;
      this.chart.options.scales.yAxes[4].display = !value;
      this.chart.update();
    },
    resetZoom() {
      this.chart.resetZoom();
    }
  }
};
</script>
