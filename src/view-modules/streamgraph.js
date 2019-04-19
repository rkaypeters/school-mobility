import {nest,select,selectAll} from 'd3';

function renderStream(data){
  
  console.log('stream!');
  
  console.log(data);
  
  const originData = nest()
			.key(d => d.schcode_origin)
			.entries(data);
  
  console.log(originData);
  
  const w = window.innerWidth;
  const h = 200;
  
  //const plot = select('streamograph')
    //.attr('width', w)
    //.attr('height', h);
  
  const streams = select('.streamograph')
    .selectAll('stream')
    .data(originData);
  
  const streamsEnter = streams.enter()
    .append('path');
  
  
  console.log(streams.merge(streamsEnter));
  
  streams.exit().remove();
  
  
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