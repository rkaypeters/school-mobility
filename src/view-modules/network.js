import {min,max,select,selectAll} from 'd3';  


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

  console.log(links.exit());
  
  links.exit().remove();

}

export default renderNetwork;
