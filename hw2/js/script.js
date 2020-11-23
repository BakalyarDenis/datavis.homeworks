const width = 1000
const height = 500
const margin = 30
const svg  = d3.select('#scatter-plot').attr('width', width).attr('height', height)

var xParam = 'fertility-rate'
var yParam = 'child-mortality'
var radius = 'gdp'
var year = '2000'

const params = ['child-mortality', 'fertility-rate', 'gdp', 'life-expectancy', 'population']
const colors = ['aqua', 'lime', 'gold', 'hotpink']

const x = d3.scaleLinear().range([margin*2, width-margin])
const y = d3.scaleLinear().range([height-margin, margin])
const xLable = svg.append('text').attr('transform', `translate(${width/2}, ${height})`)
const yLable = svg.append('text').attr('transform', `translate(${margin/2}, ${height/2}) rotate(-90)`)
const xAxis = svg.append('g').attr('transform', `translate(0, ${height - margin})`)
const yAxis = svg.append('g').attr('transform', `translate(${2*margin}, 0)`)
const color = d3.scaleOrdinal(colors)
const r = d3.scaleSqrt().range([1, 10])

d3.select('#r').selectAll('option').data(params).enter().append('option').text((r) => r)
d3.select('#x').selectAll('option').data(params).enter().append('option').text((x) => x)
d3.select('#y').selectAll('option').data(params).enter().append('option').text((y) => y)

document.getElementById('r').value = radius
document.getElementById('x').value = xParam
document.getElementById('y').value = yParam

loadData().then(data => {
  function newYear(){
    year = this.value
    updateChart()
  }
  function newRadius() {
    radius = this.value
    updateChart()
  }
  function newXParam() {
    xParam = this.value
    updateChart()
  }
  function newYParam() {
    yParam = this.value
    updateChart()
  }

  const updateChart = () => {
    d3.select('.year').text(year)

    xLable.text(xParam)
    const xRange = data.map(d=> +d[xParam][year])
    x.domain([d3.min(xRange), d3.max(xRange)])
    xAxis.call(d3.axisBottom(x))

    yLable.text(yParam)
    const yRange = data.map(d=> +d[yParam][year])
    y.domain([d3.min(yRange), d3.max(yRange)])
    yAxis.call(d3.axisRight(y))

    const rRange = data.map(d=> +d[radius][year])
    r.domain([d3.min(rRange), d3.max(rRange)])

    svg.selectAll('circle').data(data).join('circle')
      .attr('r', (e) => r(+e[radius][year]))
      .attr('cx', (e) => x(+e[xParam][year]))
      .attr('cy', (e) => y(+e[yParam][year]))
      .attr('fill', (e) => color(e['region']))
  }


  color.domain(d3.nest().key((e) => e['region']).entries(data))
  d3.select('.slider').on('change', newYear)
  d3.select('#r').on('change', newRadius)
  d3.select('#x').on('change', newXParam)
  d3.select('#y').on('change', newYParam)

  updateChart()
})


async function loadData() {
    const population = await d3.csv('data/pop.csv')
    const rest = {
        'gdp': await d3.csv('data/gdppc.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expect.csv'),
        'fertility-rate': await d3.csv('data/tfr.csv')
    }
    const data = population.map(d=>{
        return {
            geo: d.geo,
            country: d.country,
            region: d.region,
            population: {...d},
            ...Object.values(rest).map(v=>v.find(r=>r.geo===d.geo)).reduce((o, d, i)=>({...o, [Object.keys(rest)[i]]: d }), {})

        }
    })
    return data
}
