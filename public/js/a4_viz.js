//flag = 7/4 Wed afternoon
//newest version with: dynamic scaling, single tooltip, complete dropdown, chained tooltip, click to stay
//pending: vertical zoom

//Get data
var data;
$.ajax({
  url: '/static/json/a4_data.json',
  async: false,
  dataType: 'json',
  success: function (json) {
    data = json;
  }
});


var vis_width = window.innerWidth *0.9; // outer width
var vis_height = window.innerHeight * 0.8; // outer height

var params = {num:'female_number', rate:'female_rate', min_date: "2021-2-1", max_date: "2021-2-28"}; // parameters to customize the chart
var type_color = {accessories: 1, consumer_electronics: 2, fashions: 3, kids_babies: 4, jewelry: 5, food: 6};
//var type= (['accessories', 'consumer_electronics','fashions', 'kids_babies','facilities', 'jewelry', 'food'])
var floor_color = {B1: 1, B2: 2, L1: 3, L2: 4, L3: 5, L4: 6, L5: 7, L6: 8}
var myColor= d3.scaleOrdinal().range(['#8699ba', '#e6ba79', '#da85be', '#aa406a', '#8474bb', '#ce9757'])

var margin = {top: 20, right: 60, bottom: 20, left: 60};
var width = vis_width - margin.left - margin.right, // inner width
    height = vis_height - margin.top - margin.bottom; // inner height
var comparison = false;

// d3.select('.chart-outer')
//   .remove()

d3.select('#vis')
  .append('svg')
  .attr('class','chart-outer')
  .append('g')
  .attr('class','chart');

// Set the dimensions of the outer chart
d3.select('.chart-outer')
  .attr('width', vis_width)
  .attr('height', vis_height);

var clip = d3.select('.chart')
              .append("defs")
              .append("SVG:clipPath")
              .attr("id", "clip")
              .append("SVG:rect")
              .attr("width", width )
              .attr("height", height )
              .attr("x", 0)
              .attr("y", 0);

// Translate the inner chart to the left and down to create margins.
// Any new object that we append to 'g' will automatically inherit these translations
var svg = d3.select('.chart')
            .append('svg')
            .attr('width', 2000)
            .attr('height', vis_height)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var xScale = d3.scaleTime()// The data range will come from the slider
               .domain([new Date(params['min_date']),new Date(params['max_date'])])
               .range([0, width])

var yScale = d3.scaleLinear()
               .domain([d3.min(data, d=>d[params['rate']]),d3.max(data, d=>d[params['rate']])])
               .range([height, 0]);

// var yScale = d3.scaleLinear()
//                .domain([0,100])
//                .range([height, 0]);

var yScaleStatic = d3.scaleLinear()
                     .domain([0, 100])
                     .range([height, 0]);

var bubbleScale = d3.scaleLinear()
                    .range([10,1000])
                    .domain([_.min(data.map(function(d) { return d[params['num']];})),
                             _.max(data.map(function(d) { return d[params['num']];}))]);

// A line generator function. We'll use this later to draw the curves connected bubbles belonging to the same store

// Add a Y-axis to the chart, put it on the right side of the plot
var formatPercent = d3.format(".0%")
var yAxis = d3.axisLeft(yScale) // puts the tick labels to the right side of the axis
              .tickFormat(formatPercent)
              .tickSize(6);

var yAxis2 = d3.axisRight(yScale) // puts the tick labels to the right side of the axis
               .tickFormat(formatPercent)
               .tickSize(6);

svg.append('g')
    .attr('class', 'y axis')
    .attr("id", "yaxis")
    .attr('transform', 'translate(-25, 0)') // translates the axis to the right side of the plot
    .call(yAxis)

svg.append('g')
    .attr('class', 'y2 axis')
    .attr("id", "yaxis2")
    .attr('transform', 'translate(' + (width+25) + ',' + 0 + ')') // translates the axis to the right side of the plot
    .call(yAxis2)

// Add a title to the Y axis
svg.append("text")
   .attr("class", "axis_title")
   .attr("text-anchor", "middle") // Anchor the text to its center. This is the point we will translate and rotate about
                                 // Translate and rotate the axis title to get it in the right position
   .attr("transform", "translate("+ (-70) + "," + (height/2) + ") rotate(-90)")
   .text("Customer Percentage");

