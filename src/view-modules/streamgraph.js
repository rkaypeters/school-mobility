import {nest,select,selectAll,sum,scaleLinear,line,area,curveMonotoneX,axisBottom,axisLeft,max} from 'd3';

function renderStream(data){
  //This function displays the streamgraph
  
  //Add origin_type to group the incoming students based on their district. Then nest by origin_type
  data.map(d =>{
    if(d.distcode_origin == d.distcode_dest){
      d.origin_type = 'same district'
    }else{if(d.distcode_origin == '00'){
      d.origin_type = 'out of state'
    }else{d.origin_type = 'out of district'}};
    return d;
  });
  
  var originDataRollup = nest()
    .key(d => d.origin_type)
    .key(d => d.reportID)
    .rollup(function(v) { return sum(v, function(d) { return d.enters; }); })
    .object(data);

  
  //Fill in any missing values.
  var geoOptions = ['out of state','out of district','same district'];
  
  geoOptions.forEach(d =>{
    if(!originDataRollup[d]){
      originDataRollup[d]=[];
    }
    var tmp = originDataRollup[d];
    var i;
    for(i = 68; i < 78; i++){
      if(!tmp[i]){
        originDataRollup[d][i] = 0;
      };
    };
  });
  
  
  //Create stacked data values.
  //var streamCoords = [{key:'out of state',color:'#2B7C8F',values:[]},{key:'out of district',color:'#87BFCC',values:[]},{key:'same district',color:'#A8EFFF',values:[]}];   //just different colors
  var streamCoords = [{key:'out of state',color:'#2B7C8F',values:[]},{key:'out of district',color:'#70b3c2',values:[]},{key:'same district',color:'#b8e1ea',values:[]}];
  
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
  };
  
  myStack(originDataRollup);

  
  //Formatting the format
  const w = select('.streamgraph').node().clientWidth;
  const h = 130;
  const margin = {l:25,r:15,t:0,b:20};
  const innerWidth = w - margin.l - margin.r;
  const innerHeight = h - margin.t - margin.b;
  

  //Scales for axes
  const maxVal = max(streamCoords[2].values, d => d.y1);
  
  var scaleTop;
  if(maxVal > 40){
    scaleTop = maxVal;
  }else{
    scaleTop = 40;
  };
  
  const scaleX = scaleLinear().domain([68,77]).range([0,innerWidth]);
  const scaleY = scaleLinear().domain([0, scaleTop]).range([innerHeight,0]);
  
  
  //Line and area generators (currently only using area)
  const lineGenerator2 = line()
    .curve(curveMonotoneX)
    .x(d => scaleX(+d.key))
    .y(d => scaleY(d.y1));
  
  const areaGenerator = area()
    .curve(curveMonotoneX)
    .x(d => scaleX(+d.key))
    .y0(d =>scaleY(d.y0))
    .y1(d => scaleY(d.y1));

  
  //Applying to svg
  const svg = select('.streamgraph')
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', w)
    .attr('height', h);
  
  const streams = plot
    .selectAll('.stream')
    .data(streamCoords);
  
  const streamsEnter = streams.enter()
    .append('path')
    .attr('class','stream')
    .attr('transform', `translate(${margin.l}, ${margin.t})`);
  
  streams.merge(streamsEnter)
    //.attr('d', data => lineGenerator2(data.values))
    .attr('d', data => areaGenerator(data.values))
    .style('fill',d => d.color);
    //.style('stroke','#333') //optios if using line instead of area
    //.style('stroke-width','2px');

  const axisX = axisBottom()
      .scale(scaleX)
      .tickFormat(function(value){ return "'"+String(value+40).slice(-2)+ "-" + String(value+41).slice(-2)})

  const axisY = axisLeft()
      .scale(scaleY)
      //.tickSize(-innerWidth) //option to extend ticks across chart
      .ticks(3)
  
  const axes = plot
    .selectAll('.axis').remove();
  
  plot.append('g')
		.attr('class','axis')
		.attr('transform',`translate(${margin.l}, ${innerHeight+margin.t})`)
		.call(axisX)

  plot.append('g')
		.attr('class','axis')
        .attr('transform',`translate(${margin.l},${margin.t})`)
		.call(axisY);
  
};


export default renderStream;