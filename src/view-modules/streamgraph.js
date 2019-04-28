import {nest,select,selectAll,sum,scaleLinear,line,area,curveMonotoneX,axisBottom,axisLeft,max,mouse} from 'd3';

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
  const margin = {l:30,r:15,t:10,b:20};
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
    //.attr('d', data => lineGenerator2(data.values)) //if using line instead of area
    .attr('d', data => areaGenerator(data.values))
    .style('fill',d => d.color);
    //.style('stroke','#333') //options if using line instead of area
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
  
  
  //Tooltips - everything from here on
  //Remove previous iteration dom elements
  plot.selectAll('.tooltip').remove();
  
  //Create all the current dom elements
  plot.append('rect') //tooltip line
    .attr('class','tooltip')
    .attr('id','tooltiphighlight')
    .style('opacity',0)
    .attr('width',3)
    .attr('height',innerHeight)
    .attr('fill','#A9A9A9')
    .attr('rx',1.5)
    .attr('ry',1.5);
  plot.append('rect') //tooltip background
    .attr('class','tooltip')
    .attr('id','tooltiprect')
    .style('opacity',0)
    .attr('width',140)
    .attr('height',66)
    .attr('fill','white')
    .attr('rx',5)
    .attr('ry',5);
  plot.append('text') //tooltip header
    .attr('class','tooltip')
    .attr('id','tooltip0')
    .style('opacity', 0)
    .attr('stroke','#505050');
  plot.append('text') //tooltip line 1
    .attr('class','tooltip')
    .attr('id','tooltip1')
    .style('opacity', 0)
    .attr('stroke','#88b8c3');
  plot.append('text') //tooltip line 2
    .attr('class','tooltip')
    .attr('id','tooltip2')
    .style('opacity', 0)
    .attr('stroke','#4da0b3');
  plot.append('text') //tooltip line 3
    .attr('class','tooltip')
    .attr('id','tooltip3')
    .style('opacity', 0)
    .attr('stroke','#297889');
  plot.append('rect') //rect for mouseenter, etc
    .attr('class','tooltip')
    .attr('id','mouse-target')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('x',margin.l)
    .attr('y',margin.t)
    .style('opacity', 0);
  
  //On mouseenter, make elements visible (opacity >0)
  plot.select('#mouse-target')
    .on('mouseenter', function(d){
      plot.select('#tooltip0')
        .style('opacity',1);
      plot.select('#tooltip1')
          .style('opacity',1);
      plot.select('#tooltip2')
          .style('opacity',1);
      plot.select('#tooltip3')
          .style('opacity',1);
      plot.select('#tooltiphighlight')
        .style('opacity','.6');
      plot.select('#tooltiprect')
        .style('opacity','.8');
    })
    //On move, adjust positioning and text
    .on('mousemove', function(d){
      const mouseCoord = mouse(plot.select('#mouse-target').node());
      const mouseX = mouseCoord[0];
      const rptID = Math.round(scaleX.invert(mouseX-margin.l));
      const oos = originDataRollup['out of state'][rptID];
      const ood = originDataRollup['out of district'][rptID];
      const sd = originDataRollup['same district'][rptID];
    
      const indent = 8;
      const lineHeight = 16;
      const toolTipY = 12+lineHeight;
      const boxW = plot.select('#tooltiprect').node().width.animVal.value;
      var toolTipX;
      if(rptID==76 || rptID ==77){
          toolTipX = scaleX(77)+margin.l-boxW-2
          }else{toolTipX = scaleX(rptID)+margin.l+12};
      const hXpos = scaleY(streamCoords[2].values[rptID-68].y1)+margin.t-4;
      const hHeight = scaleY(0)-scaleY(streamCoords[2].values[rptID-68].y1)+8; 
    
      plot.select('#tooltiphighlight')
        .attr('x',scaleX(rptID)+margin.l-1.5)
        .attr('y',hXpos)
        .attr('height',hHeight);
      plot.select('#tooltiprect')
        .attr('x',toolTipX-6)
        .attr('y',toolTipY-lineHeight+2);
      plot.select('#tooltip0')
        .text("20"+String(rptID+40).slice(-2)+ "-" + String(rptID+41).slice(-2)+' midyear enters')
        .attr('x',toolTipX)
        .attr('y',toolTipY);
      plot.select('#tooltip1')
        .text(`In-district:  ${sd}`)
        .attr('x',toolTipX+indent)
        .attr('y',toolTipY+lineHeight);
      plot.select('#tooltip2')
        .text(`In-state: ${ood}`)
        .attr('x',toolTipX+indent)
        .attr('y',toolTipY+2*lineHeight);
      plot.select('#tooltip3')
        .text(`Out-of-state: ${oos}`)
        .attr('x',toolTipX+indent)
        .attr('y',toolTipY+3*lineHeight);

    })
    //On leave, disappear (opacity = 0)
    .on('mouseleave', function(d){
      plot.selectAll('.tooltip')
        .transition()
        .duration(200)
        .style('opacity','0');
    });
  
  
};


export default renderStream;