// Define a table of day. We'll add a vertical marker line at each of these days.
var date_labels = [{date: '2021-2-1'},
                   {date: '2021-2-4'},
                   {date: '2021-2-7'},
                   {date: '2021-2-10'},
                   {date: '2021-2-13'},
                   {date: '2021-2-16'},
                   {date: '2021-2-19'},
                   {date: '2021-2-22'},
                   {date: '2021-2-25'},
                   {date: '2021-2-28'}];

// Add a marker line for each row in the date_labels table
svg.selectAll('.date_marker')
    .data(date_labels)
    .enter()
    .append('line')
    .attr('class', 'date_marker')
    .attr('y1', yScaleStatic(0))
    .attr('x1', function(d) {return xScale(new Date(d['date'] ));})
    .attr('x2', function(d) {return xScale(new Date(d['date'] ));})
    .attr('y2', yScaleStatic(100))
    .style('stroke', '#E3E9ED')

// Add a label at the top of the date markers
svg.selectAll('.date_label_top')
    .data(date_labels)
    .enter()
    .append('text')
    .attr('class', 'date_label_top')
    .attr('x', function(d) {return xScale(new Date(d['date'] ));})
    .attr('y', yScaleStatic(100) - 10)
    .text(function(d) {return d['date'].slice(5,10)})

// Add a label at the bottom of the date markers
svg.selectAll('.date_label_bottom')
    .data(date_labels)
    .enter()
    .append('text')
    .attr('class', 'date_label_bottom')
    .attr('x', function(d) {return xScale(new Date(d['date'] ));})
    .attr('y', yScaleStatic(0) + 20)
    .text(function(d) {return d['date'].slice(5,10)})

var line = d3.line()
             .x(function(d) { return xScale(new Date(d['date'])); })
             .y(function(d) { return yScale(d[params['rate']]); })
             .curve(d3.curveMonotoneX) // smooth

// Add the curves to the chart (one for each specific store). Draw curves first to be underneath bubbles
var storeName = d3.set(data.map(function(d) { return d['store_name'];})).values();
var container_path = svg.append('g').attr("class", "all_path")
for (var i = 0; i < storeName.length; i++) {
  var storeName_filt = storeName[i];
  var data_filt = _.filter(data, function(element){ return element.store_name && [element.store_name].indexOf(storeName_filt) != -1;});
      data_filt = data_filt.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); //sort by time

  path = container_path.append('path')
                      .datum(data_filt)
                      //Because this is a datum, to find out if this curve needs to be highlighted we need to look in d[0]['highlight'], not d['highlight']!
                      .attr('id', "curve_" + storeName_filt)
                      .attr('class', "groupPath")
                      .attr('d', line) // call the line generator function defined earlier
                      .style('fill', 'none')
                      .style('stroke', d => myColor(type_color[d[0].type]))
                      .style('stroke-width', 2)
                      .style('stroke-opacity', 0)
};

