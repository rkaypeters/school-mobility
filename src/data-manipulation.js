import {min,max,geoMercator,scaleLinear,select,nest,key,entries,mean} from 'd3';    

    
function formatEnters(metadataSch,mobstab,geodata,entersdata){  
  //This is the initial formatting; it's merging a bunch of csv's to get all of the needed fields in one place.
  
  const metaFilter = metadataSch.filter(d => d.status ==1).filter(d=> d.adminSite == 'N').filter(d => d.remove ==0);
  
  const meta_tmp = metadataSch.map(d => [d.schcode,d]);
  const metaMap = new Map(meta_tmp);
  const mobstab_tmp = mobstab.map(d => [d.schcode,d]);
  const mobstabMap = new Map(mobstab_tmp);
  const geo_tmp = geodata.map(d => [d.schcode,d]);
  const geoMap = new Map(geo_tmp);
  
  myProjection(select('.network').node(),geodata);
  
  const enters_tmp = entersdata.filter(d => d.reportID ==77)
    .filter(d => d.schcode_dest != ' ')
    .filter(d => d.schcode_origin != d.schcode_dest);

  
  //Filling in blanks for schools that have no enters, so they still show up
  metaFilter.forEach(d=>{
    var count = 0;
    enters_tmp.forEach(e=>{
      if(d.schcode === e.schcode_dest){
        count += 1;
      }
    });
    if(count == 0){
      enters_tmp.push({
        reportID: '77',
        schcode_dest: d.schcode,
        schcode_origin: '00000',
        enters: 0});
    };
  });
  
  
  //Now lots of merging and such
  const enters1718 = enters_tmp
    .map(d => {
      const md = metaMap.get(d.schcode_dest);
      d.adminSite_dest = md.adminSite;
      d.distcode_dest = md.distcode;
      d.schname30_dest = md.schname30;
      d.schname15_dest = md.schname15;
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
      if (metaMap.get(d.schcode_origin)){
        const md = metaMap.get(d.schcode_origin);
        if(md.distcode){
          d.adminSite_origin = md.adminSite;
          d.distcode_origin = md.distcode;
          d.schname30_origin = md.schname30;
          d.schname15_origin = md.schname15;
          d.gradeCfg_origin = md.gradeCfg;
        }
      } return d;
      })
    .filter(d => d.adminSite_dest == 'N')
    .map(d => {
        const gd = geoMap.get(d.schcode_dest);
        if(gd){
            d.lngLat_dest = gd.lngLat;
            d.xy_dest = gd.xy;
        }else{
          if(d.schcode_dest === '00000'){
             d.xy_dest = [20,20];
              console.log('out of state');
              }else{d.xy_dest = [20,700];
                   console.log('other');}
             }
        const go = geoMap.get(d.schcode_origin);
        if(go){
            d.lngLat_origin = go.lngLat;
            d.xy_origin = go.xy;
        }else{if(d.schcode_origin === '00000'){
             d.xy_origin = [20,20];
             //};
             //if(d.schcode === /190$/){ //considered separating out '190' schools, outplacements often for students with disabilities or health issues requiring a specialized school
                //d.xy_dest = [20,700];
             //}
              }else{d.xy_origin = [20,700];}
             }
        return d;
        });
  
  return(enters1718);
  
}


