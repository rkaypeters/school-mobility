import {min,max,select,selectAll,scalePow,scaleLinear,transition,forceSimulation,forceCollide,forceX,forceY,mouse} from 'd3';  


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


function renderNetworkUpdate(rootDom,nodesData,linksData,distcode,dispatch){
  //Creates the network graph for the district level (schools displayed, filtered by district) zoom
  
  // Overall svg
  const svg = select(rootDom)
    .selectAll('svg')
    .data([1]);
  const svgEnter = svg.enter()
    .append('svg');
  const plot = svg.merge(svgEnter);
  
  // Node colors
  var scaleR = scaleLinear().domain([20,50]).range([234,184]);
  var scaleG = scaleLinear().domain([20,50]).range([206,115]);
  var scaleB = scaleLinear().domain([20,50]).range([182,53]);
  var scaleL = scaleLinear().domain([0,60]).range([95,40]);
  var scaleS = scaleLinear().domain([0,60]).range([50,100]);

  var colorGenerator = (d => 'hsl(23,' +
    Math.round(scaleS(d)) +'%,' + 
    Math.round(scaleL(d)) + '%)');

  //var activeSch;
  
  
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

      links.merge(linksEnter)
        .transition()
        .duration(1000)
        .attr('x1', d=> {
          if(d.target.x){
              return d.target.x;
          }else{
              return 20;
          }
        })
        .attr('y1', d=> {
          if(d.target.y){
              return d.target.y;
          }else{
              return 20;
          }
        })
        .attr('x2', d=> {
          if(d.source.x){
              return d.source.x;
          }else{
              return 20;
          }
        })
        .attr('y2', d=> {
          if(d.source.y){
              return d.source.y;
          }else{
              return 20;
          }
        })
        .style('stroke-width', d=>{
        return ((d.value/4+.5).toString() + 'px');
        })
        .style('stroke','#A9A9A9')
        .style('stroke-opacity',d => {
          if(d.target.distcode ==distcode){
            d.value*d.value * 0.03;
          }else{return '0'}});
    
      //links.merge(linksEnter).on('click', console.log('mouse!');
            //linkMouseOver)
        //.on('mouseout', linkMouseOut);;
        //.style('stroke', d =>{
          //if(d.target.distcode == distcode){
            //return 'green';
          //}else{return 'white'}
      //});
      //.style('stroke-opacity',d => {return scaleWeight(d.value)});

      //console.log(links.merge(linksEnter));

      links.exit().remove();
    
    
      // Nodes
    
      //console.log(nodesData);

      const nodes = plot.selectAll('.node')
        .data(nodesData, d => d.schcode);

      const nodesEnter = nodes.enter()
        .append('circle')
        .attr('class','node');
      
      nodes.exit().remove();

      nodes.merge(nodesEnter)
        .transition()
        .duration(1000)
        .attr('r',d => Math.sqrt(d.adm + 4))
        .style('fill-opacity', .95)
        .style('fill', d => {
          if(d.distcode ==distcode){
            return colorGenerator(d.mobRate);
          }else{return '#DCDCDC'}
        })
        .style('stroke-width', '1px')
        .style('stroke-opacity', .2)
        .attr('cx',d => {if(d.x){
                return d.x
              }})
        .attr('cy',d => {if(d.y){
                return d.y
          }});
    
    
      //console.log(nodes.merge(nodesEnter));
    
      plot.selectAll('.node').on('mouseover',console.log('mouse!'));
    
      nodes.merge(nodesEnter).on('click', d=>{
        //console.log(activeSch);
        //console.log(d.schcode);
        
        if(activeSch != d.schcode){
          var activeSch = d.schcode;  
          console.log(activeSch);
          dispatch.call('select:school',null,d.schcode);
          console.log(plot.selectAll('.link'));

          plot.selectAll('.link')
          //links.merge(links.enter)
            .style('stroke', d=>{
              if(d.target.schcode == activeSch){
                return '#40848F'
                console.log('highlight');
              }else{return '#F6F6F6'}
              //console.log(d.target.schcode);

            })
            .style('stroke-opacity',d => {
              if(d.target.schcode ==activeSch){
                1;
              }else{if(d.target.distcode ==distcode){
                d.value*d.value * 0.03;
              }else{return '0'}};
            });
        }else{console.log('second click')};
      });
    
    
    
      // Labels
      const labels = plot.selectAll('.label')
        .data(nodesData, d=> d.schcode);

      const labelsEnter = labels.enter()
        .append('text')
        .attr('class','label');

      labels.merge(labelsEnter)
        .transition()
        .duration(1000)
        .text(d => 
              {if(d.distcode ==distcode){
            return d.schname
          }
        })
        .attr('x',d => {if(d.x){
                return d.x +Math.sqrt(d.adm + 4)/4
              }})
        .attr('y',d => {if(d.y){
                return d.y+3
          }})
  
  });
  
  console.log(plot.selectAll('.link'));
  console.log(plot.selectAll('.node'));
  
  //plot.selectAll('.link').on('click', console.log('clicked a link!'));
            //linkMouseOver)
        //.on('mouseout', linkMouseOut);;
        //.style('stroke', d =>{
          //if(d.target.distcode == distcode){
            //return 'green';
          //}else{return 'white'}
      //});
      //.style('stroke-opacity',d => {return scaleWeight(d.value)});

      //console.log(links.merge(linksEnter));
  
  function linkMouseOver(d, i) {  // Add interactivity

    // Use D3 to select element, change color and size
    //select(this).attr({
      //fill: "orange",
      //r: radius * 2
    //});

    // Specify where to put label of text
    /*svg.append("text").attr({
       id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
        x: function() { return xScale(d.x) - 30; },
        y: function() { return yScale(d.y) - 15; }
    })
    .text(function() {
      return [d.x, d.y];  // Value of the text
    });*/
    
    console.log('link mouseover!');
    
  };

  function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    /*d3.select(this).attr({
      fill: "black",
      r: radius
    });

    // Select text by id and then remove
    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location*/
    
    console.log('link mouseout!');
    
  }
  

}




