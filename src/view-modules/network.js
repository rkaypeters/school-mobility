import {min,max,select,selectAll,scalePow,scaleLinear,transition,forceSimulation,forceCollide,forceX,forceY,mouse} from 'd3';  

function renderNetworkUpdate(rootDom,nodesData,linksData,distcode,dispatch){
  //Creates the network graph for the district level (schools displayed, filtered by district) zoom
  
  nodesData.forEach(d =>{
    d.sort = 0;
    if(d.distcode==distcode){
      d.sort = 1;
    }
  });
  
  //Help current district data get to the front
  nodesData.sort(function(a, b){return a.sort - b.sort});
  
  //For experimenting with dropping force layout in small cases
  var numSch = nodesData.filter(d => d.distcode ==distcode).length;
  var minSch = 4;
  
  
  // Overall svg
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');
  const plot = svg.merge(svgEnter);
  

  plot.selectAll('.clickLabel').remove();
  plot.selectAll('.linkMouseOverLabel').remove();
  //This keeps the mouseover from the state view from persisting and throwing errors.
  plot.selectAll('.link')
          .on('mouseenter',e=>{
            
          });
  
  
  // Node colors
  var scaleR = scaleLinear().domain([20,50]).range([234,184]);
  var scaleG = scaleLinear().domain([20,50]).range([206,115]);
  var scaleB = scaleLinear().domain([20,50]).range([182,53]);
  var scaleL = scaleLinear().domain([0,60]).range([95,40]);
  var scaleS = scaleLinear().domain([0,60]).range([50,100]);

  var colorGenerator = (d => 'hsl(23,' +
    Math.round(scaleS(d)) +'%,' + 
    Math.round(scaleL(d)) + '%)');
  
  
  //Force simulation - to avoid overlapping schools
  forceSimulation(nodesData)
    .force('x',forceX(d=>
          {if(d.xyNew){
            return d.xyNew[0]
          }}))
    .force('y',forceY(d=>
          {if(d.xyNew){
            return d.xyNew[1]
          }}))
    //.force('collide',forceCollide().radius(d => Math.sqrt(d.adm + 4)+2))//I liked the extra spread from this but it pushed some small schools off the page and I wasn't able to handle that in time to submit.
    .force('collide',forceCollide().radius(d => Math.sqrt(d.adm + 4)))
    .tick([100])
    .alpha([.0005])
    .on('end',function(){
  
      // Links
      var activeSch;
      const links = plot
        .selectAll('.link')
        .data(linksData);
      const linksEnter = links.enter().append('line').attr('class','link')
        .style('stroke-opacity',0.05)
        .style('stroke-width','1px');
    
      //Change to allow overlaps if there is a very small number of schools in the district; charter schools were getting pushed out of the fram with the force layout since they pull from such far away places. It much more like a bubble chart than a map.
      //I was experimenting with this, but didn't get far enough to keep it. There are some issues with small chartesr than have two schools in one building.
      /*if(numSch<minSch){
        nodesData.forEach(d=>{
          if(d.xyNew){
            d.x=d.xyNew[0];
            d.y=d.xyNew[1];}
        });
        linksData.forEach(d=>{
          if(d.target.xyNew){
            d.target.x=d.target.xyNew[0];
            d.target.y=d.target.xyNew[1];
          };
          if(d.source.xyNew){
            d.source.x=d.source.xyNew[0];
            d.source.y=d.source.xyNew[1];
          };
        });
      };*/

    
      links.merge(linksEnter)
        .transition()
        .duration(1000)
        .attr('x1', d=> {if(d.target.x){return d.target.x;
          }else{return 20;}})
        .attr('y1', d=> {if(d.target.y){return d.target.y;
          }else{return 20;}})
        .attr('x2', d=> {if(d.source.x){return d.source.x;
          }else{return 20;}})
        .attr('y2', d=> {if(d.source.y){return d.source.y;
          }else{return 20;}})
    
      links.merge(linksEnter)
        .style('stroke-width', d=>{return ((d.value/4+.5).toString() + 'px');
        })
        .style('stroke','#A9A9A9')
        .style('stroke-opacity',d => {
          if(d.target.distcode ==distcode){
            d.value*d.value * 0.03;
          }else{return '0'}});

      links.exit().remove();
    
    
      // Nodes
      const nodes = plot.selectAll('.node')
        .data(nodesData, d => d.schcode);

      const nodesEnter = nodes.enter()
        .append('circle')
        .attr('class','node');
      
      nodes.exit().remove();

      nodes.merge(nodesEnter)
        .transition()
        .duration(1000)
        .attr('cx',d => {if(d.x){return d.x}})
        .attr('cy',d => {if(d.y){return d.y}})
        .attr('r',d => Math.sqrt(d.adm + 4))
        .style('fill-opacity', .95)
        .style('fill', d => {
          if(d.distcode ==distcode){
            return colorGenerator(d.mobRate);
          }else{return '#DCDCDC'}
        })
        .style('stroke-width', '1px')
        .style('stroke-opacity', .2);
    
    
      nodes.merge(nodesEnter).on('click', d=>{
        
        plot.selectAll('.clickLabel').remove();
        
        if(activeSch != d.schcode){
          var activeSch = d.schcode;  
          dispatch.call('select:school',null,d.schcode);

          plot.selectAll('.link')
            .style('stroke', d=>{
              if(d.target.schcode == activeSch){return '#40848F'
              }else{return '#F6F6F6'}})
            .style('stroke-opacity',d => {
              if(d.target.schcode ==activeSch){1;
              }else{if(d.target.distcode ==distcode){
                  d.value*d.value * 0.03;
                }else{return '0'}};
            });
        }else{console.log('second click')};
        
        if(numSch>12 && (d.adm <= 850 && d.mobRate <=35) && d.distcode ==distcode){
          plot.append('text')
            .attr('class','clickLabel')
            .text(d.schname15 + ', mobility rate: ' + Math.round(+d.mobRate*10)/10)
            .attr('x',d.x)
            .attr('y',d.y+3)
            .attr('opacity',1);
        };
        
        //Hover functionality when a relevant link is entered
        //I wanted to add this, but with so many nodes going off the page, I needed to adjust the location of the display and did not have time for that... So many features I'd like to add or small changes I'd like to make.
        /*links.merge(linksEnter)
          .on('mouseenter',e=>{
            if(e.target.schcode == activeSch){
              
              var yDist, xDist, yMove, xMove;
              if(e.source.y){yDist = e.source.y - e.target.y}else{yDist = 0};
              if(e.source.x){xDist = e.source.x - e.target.x}else{xDist = 0};
              //if(yDist>(e.target.y)
              
              console.log(plot.clientHeight);
              console.log(plot.cleintWidth);
              
              console.log(xDist,yDist);
              
              plot.append('text')
                .attr('class','linkMouseOverLabel')
                .text(f =>{
                  var myString = e.value + ' student';
                  if(e.value!=1){myString += 's'};
                  myString += ' entered from ';
                  if(e.source.schname){
                    myString += e.source.schname + '.'
                  }else{myString += 'out of state.'};
                  return(myString);
                })
                .attr('x',(e.source.x+e.target.x)/2)
                      //e=>{
                  //var point = mouse(this);
                  //return(point[0])
                  //return((e.source.x+e.target.x)/2)
                //})
                .attr('y',(e.source.y+e.target.y)/2)
                .attr('opacity',1);
            }
          })
          .on('mouseleave', d=>{
            plot.selectAll('.linkMouseOverLabel')
              .transition()
              .duration(400)
              .remove();
          })*/
        
      })
    
      //Hover labels just for cases in large districts that aren't alreayd labelled
      .on('mouseenter',d =>{
        if(numSch>12){
          if((d.adm <= 800 && d.mobRate <=35) && d.distcode ==distcode){
          
            plot.append('text')
              .attr('class','mouseOverLabel')
              .text(d.schname15 + ', mobility rate: ' + Math.round(+d.mobRate*10)/10)
              .attr('x',d.x)
              .attr('y',d.y+3)
              .attr('opacity',1);
            
            labels.merge(labelsEnter)
              .transition()
              .duration(200)
              .attr('opacity', d=> 0);
          }
        };
      })
      .on('mouseleave',d =>{
        plot.selectAll('.mouseOverLabel')
          .transition()
          .duration(400)
          .remove();
        
        labels.merge(labelsEnter)
          .transition()
          .duration(400)
          .attr('opacity', d=> {if(numSch>12){
            if(d.adm > 800 || d.mobRate >35){return 1}else{return 0}
          }else{return 1}});
      });
    
    
      // Labels - overall
      const labels = plot.selectAll('.label')
        .data(nodesData, d=> d.schcode);

      const labelsEnter = labels.enter()
        .append('text')
        .attr('class','label');

      labels.merge(labelsEnter)
        .transition()
        .duration(1000)
        .text(d => {if(d.distcode ==distcode){
            return (d.schname15 + ', mobility rate: ' + d.mobRate)}
        })
        .attr('x',d => {if(d.x){
                return d.x +Math.sqrt(d.adm + 4)/4
              }})
        .attr('y',d => {if(d.y){
                return d.y+3
          }})
        .attr('opacity', d=> {if(numSch>12){
          if(d.adm > 800 || d.mobRate >35){return 1}else{return 0}
        }else{return 1}});
  
  });

}




