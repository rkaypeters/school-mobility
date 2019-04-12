My next steps (I think) as of 4/7:
    DONE - 1. fix translate in myProjection
    2. add drop-down filters for district and grade span (filters nodesData and linksData potentially, goes after projection and network setup, re-runs myNetwork through dispatch)
        a. enter-exit-update! dispatch! maybe more!
    DONE with district, hold on grade span.
        
        
    3. add feature to zoom/pan to the location of filtered data when district or grade span is updated. This means mapping xy to a new range. This could potentially happen to nodesData and linksData before myNetwork.
        a. potentially, if there are 4+ target nodes focus on those 4+; if fewer than 4, include source in the focus
    DONE with all zoooming, missing variation by number of targets or for weird layouts.
        
        
    4. reconsider visual elements; this is a good point for design considerations (color for source v target for filters? whats the best way to show the strength of these relationships? where should the 190s and 000s go?, etc). this needs work.
        a. consider repsentation of overall mobility rate in a channel in this chart (size?)
        b. consider altering weight of links to match percentage of students rather than count
        c. consider representing school size somehow. is this a tradeoff with overall mobility rate?
        d. title and whatnot
        e. css
    5. add functionality for specific school imformation. potentially, select a school my clicking on its node.
        a. highlighting functionality - that node and links from it
        b. additional view: streamgraph of students by school over time
        c. additional view: school information (mobility and stability rate, % economicaly disadvantaged, english learners, nonwhite, proficiency, etc; consider what makes sense)
    6. (optional if time) - try panning and zooming features on map. d3 has funcationality such that users can move around if I want to go that way
    
    
    Additional steps 4/11:
    - add distcode to source
    - clean up indentation
    - combine data utils
    - work on missing coordinates


Key questions for Siqi:
    1. Am I understanding wrapping functions? It seems like I may be overusing constructor functions. Should I consider other approaches for working with functions between files?
    2. Feedback on general approach/efficiency/best practices (coding-wise; deisgn-wise I have a plan but so little is fleshed out feedback, if any, should be more based on the plan above than what's showing up now; I aim to be ready for deisgn feedback Friday). Am I missing a best practice or doing something silly?
    3. How do I fix translate in myProjection?
    4. Tips for arranging doms. How to I place svg elements where I want them? For example, to the right of another instead of below? What about responsive design? What other best practices should I consider? Maybe there is a resource I can read myself for this.
    
    