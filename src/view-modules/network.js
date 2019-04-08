import {min,max,select,selectAll} from 'd3';  



function MyNetwork(){

    // may add force layout stuff later (I think I can?) to spread stuff if needed, but it seems to not handle what I want specifically enough so doing it by scratch seems right for now.

    function exportFunction(rootDom,nodesData,linksData){
        const w = rootDom.clientWidth;

        const plot = select(rootDom)
            .append('svg')
            .attr('width',750)
            .attr('height',1000);

        const links = plot
            .selectAll('.link')
            .data(linksData);
        const linksEnter = links.enter().append('line').attr('class','link')
            .style('stroke-opacity',0.05)
            .style('stroke-width','1px')
            .style('stroke','black');

        //console.log(links.merge(linksEnter).selectAll('.link'));

        links.merge(linksEnter)
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
            //.style('stroke-width', d=>{
            //return (d.value.toString() + 'px');
            //})
            .style('stroke-opacity',d => {return (d.value * 0.05)});


        //console.log(nodesData);

        const nodes = plot.selectAll('.node')
            .data(nodesData);
        const nodesEnter = nodes.enter().append('g').attr('class','node');

        nodesEnter.append('circle')
            .style('fill-opacity',.1)
            .style('stroke','#333')
            .style('stroke-width','2px');

        nodes.merge(nodesEnter)
            .attr('r',d=> d.value.totalEnters)
            .attr('transform', d => `translate(${d.xy[0]}, ${d.xy[1]})`);

        //console.log(nodes.merge(nodesEnter));

    }
    
    return exportFunction;
    
}

export default MyNetwork;


// District-specific version - in progress, not very far

function myDistrictNetwork(rootDom,data,district){
    
    //console.log(district);
    const districtData = data.filter(d => d.distcode_dest === district);
    
    districtData.forEach(d => {
        delete d.xy_dest;
        delete d.xy_origin;});
    
    console.log(districtData);
    
    myProjection2(rootDom,districtData,90000); 
    
    console.log(districtData);
    
    
    //const w = rootDom.clientWidth;
    
    
    

    
    //console.log(linksData);
    
    /*const plot = d3.select(rootDom)
        .append('svg')
        .attr('width',750)
        .attr('height',1000);
    
    const links = plot
        .selectAll('.link')
        .data(linksData);
    const linksEnter = links.enter().append('line').attr('class','link')
        .style('stroke-opacity',0.05)
		.style('stroke-width','1px')
		.style('stroke','black');
    
    //console.log(links.merge(linksEnter).selectAll('.link'));
    
    links.merge(linksEnter)
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
        //.style('stroke-width', d=>{
        //return (d.value.toString() + 'px');
        //})
        .style('stroke-opacity',d => {return (d.value * 0.05)});
    
    
    //console.log(nodesData);
    
    const nodes = plot.selectAll('.node')
        .data(nodesData);
    const nodesEnter = nodes.enter().append('g').attr('class','node');

    nodesEnter.append('circle')
        .style('fill-opacity',.1)
		.style('stroke','#333')
		.style('stroke-width','2px');

	nodes.merge(nodesEnter)
        .attr('r',d=> d.value.totalEnters)
		.attr('transform', d => `translate(${d.xy[0]}, ${d.xy[1]})`);
    
    console.log(nodes.merge(nodesEnter));*/
    
}
