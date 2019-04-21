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
  
  var originDataRollup = nest()
    .key(d => d.origin_type)
    .key(d => d.reportID)
    .rollup(function(v) { return sum(v, function(d) { return d.enters; }); })
    .entries(data);
  
  var originDataRollup2 = nest()
    .key(d => d.origin_type)
    .key(d => d.reportID)
    .rollup(function(v) { return sum(v, function(d) { return d.enters; }); })
    .object(data);
  
  //console.log(originDataRollup2);
  
  var geoOptions = ['out of state','out of district','same district'];
  
  geoOptions.forEach(d =>{
    //console.log(d);
    //console.log(originDataRollup2[d]);
    var tmp = originDataRollup2[d];
    var i;
    for(i = 68; i < 78; i++){
      //originDataRollup2
      if(!tmp[i]){
        originDataRollup2[d][i] = 0;
      };
    };
  });
  
  var originDataRollup3;
  
  //originDataRollup2.forEach(d=>
    //return d; 
  //);
  
  
  //console.log('original');
  //console.log(originDataRollup2);
  
  const originDataRollup3 = Object.entries(originDataRollup2);
  //const originDataRollup3 = Array.from(originDataRollup2);
  //const originDataRollup3 = Object.values(originDataRollup2);
  
  var originDataRollup3;
  
  //console.log('current');
  //console.log(originDataRollup3);
  //console.log(originDataRollup3[0][1]);
  
  
  /*originDataRollup.forEach(d =>{
    
    var tmp = d.values;
    console.log(tmp);
    
    var i;
    for(i=68; i< 78; i++){
      //console.log(i);
      if(tmp.filter(v=> v.key == i).length ==0){
        console.log(d.key);
        var geo = d.key;
        console.log('missing value');
        console.log(d[geo]);
        //d[geo].push({key: toString(i),value: 0});
      }
      
      //console.log(tmp.filter(d=> d.key == i));
      //console.log(d.values[toString(i)]);
      //console.log(d.values);
      //if(!d.values.i){
        //console.log('missing value');
      //}
    };
    
  });*/
  
  
  
  //console.log(originData);
  //console.log('goal');
  //console.log(originDataRollup);
  //console.log(originDataRollup[0].values[0]);
  
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
    //.x(d => scaleX(d[]))
    .x(d => scaleX(+d.key)) //new change
    .y(d => scaleY(d.value)); //new change
  
  //console.log(lineGenerator(originDataRollup[0].values));
  
  const streams = plot
    .selectAll('.stream')
    .data(originDataRollup);
    //.data(originDataRollup3);
  
  const streamsEnter = streams.enter()
    .append('path')
    .attr('class','stream')
  
  streams.merge(streamsEnter)
    .attr('d', data => lineGenerator(data.values))
    .style('fill','none')
    .style('stroke','#333')
    .style('stroke-width','2px');
  
  
  //console.log(streams.merge(streamsEnter));
  
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