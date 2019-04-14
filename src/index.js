console.log('index.js!');

import {select,min,max,geoMercator,dispatch} from 'd3';

import {mobstabdataPromise,
        metadataPromise,
        geodataPromise,
        schEntersPromise,
        leaMetadataPromise
} from './data-import';

import {renderNetwork,renderNetworkUpdate} from './view-modules/network';
import MakeDropdown from './view-modules/dropdowns';
import {networkSetup,myProjection,adjustProjection,adjustProjection2} from './data-manipulation';


//// The bulk of it - after the promises

Promise.all([ mobstabdataPromise,
             metadataPromise,
             geodataPromise,
             schEntersPromise,
             leaMetadataPromise])
  .then(([mobstab,metadataSch,geodata,entersdata,metadataLEA]) => {
                                              
  //console.log(metadataSch);
  //console.log(mobstab);
  //console.log(geodata);
  //console.log(entersdata);
  //console.log(metadataLEA);
    
  const meta_tmp = metadataSch.map(d => {
    return [d.schcode, d]
  });
  const metaMap = new Map(meta_tmp);
  //console.log(metaMap);
    
  myProjection(select('.network').node(),
               geodata,
               45000) //still need to set up network DOM dimensions
    .push({schcode: '00000',xy: [20,20]});

  const geo_tmp = geodata.map(d => {
      return[d.schcode,d]
  });
  const geoMap = new Map(geo_tmp);
  //console.log(geoMap);

  //console.log(entersdata);

  //should I put this in a separate script?
  const enters1718 = entersdata.filter(d => d.reportID ==77)
      .filter(d => d.schcode_dest != ' ')
      .filter(d => d.schcode_origin != d.schcode_dest)
      .map(d => {
      const md = metaMap.get(d.schcode_dest);
      d.adminSite_dest = md.adminSite;
      d.distcode_dest = md.distcode;
      d.schname30_dest = md.schname30;
      d.gradeCfg_dest = md.gradeCfg;
      return d;
  })
    /*.map(d => {
      if (d.schcode_origin != '00000' && d.schcode_origin != ' '){


      const md = metaMap.get(d.schcode_origin);
      /*if(md.distcode){
        d.adminSite_origin = md.adminSite;
        d.distcode_origin = md.distcode;
        d.schname30_origin = md.schname30;
        d.gradeCfg_origin = md.gradeCfg;
      }
      return d;*
      console.log(md);
      }
    })*/

      .filter(d => d.adminSite_dest == 'N')
      .map(d => {
          const gd = geoMap.get(d.schcode_dest);
          if(gd){
              d.lngLat_dest = gd.lngLat;
              d.xy_dest = gd.xy;
          }else{
            d.xy_dest = [20,700];
          }
          const go = geoMap.get(d.schcode_origin);
          if(go){
              d.lngLat_origin = go.lngLat;
              d.xy_origin = go.xy;
          }
        //else{
          //  d.xy_origin = [20,700];
          //}
          return d;
          });

  //console.log(enters1718);


  const mobstab_sch = mobstab
      .filter(d => d.schname != '')
      .map(d => {
      const md = metaMap.get(d.schcode);
      d.adminSite = md.adminSite;

      return d;
  })
      .filter(d => d.adminSite == 'N');

  //console.log(mobstab_sch);

  //const enters1718Network = enters1718.filter(d =>d.gradeCfg_dest == 'H').filter(d => d.schcode_dest!= '00000').filter(d => d.schcode_origin != '00000');

  const [nodesData,linksData] = networkSetup(enters1718);
  
  console.log(nodesData);
  console.log(linksData);

  //const myNetwork = MyNetwork();

  renderNetwork('.network',
            nodesData,
            linksData.filter(d => d.target.schcode != '00000')
              .filter(d => d.source.schcode != '00000')//.filter(d => d.value != 1)
           );
  
  districtDropDown(metadataLEA.filter(d => [1,2,3].includes(+d.leaType)),
                   '.dropdown',
                   nodesData,
                   linksData);
  
  
  
}
    
)


function districtDropDown(leaData,rootDom,nodes,links){
  
  const districtList = select(rootDom)
    .append('select');
  districtList.selectAll('option')
    .data(leaData)
    .enter()
    .append('option')
    .attr('value',d=> d.distcode)
    .html(d => d.distname);
  
  districtList.on('change',function(){
    const distcode = this.value;
    globalDispatch.call('change:district',null,distcode,nodes,links);
    
  });

  
}


const globalDispatch = dispatch('change:district');

