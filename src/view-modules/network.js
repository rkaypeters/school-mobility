import {min,max,select,selectAll,scalePow,transition} from 'd3';  


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


function renderNetworkUpdate(rootDom,nodesData,linksData){
  const w = rootDom.clientWidth;

  //console.log(nodesData);
  
  const nodesDataArray = Array.from(nodesData.values());
  
  //console.log(nodesDataArray);
  
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', 750)
    .attr('height', 1000);
  
  const nodes = plot.selectAll('.node')
    .data(nodesDataArray,d => d.schcode);
  
  const nodesEnter = nodes.enter()
    .append('circle')
    .attr('class','node');
  
  nodes.merge(nodesEnter)
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

function renderNetworkUpdate2(rootDom,nodesData,linksData,distcode){
  const w = rootDom.clientWidth;

  //console.log(nodesData);
  
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', 750)
    .attr('height', 1000);
  
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
    .attr('r',d => Math.sqrt(d.adm + 16))
    .style('fill-opacity', .7)
    .style('fill', d => {
      if(d.distcode ==distcode){
        return '#87C3CC'
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
  
  const labels = plot.selectAll('.label')
    .data(nodesData, d=> d.schcode);
  
  const labelsEnter = labels.enter()
    .append('text')
    .attr('class','label');
  
  labels.merge(labelsEnter)
    .text(d => d.schcode)
    .attr('x',d=>
          {if(d.xyNew){
            return d.xyNew[0]
          }})
    .attr('y', d=>
          {if(d.xyNew){
            return d.xyNew[1]}});
  
  console.log(distcode);
  
  const links = plot
    .selectAll('.link')
    .data(linksData);
    //.transition();
  const linksEnter = links.enter().append('line').attr('class','link')
    .style('stroke-opacity',0.05)
    .style('stroke-width','1px')
    .style('stroke','black');
  
  links.merge(linksEnter)
    .transition()
    .duration(1500)
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

}



export {renderNetwork,renderNetworkUpdate,renderNetworkUpdate2};
