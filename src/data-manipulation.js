import {min, max, geoMercator,scaleLinear,select,nest,key,entries} from 'd3';    
    
    

function formatEnters(metadataSch,mobstab,geodata,entersdata){
  
  const metaFilter = metadataSch.filter(d => d.status ==1).filter(d=> d.adminSite == 'N').filter(d => d.remove ==0);
  
  const meta_tmp = metadataSch.map(d => [d.schcode,d]);
  const metaMap = new Map(meta_tmp);
  
  const mobstab_tmp = mobstab.map(d => [d.schcode,d]);
  const mobstabMap = new Map(mobstab_tmp);

  
  myProjection(select('.network').node(),geodata); //still need to set up network DOM dimensions
    //.push({schcode: '00000',xy: [20,20]});

  const geo_tmp = geodata.map(d => [d.schcode,d]);
  const geoMap = new Map(geo_tmp);
  
  const enters_tmp = entersdata.filter(d => d.reportID ==77)
    .filter(d => d.schcode_dest != ' ')
    .filter(d => d.schcode_origin != d.schcode_dest);
  //console.log(enters_tmp);
  
  metaFilter.forEach(d=>{
    var count = 0;
    enters_tmp.forEach(e=>{
      if(d.schcode === e.schcode_dest){
        count += 1;
      }
    });
    if(count == 0){
      //console.log(d.schcode);
      enters_tmp.push({
        reportID: '77',
        schcode_dest: d.schcode,
        schcode_origin: '00000',
        enters: 0});
    };
    
  });
  
  //console.log(enters_tmp);
  
  
  const enters1718 = enters_tmp
    .map(d => {
      const md = metaMap.get(d.schcode_dest);
      d.adminSite_dest = md.adminSite;
      d.distcode_dest = md.distcode;
      d.schname30_dest = md.schname30;
      d.gradeCfg_dest = md.gradeCfg;
      return d;
    })
    .map( d =>{
      const msd = mobstabMap.get(d.schcode_dest);
      d.adm = msd.adm;
      d.mobRate = msd.mobRate1;
      return d;
    })
    .map(d => {
      //if (d.schcode_origin != '00000' && d.schcode_origin != ' '){
      if (metaMap.get(d.schcode_origin)){
        //console.log('step 1!');
        const md = metaMap.get(d.schcode_origin);
        if(md.distcode){
          d.adminSite_origin = md.adminSite;
          d.distcode_origin = md.distcode;
          d.schname30_origin = md.schname30;
          d.gradeCfg_origin = md.gradeCfg;
        }
        //return d;
        //console.log(md);
      } return d;
      })
      .filter(d => d.adminSite_dest == 'N')
      .map(d => {
          const gd = geoMap.get(d.schcode_dest);
          if(gd){
              d.lngLat_dest = gd.lngLat;
              d.xy_dest = gd.xy;
              //console.log('geoMap!');
          }else{//console.log('no geoMap!');
            if(d.schcode_dest === '00000'){
               d.xy_dest = [20,20];
                console.log('out of state');
               //};
               //if(d.schcode === /190$/){
                  //console.log('190 school');
                  //d.xy_dest = [20,700];
               //}
                }else{d.xy_dest = [20,700];
                     console.log('other');}
               }
          const go = geoMap.get(d.schcode_origin);
          if(go){
              d.lngLat_origin = go.lngLat;
              d.xy_origin = go.xy;
          }else{if(d.schcode_origin === '00000'){
               d.xy_origin = [20,20];
                //console.log('out of state');
               //};
               //if(d.schcode === /190$/){
                  //console.log('190 school');
                  //d.xy_dest = [20,700];
               //}
                }else{d.xy_origin = [20,700];}
               }
        //else{
          //  d.xy_origin = [20,700];
          //}
          return d;
          });
  
  //console.log(enters1718);
  
  const entersBySch = nest()
    .key(d => d.schcode_dest)
    .entries(enters1718);
  
  //console.log(entersBySch);
  
  return(enters1718);
  
}


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
        totalEnters: newLink.value,
        adm: +d.adm,
        mobRate: +d.mobRate,
        schname: d.schname30_dest
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
      }
      if(d.distcode_origin){
          newNode.distcode = d.distcode_origin;
          newNode.adm = d.adm_origin;
          newNode.schname = d.schname30_dest;
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




// returns xy, added to the objects for an array data, with object property lndLat, based on rootDom specifications

function myProjection(rootDom,data){

  const wW = window.innerWidth;
  const wH = window.innerHeight;

  //console.log(wW);
  //console.log(data);
  
  var w, h;
  
  if(wW>=400){
     w = wW;
  }else{ w = 400;};
  if(wH>=800){
    h = wH-200;
  }else{h = 600;};
  
  
  const myScale = 50*h;
  
  //console.log(data);
  //console.log(w);
  //console.log(h);
  
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
    .center([(maxLng+minLng-.35)/2,(maxLat+minLat)/2+.2])
    //.center(289,127)
    //.translate([w/2,h/2]);

  data.forEach(d => {d.xy = projection(d.lngLat);
                    }
  );
  
  return(data);

}



///such a mess

function adjustProjection(data){
  
  const h = 1000;
  const w = 750;//NEED TO ADJUST FOR FLEXIBILITY!
  const margin = 20;
  
  //console.log(data);
  //console.log(data.length);
  
  var minX;
  var maxX;
  var minY;
  var maxY;
  
  if(data.length>=6){
    
    //console.log('length GT 6');
    minX = min(data, d => d.target.xy[0]);
    maxX = max(data, d => d.target.xy[0]);
    minY = min(data, d => d.target.xy[1]);
    maxY = max(data, d => d.target.xy[1]);
    
    //console.log(minY);
    //console.log(maxY);
    
  }else{ ///need to fix this; it's not working with undefined sources
    minX = Math.min(min(data, d=> d.target.xy[0]),min(data,d => d.source.xy[0]));
    maxX = Math.max(max(data, d=> d.target.xy[0]),max(data,d => d.source.xy[0]));
    minY = Math.min(min(data, d=> d.target.xy[1]),min(data,d => d.source.xy[1]));
    maxY = Math.max(max(data, d=> d.target.xy[1]),max(data,d => d.source.xy[1]));
  };
  
  const yProportion = (maxY - minY)/(h - 2*margin);
  const xProportion = (maxX - minX)/(w - 2*margin);
  
  
  if(yProportion < xProportion){
    //console.log('X is the limitation');
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/8,7*w/8]);
    
    var yNewRange = (maxY-minY)*3*w/(4*(maxX-minX));
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/2-3*yNewRange/4,h/2+3*yNewRange/4]);
    
  }else{
    //console.log('Y is the limitation');
    
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
  
  
  //console.log(minX);
  //console.log(maxX);
  //console.log(minY);
  //console.log(maxY);
  
  
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
  
  
  //console.log(data);
  
  return(data);
  
  
}


