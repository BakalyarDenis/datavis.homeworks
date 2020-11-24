const b_width = 1000
const d_width = 500
const b_height = 1000
const d_height = 1000
const colors = [
  '#DB202C','#a6cee3','#1f78b4',
  '#33a02c','#fb9a99','#b2df8a',
  '#fdbf6f','#ff7f00','#cab2d6',
  '#6a3d9a','#ffff99','#b15928'
]
const radius = d3.scaleLinear().range([0.5, 20])
const color = d3.scaleOrdinal().range(colors)
const x = d3.scaleLinear().range([0, b_width])
const bubble = d3.select('.bubble-chart').attr('width', b_width).attr('height', b_height)
const donut = d3.select('.donut-chart').attr('width', d_width).attr('height', d_height).append("g").attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")")
const donut_lable = d3.select('.donut-chart').append('text').attr('class', 'donut-lable').attr("text-anchor", "middle").attr('transform', `translate(${(d_width/2)} ${d_height/2})`)
const tooltip = d3.select('.tooltip').style("opacity", 0.9)
const forceStrength = 0.03
const simulation = d3.forceSimulation()

d3.csv('data/netflix.csv').then( data => {
  data = d3.nest().key(d => d.title).rollup(d => d[0]).entries(data).map(d => d.value).filter(d => d['user rating score'] !== 'NA')

  const rating = data.map(d => +d['user rating score'])
  const years = data.map(d => +d['release year'])
  const ratings = d3.nest().key(d=>d.rating).rollup(d => d.length).entries(data)
  const pie = d3.pie().value(d => d.value.value)
  const data_ready = pie(d3.entries(ratings))
  const ticked = () => {
    var circle_data = bubble.selectAll('circle').data(data)

    circle_data.enter()
      .append('circle')
      .attr("r", d => radius(d['user rating score']))
      .attr("fill", d => color(d["rating"]))
      .merge(circle_data)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('stroke', 'black')
      .style('stroke-width', 0)
      .on('mouseover', overBubble)
      .on('mouseout', outOfBubble)
      .exit()
      .remove()
  }

  function overBubble(d){
    d3.select(this).style('stroke-width', 2)
    tooltip.html(`<b>${d['title']}</b><br/>${d['release year']}`)
    tooltip.style("left", (d.x + (+d3.select(this).attr('r'))) + "px").style("top", (d.y - 90) + "px").style('display', 'block')
  }

  function outOfBubble(){
    d3.select(this).style('stroke-width', 0)
    tooltip.style('display', 'none')
  }

  function overArc(d){
    donut_lable.text(d.data.value.key)
    d3.select(this).style('opacity', 0.5)
    const selected_rating = d.data.value.key
    bubble.selectAll('circle').style('opacity', d => d.rating == selected_rating ?  1 : 0.5).style('stroke-width', d => d.rating == selected_rating ? 2 : 0)
  }

  function outOfArc(){
    d3.select(this).style('opacity', 1)
    donut_lable.text('')
    bubble.selectAll('circle').style('opacity', 1).style('stroke-width', 0)
  }

  color.domain(ratings)
  radius.domain([d3.min(rating), d3.max(rating)])
  x.domain([d3.min(years), d3.max(years)])

  simulation.nodes(data)
    .force('x', d3.forceX().x(d => x(+d['release year'])))
    .force('center', d3.forceCenter(b_width/2, b_height/2))
    .force('collision', d3.forceCollide().radius(d => radius(d['user rating score'])))
    .on('tick', ticked)

  donut.selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc().innerRadius(100).outerRadius(250))
    .attr('fill', d => color(d.data.value.key))
    .attr("stroke", "white")
    .style("stroke-width", 2)
    .style("opacity", 1)
    .on('mouseover', overArc)
    .on('mouseout', outOfArc)
})