globalDispatch.on('change:district', (distcode,nodesData,linksData) => {

  console.log(distcode);
  
  const filteredLinks = linksData.filter(d => d.target.distcode == distcode);
  const projFiltLinks = adjustProjection(filteredLinks.filter(d => d.source.schcode != '00000'));
  const [adjNodes,adjLinks] = adjustProjection2(nodesData,linksData,distcode);
  
  console.log(adjNodes);
  console.log(adjLinks);
  
  //console.log(filteredLinks);
  //console.log(projFiltLinks);
  
  renderNetworkUpdate('.network',
              nodesData,
              //filteredLinks
                //.filter(d => d.source.schcode != '00000')//.filter(d => d.value != 1)
              projFiltLinks
             );
  
});








/////////// OLD STUFF //////////////

//This isn't actually the bar chart; it's just the dots to practicing displaying this for now.
//retired this, but leaving the code for now in case it helps later when/if I want circles for the nodes.

function drawBarChart(rootDom,data){
    
    const w = rootDom.clientWidth;
    //const h = rootDom.clientHeight;
    
    const plot = select(rootDom)
        .append('svg')
        .attr('width', w)
        .attr('height', 100)
        .append('g'); //adds g element in svg
    
    const nodes = plot.selectAll('.node')
        .data(data,d => d.key); //what is this
    const nodesEnter = nodes.enter().append ('g')
        .attr('class','node')
    nodes.merge(nodesEnter)
		.attr('transform', d => {
			//const xy = projection(d.origin_lngLat);
			return `translate(${d.mobRate1*w/100}, 50)`;
		})//not sure what this does
    nodesEnter.append('circle');
    nodes.merge(nodesEnter)
        .attr('x', d => d.mobRate1)
        .select('circle')
		//.attr('r', d => scaleSize(d.total))
        .attr('r', 10)
		.style('fill-opacity', .03)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2) ;
    
    //console.loge(nodes);
    
}



//// in progress
function myProjection2(rootDom,data,myScale){
    const w = rootDom.clientWidth;
    const h = rootDom.clientHeight;
    
    const projection_tm = geoMercator()
    
    console.log(data);
    
    const minLng = min(data, function(d){
        return d.lngLat_dest[0];
    })
    const maxLng = max(data, function(d){
        return d.lngLat_dest[0];
    })
    const minLat = min(data, function(d){
        return d.lngLat_dest[1];
    })
    const maxLat = max(data, function(d){
        return d.lngLat_dest[1];
    })
    
    const projection = geoMercator()
        .scale(myScale)
        .center([(maxLng+minLng)/2,(maxLat+minLat)/2+.2])
        //.center(289,127)
        .translate([w/2,h/2]);
    
    //console.log(data);
    
    data.forEach(d=>
                 {d.xy_dest = projection(d.lngLat_dest);
                 }
    );
    //console.log(data);
    return(data);
    
}




///First map - just locations

function drawMap(rootDom,data){
    const w = rootDom.clientWidth;
    const h = rootDom.clientHeight;
    
    const projection_tm = geoMercator()
    
    const minLng = min(data, function(d){
        if(d.lngLat){
            return d.lngLat[0];
        }
    })
    const maxLng = max(data, function(d){
        if(d.lngLat){
            return d.lngLat[0];
        }
    })
    const minLat = min(data, function(d){
        if(d.lngLat){
            return d.lngLat[1];
        }
    })
    const maxLat = max(data, function(d){
        if(d.lngLat){
            return d.lngLat[1];
        }
    })
    
    const projection = geoMercator()
        .scale(45000)
        .center([(maxLng+minLng)/2,(maxLat+minLat)/2+.2])
        //.center(289,127)
        .translate([w/2,h/2]);
    
    const plot = select(rootDom)
        .append('svg')
        .attr('width', w)
        .attr('height', 1000)
        .append('g');
    
    const nodes = plot.selectAll('.node')
        .data(data,d => d.key);
    const nodesEnter = nodes.enter().append ('g')
        .attr('class','node');
    nodesEnter.append('circle');
    
    nodes.merge(nodesEnter)
        .filter(d => d.lngLat)
		.attr('transform', d => {
			const xy = projection(d.lngLat);
			return `translate(${xy[0]}, ${xy[1]})`;
            console.log(xy[0] + ' ' + xy[1]);
        });
    nodes.merge(nodesEnter)
        //.attr('x', d => d.mobRate1)
        .select('circle')
		//.attr('r', d => scaleSize(d.total))
        .attr('r', 10)
		.style('fill-opacity', .3)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2) ;
}