function adjustProjection2(nodesData,linksData,distcode){
  
  console.log(nodesData);
  console.log(distcode);
  
  const minDNodes = 4;
  //const h = 1000;
  //const w = 750;//NEED TO ADJUST FOR FLEXIBILITY!
  const cW = window.innerWidth;
  const cH = window.innerHeight;

  var w, h;
  
  if(cW>=400){
     w = cW;
  }else{ w = 400;};
  if(cH>=800){
    h = cH-200;
  }else{h = 600;};
  
  const margin = 20;
  
  const nodesDataArray = Array.from(nodesData.values());
  
  //console.log(nodesDataArray);
  
  var filteredNodes = nodesDataArray.filter(d => d.distcode == distcode);
  //const filteredLinks = linksData.filter(d => d.target.distcode == distcode);
  
  //console.log(filteredNodes);
  //console.log(filteredLinks);
  
  //var minX, maxX, minY, maxY;
  
  if (filteredNodes.length >= minDNodes){
    //console.log('greater than D');
    
    /*minX = min(filteredNodes, d => d.xy[0]);
    maxX = max(filteredNodes, d => d.xy[0]);
    minY = min(filteredNodes, d => d.xy[1]);
    maxY = max(filteredNodes, d => d.xy[1]);
    
    console.log(minY);
    console.log(maxY);*/
    
  }else{
    console.log('less than D - edit filtered Nodes now');
  };
  
  
  var minX = min(filteredNodes, d => d.xy[0]);
  var maxX = max(filteredNodes, d => d.xy[0]);
  var minY = min(filteredNodes, d => d.xy[1]);
  var maxY = max(filteredNodes, d => d.xy[1]);
    
  //console.log(minY);
  //console.log(maxY);
  
  const yProportion = (maxY - minY)/(h - 2*margin);
  const xProportion = (maxX - minX)/(w - 2*margin);
  
  //console.log(yProportion);
  //console.log(xProportion);
  
  
  if(yProportion < xProportion){
    //console.log('X is the limitation');
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/8,7*w/8]);
    
    var yNewRange = (maxY-minY)*3*w/(4*(maxX-minX));
    //console.log(yNewRange);
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/2-3*yNewRange/4,h/2+3*yNewRange/4]);
    
  }else{
    //console.log('Y is the limitation');
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/8,7*h/8]);
    
    var xNewRange = (maxX-minX)*3*h/(4*(maxY-minY));
    //console.log(xNewRange);
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/2-3*xNewRange/4,w/2+3*xNewRange/4]);
    
  }
  
  
  nodesDataArray.forEach(d =>{
    
    if(d.xy){
      const newX = scaleX(d.xy[0]);
      const newY = scaleY(d.xy[1]);
      
      d.xyNew = [newX,newY];
    }else{
      d.xyNew = [20,20];
    };
    
  });
  
  //console.log(nodesDataArray);
  
  const nodes_tmp = nodesDataArray.map(d => {
    return [d.schcode, d]
  });
  const newNodesMap = new Map(nodes_tmp);
  
  newNodesMap.set('00000',{xyNew:[20,20]});
  
  //console.log(newNodesMap);
  
  linksData.map(d =>{
    if(newNodesMap.get(d.source.schcode)){
      const mS = newNodesMap.get(d.source.schcode);
      d.source.xyNew = mS.xyNew;
      return d;
    }
    
    if(newNodesMap.get(d.target.schcode)){
      const mT = newNodesMap.get(d.target.schcode);
      d.target.xyNew = mT.xyNew;
      return d;
    }
    
  })
  
  //console.log(linksData);
  
  return([nodesDataArray,linksData]);
  
}






