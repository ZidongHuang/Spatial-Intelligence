//initialize parameters<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
var outerWidth = 0.7 * window.innerWidth;
var outerHeight = 0.6 * window.innerHeight;

var size_normal = 4;
var size_hover = 6.5;
var size_hover_rest = 1;

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var div2 = d3.select("body").append("div")
    .attr("class", "tooltip2")
    .style("opacity", 0);

var gender_colorScale = d3.scale.ordinal()
                                .domain(['Male', 'Female', 'Fashion', 'Food', 'ConsumerElectronics', 'Accessories', 'KidsBabies', 'Jewelry'])
                                .range(['#76B3BD', '#DFA899' , '#3D94B8', '#3D6F94', '#D1807C', '#84AAB3', '#C6A899', '#8B0D3B']);

var age_colorScale = d3.scale.ordinal()
                                .domain(['Teenager', 'Youth', 'MiddleAged', 'Senior', 'Fashion', 'Food', 'ConsumerElectronics', 'Accessories', 'KidsBabies', 'Jewelry'])
                                .range(['#76B3BD', '#DFA899' , '#3D94B8', '#3D6F94', '#D1807C', '#84AAB3', '#C6A899', '#8B0D3B', '#8B0D3B', '#8B0D3B']);

var svg = d3.select(".svg1")
            .attr("width", outerWidth)
            .attr("height", outerHeight)
            // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select("canvas")
  .attr("width", outerWidth)
  .attr("height", outerHeight)

var width = outerWidth,
    height = outerHeight;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category10();

var sankey = d3.sankey()
               .nodeWidth(17)
               .nodePadding(15)
               .size([outerWidth, outerHeight])
var t;


