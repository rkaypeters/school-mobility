import {min,max,select,selectAll,scalePow} from 'd3';  


    // may add force layout stuff later (I think I can?) to spread stuff if needed, but it seems to not handle what I want specifically enough so doing it by scratch seems right for now. also might not be necessary.

function renderNetwork(rootDom,nodesData,linksData){
  const w = rootDom.clientWidth;

  
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', 750)
    .attr('height', 1000);

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


function renderNetworkUpdate(rootDom,nodesData,linksData){
  const w = rootDom.clientWidth;

  console.log(nodesData);
  
  const nodesDataArray = Array.from(nodesData.values());
  
  console.log(nodesDataArray);
  
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', 750)
    .attr('height', 1000);

  /*const nodes = plot
    .selectAll('.node')
    .data(nodesData, d => d.key);
  
  const nodesEnter = nodes.enter()
    .append('circle')
    .attr('class','node')
    .style('fill','black');
  
  console.log(nodes.merge(nodesEnter));
  
  nodes.merge(nodesEnter)
    .attr('r',d => {
      return d.value.totalEnters*3;
    })
    .attr('cx', d=>
          {return d.value.xy[0]})
    .attr('cy', d=>
          {return d.value.xy[1]});*/
  
  const nodes = plot.selectAll('.node')
    .data(nodesDataArray,d => d.schcode);
  
  console.log(nodes);
  console.log(nodes.enter());
  
  const nodesEnter = nodes.enter()
    .append('circle')
    .attr('class','node');
  
  console.log(nodes.merge(nodesEnter));
    
  /*nodes.merge(nodesEnter)
    .filter(d => d.xy)
    .attr('transform', d => {
      const xy = projection(d.lngLat);
      return `translate(${xy[0]}, ${xy[1]})`;
      console.log(xy[0] + ' ' + xy[1]);
    });*/
  nodes.merge(nodesEnter)
    //.attr('x', d => d.mobRate1)
    //.selectAll('circle')
    //.attr('r', d => scaleSize(d.total))
    .attr('r', 10)
    .style('fill-opacity', .3)
    .style('stroke', '#000')
    .style('stroke-width', '1px')
    .style('stroke-opacity', .2)
    .attr('cx', d=>
          {if(d.xy){
            return d.xy[0]
          }})
    .attr('cy', d=>
          {if(d.xy){
            return d.xy[1]}});
  
  
  
  
  
  
  const links = plot
    .selectAll('.link')
    .data(linksData);
  const linksEnter = links.enter().append('line').attr('class','link')
    .style('stroke-opacity',0.05)
    .style('stroke-width','1px')
    .style('stroke','black');
  
  links.merge(linksEnter)
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
    return ((d.value/2).toString() + 'px');
    })
    .style('stroke-opacity',d => d.value*d.value * 0.03);
  //.style('stroke-opacity',d => {return scaleWeight(d.value)});
  
  links.exit().remove();

}

export {renderNetwork,renderNetworkUpdate};