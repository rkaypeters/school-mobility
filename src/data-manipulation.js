import {min, max, geoMercator,scaleLinear} from 'd3';    
    
    
function networkSetup(data){

  //console.log(data);
  const nodesData = new Map();
  const linksData = [];

  data.forEach(d => {
    const newLink = {
      value: d.enters
    };

    if(!nodesData.get(d.schcode_dest)){
      const newNode = {
        schcode: d.schcode_dest,
        distcode: d.distcode_dest,
        xy: d.xy_dest,
        totalEnters: newLink.value
      }; 

      nodesData.set(d.schcode_dest,newNode);
      newLink.target = newNode;
    }else{
      const existingNode = nodesData.get(d.schcode_dest);
        existingNode.totalEnters += newLink.value;
        newLink.target = existingNode;
    };

    if(!nodesData.get(d.schcode_origin)){
      const newNode = {
        schcode: d.schcode_origin,
        xy: d.xy_origin,
        totalEnters: 0
      };
      nodesData.set(d.shcode_origin,newNode);
      newLink.source = newNode;
    }else{
      const existingNode = nodesData.get(d.schcode_origin);
      newLink.source = existingNode;
    }
    
    linksData.push(newLink);  
  })

  //console.log(nodesData);
  //console.log(linksData);

  return[nodesData,linksData];

}




// returns xy, added to the objects for an array data, with object property lndLat, baed on rootDom specifications

function myProjection(rootDom,data,myScale){
  const w = rootDom.clientWidth;
  const h = rootDom.clientHeight;

  const projection_tm = geoMercator()

  const minLng = min(data, function(d){
    return d.lngLat[0];
  })
  const maxLng = max(data, function(d){
    return d.lngLat[0];
  })
  const minLat = min(data, function(d){
    return d.lngLat[1];
  })
  const maxLat = max(data, function(d){
    return d.lngLat[1];
  })

  const projection = geoMercator()
    .scale(myScale)
    .center([(maxLng+minLng)/2,(maxLat+minLat)/2+.2])
    //.center(289,127)
    //.translate([w/2,h/2]);

  data.forEach(d=>
     {d.xy = projection(d.lngLat);
     }
  );
  
  return(data);

}



///such a mess

function adjustProjection(data){
  
  const h = 1000;
  const w = 750;//NEED TO ADJUST FOR FLEXIBILITY!
  const margin = 20;
  
  console.log(data);
  
  const minX = min(data, d => d.target.xy[0]);
  const maxX = max(data, d => d.target.xy[0]);
  const minY = min(data, d => d.target.xy[1]);
  const maxY = max(data, d => d.target.xy[1]);
  
  const yProportion = (maxY - minY)/(h - 2*margin);
  const xProportion = (maxX - minX)/(w - 2*margin);
  
  if(yProportion < xProportion){
    console.log('X is the limitation');
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/8,7*w/8]);
    
    var yNewRange = (maxY-minY)*3*w/(4*(maxX-minX));
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/2-3*yNewRange/4,h/2+3*yNewRange/4]);
    
  }else{
    console.log('Y is the limitation');
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/8,7*h/8]);
    
    var xNewRange = (maxX-minX)*3*h/(4*(maxY-minY));
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/2-3*xNewRange/4,w/2+3*xNewRange/4]);
    
  }
  
  
  /*var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/4,3*w/4]);
    
  var yNewRange = (maxY-minY)*w/(2*(maxX-minX));
    
  var scaleY = scaleLinear()
    .domain([minY,maxY])
      //.range([h/2-yNewRange/2,h/2+yNewRange/2]);
    .range([h/4,3*h/4]);*/
  
  
  console.log(minX);
  console.log(maxX);
  console.log(minY);
  console.log(maxY);
  
  
  data.forEach(d => {
    const newX = scaleX(d.target.xy[0]);
    const newY = scaleY(d.target.xy[1]);
    
    //console.log(scaleX(d.source.xy[0]));
    
    d.target.xyNew = [newX,newY];
    
    if(d.source.xy){
      const newSX = scaleX(d.source.xy[0]);
      const newSY = scaleY(d.source.xy[1]);
      
      d.source.xyNew = [newSX,newSY];
    } else{
      const newSX = 20;
      const newSY = 20;
      
      d.source.xyNew = [newSX,newSY];
    };
    
  })
  
  
  console.log(data);
  
  return(data);
  
  
}


export {networkSetup,myProjection,adjustProjection};
