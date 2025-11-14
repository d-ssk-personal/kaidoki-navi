<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'PriceChart',
  props: {
    priceHistory: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.renderChart()
  },
  watch: {
    priceHistory: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d')
      
      const labels = this.priceHistory.map(item => item.date)
      const data = this.priceHistory.map(item => item.price)
      
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '価格 (円)',
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  return `¥${context.parsed.y}`
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => {
                  return `¥${value}`
                }
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      })
    },
    updateChart() {
      if (!this.chart) {
        this.renderChart()
        return
      }
      
      const labels = this.priceHistory.map(item => item.date)
      const data = this.priceHistory.map(item => item.price)
      
      this.chart.data.labels = labels
      this.chart.data.datasets[0].data = data
      this.chart.update()
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>