var update = function(){

  //create Sankey <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  var category = document.getElementById("category").value;
  var date = document.getElementById("date").value;
  var url = '/static/js/data/' + category + "_" + date + '.json'
  var flow, path;

  $.ajax({
    url: url,
    async: false,
    dataType: 'json',
    success: function (json) {
      flow = json;
    }
  });

  sankey.nodes(flow.nodes)
        .links(flow.links)
        .layout(32);

  path = sankey.link();

  d3.select("canvas").node().getContext("2d").clearRect(0,0,outerWidth,outerHeight);
  d3.selectAll('.alllink').remove();
  d3.selectAll(".allnode").remove();

  var link = svg.append("g")
      .attr("class", "alllink")
      .selectAll(".link")
      .data(flow.links)
    .enter().append("path")
      .attr("class", d => {return "link l" + d.source.name + " " + d.target.name})
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy ); })
      .style("stroke-opacity", 0.05)
      .on("mouseover", d => {
        d3.selectAll(".link").filter("." + d.source.name).filter("." + d.target.name)
          .style("stroke-opacity", 0.1)

        flow.links.forEach(function (link) {
          if(link.source.name === d.source.name && link.target.name === d.target.name){
            link.particleSize = size_hover;}
          else{link.particleSize = size_hover_rest;}
         })

        div.transition().duration(200)
        .style("display", "inline")
        .style("opacity", 1);

      })
      .on("mousemove", function(d){
        div
           .html("<p>" + d.source.name + " -> " + d.target.name + "<br/>" + "<b>" + d.value + " people<b/><p>")
           .style("left", (d3.event.pageX - 130) + "px")
           .style("top", (d3.event.pageY - 75) + "px");
      })
      .on("mouseout", d => {
        d3.selectAll(".link").filter("." + d.source.name).filter("." + d.target.name)
          .style("stroke-opacity", 0.05)

        flow.links.forEach(function (link) {
          link.particleSize = size_normal;
         })

        div.transition().duration(200)
          .style("display", "none")
          .style("opacity", 0);

      })
      .sort(function(a, b) { return b.dy - a.dy; });

  var node = svg.append("g")
      .attr("class", "allnode")
      .selectAll(".node")
      .data(flow.nodes)
    .enter().append("g")
      .attr("class", d => "node n" + d.name)
      .attr("transform", d => "translate(" + d.x + "," + d.y +  ")")
      .on("mouseover", d => {
        d3.selectAll("."+d.name)
          .style("stroke-opacity", 0.1);

        flow.links.forEach(function (link) {
          if(link.source.name === d.name || link.target.name === d.name){
            link.particleSize = size_hover;}
          else{link.particleSize = size_hover_rest;}
         })

         div2.transition().duration(200)
         .style("display", "inline")
         .style("opacity", 1);
      })
      .on("mousemove", function(d){
        var text = "";
        if(d.sourceLinks.length){
          d.sourceLinks.forEach(function(link){
              var perc = d3.format(".0%")(link.value / d.value)
              var name = link.target.name
              text += perc + " " + name + "<br/>"
              })
          div2
             .html("<p>"+ text + "<p>")
             .style("text-align", "right")
             .style("width", "200px")
             .style("height", "150px")
             .style("left", (d3.event.pageX - 230) + "px")
             .style("top", (d3.event.pageY - 75) + "px");
        } else {
          d.targetLinks.forEach(function(link){
              var perc = d3.format(".0%")(link.value / d.value)
              var name = link.source.name
              text += perc + " " + name + "<br/>"
              })
          div2
             .html("<p>"+ text + "<p>")
             .style("text-align", "left")
             .style("width", "150px")
             .style("height", "60px")
             .style("left", (d3.event.pageX + 30) + "px")
             .style("top", (d3.event.pageY - 25) + "px");
        }
      })
      .on("mouseout",d => {
        d3.selectAll("."+d.name)
          .style("stroke-opacity", 0.05)

        flow.links.forEach(function (link) {
          link.particleSize = size_normal;
        })

        div2.transition().duration(200)
          .style("display", "none")
          .style("opacity", 0);
      })
    .call(
      d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() { this.parentNode.appendChild(this); })
        .on("drag", dragmove)
      )

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

  node.append("rect")
      .attr("class", d => "rect r" + d.name)
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      // .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("fill", function(d) {
        if(category == 'gender')
        {return d.color = gender_colorScale(d.name) ;}
        else if(category == 'age')
        {return d.color = age_colorScale(d.name) ;}
      })
      .style("stroke", "none")

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  if(category == "gender"){
    d3.selectAll(".nFemale")
      .attr("transform", "translate(" + flow.nodes[1].x + "," + (flow.nodes[1].y = outerHeight - flow.nodes[1].dy) + ")");
    sankey.relayout();
    link.attr("d", path);
    d3.select("canvas").node().getContext("2d").clearRect(0,0,outerWidth,outerHeight);
  }else if (category == 'age'){
    d3.selectAll(".nSenior")
      .attr("transform", "translate(" + flow.nodes[3].x + "," + (flow.nodes[3].y = outerHeight - flow.nodes[3].dy) + ")");
    d3.selectAll(".nMiddleAged")
      .attr("transform", "translate(" + flow.nodes[2].x + "," + (flow.nodes[2].y = outerHeight - flow.nodes[3].dy - flow.nodes[2].dy - sankey.nodePadding()) + ")");

    sankey.relayout();
    link.attr("d", path);
    d3.select("canvas").node().getContext("2d").clearRect(0,0,outerWidth,outerHeight);
  }

  //create Particles <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  var linkExtent = d3.extent(flow.links, function (d) {return d.value});
  var frequencyScale = d3.scale.linear().domain(linkExtent).range([0.05,1]);
  var particleSizeScale = d3.scale.linear().domain(linkExtent).range([1,5]);
  var particleSpeedScale = d3.scale.linear().domain(linkExtent).range([1, 5]);
  var particles = [];

  flow.links.forEach(function (link) {
    link.freq = frequencyScale(link.value);
    link.particleSize = size_normal;
    link.particleColor = d3.scale.linear().domain([0,1]).range([link.source.color, link.target.color]);
  })

  function tick(elapsed) {
    //decide how many number of new particles to add in every elapsed time
    var density = 2;
    //remove particles reach the end
    particles = particles.filter(function (d) {return d.currentLength < d.path.getTotalLength()});
    //for each path, do the following:
    d3.selectAll("path.link").each(
        function (d) {
          //d is flow.link
          //"this" is <path>
          for (var x = 0; x < density; x++) {
            var offset = (Math.random() - .53) * (d.dy - 4);
            if (Math.random() < d.freq) {
              var length = this.getTotalLength();
              particles.push({
                link: d, time: elapsed, offset: offset, path: this, length: length,
                animateTime: length, speed: particleSpeedScale(d.value) + Math.random()
              })
              //p_counts ++;
            }
          }
        });
    particleEdgeCanvasPath(elapsed);
    // if(elapsed > 5000){t.stop()};
  }

  function particleEdgeCanvasPath(elapsed) {
    //get canvas 2d context for drawing
    var context = d3.select("canvas").node().getContext("2d");
    //clear previous particles
    context.clearRect(0,0,outerWidth,outerHeight);
    //draw particles
    for (var x in particles) {
        //the duration this particle exists
        var duration = elapsed - particles[x].time;
        //the speed controller
        var speedIndex = 0.05;
        //where the particle is now
        particles[x].currentLength = duration * speedIndex * particles[x].speed;
        var currentPos = particles[x].path.getPointAtLength(particles[x].currentLength);
        context.beginPath();
        context.fillStyle = particles[x].link.particleColor(particles[x].currentLength/particles[x].path.getTotalLength());
        // context.arc(currentPos.x, currentPos.y + particles[x].offset, particles[x].link.particleSize, 0, 2*Math.PI); // draw circle
        context.rect(currentPos.x, currentPos.y + particles[x].offset*0.95, particles[x].link.particleSize, particles[x].link.particleSize)
        context.fill();
    }
  }

  if(t !== undefined ){
    t.stop();
  }
  t = d3.timer(tick, 0);
}

update();