// Then add the bubbles to the chart (one for each store in each eay)
var clicked = {};
var mousePos;
var container_bubble = svg.append('g').attr("class", "all_bubble")
for (i = 0; i < storeName.length; i++) {
  var storeName_filt = storeName[i];
  var data_filt = _.filter(data, function(element){return element.store_name && [element.store_name].indexOf(storeName_filt) != -1;})
  clicked[storeName_filt] = false;

  text = container_bubble.selectAll()
            .data(data_filt)
            .enter()
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('id', d => "text_" + d["store_name"])
            .attr('class', "groupCircle_text")
            .attr('x', function(d) { return xScale(new Date(d['date']));})
            .attr('y', function(d) { return yScale(parseFloat(d[params['rate']])) + 20 + Math.sqrt((bubbleScale(parseFloat(d[params['num']])))/Math.PI);})

  bubble = container_bubble.selectAll()
              .data(data_filt)
              .enter()
              .append('circle')
              .attr('id', d => d['store_name'])
              .attr('class', "groupCircle")
              .attr('cx', function(d) { return xScale(new Date(d['date']));})
              .attr('cy', function(d) { return yScale(parseFloat(d[params['rate']]));})
              .attr('r', function(d) { return Math.sqrt((bubbleScale(parseFloat(d[params['num']])))/Math.PI);})
              .style('stroke-width', 0)
              .style('fill',  function(d) { return myColor(d.type) })
              .style('fill-opacity', 0.7)
              .on('mouseover', function(d,i){
                   d3.selectAll("#curve_" + d['store_name']).moveToFront();
                   d3.selectAll("#curve_" + d['store_name']).style("stroke-opacity", 1);
                   d3.selectAll("#" + d['store_name']).moveToFront();
                   d3.selectAll("#" + d['store_name']).style("fill-opacity", 1);

                   var label = 'Store name: ' + d['store_name'] + '<br/>' +
                                'Business type: ' + d['type'] + '<br/>' +
                                //'Floor: ' + d['floor'] + '<br/>' +
                                'Number of ' + params['num'].split('_')[0] + ': ' + parseInt(d[params['num']]) + '<br/>' +
                                'Percentage of '+ params['num'].split('_')[0] + ': ' + (d[params['rate']]*100).toFixed(1) + '%'  + '<br/>' ;

                   showDetails(label,this);

                   mousePos = $(this).position()

                   d3.selectAll("#text_" + d["store_name"])
                     .text((d,index) => {return (d[params['rate']]*100).toFixed(1)  + "%"})
                     .moveToFront()
                     .attr('opacity', 0.8)
                     .style('font-size', 12)
              })
              .on('mouseout', function(d,i){
                if(clicked[d.store_name] === false){
                  d3.selectAll("#curve_" + d['store_name']).style("stroke-opacity", 0);
                  d3.selectAll("#text_" + d["store_name"]).text('');
                  d3.selectAll("#" + d['store_name']).style("fill-opacity", 0.5);
                  }
                  hideDetails();
                })
              .on('click', (d,i) => {

                clicked[d.store_name] = !clicked[d.store_name];

                console.log(d.store_name + " it's click flag is " + clicked[d.store_name])

                if (clicked[d.store_name] === true ){
                    console.log("drawing " + d.store_name)

                    d3.selectAll("#text_" + d["store_name"]).filter(function(d,i){return clicked[d.store_name] === true})
                      .clone()
                      .attr("class", "stay_text")
                      .attr("id", "stay_text_" + d['store_name'] + "_" + params['rate'])
                      .text((d,index) => {return (d[params['rate']]*100).toFixed(1) + "%"})
                      .attr("opacity", 0);

                    d3.select('.chart-outer')
                        .append('text')
                        .attr("class", "stayGeneral")
                        .attr("id", "stayGeneral" + "_" + d['store_name'])
                        .attr('x', vis_width - 35)
                        .attr('y', function(){
                          arr = data.filter(a => a['store_name']===d['store_name'])
                          return 30 + yScale(arr[arr.length-1][params['rate']])
                      })
                        .attr("text-anchor", "left")
                        .text(params['rate'] + " of " + d['store_name'])
                        .attr('font-size', 18)
                        .style('fill',  function(color) { return myColor(type_color[d.type]) })
                        .style('opacity', 1);
                }
                else {
                  d3.selectAll("#stay_text_" + d['store_name'] + "_" + params['rate']).remove();
                  d3.selectAll("#stayGeneral_" + d['store_name']).remove()
                }


              })
}

