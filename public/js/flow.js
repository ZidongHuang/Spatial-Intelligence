var outerWidth = 1200;
var outerHeight = 550;

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("display", "none");

var margin = {top: 1, right: 1, bottom: 1, left: 1},
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category10();

var svg = d3.select(".svg1")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select(".svg2")
             .attr("width", 1300)
             .attr("height", outerHeight);

var sankey = d3.sankey()
               .nodeWidth(15)
               .nodePadding(15)
               .size([1200, 550])
               //.align('left');

var freqCounter = 1;

var flow;
$.ajax({
  url: '/static/js/data/gender_2021-02-01.json',
  async: false,
  dataType: 'json',
  success: function (json) {
    flow = json;
  }
});

sankey.nodes(flow.nodes)
      .links(flow.links)
      .layout(32);

// console.log("links", flow.links);
// console.log("nodes", flow.nodes);

var path = sankey.link();

var link = svg.append("g").selectAll(".link")
    .data(flow.links)
  .enter().append("path")
    .attr("class", d => {return "link " + d.source.name + " " + d.target.name})
    .attr("d", path)
    .style("stroke-width", function(d) { return Math.max(1, d.dy ); })
    .style("stroke-opacity", 0.05)
    .on("mouseover", d => {
      d3.selectAll(".link").filter("." + d.source.name).filter("." + d.target.name)
        .style("stroke-opacity", 0.1)

      flow.links.forEach(function (link) {
        if(link.source.name === d.source.name && link.target.name === d.target.name){
          link.particleSize = 2.5;}
        else{link.particleSize = 0.5;}
       })

      div.style("display", "inline");

    })
    .on("mousemove", function(d){
      div
            .text("Now there are " + d.value + " " + d.source.name + " entering the " + d.target.name)
            .style("left", (d3.event.pageX -80) + "px")
            .style("top", (d3.event.pageY - 100) + "px");
    })
    .on("mouseout", d => {
      d3.selectAll(".link").filter("." + d.source.name).filter("." + d.target.name)
        .style("stroke-opacity", 0.05)

      flow.links.forEach(function (link) {
        link.particleSize = 1.5;
       })

      div.style("display", "none");

    })
    .sort(function(a, b) { return b.dy - a.dy; });

var node = svg.append("g").selectAll(".node")
    .data(flow.nodes)
  .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y +  ")"; })
    .on("mouseover", d => {
      d3.selectAll("."+d.name)
        .style("stroke-opacity", 0.1);

      flow.links.forEach(function (link) {
        if(link.source.name === d.name || link.target.name === d.name){
          link.particleSize = 2.5;}
        else{link.particleSize = 0.5;}
       })

    })
    .on("mouseout",d => {
      d3.selectAll("."+d.name)
        .style("stroke-opacity", 0.05)

      flow.links.forEach(function (link) {
        link.particleSize = 1.5;
      })
    })
  .call(d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", function() { this.parentNode.appendChild(this); })
    .on("drag", dragmove))

node.append("rect")
    .attr("class", d => d.name)
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
    .style("stroke", "none")
  .append("title")
    .text(function(d) { return d.name + "\n" + format(d.value); });

