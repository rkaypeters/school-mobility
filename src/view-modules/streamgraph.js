import {nest,select,selectAll,sum,scaleLinear,line,curveMonotoneX} from 'd3';

function renderStream(data){
  
  //console.log(data);
  
  data.map(d =>{
    if(d.distcode_origin == d.distcode_dest){
      d.origin_type = 'same district'
    }else{if(d.distcode_origin == '00'){
      d.origin_type = 'out of state'
    }else{d.origin_type = 'out of district'}};
    return d
  })
  
  const originData = nest()
			.key(d => d.origin_type)
			.entries(data);
  
  const originDataRollup = nest()
    .key(d => d.origin_type)
    .key(d => d.reportID)
    .rollup(function(v) { return sum(v, function(d) { return d.enters; }); })
    .entries(data);
  
  console.log(originData);
  console.log(originDataRollup);
  
  const w = window.innerWidth;
  const h = 200;
  
  const svg = select('.streamgraph')
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', w)
    .attr('height', h);
  
  
  /*const plot = select('.streamgraph')
    .append('svg')
    .attr('width', w)
    .attr('height', h);*/ 
  
  
  const scaleX = scaleLinear().domain([68,77]).range([0, w]);
  const scaleY = scaleLinear().domain([0, 30]).range([h, 0]);

  //take array of xy values, and produce a shape attribute for <path> element
  const lineGenerator = line()
    .curve(curveMonotoneX)
    .x(d => scaleX(+d.key))
    .y(d => scaleY(d.value)); //function
  //const areaGenerator = d3.area()
      //.x(d => scaleX(+d.key))
      //.y0(innerHeight)
      //.y1(d => scaleY(d.value));

  /*const axisX = d3.axisBottom()
      .scale(scaleX)
      .tickFormat(function(value){ return "'"+String(value).slice(-2)})

  const axisY = d3.axisLeft()
      .scale(scaleY)
      .tickSize(-innerWidth)
      .ticks(3)*/
  
  //console.log(lineGenerator(originDataRollup[0].values));
  
  const streams = plot
    .selectAll('.stream')
    .data(originDataRollup);
  
  const streamsEnter = streams.enter()
    .append('path')
    .attr('class','stream')
  
  streams.merge(streamsEnter)
    .attr('d', data => lineGenerator(data.values))
    .style('fill','none')
    .style('stroke','#333')
    .style('stroke-width','2px');
  
  
  console.log(streams.merge(streamsEnter));
  
  //streams.exit().remove();
  
  
    //.enter
    //.append('svg')
    //.attr('class','stream')
  
  
    /*const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', w)
    .attr('height', h);

  const links = plot
    .selectAll('.link')
    .data(linksData);
  const linksEnter = links.enter().append('line').attr('class','link')
    .style('stroke-opacity',0.05)
    .style('stroke-width','1px')
    .style('stroke','black');

  links.merge(linksEnter)
    .attr('x1', d=> {

    })
    .attr('y1', d=> {

    })
    .attr('x2', d=> {

    })
    .attr('y2', d=> {

    })
    //.style('stroke-width', d=>{
    //return (d.value.toString() + 'px');
    //})
    .style('stroke-opacity',d => {return (d.value * 0.05)});
  
  links.exit().remove();*/
  
  
  
  
  
};

export default renderStream;