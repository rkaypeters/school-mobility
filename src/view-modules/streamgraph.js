import {nest,select,selectAll,sum,scaleLinear,line,area,curveMonotoneX} from 'd3';

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
  
  var originDataRollup = nest()
    .key(d => d.origin_type)
    .key(d => d.reportID)
    .rollup(function(v) { return sum(v, function(d) { return d.enters; }); })
    .object(data);
  
  var geoOptions = ['out of state','out of district','same district'];
  
  geoOptions.forEach(d =>{
    //console.log(d);
    //console.log(originDataRollup[d]);
    var tmp = originDataRollup[d];
    var i;
    for(i = 68; i < 78; i++){
      if(!tmp[i]){
        originDataRollup[d][i] = 0;
      };
    };
  });

  console.log(originDataRollup);
  
  var streamCoords = [{key:'out of state',color:'#2B7C8F',values:[]},{key:'out of district',color:'#87BFCC',values:[]},{key:'same district',color:'#A8EFFF',values:[]}];
  
  function myStack(d){
    var i;
    for(i=68; i<78; i++){
      var oos = d['out of state'][i];
      var ood = d['out of district'][i];
      var sd = d['same district'][i];
      
      streamCoords[0].values.push({key:i, y0:0, y1:oos});
      streamCoords[1].values.push({key:i, y0:oos, y1: oos + ood});
      streamCoords[2].values.push({key:i, y0:oos + ood, y1: oos + ood + sd});
    }
    
    console.log(d['out of state']);
    
  };
  
  myStack(originDataRollup);
  console.log(streamCoords);

  
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
  
  const scaleX = scaleLinear().domain([68,77]).range([0, w]);
  const scaleY = scaleLinear().domain([0, 60]).range([h, 0]);

  const lineGenerator = line()
    .curve(curveMonotoneX)
    .x(d => scaleX(+d.key))
    .y(d => scaleY(d.value));
  
  const lineGenerator2 = line()
    .curve(curveMonotoneX)
    .x(d => scaleX(+d.key))
    .y(d => scaleY(d.y1));
  
  const areaGenerator = area()
    .curve(curveMonotoneX)
    .x(d => scaleX(+d.key))
    .y0(d =>scaleY(d.y0))
    .y1(d => scaleY(d.y1));

  
  const streams = plot
    .selectAll('.stream')
    //.data(originDataRollup);
    .data(streamCoords);
  
  const streamsEnter = streams.enter()
    .append('path')
    .attr('class','stream')
  
  streams.merge(streamsEnter)
    //.attr('d', data => lineGenerator(data.values))
    //.attr('d', data => lineGenerator2(data.values))
    .attr('d', data => areaGenerator(data.values))
    .style('fill',d => d.color);
    //.style('stroke','#333')
    //.style('stroke-width','2px');
  
  
  console.log(streams.merge(streamsEnter));
  
  //streams.exit().remove();
  
  
  
  
  
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
  
  
  
};

export default renderStream;