function redraw(data, vis_width, vis_height, params) {

  if (comparison === false){
    Object.keys(clicked).forEach(key => {clicked[key] = false});

    //remove clicked cloned text
    d3.selectAll(".stayGeneral").remove();
    d3.selectAll(".stay_text").remove();

    yScale = d3.scaleLinear()
               .domain([d3.min(data, d=>d[params['rate']]),d3.max(data, d=>d[params['rate']])])
               .range([height, 0]);

    yAxis = d3.axisLeft(yScale) // puts the tick labels to the right side of the axis
              .tickFormat(formatPercent)
              .tickSize(6);

    yAxis2 = d3.axisRight(yScale) // puts the tick labels to the right side of the axis
               .tickFormat(formatPercent)
               .tickSize(6);

    d3.select(".y")
      .transition()
      .call(yAxis);

    d3.select(".y2")
      .transition()
      .call(yAxis2);

    d3.selectAll('.groupPath').remove()

    for (var i = 0; i < storeName.length; i++) {
      var storeName_filt = storeName[i];
      var data_filt = _.filter(data, function(element){ return element.store_name && [element.store_name].indexOf(storeName_filt) != -1;});
          data_filt = data_filt.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); //sort by time

      path = container_path.append('path')
                          .datum(data_filt)
                          //Because this is a datum, to find out if this curve needs to be highlighted we need to look in d[0]['highlight'], not d['highlight']!
                          .attr('id', "curve_" + storeName_filt)
                          .attr('class', "groupPath")
                          .attr('d', line) // call the line generator function defined earlier
                          .style('fill', 'none')
                          .style('stroke', d => myColor(type_color[d[0].type]))
                          .style('stroke-width', 2)
                          .style('stroke-opacity', 0)
    };

    let bubbleScale1 = d3.scaleLinear()
                        .range([10,1000])
                        .domain([_.min(data.map(function(d) { return d[params['num']];})),
                                 _.max(data.map(function(d) { return d[params['num']];}))]);
    d3.selectAll(".groupCircle")
      .transition()
      .duration(300)
      .attr('cx', function(d) { return xScale(new Date(d['date']));})
      .attr('cy', function(d) { return yScale(parseFloat(d[params['rate']]));})
      .attr('r', function(d) { return Math.sqrt((bubbleScale1(parseFloat(d[params['num']])))/Math.PI);})
      .style('fill-opacity', 0.6)

    d3.selectAll('.groupCircle_text')
      .attr('x', function(d) { return xScale(new Date(d['date']));})
      .attr('y', function(d) { return yScale(parseFloat(d[params['rate']])) + 20 + Math.sqrt((bubbleScale(parseFloat(d[params['num']])))/Math.PI);})
      .text('')
  }
  else {
    d3.selectAll('.groupPath').filter(function(d,i){return clicked[d[0].store_name] === true})
      .clone()
      .attr("class", "stay_curve")
      .attr("id", "");

    d3.selectAll(".groupCircle").filter(function(d,i){return clicked[d.store_name] === true})
      .clone()
      .attr("class", "stay_bubble")
      .attr("id", "")
      .style("fill-opacity", 1);

    d3.selectAll(".stay_text")
      .attr("opacity", 0.8);

    Object.keys(clicked).forEach(key => {clicked[key] = false});

    yScale = d3.scaleLinear()
               .domain([d3.min(data, d=>d[params['rate']]),d3.max(data, d=>d[params['rate']])])
               .range([height, 0]);

    yAxis = d3.axisLeft(yScale) // puts the tick labels to the right side of the axis
              .tickFormat(formatPercent)
              .tickSize(6);

    yAxis2 = d3.axisRight(yScale) // puts the tick labels to the right side of the axis
               .tickFormat(formatPercent)
               .tickSize(6);

    d3.select(".y")
      .transition()
      .call(yAxis);

    d3.select(".y2")
      .transition()
      .call(yAxis2);

    d3.select(".axis")
      .transition()
      .call(yAxis);

    d3.selectAll('.groupPath').remove();

    for (var i = 0; i < storeName.length; i++) {
      var storeName_filt = storeName[i];
      var data_filt = _.filter(data, function(element){ return element.store_name && [element.store_name].indexOf(storeName_filt) != -1;});
          data_filt = data_filt.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); //sort by time

      path = container_path.append('path')
                          .datum(data_filt)
                          //Because this is a datum, to find out if this curve needs to be highlighted we need to look in d[0]['highlight'], not d['highlight']!
                          .attr('id', "curve_" + storeName_filt)
                          .attr('class', "groupPath")
                          .attr('d', line) // call the line generator function defined earlier
                          .style('fill', 'none')
                          .style('stroke', d => myColor(type_color[d[0].type]))
                          .style('stroke-width', 2)
                          .style('stroke-opacity', 0)
    };

    let bubbleScale2 = d3.scaleLinear()
                        .range([10,1000])
                        .domain([_.min(data.map(function(d) { return d[params['num']];})),
                                 _.max(data.map(function(d) { return d[params['num']];}))]);

    d3.selectAll(".groupCircle")
      .transition()
      .duration(300)
      .attr('cx', function(d) { return xScale(new Date(d['date']));})
      .attr('cy', function(d) { return yScale(parseFloat(d[params['rate']]));})
      .attr('r', function(d) { return Math.sqrt((bubbleScale2(parseFloat(d[params['num']])))/Math.PI);})
      .style('fill-opacity', 0.6)

    d3.selectAll('.groupCircle_text')
      .attr('x', function(d) { return xScale(new Date(d['date']));})
      .attr('y', function(d) { return yScale(parseFloat(d[params['rate']])) + 20 + Math.sqrt((bubbleScale(parseFloat(d[params['num']])))/Math.PI);})
      .text('')


  }

}