function renderLeaNetwork(rootDom,nodesData,linksData,dispatch){
  
  //Format dimensions
  const w1 = select(rootDom).node().clientWidth;
  const h1 = window.innerHeight - select('.intro').node().clientHeight - select('.dropdown').node().clientHeight - 325;

  var w, h;
  if(w1>=400){
     w = w1;
  }else{ w = 400;};
  if(h1 >= 600){
    h = h1;
  }else{h = 600;};
  
  const nodesDataArray = Array.from(nodesData.values());
  
  
  // Overall svg
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', w)
    .attr('height', h);
  
  var activeDist ='';
  plot.selectAll('.label').remove();
  plot.selectAll('.clickLabel').remove();
  
  
  // Node colors
  var scaleR = scaleLinear().domain([20,50]).range([234,184]);
  var scaleG = scaleLinear().domain([20,50]).range([206,115]);
  var scaleB = scaleLinear().domain([20,50]).range([182,53]);
  var scaleL = scaleLinear().domain([0,60]).range([95,40]);
  var scaleS = scaleLinear().domain([0,60]).range([50,100]);

  var colorGenerator = (d => 'hsl(23,' + Math.round(scaleS(d)) +'%,' + 
                        Math.round(scaleL(d))
                          + '%)');
  
  //Force simulation to keep nodes from overlapping... a little odd in the state view, but I think helfpul.
  forceSimulation(nodesDataArray)
    .force('x',forceX(d=>
          {if(d.xy){
            return d.xy[0]
          }}))
    .force('y',forceY(d=>
          {if(d.xy){
            return d.xy[1]
          }}))
    .force('collide',forceCollide().radius(function(d){
      if(d.adm){
        return (Math.cbrt(d.adm+64)+3);
      }else{return 5;}
    }))
    .tick([100])
    .alpha([.0005])  
    .on('end',function(){
  
    
      // Links
    
      const links = plot
        .selectAll('.link')
        .data(linksData);
      const linksEnter = links.enter()
        .append('line')
        .attr('class','link');
    
      links.merge(linksEnter)
        .transition()
        .duration(500)
        .style('stroke-width','1px')
        .attr('x1', d=> {
          if(d.target.x){return d.target.x;
            }else{return 20;}})
        .attr('y1', d=> {
          if(d.target.y){return d.target.y;
            }else{return 20;}})
        .attr('x2', d=> {
          if(d.source.x){return d.source.x;
            }else{return 20;}})
        .attr('y2', d=> {
          if(d.source.y){return d.source.y;
          }else{return 20;}})
        .style('stroke','#A9A9A9')
        .style('stroke-opacity',d => {
          if(d.source.distcode === '00'){
            return 0;
          }else{return d.value*d.value *0.03;}});

      links.exit().remove();
    
    
      // Nodes

      const nodes = plot.selectAll('.node')
        .data(nodesDataArray, d => d.distcode);

      const nodesEnter = nodes.enter()
        .append('circle')
        .attr('class','node');

      nodes.merge(nodesEnter)
        .transition()
        .duration(500)
        .attr('r',function(d){
          if(d.adm){return Math.cbrt(d.adm+64);
          }else{return 5;}})
        .style('fill-opacity', .95)
        .style('fill', d => {
          if(d.mobRate){return colorGenerator(d.mobRate);
          }else{return '#DCDCDC'}})
        .attr('cx',d => {if(d.x){
          return d.x}})
        .attr('cy',d => {if(d.y){
          return d.y}});

    
      //Highlighting functionality when a node is clicked
      nodes.merge(nodesEnter).on('click', d=>{
        dispatch.call('select:district',null,d.distcode);
      
        activeDist = d.distcode;

        plot.selectAll('.link')
          .style('stroke', e=>{
            if(e.target.distcode == activeDist){
              return '#40848F'
              console.log('highlight');
            }else{return '#F6F6F6'}})
          .style('stroke-width', e=>{
            if(e.target.distcode == activeDist){
              return 2;}})
          .style('stroke-opacity', e =>{
            if(e.target.distcode ==activeDist){
              return e.value*e.value * 0.06
            }else{if(e.source.distcode =='00'){
              return 0
            }else{return e.value*e.value * 0.03}}});
        
        plot.selectAll('.clickLabel').remove();
        
        plot.append('text')
            .attr('class','clickLabel')
            .text(d.distname16 + ', mobility rate: ' + Math.round(+d.mobRate*10)/10)
            .attr('x',d.x)
            .attr('y',d.y+3)
            .attr('opacity',1);
        
        //Hover functionality when a relevant link is entered
        links.merge(linksEnter)
          .on('mouseenter',e=>{
            if(e.target.distcode == activeDist){
              plot.append('text')
                .attr('class','linkMouseOverLabel')
                .text(f =>{
                  var myString = e.value + ' student';
                  if(e.value!=1){myString += 's'};
                  myString += ' entered from ';
                  if(e.source.distname){
                    myString += e.source.distname + '.'
                  }else{myString += 'out of state.'};
                  return(myString);
                })
                .attr('x',(e.source.x+e.target.x)/2)
                .attr('y',(e.source.y+e.target.y)/2)
                .attr('opacity',1);
            }
          })
          .on('mouseleave', d=>{
            plot.selectAll('.linkMouseOverLabel')
              .transition()
              .duration(400)
              .remove();
          })
      })
      //Hover functionality for entering a node
      .on('mouseenter',d =>{
        plot.append('text')
          //.transition()
          //.duration(1000)
          .attr('class','mouseOverLabel')
          .text(e =>{
            var myString;
            if(d.distname16){myString = d.distname16
              + ', mobility rate: '
              + Math.round(+d.mobRate*10)/10
            }else{myString = 'Out of state'}
            return myString;
          })
          .attr('x',d.x)
          .attr('y',d.y+4)
          .attr('opacity',1);
      })
      .on('mouseleave',d =>{
        plot.selectAll('.mouseOverLabel')
          .transition()
          .duration(200)
          .remove();
      });
    
    nodes.exit().remove();
    links.exit().remove();
  
  });
  

}

function renderNetwork(rootDom,nodesData,linksData){
  //This is the original state-level view with all schools. It's no longer in use as I switched to a district aggregation.
  
  //Setting svg dimensions
  const w1 = select(rootDom).node().clientWidth;
  const h1 = window.innerHeight - select('.intro').node().clientHeight - select('.dropdown').node().clientHeight - 235;

  var w, h;
  
  if(w1>=400){
     w = w1;
  }else{ w = 400;};
  if(h1 >= 600){
    h = h1;
  }else{h = 600;};
  
  
  //Set up full svg
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');

  const plot = svg.merge(svgEnter)
    .attr('width', w)
    .attr('height', h);

  plot.selectAll('.node')
    .remove();
  plot.selectAll('.label')
    .remove();
  
  //Display links
  const links = plot
    .selectAll('.link')
    .data(linksData);
  const linksEnter = links.enter().append('line').attr('class','link');

  links.merge(linksEnter)
    .style('stroke-opacity',0.05)
    .style('stroke-width','1px')
    .style('stroke','#404040')
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
    .style('stroke-opacity',d => {return (d.value * 0.05)});
  
  links.exit().remove();

};

export {renderNetwork,renderNetworkUpdate,renderLeaNetwork};