function renderLeaNetwork(rootDom,nodesData,linksData,dispatch){
  
  //Format dimensions
  const w1 = select(rootDom).node().clientWidth;
  const h1 = window.innerHeight - select('.intro').node().clientHeight - select('.dropdown').node().clientHeight - 275;

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
  
  plot.selectAll('.label')
    .remove();
  
  
  // Node colors
  var scaleR = scaleLinear().domain([20,50]).range([234,184]);
  var scaleG = scaleLinear().domain([20,50]).range([206,115]);
  var scaleB = scaleLinear().domain([20,50]).range([182,53]);
  var scaleL = scaleLinear().domain([0,60]).range([95,40]);
  var scaleS = scaleLinear().domain([0,60]).range([50,100]);

  var colorGenerator = (d => 'hsl(23,' + Math.round(scaleS(d)) +'%,' + 
                        Math.round(scaleL(d))
                          + '%)');

  //var activeSch;
  
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
    
      //var activeSch;
      const links = plot
        .selectAll('.link')
        .data(linksData);
      const linksEnter = links.enter()
        .append('line')
        .attr('class','link');
        //.attr('class',d => 'link'+d.target.distcode);
    
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
      
      /*const nodeLabelsEnter = nodesEnter.append('text')
        .attr('class','label')
        //.transition()
        //.duration(500)
        .text(d => d.distname)
        .attr('x',d => {if(d.x){
                return d.x
              }})
        .attr('y',d => {if(d.y){
                return d.y
          }})
        .attr('opacity',1);*/

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
    
      console.log(nodes.merge(nodesEnter));
      //console.log(linksData);
    
      //plot.selectAll('.node').on('mouseover',console.log('mouse!'));

    
      //Highlighting functionality when a node is clicked
      nodes.merge(nodesEnter).on('click', d=>{
        dispatch.call('select:district',null,d.distcode);
      
        var activeDist = d.distcode;

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
            //.transition()
            //.duration(1000)
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
                  myString += ' moved from ';
                  if(e.source.distname){
                    myString += e.source.distname + '.'
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
          })
      })
      //Hover functionality for entering a node
      .on('mouseenter',d =>{
        plot.append('text')
            //.transition()
            //.duration(1000)
            .attr('class','mouseOverLabel')
            .text(d.distname16 + ', mobility rate: ' + Math.round(+d.mobRate*10)/10)
            .attr('x',d.x)
            .attr('y',d.y+3)
            .attr('opacity',1);
      })
      .on('mouseleave',d =>{
        plot.selectAll('.mouseOverLabel')
          .transition()
          .duration(200)
          .remove();
      });
    
    console.log(nodesDataArray);
    console.log(linksData);
    
    
    
      // Labels
  
      /*const labels = plot.selectAll('.label')
        .data(nodesDataArray, d=> d.distcode);

      const labelsEnter = labels.enter()
        .append('text')
        .attr('class','label');

      labels.merge(labelsEnter)
        .transition()
        .duration(500)
        .text(d => d.distname)
        .attr('x',d => {if(d.x){
                return d.x
              }})
        .attr('y',d => {if(d.y){
                return d.y
          }})
        .attr('opacity',0);/*
    
    //console.log(plot.selectAll('circle'));
    
       /*plot.selectAll('circle')
         .on('mouseenter',
          console.log('mousy')
             /*function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(formatTime(d.date) + "<br/>"  + d.close)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            }*
        )					
        .on('mouseout', 
            console.log('mousemouse')
            /*function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })*/
    
    nodes.exit().remove();
    links.exit().remove();
  
  });
  
  function linkMouseOver(d, i) {  // Add interactivity

    // Use D3 to select element, change color and size
    //select(this).attr({
      //fill: "orange",
      //r: radius * 2
    //});

    // Specify where to put label of text
    /*svg.append("text").attr({
       id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
        x: function() { return xScale(d.x) - 30; },
        y: function() { return yScale(d.y) - 15; }
    })
    .text(function() {
      return [d.x, d.y];  // Value of the text
    });*/
    
    console.log('link mouseover!');
    
  };

  function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    /*d3.select(this).attr({
      fill: "black",
      r: radius
    });

    // Select text by id and then remove
    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location*/
    
    console.log('link mouseout!');
    
  }
  

}



export {renderNetwork,renderNetworkUpdate,renderLeaNetwork};