function formatLeaEnters(metadataLEA,mobstabLEA,geodata,metadataSch,entersdataLEA){  
  //Formatting data for LEA view
  
  const meta_tmp = metadataLEA.filter(d => d.remove != 1)
    .map(d => [d.distcode,d]);
  const metaMap = new Map(meta_tmp);
  const meta_tmpSch = metadataSch.map(d => [d.schcode,d]);
  const metaMapSch = new Map(meta_tmpSch);
  const mobstab_tmp = mobstabLEA.map(d => [d.distcode,d]);
  const mobstabMap = new Map(mobstab_tmp);
  
  
  //I don't have coordinates for districts (LEAs) so I'm making them the average of the schools.
  const geodataMeta = geodata.filter(d => [1,6,7].includes(+d.schType))
    .map(d => {
      const md = metaMapSch.get(d.schcode);
      if(md){
        d.distcode = md.distcode;
      };
      return d;
    }).filter(d => d.distcode);
  
  const geodataDist = nest()
    .key(d => d.distcode)
    .rollup(function(v){ return{
      lngLat: [mean(v, w => w.lngLat[0]),mean(v, w => w.lngLat[1])],
      xy: [mean(v, w => w.xy[0]),mean(v, w => w.xy[1])]
    }})
    .entries(geodataMeta);
  
  const geo_tmp = geodataDist.map(d => [d.key,d.value]);
  const geoMap = new Map(geo_tmp);
  
  
  //Now formatting the enters data, merging everything
  const enters_tmp = entersdataLEA.filter(d => d.reportID ==77);
  
  metadataLEA.filter(d => d.remove != 1).forEach(d=>{
    var count = 0;
    enters_tmp.forEach(e=>{
      if(d.distcode === e.distcode_dest){
        count += 1;
      }
    });
    if(count == 0){
      enters_tmp.push({
        reportID: '77',
        distcode_dest: d.distcode,
        distcode_origin: '00',
        enters: 0});
    };
    
  });
  
  const enters1718 = enters_tmp
    .map(d => {
      const md = metaMap.get(d.distcode_dest);
      d.distname_dest = md.distname;
      d.distname16_dest = md.distname16;
      return d;
    })
    .map( d =>{
      const msd = mobstabMap.get(d.distcode_dest);
      d.adm = msd.adm;
      d.mobRate = msd.mobRate1;
      return d;
    })
    .map(d => {
      if (metaMap.get(d.distcode_origin)){
        const md = metaMap.get(d.distcode_origin);
        if(md.distcode){
          d.distname_origin = md.distname;
          d.distname16_origin = md.distname16;
        }
      } return d;
    })
    .map( d =>{
      if (mobstabMap.get(d.distcode_origin)){
        const msd = mobstabMap.get(d.distcode_origin);
        d.adm_origin = msd.adm;
        d.mobRate_origin = msd.mobRate1;
      }
      return d;
    })
    .map(d => {
      const gd = geoMap.get(d.distcode_dest);
      if(gd){
          d.lngLat_dest = gd.lngLat;
          d.xy_dest = gd.xy;
      }
      const go = geoMap.get(d.distcode_origin);
      if(go){
          d.lngLat_origin = go.lngLat;
          d.xy_origin = go.xy;
      }else{if(d.distcode_origin === '00'){
           d.xy_origin = [20,20];
            }else{d.xy_origin = [20,700];}
           }
      return d;
    });
  
  return(enters1718);
  
};


function networkSetup(data){
  //Takes the formatted enters data and makes it into nodes and links
  
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
        schname: d.schname30_dest,
        schname15: d.schname15_dest
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
          newNode.schname15 = d.schname15_dest;
      };
      //nodesData.set(d.schcode_origin,newNode); //The way I wrote this, this step doens't work because I don't ahve a mobRate_dest, but it's mostly handled elsewhere.
      newLink.source = newNode;
    }else{
      const existingNode = nodesData.get(d.schcode_origin);
      newLink.source = existingNode;
    }
    
    linksData.push(newLink);  
  })

  return[nodesData,linksData];

};


function networkSetupLea(data){
  //Take the formatted LEA data and make it into nodes and links. if I had more time I would combine this and networkSetup into one function. I realize they are very similar!
  
  const nodesData = new Map();
  const linksData = [];

  data.forEach(d => {
    const newLink = {
      value: d.enters
    };

    if(!nodesData.get(d.distcode_dest)){
      const newNode = {
        distcode: d.distcode_dest,
        xy: d.xy_dest,
        totalEnters: newLink.value,
        adm: +d.adm,
        mobRate: +d.mobRate,
        distname: d.distname_dest,
        distname16: d.distname16_dest
      }; 

      nodesData.set(d.distcode_dest,newNode);
      newLink.target = newNode;
    }else{
      const existingNode = nodesData.get(d.distcode_dest);
      existingNode.totalEnters += newLink.value;
      newLink.target = existingNode;
    };

    if(!nodesData.get(d.distcode_origin)){
      const newNode = {
        distcode: d.distcode_origin,
        xy: d.xy_origin,
        totalEnters: 0
      }
      if(d.distname_origin){
          newNode.adm = +d.adm_origin;
          newNode.mobRate = +d.mobRate_origin;
          newNode.distname = d.distname_origin;
          newNode.distname16 = d.distname16_origin;
      };
      nodesData.set(d.distcode_origin,newNode);
      newLink.source = newNode;
    }else{
      const existingNode = nodesData.get(d.distcode_origin);
      newLink.source = existingNode;
    }
    
    linksData.push(newLink);  
  })

  return[nodesData,linksData];

}