var zoom = d3.zoom()
             .scaleExtent([.5, 20])
             .extent([[0,0], [width, height]])
             .on("zoom", updateChart);

function updateChart() {
  var new_xScale = d3.event.transform.rescaleX(xScale);
  var new_yScale = d3.event.transform.rescaleY(yScale);

  yAxis.call(d3.axisLeft(new_yScale));
}

function clearView() {
  Object.keys(clicked).forEach(key => {clicked[key] = false});

  d3.selectAll(".groupPath")
    .transition()
    .duration(100)
    .style("stroke-opacity", 0);

  d3.selectAll(".groupCircle")
    .transition()
    .duration(200)
    .style('fill-opacity', 0.6)

  d3.selectAll('.groupCircle_text')
    .transition()
    .duration(300)
    .text('')


  d3.selectAll(".stay_text").remove();
  d3.selectAll(".stay_curve").remove();
  d3.selectAll(".stay_bubble").remove();
  d3.selectAll(".stayGeneral").remove();
}

function toggle() {
  if (comparison === true){
    clearView();
  };

  comparison = !comparison;
  console.log("now comparison is " + comparison)
}

var showDetails = function(data, element) {
  pos = $(element).position()
  $('#chart-tooltip').html(data)
  // display the tooltip above and to the right of the selected object
  $('#chart-tooltip').css('top', (pos.top-$('#chart-tooltip').height()*1.5)+'px').css('left', (pos.left-$('#chart-tooltip').width()/2.0)+'px');
  $('#chart-tooltip').show()

};

var hideDetails = function() {
    $('#chart-tooltip').hide()
  };

// Helper fucntion to move objects to the front of the draw queue. This means no other objects will overlap with it.
d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
      this.parentNode.appendChild(this);
      });
};

var createToolbar = function(data, params) {
  // an array of the customer Label names in the input data
  var customerLabel = d3.set(data.map(function(d) { return d['dropdown'];})).values();
  customerLabel.pop();
  // create pickers for both the customer label title
  var dimensions = ['label'];
  var toolbar_labels = ['Label of Customer']; // This will be displayed to the left of the dropdown menu

  // We don't need a for-loop here, since we're only adding a single dropdown menu,
  // but this code is handy to have if you ever need to add multiple dropdowns, so I'm keeping it in.
  for(var i_dim in dimensions) {
    var dim = dimensions[i_dim];
    var label = toolbar_labels[i_dim];

    // create the <select></select> dropdown menu
    $('#toolbar').append("<div class='form-group'><label for='"+dim+"-var'>"+label+":</label><select class='form-control' id='"+dim+"-var' value='youth_rate'></select></div>")
    // populate the dropdown with the customer label options (<option></option>)
    for(i_label in customerLabel) {
      label_name = customerLabel[i_label];
      $('#'+dim+'-var').append("<option value='"+label_name+"'>"+label_name+"</option>");
    }
    // set picker to saved param values
    $('#'+dim+'-var').val(params['rate']);

    // handle change to select, wrap in anonymous function so the pickers don't clash
    $('#'+dim+'-var').change(function(dim) {
      return function() {
        var newVar = $('#'+dim+'-var').val();
        params[dim+'axis'] = newVar;
        params[dim+'axislabel'] = newVar;
        params['num'] = $("#label-var").val().replace("rate", "number");
        params['rate'] = $("#label-var").val();

        redraw(data,vis_width,vis_height,params);
      }
    }(dim));
  }
}

// Execute the se functions to actually build the chart
//createSlider(data, params);
createToolbar(data, params);
// Append a div container to the #vis div containter. This container will hold our tooltips.
// Hide the tooltips by default, we'll display them only when the user hovers over a bubble.
$('#vis').append("<div class='tooltip' id='chart-tooltip'></div>");
$('#chart-tooltip').hide();
