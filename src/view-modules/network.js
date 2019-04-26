import {min,max,select,selectAll,scalePow,scaleLinear,transition,forceSimulation,forceCollide,forceX,forceY} from 'd3';  


function renderNetwork(rootDom,nodesData,linksData){
  //This is the original state-level view with all schools. It's no longer in use as I switched to a district aggregation.
  
  //Setting svg dimensions
  const w1 = select(rootDom).node().clientWidth;
  const h1 = window.innerHeight - select('.intro').node().clientHeight - select('.dropdown').node().clientHeight - 235;
  
  console.log(select('.intro').node().clientHeight);
  console.log(select('.dropdown').node().clientHeight); //need this piece

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
    
    
      console.log(nodes.merge(nodesEnter));
    
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
  const w1 = select(rootDom).node().clientWidth;
  const h1 = window.innerHeight - select('.intro').node().clientHeight - select('.dropdown').node().clientHeight - 235;
  
  //console.log(select('.intro').node().clientHeight);
  //console.log(select('.dropdown').node().clientHeight); //need this piece

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
    //.force('collide',forceCollide().radius(d => {if(d.adm){Math.cbrt(d.adm+8);}else{5;}}))
    .force('collide',forceCollide().radius(function(d){
      if(d.adm){
        return Math.cbrt(d.adm+64);
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
      const linksEnter = links.enter().append('line').attr('class','link')
        .style('stroke-opacity',0.05)
        .style('stroke-width','1px');

      links.merge(linksEnter)
        //.transition()
        //.duration(1000)
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
        //.style('stroke-width', d=>{
        //return ((d.value/4+.5).toString() + 'px');
        //})
        .style('stroke','black')
        //.style('stroke-opacity',d => d.value *0.03);
        .style('stroke-opacity',d => {
          if(d.source.distcode === '00'){
            return 0;
          }else{return d => d.value*d.value *0.05}});
  //});
    
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
      //console.log(nodesDataArray);

      const nodes = plot.selectAll('.node')
        .data(nodesDataArray, d => d.distcode);

      const nodesEnter = nodes.enter()
        .append('circle')
        .attr('class','node');

      nodes.merge(nodesEnter)
        //.transition()
        //.duration(1000)
        .attr('r',function(d){
          if(d.adm){
            return Math.cbrt(d.adm+64);
          }else{return 5;}
        })
        .style('fill-opacity', .95)
        .style('fill', d => {
          if(d.mobRate){
            return colorGenerator(d.mobRate);
          }else{return '#DCDCDC'}
        })
        .attr('cx',d => {if(d.x){
                return d.x
              }})
        .attr('cy',d => {if(d.y){
                return d.y
          }});
    
    
      //console.log(nodes.merge(nodesEnter));
      //console.log(linksData);
    
      plot.selectAll('.node').on('mouseover',console.log('mouse!'));
    
      //nodes.merge(nodesEnter).on('click', d=>{
          //dispatch.call('select:district',null,d.distcode);
      //});
    
    
    console.log(plot.selectAll('circle'));
    
       plot.selectAll('circle')
         .on('mouseover',
          console.log('mousy')
             /*function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(formatTime(d.date) + "<br/>"  + d.close)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            }*/
        )					
        .on('mouseout', 
            /*function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        }*/);
    
      nodes.merge(nodesEnter).on('click', d=>{
        //console.log(d);
        //console.log(d.distcode);
        //console.log(dispatch);
        
        dispatch.call('select:district',null,d.distcode);
        //console.log(activeSch);
        //console.log(d.schcode);
        
        //if(activeSch != d.schcode){
          var activeDist = d.distcode;
          console.log(activeDist);
          //console.log(activeSch);
          //dispatch.call('select:school',null,d.schcode);
          //console.log(plot.selectAll('.link'));

          plot.selectAll('.link')
          //links.merge(links.enter)
            .style('stroke', d=>{
              if(d.target.distcode == activeDist){
                return '#40848F'
                console.log('highlight');
              }else{return '#F6F6F6'}
              //console.log(d.target.schcode);
            })
            .style('stroke-width', d=>{
              //console.log(d.value);
              return (String(Math.sqrt(d.value)/4+.5) + 'px');
            });
            //.style('stroke-opacity',d => {
              //if(d.target.schcode ==activeSch){
                //1;
              //}else{if(d.target.distcode ==distcode){
                //d.value*d.value * 0.03;
              //}else{return '0'}};
            //});
        //}else{console.log('second click')};
      });
    
    
    
      // Labels
  
      /*const labels = plot.selectAll('.label')
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
                return d.x
              }})
        .attr('y',d => {if(d.y){
                return d.y
          }})*/
    
    console.log(plot.selectAll('circle'));
    
       plot.selectAll('circle')
         .on('mouseenter',
          console.log('mousy')
             /*function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(formatTime(d.date) + "<br/>"  + d.close)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            }*/
        )					
        .on('mouseout', 
            /*function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        }*/)
    
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
