import {min, max} from 'd3';    
    
    
function NetworkSetup(){

    function exportFunction(data){

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
 
    
return exportFunction;
    
}
    
export default NetworkSetup;