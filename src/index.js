/// Imports

import {select,min,max,geoMercator,dispatch} from 'd3';
import {mobstabdataPromise,
        metadataPromise,
        geodataPromise,
        schEntersPromise,
        leaMetadataPromise,
        leaEntersPromise,
        leaMobstabdataPromise} from './data-import';
import {renderNetwork,
        renderNetworkUpdate,
        renderLeaNetwork} from './view-modules/network';
import {networkSetup,
        networkSetupLea,
        myProjection,
        adjustProjection,
        formatEnters,
        formatLeaEnters} from './data-manipulation';
import renderStream from './view-modules/streamgraph';


/// Main

Promise.all([ mobstabdataPromise,
             metadataPromise,
             geodataPromise,
             schEntersPromise,
             leaMetadataPromise,
             leaEntersPromise,
             leaMobstabdataPromise])
  .then(([mobstab,metadataSch,geodata,entersdata,metadataLEA,entersdataLEA,mobstabLEA]) => {
  
    //Filter to only the necessary geogrpahic data
    const geoFilter = geodata.filter(d => [1,6,7].includes(+d.schType));
  
    //School data formatting
    const enters1718 = formatEnters(metadataSch,mobstab,geoFilter,entersdata);
    const [nodesData,linksData] = networkSetup(enters1718);
  
    //Lea (local education agency/'district') data formatting
    const leaEnters1718 = formatLeaEnters(metadataLEA,mobstabLEA,geodata,metadataSch,entersdataLEA);
    const [nodesDataLea,linksDataLea] = networkSetupLea(leaEnters1718);
  
    renderLeaNetwork('.network',
                   nodesDataLea,
                   linksDataLea.filter(d => d.source.distcode != d.target.distcode),globalDispatch);

    districtDropdown(metadataLEA.filter(d => [1,2,3].includes(+d.leaType)),
                     '.dropdown',
                     nodesData,
                     linksData);
  
    select('.btn').on('click', function(){
      renderLeaNetwork('.network',
                       nodesDataLea,
                       linksDataLea.filter(d => d.source.distcode != d.target.distcode),
                       globalDispatch);
      select('.streamgraph')
        .selectAll('svg').remove();
      select('.flowText').html(`<strong>Student Flow:</strong> Comparing <font color='#2B7C8F'>out-of-state</font>, <font color = '#70b3c2'>in-state</font>, and <font color='#a5cad2'>in-district</font> transfers over time. <i>[Select a school or district above. Y-axis is total entering students.]</i>`);
      
    });

  
  } 
);


/// Dropdown

function districtDropdown(leaData,rootDom,nodes,links){
  //This creates the district (or LEA) dropdown.
  
  //Sort LEA names in alphabetical order for the drop down
  leaData.sort(function(a,b){
    if(a.distname < b.distname) {return -1;}
    if(a.firstname > b.firstname) {return 1;}
  });
  
  //Create the necessary dom elements
  const districtList = select(rootDom)
    .append('select')
    .attr('class','form-control form-control-sm')
    .attr('width',300);
  districtList.selectAll('option')
    .data(leaData)
    .enter()
    .append('option')
    .attr('value',d=> d.distcode)
    .html(d => d.distname);
  
  //Call the 'change:district' dispatch when a new district is chosen.
  districtList.on('change',function(){
    const distcode = this.value;
    globalDispatch.call('change:district',null,distcode,nodes,links);
    globalDispatch.call('select:district',null,distcode);
    
  });
  
};


/// Global Dispatches

const globalDispatch = dispatch('change:district','select:school','select:district');

globalDispatch.on('change:district', (distcode,nodesData,linksData) => {
  //This updates the network view when a district is chosen from the dropdown.
  
  //Call adjustProjection to get new 'zoomed in' coordinates
  const [adjNodes,adjLinks] = adjustProjection(nodesData,linksData,distcode);
  
  //Then render the network
  renderNetworkUpdate('.network',adjNodes,adjLinks,distcode,globalDispatch);
  
});


globalDispatch.on('select:school', (schcode,nodesData,linksData) => {
  //This function updates the streamgraph when a school is selected.
  
  //First the original data need to be formatted and filtered differently than we've been using in the map view to get all years of data
  Promise.all([ metadataPromise,
             schEntersPromise,
             leaMetadataPromise])
  .then(([metadataSch,entersdata,metadataLEA]) => {
  
    const meta_tmp = metadataSch.map(d => [d.schcode,d]);
    const metaMap = new Map(meta_tmp);
    const lea_tmp = metadataLEA.map(d => [d.distcode,d]);
    const leaMetaMap = new Map(lea_tmp);
    
    //Change the labelling while we're at it
    const schname = metaMap.get(schcode).schname;
    select('.flowText').html(`<strong>${schname} Student Flow:</strong> Comparing <font color='#2B7C8F'>out-of-state</font>, <font color = '#70b3c2'>in-state</font>, and <font color='#a5cad2'>in-district</font> transfers over time.<br><i>&nbsp;&nbsp;&nbsp;&nbsp;[Select a school or district above. Y-axis is total entering students. Bands represent the three types of transfers.]</i>`);

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
        if (metaMap.get(d.schcode_origin)){
          const md = metaMap.get(d.schcode_origin);
          if(md.distcode){
            d.adminSite_origin = md.adminSite;
            d.distcode_origin = md.distcode;
            d.schname30_origin = md.schname30;
            d.gradeCfg_origin = md.gradeCfg;
          }
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
    
    //Now call renderStream
    renderStream(entersDataSch);
    window.scrollTo({top:500, behavior: 'smooth' });
    
  });
  
});


globalDispatch.on('select:district',(distcode) => {
  //This function updates the streamgraph when a district is selected.
  
  Promise.all([leaMetadataPromise,leaEntersPromise])
    .then(([metadataLEA,entersdata]) => {
  
      const meta_tmp = metadataLEA.map(d => [d.distcode,d]);
      const metaMap = new Map(meta_tmp);

      //Change the labelling
      const distname = metaMap.get(distcode).distname;
      select('.flowText').html(`<strong>${distname} Student Flow:</strong> Comparing <font color='#2B7C8F'>out-of-state</font>, <font color = '#70b3c2'>in-state</font>, and <font color='#a5cad2'>in-district</font> transfers over time.<br><i>&nbsp;&nbsp;&nbsp;&nbsp;[Select a school or district above. Y-axis is total entering students. Bands represent the three types of transfers.]</i>`);

      //Only minor filtering for data structure
      const entersDataDist = entersdata
        .filter(d => d.distcode_dest == distcode);

      //Call renderStream
      renderStream(entersDataDist);
      window.scrollTo({top:500, behavior: 'smooth' });
    
  });
  
});

