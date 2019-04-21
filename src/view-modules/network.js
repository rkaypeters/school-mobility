import {min,max,select,selectAll,scalePow,scaleLinear,transition} from 'd3';  


  // may add force layout stuff later (I think I can?) to spread stuff if needed, but it seems to not handle what I want specifically enough so doing it by scratch seems right for now. also might not be necessary.

function renderNetwork(rootDom,nodesData,linksData){
  
  const cW = window.innerWidth;
  const cH = window.innerHeight;

  var w, h;
  
  if(cW>=400){
     w = cW;
  }else{ w = 400;};
  if(cH>=800){
    h = cH-200;
  }else{h = 600;};
  
  //console.log(w);
  //console.log(h);
  
  const svg = select(rootDom)
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
      if(d.target.xy){
          return d.target.xy[0];
      }else{
          return 0;
      }
    })
    .attr('y1', d=> {
      if(d.target.xy){
          return d.target.xy[1];
      }else{
          return 0;
      }
    })
    .attr('x2', d=> {
      if(d.source.xy){
          return d.source.xy[0];
      }else{
          return 0;
      }
    })
    .attr('y2', d=> {
      if(d.source.xy){
          return d.source.xy[1];
      }else{
          return 0;
      }
    })
    //.style('stroke-width', d=>{
    //return (d.value.toString() + 'px');
    //})
    .style('stroke-opacity',d => {return (d.value * 0.05)});
  
  links.exit().remove();

}




function renderNetworkUpdate(rootDom,nodesData,linksData,distcode,dispatch){
  //const w = rootDom.clientWidth; // these aren't working out for me; i'm getting much smaller blocks
  //const h = rootDom.clientHeight;

  //console.log(nodesData);
  
  /*const cW = window.innerWidth;
  const cH = window.innerHeight;

  var w, h;
  
  if(cW>=400){
     w = cW;
  }else{ w = 400;};
  if(cH>=800){
    h = cH-200;
  }else{h = 600;};*/
  
  
  // Overall svg
  
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter);
    //.attr('width', w)
    //.attr('height', h);
  
  
  
  // Links
  
  const links = plot
    .selectAll('.link')
    .data(linksData);
  const linksEnter = links.enter().append('line').attr('class','link')
    .style('stroke-opacity',0.05)
    .style('stroke-width','1px')
    .style('stroke','black');
  
  links.merge(linksEnter)
    .transition()
    .duration(1200)
    .attr('x1', d=> {
      if(d.target.xyNew){
          return d.target.xyNew[0];
      }else{
          return 0;
      }
    })
    .attr('y1', d=> {
      if(d.target.xyNew){
          return d.target.xyNew[1];
      }else{
          return 0;
      }
    })
    .attr('x2', d=> {
      if(d.source.xyNew){
          return d.source.xyNew[0];
      }else{
          return 0;
      }
    })
    .attr('y2', d=> {
      if(d.source.xyNew){
          return d.source.xyNew[1];
      }else{
          return 0;
      }
    })
    .style('stroke-width', d=>{
    return ((d.value/4).toString() + 'px');
    })
    .style('stroke-opacity',d => {
      if(d.target.distcode ==distcode){
        d.value*d.value * 0.03;
      }else{return '0'}});
    //.style('stroke', d =>{
      //if(d.target.distcode == distcode){
        //return 'green';
      //}else{return 'white'}
  //});
  //.style('stroke-opacity',d => {return scaleWeight(d.value)});
  
  console.log(links.merge(linksEnter));
  
  links.exit().remove();
  
  
  
  // Nodes
  
  
  //var colorGenerator = 
    
  var scaleR = scaleLinear().domain([20,50]).range([234,184]);
  var scaleG = scaleLinear().domain([20,50]).range([206,115]);
  var scaleB = scaleLinear().domain([20,50]).range([182,53]);
  var scaleL = scaleLinear().domain([0,60]).range([95,40]);
  var scaleS = scaleLinear().domain([0,60]).range([50,100]);
  
  //console.log('rgb(' + Math.round(scaleR(75)) + ',' + Math.round(scaleG(75)) + ',' + Math.round(scaleB(75)) + ')');
  
  /*var colorGenerator = (d =>
                        'rgb(' + Math.round(scaleR(d)) + ',' + Math.round(scaleG(d)) + ',' + Math.round(scaleB(d)) + ')');*/
  var colorGenerator = (d => 'hsl(23,' + Math.round(scaleS(d)) +'%,' + 
                        Math.round(scaleL(d))
                          + '%)');
  
  const nodes = plot.selectAll('.node')
    .data(nodesData, d => d.schcode);
  
  const nodesEnter = nodes.enter()
    .append('circle')
    .attr('class','node');
  
  nodes.merge(nodesEnter)
    .transition()
    .duration(1500)
    //.attr('r', d=>
         //Math.sqrt(d.totalEnters + 4)*2)
    .attr('r',d => Math.sqrt(d.adm + 4))
    .style('fill-opacity', .9)
    .style('fill', d => {
      if(d.distcode ==distcode){
        return colorGenerator(d.mobRate);
      }else{return '#DCDCDC'}
    })
    .style('stroke-width', '1px')
    .style('stroke-opacity', .2)
    .attr('cx', d=>
          {if(d.xyNew){
            return d.xyNew[0]
          }})
    .attr('cy', d=>
          {if(d.xyNew){
            return d.xyNew[1]}});
  
  nodes.merge(nodesEnter).on('click', d=>{
    var s = d.schcode;  
    console.log(s);
    dispatch.call('select:school',null,d.schcode);
    console.log(plot.selectAll('.link'));

    plot.selectAll('.link')
    //links.merge(links.enter)
      .style('stroke', d=>{
        if(d.target.schcode == s){
          return '#40848F'
          console.log('highlight');
        }else{return '#F6F6F6'}
        //console.log(d.target.schcode);

      })
      .style('stroke-opacity',d => {
        if(d.target.schcode ==s){
          1;
        }else{if(d.target.distcode ==distcode){
          d.value*d.value * 0.03;
        }else{return '0'}};
      });
  });
  
  
  
  // Labels
  
  const labels = plot.selectAll('.label')
    .data(nodesData, d=> d.schcode);
  
  const labelsEnter = labels.enter()
    .append('text')
    .attr('class','label');
  
  labels.merge(labelsEnter)
    .text(d => 
          {if(d.distcode ==distcode){
        return d.schname
      }
    })
    .attr('x',d=>
          {if(d.xyNew){
            return d.xyNew[0]
          }})
    .attr('y', d=>
          {if(d.xyNew){
            return d.xyNew[1]}});

  

}



export {renderNetwork,renderNetworkUpdate};
