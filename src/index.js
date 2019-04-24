/// Imports

import {select,min,max,geoMercator,dispatch} from 'd3';

import {mobstabdataPromise,
        metadataPromise,
        geodataPromise,
        schEntersPromise,
        leaMetadataPromise} from './data-import';

import {renderNetwork,
        renderNetworkUpdate} from './view-modules/network';
import MakeDropdown from './view-modules/dropdowns';
import {networkSetup,
        myProjection,
        adjustProjection,
        formatEnters} from './data-manipulation';
import renderStream from './view-modules/streamgraph';


/// Main

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

    const geoFilter = geodata.filter(d => [1,6,7].includes(+d.schType));

    const enters1718 = formatEnters(metadataSch,mobstab,geoFilter,entersdata);

    const [nodesData,linksData] = networkSetup(enters1718);

    renderNetwork('.network',
              nodesData,
              linksData.filter(d => d.target.schcode != '00000')
                .filter(d => d.source.schcode != '00000')
             );

    districtDropdown(metadataLEA.filter(d => [1,2,3].includes(+d.leaType)),
                     '.dropdown',
                     nodesData,
                     linksData);
  
    select('.btn').on('click', function(){
      console.log('button press');
      renderNetwork('.network',
        nodesData,
        linksData.filter(d => d.target.schcode != '00000')
          .filter(d => d.source.schcode != '00000')
      );
      //dispatch.call(
		//'ui-event',
		//null,
		//'button',
		//d3.event.type,
		//d3.event.value)
    });
  
  } 
)


/// Dropdown

function districtDropdown(leaData,rootDom,nodes,links){
  
  leaData.sort(function(a,b){
    if(a.distname < b.distname) {return -1;}
    if(a.firstname > b.firstname) {return 1;}
  })
  
  //console.log(leaData);
  
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


/// Global Dispatches

const globalDispatch = dispatch('change:district','select:school');

globalDispatch.on('change:district', (distcode,nodesData,linksData) => {

  //console.log(distcode);
  
  const [adjNodes,adjLinks] = adjustProjection(nodesData,linksData,distcode);
  
  //console.log(adjNodes);
  //console.log(adjLinks);
  
  
  renderNetworkUpdate('.network',adjNodes,adjLinks,distcode,globalDispatch);
  
});


globalDispatch.on('select:school', (schcode,nodesData,linksData) => {

  console.log(schcode);
  
  Promise.all([ metadataPromise,
             schEntersPromise,
             leaMetadataPromise])
  .then(([metadataSch,entersdata,metadataLEA]) => {
  
  //const entersData = schEntersPromise.then(result =>{
  
    const meta_tmp = metadataSch.map(d => [d.schcode,d]);
    const metaMap = new Map(meta_tmp);

    const lea_tmp = metadataLEA.map(d => [d.distcode,d]);
    const leaMetaMap = new Map(lea_tmp);

    const entersDataSch = entersdata
        .filter(d => d.schcode_dest == schcode)
        .filter(d => d.schcode_origin != schcode)
        .map(d => {
          const md = metaMap.get(d.schcode_dest);
          d.adminSite_dest = md.adminSite;
          d.distcode_dest = md.distcode;
          d.schname30_dest = md.schname30;
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
        .map(d => {
          const md = leaMetaMap.get(d.distcode_dest);
          d.distname_dest = md.distname;
          return d;
        })
        .map(d => {
          if(d.schcode_origin === '00000'){
            d.distcode_origin = '00';
          };
          return d;
        });  




    //const entersDataSch = entersdata
      //.filter(d => d.schcode_dest == schcode)
      //.filter(d => d.schcode_origin != schcode)
    
    console.log(entersDataSch);
    
    renderStream(entersDataSch,schcode);
    
  });
  
  
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

