import {select,selectAll} from 'd3'; 


function MakeDropdown(codeField,nameField){   
    
  //I would like to make this a factory funciton to also use for the gradespan filter but don't want to be held up figuring that out.
  
  function exportFunction(data,rootDom){
  
    const options = select(rootDom)
      .selectAll('.option')
      .data(data);
    const optionsEnter = options.enter().append('option').attr('class','option');

    options.merge(optionsEnter)
      .attr('value', d=> d.distcode)
      .text(d=> d.distname);
  }
  
  return exportFunction;
}

export default MakeDropdown;