function myProjection(rootDom,data){
  const w1 = rootDom.clientWidth;
  const h1 = window.innerHeight - select('.intro').node().clientHeight - select('.dropdown').node().clientHeight - 220;

  var w, h;
  
  if(w1>=400){
     w = w1;
  }else{ w = 400;};
  if(h1 >= 600){
    h = h1;
  }else{h = 600;};
  
  
  const myScale = 54*h;
  
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

  
  var shiftVal = w/1500;
  
  const projection = geoMercator()
    .scale(myScale)
    .center([(maxLng+minLng+.4-shiftVal)/2,(maxLat+minLat)/2+.172])
    //.translate([w/2,h/2]);

  data.forEach(d => {d.xy = projection(d.lngLat);
                    }
  );
  
  return(data);

};


function adjustProjection(nodesData,linksData,distcode){
  
  //console.log(nodesData);
  //console.log(distcode);
  
  const w1 = select('.network').node().clientWidth;
  const h1 = window.innerHeight - select('.intro').node().clientHeight - select('.dropdown').node().clientHeight - 200;
  
  //console.log(select('.dropdown').node().clientHeight); //need this piece

  var w, h;
  
  if(w1>=400){
     w = w1;
  }else{ w = 400;};
  if(h1 >= 600){
    h = h1;
  }else{h = 600;};
  
  
  const minDNodes = 4;
  
  const nodesDataArray = Array.from(nodesData.values());
  
  var filteredNodes = nodesDataArray.filter(d => d.distcode == distcode);
  
  if (filteredNodes.length < minDNodes){
    
    const filteredLinks = linksData.filter(d => d.target.distcode == distcode);
    
    if(filteredLinks.length >0){
      var nodes = [];

      filteredLinks.forEach(d => {
        if(!nodes.includes(d.source.schcode) && d.source.schcode != '00000'){nodes.push(d.source.schcode)};
        if(!nodes.includes(d.target.schcode)){nodes.push(d.target.schcode)};
      });

      //console.log(nodes);
      filteredNodes = nodesDataArray.filter(d => nodes.includes(d.schcode));
    };
    
  };
  
  //console.log(filteredNodes);
  
  
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
  
  const yProportion = (maxY - minY)/h;
  const xProportion = (maxX - minX)/w;
  
  if(yProportion < xProportion){
    console.log('X is the limitation');
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([w/8,7*w/8]);
    
    var yNewRange = (maxY-minY)*3*w/(4*(maxX-minX));
    console.log(yNewRange);
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      //.range([h/2-3*yNewRange/4,h/2+3*yNewRange/4]);
      .range([(h-yNewRange)/2,(h+yNewRange)/2]);
    
  }else{
    //console.log('Y is the limitation');
    
    var scaleY = scaleLinear()
      .domain([minY,maxY])
      .range([h/8,7*h/8]);
    
    var xNewRange = (maxX-minX)*3*h/(4*(maxY-minY));
    //console.log(xNewRange);
    
    var scaleX = scaleLinear()
      .domain([minX,maxX])
      .range([(w-xNewRange)/2,(w+xNewRange)/2]);
      //.range([w/2-3*xNewRange/4,w/2+3*xNewRange/4]);
    
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


export {networkSetup,networkSetupLea,myProjection,adjustProjection,formatEnters,formatLeaEnters};
