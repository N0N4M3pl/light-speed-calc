<template>
  <canvas ref="chartEle" width="100" height="20"></canvas>
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
            label: 'Emitter: light sending',
            borderColor: colors.orange.base,
            order: 1,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Gauge: light receiving',
            borderColor: colors.cyan.base,
            order: 2,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Distance: length',
            borderColor: colors.lightGreen.lighten2,
            order: 3,
            xAxisID: 'time-x-axis',
            yAxisID: 'distance-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Distance: light delay (simulated)',
            borderColor: colors.lightGreen.darken3,
            order: 4,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-delay-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          },
          {
            label: 'Gauge: light delay (measured)',
            borderColor: colors.cyan.darken3,
            order: 5,
            xAxisID: 'time-x-axis',
            yAxisID: 'light-delay-y-axis',
            lineTension: 0,
            fill: false,
            data: []
          }
        ]
      },
      options: {
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
              labels: ['MEASURE', 'SEPARATION', 'SYNCHRONIZE', 'INACTIVE']
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
      this.chart = new Chart(this.$refs.chartEle, this.config);
    });
  },
  methods: {
    updateData(
      stateEvents,
      emitterLightEvents,
      distanceLengthEvents,
      distanceLightDelayEvents,
      gaugeLightEvents,
      gaugeMeasuredLightDelayEvents
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
      this.chart.update();
    }
  }
};
</script>
