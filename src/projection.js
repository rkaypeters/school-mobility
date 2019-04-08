import {min, max, geoMercator} from 'd3';  

// returns xy, added to the objects for an array data, with object property lndLat, baed on rootDom specifications

function MyProjection(){

    function exportFunction(rootDom,data,myScale){
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
            .translate([w/2,h/2]);     //when I switched to webpack the translate piece broke - it's stuck with the middle of the y at the top; need to fix

        //console.log(data);

        data.forEach(d=>
                     {d.xy = projection(d.lngLat);
                     }
        );
        //console.log(data);
        return(data);

    }
    
    return exportFunction;
    
}

export default MyProjection;