node.append("text")
    .attr("x", -6)
    .attr("y", function(d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .attr("fill",  function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
    .text(function(d) { return d.name; })
  .filter(function(d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

// var notesRight = svg2.append('g').selectAll(".notesRight")
//                 .data(flow.links)
//                 .enter()
//                 .append("text")
//                 .attr("transform", function(d) {
//                   let temp = d.target.y + d.ty + (d.dy / 2);
//                   return "translate(" + d.target.x + "," + temp +  ")"; })
//                 .attr("x", 195)
//                 // .attr("y", function(d) { return d.dy / 2; })
//                 .attr("dy", ".5em")
//                 .attr("text-anchor", "start")
//                 .attr("font-size", "8px")
//                 .text(function(d) { return d3.format(".0%")(d.value / d.target.value) + " " + d.source.name })
//
// var notesLeft = svg2.append('g').selectAll(".notesLight")
//                 .data(flow.links)
//                 .enter()
//                 .append("text")
//                 .attr("transform", function(d) {
//                   let temp = d.source.y + d.sy + (d.dy / 2);
//                   return "translate(" + d.source.x + "," + temp +  ")"; })
//                 .attr("x", 160)
//                 // .attr("y", function(d) { return d.dy / 2; })
//                 .attr("dy", ".5em")
//                 .attr("text-anchor", "end")
//                 .attr("font-size", "8px")
//                 .text(function(d) { return d.target.name + " " + d3.format(".0%")(d.value / d.source.value) })

function dragmove(d) {
  d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
  sankey.relayout();
  link.attr("d", path);
}

// draw particles
var linkExtent = d3.extent(flow.links, function (d) {return d.value});
var frequencyScale = d3.scale.linear().domain(linkExtent).range([0.05,1]);
var particleSizeScale = d3.scale.linear().domain(linkExtent).range([1,5]);
var particleSpeedScale = d3.scale.linear().domain(linkExtent).range([1, 5]);
var particles = [];
var p_counts = 0;

flow.links.forEach(function (link) {
  link.freq = frequencyScale(link.value);
  link.particleSize = 1.5;
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
          var offset = (Math.random() - .5) * (d.dy - 4);
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
  //console.log(p_counts);
  // if(elapsed > 5000) t.stop();
}

function particleEdgeCanvasPath(elapsed) {
  //get canvas 2d context for drawing
  var context = d3.select("canvas").node().getContext("2d");
  //clear previous particles
  context.clearRect(0,0,1200,1000);
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
      context.fillStyle = particles[x].link.particleColor(1);
      context.arc(currentPos.x, currentPos.y + particles[x].offset, particles[x].link.particleSize, 0, 2*Math.PI); // draw circle
      context.fill();
  }
}

//keep generating particles
var t = d3.timer(tick, 0);

var stop_flag = true;

var stop = function(timer){
  if(stop_flag){
    timer.stop();
    stop_flag = !stop_flag;
  }else{
    timer.restart(tick, 0);
    stop_flag = !stop_flag;
  }
}


var update = function(timer){
  var category = document.getElementById("category").value;
  var date = document.getElementById("date").value;
  console.log(date);
  var url = '/static/js/data/' + category + "_" + date + '.json'

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

  timer.stop();
  d3.select("canvas").node().getContext("2d").clearRect(0,0,1200,1000);
  d3.selectAll('.link').remove();
  d3.selectAll(".node").remove();

  link = svg.append("g").selectAll(".link")
      .data(flow.links)
    .enter().append("path")
      .attr("class", d => {return "link " + d.source.name + " " + d.target.name})
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy ); })
      .style("stroke-opacity", 0.05)
      .on("mouseover", d => {
        d3.selectAll(".link").filter("." + d.source.name).filter("." + d.target.name)
          .style("stroke-opacity", 0.1)

        flow.links.forEach(function (link) {
          if(link.source.name === d.source.name && link.target.name === d.target.name){
            link.particleSize = 2.5;}
          else{link.particleSize = 0.5;}
         })

        div.style("display", "inline");

      })
      .on("mousemove", function(d){
        div
              .text("Now there are " + d.value + " " + d.source.name + " entering the " + d.target.name)
              .style("left", (d3.event.pageX -80) + "px")
              .style("top", (d3.event.pageY - 100) + "px");
      })
      .on("mouseout", d => {
        d3.selectAll(".link").filter("." + d.source.name).filter("." + d.target.name)
          .style("stroke-opacity", 0.05)

        flow.links.forEach(function (link) {
          link.particleSize = 1.5;
         })

        div.style("display", "none");
      })
      .sort(function(a, b) { return b.dy - a.dy; });

  var node = svg.append("g").selectAll(".node")
      .data(flow.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y +  ")"; })
      .on("mouseover", d => {
        d3.selectAll("."+d.name)
          .style("stroke-opacity", 0.1);

        flow.links.forEach(function (link) {
          if(link.source.name === d.name || link.target.name === d.name){
            link.particleSize = 2.5;}
          else{link.particleSize = 0.5;}
         })

      })
      .on("mouseout",d => {
        d3.selectAll("."+d.name)
          .style("stroke-opacity", 0.05)

        flow.links.forEach(function (link) {
          link.particleSize = 1.5;
        })
      })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove))

  node.append("rect")
      .attr("class", d => d.name)
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", "none")
    .append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .attr("fill",  function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  var linkExtent = d3.extent(flow.links, function (d) {return d.value});
  var frequencyScale = d3.scale.linear().domain(linkExtent).range([0.05,1]);
  var particleSizeScale = d3.scale.linear().domain(linkExtent).range([1,5]);
  var particleSpeedScale = d3.scale.linear().domain(linkExtent).range([1, 5]);
  var particles = [];
  var p_counts = 0;

  flow.links.forEach(function (link) {
    link.freq = frequencyScale(link.value);
    link.particleSize = 1.5;
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
            var offset = (Math.random() - .5) * (d.dy - 4);
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
    //console.log(p_counts);
    // if(elapsed > 5000){t.stop()};
  }

  function particleEdgeCanvasPath(elapsed) {
    //get canvas 2d context for drawing
    var context = d3.select("canvas").node().getContext("2d");
    //clear previous particles
    context.clearRect(0,0,1200,1000);
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
        context.fillStyle = particles[x].link.particleColor(1);
        context.arc(currentPos.x, currentPos.y + particles[x].offset, particles[x].link.particleSize, 0, 2*Math.PI); // draw circle
        context.fill();
    }
  }

  var t = d3.timer(tick, 0);
}