function adjustProjection3(nodesData,linksData,distcode){
  
  console.log(nodesData);
  //console.log(distcode);
  
  const minDNodes = 3;
  //const h = 1000;
  //const w = 750;//NEED TO ADJUST FOR FLEXIBILITY!
  const cW = window.innerWidth;
  const cH = window.innerHeight;

  var w, h;
  
  if(cW>=400){
     w = cW;
  }else{ w = 400;};
  if(cH>=800){
    h = cH-200;
  }else{h = 600;};
  
  const margin = 20;
  
  const nodesDataArray = Array.from(nodesData.values());
  
  //console.log(nodesDataArray);
  
  var filteredNodes = nodesDataArray.filter(d => d.distcode == distcode);
  
  if (filteredNodes.length < minDNodes){
    
    const filteredLinks = linksData.filter(d => d.target.distcode == distcode);
    //.filter(d => d.source.schcode != '00000');
    
    console.log(filteredLinks);
    
    if(filteredLinks.length >0){
      var nodes = [];

      filteredLinks.forEach(d => {
        if(!nodes.includes(d.source.schcode) && d.source.schcode != '00000'){nodes.push(d.source.schcode)};
        if(!nodes.includes(d.target.schcode)){nodes.push(d.target.schcode)};
      });

      console.log(nodes);
      filteredNodes = nodesDataArray.filter(d => nodes.includes(d.schcode));
    };
    
  };
  
  console.log(filteredNodes);
  
  
  var minX, maxX, minY, maxY;
  
  if(filteredNodes.length > 1){
    minX = min(filteredNodes, d => d.xy[0]);
    maxX = max(filteredNodes, d => d.xy[0]);
    minY = min(filteredNodes, d => d.xy[1]);
    maxY = max(filteredNodes, d => d.xy[1]);
  }else{
    minX = filteredNodes[0].xy[0] - 8;
    maxX = filteredNodes[0].xy[0] + 8;
    minY = filteredNodes[0].xy[1] - 8;
    maxY = filteredNodes[0].xy[1] + 8;
  };
  
  
    
  console.log(minY);
  console.log(maxY);
  
  const yProportion = (maxY - minY)/(h - 2*margin);
  const xProportion = (maxX - minX)/(w - 2*margin);
  
  //console.log(yProportion);
  //console.log(xProportion);
  
  
  if(yProportion < xProportion){
    //console.log('X is the limitation');
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/8,7*w/8]);
    
    var yNewRange = (maxY-minY)*3*w/(4*(maxX-minX));
    //console.log(yNewRange);
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/2-3*yNewRange/4,h/2+3*yNewRange/4]);
    
  }else{
    //console.log('Y is the limitation');
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/8,7*h/8]);
    
    var xNewRange = (maxX-minX)*3*h/(4*(maxY-minY));
    //console.log(xNewRange);
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/2-3*xNewRange/4,w/2+3*xNewRange/4]);
    
  }
  
  
  nodesDataArray.forEach(d =>{
    
    if(d.xy){
      const newX = scaleX(d.xy[0]);
      const newY = scaleY(d.xy[1]);
      
      d.xyNew = [newX,newY];
    }else{
      d.xyNew = [20,20];
    };
    
  });
  
  //console.log(nodesDataArray);
  
  const nodes_tmp = nodesDataArray.map(d => {
    return [d.schcode, d]
  });
  const newNodesMap = new Map(nodes_tmp);
  
  newNodesMap.set('00000',{xyNew:[20,20]});
  
  //console.log(newNodesMap);
  
  linksData.map(d =>{
    if(newNodesMap.get(d.source.schcode)){
      const mS = newNodesMap.get(d.source.schcode);
      d.source.xyNew = mS.xyNew;
      return d;
    }
    
    if(newNodesMap.get(d.target.schcode)){
      const mT = newNodesMap.get(d.target.schcode);
      d.target.xyNew = mT.xyNew;
      return d;
    }
    
  })
  
  //console.log(linksData);
  
  return([nodesDataArray,linksData]);
  
}


export {networkSetup,myProjection,adjustProjection,adjustProjection2,adjustProjection3,formatEnters};
