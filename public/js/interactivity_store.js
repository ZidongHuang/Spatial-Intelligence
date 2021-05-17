
const apisUrl='http://161.189.24.17:3005'
var store_id_sel;
var stores_sel;
var startDateTime='';
var endDateTime='';
var booth2store={};
var store_names={}
var all_data_in_floor={}
var cnt=0
var property_id = "beijing_hopson_one"
const color_platter= ['#e6ba79', '#da85be', '#aa406a', '#8474bb', '#3caea3'];   
const default_data = [{'age17to30': 0,
    'age31to45': 0,
    'age46to60': 0,
    'ageless16': 0,
    'bodyfat': 0,
    'bodynormal': 0,
    'bodythin': 0,
    'customer': 0,
    'employee': 0,
    'end_time': "3000-05-01 00:00:00",
    'enter_cnt': 0,
    'enter_rate': 1,
    'exit_cnt': 1,
    'female': 0,
    'hs_baldhead': 0,
    'hs_blackhair': 0,
    'hs_glasses': 0,
    'hs_hat': 0,
    'hs_longhair': 0,
    'intersect_enter': 0,
    'intersect_exit': 0,
    'passer_cnt': 0,
    'start_time': "3000-01-01 00:00:00",
    'store_id': "",
    'watcher_cnt': 0}];

const id2height={
    '_801': 720000,
    '_800': 600000,
    '_799': 480000,
    '_798': 360000,
    '_797': 240000,
    '_796': 120000,
    '_795': 0,
    '_802': -120000,
    '_803': -240000
}

$('#datetime-body').append($('<input>',{
    placeholder:'Select A date and time: ',
    class:'form-control',
    id: 'input',
}));

//explode button
var button1=$('#button-explode2').append($('<button>',{
    id: 'btn-explode2',
    class: 'btn',
    type: 'button',
    text: 'Explode'
}));

//show default data on loading
console.log('test begin')
createRadarChart(default_data);
// createDonutChart(default_data);
createCircBarChart(default_data);
createPiechart(default_data);


$.post(apisUrl + '/get_available_date', {'property_id': property_id}, function(data, textStatus, jqXHR){
    $('#datetime-body').daterangepicker({minDate:moment(data[0].start_date),
                                         maxDate:moment(data[0].end_date),
                                         timePicker: true, 
                                         timePicker24Hour: true,
                                         alwaysShowCalendars: false})
});

$.post(apisUrl + '/get_store_info', {'property_id': property_id}, function(data, textStatus, jqXHR){
    console.log(textStatus);
    for (let i=0;i<data.length;i++){
        store_names[data[i].store_berth]=data[i].store_name
    }
    console.log('store_names', store_names);
});

  
$('#datetime-body').on('apply.daterangepicker',function(){
    startDateTime = $('#datetime-body').data('daterangepicker').startDate.format('YYYY-MM-DD HH:mm:ss');
    endDateTime = $('#datetime-body').data('daterangepicker').endDate.format('YYYY-MM-DD HH:mm:ss');
    $('#input').attr('placeholder', startDateTime+' - '+endDateTime);
    if (store_id_sel){
        loadRangeData(startDateTime,endDateTime,store_names[store_id_sel]);
    }
});

floorGroup.on('loaded',function(){
    cameraControl.on("picked", function (hit) {  
    if(Object.keys(store_names).includes(hit.mesh.id)){
        stores_sel=currentFloorStores;
            if  (stores_sel.includes(hit.mesh.id)){
                store_id_sel=hit.mesh.id
            }
            if (store_id_sel){
                loadRangeData(startDateTime,endDateTime,store_names[store_id_sel]);

            }
        }
    console.log('all stores on floor ', currentFloorStores)
    all_data_in_floor={}   
    });

});

storeGroup.on('loaded',function(){
    button1.on('click',function(){
        // event: change placeholder text and exlopde the model
        var text=this.lastChild.innerText
        // env.visible=false;
        if (text == 'Explode'){
            this.lastChild.innerText='Contract'
            explode();
        }
        else{this.lastChild.innerText='Explode';
            // env.visible=true;
            contract();      
        }
    });
    function explode(){
        var height = 0
        // console.log('exploded!')
        for (const [key, value] of Object.entries(floorGroup.meshes)) {
            p = id2height[key];
        //    console.log(key)
            value.position=[0,p,0];
        //    console.log(value.position)

            //store location change
            for (const [k,v] of Object.entries(storeGroup.meshes)){
                // console.log('store',k.slice(0,2))
                // console.log('floor',p)
                // if stores are on the floor
                if (k.slice(0,2)==id2floor[key]){
                    v.position=[0,p+10,0]
                    v.visible = true;
                    // console.log(v.position)
                }

            }
            
        };
        console.log(storeGroup.meshes);
    };
    
    function contract(){
        // console.log('contracted!')
        for (const [key, value] of Object.entries(floorGroup.meshes)) {
           value.position=[0,0,0]
        //    console.log(value.position)
        };
        for (const [key, value] of Object.entries(storeGroup.meshes)) {
            //    console.log(key)
            value.position=[0,0,0]
            //    console.log(value.position)
            };
    }
});

function loadRangeData(startDateTime,endDateTime,store_id){

    console.log('store: ', store_id)
    console.log("search btwn: ",startDateTime,endDateTime)
    

    $.post(apisUrl + '/get_store_kpis2', {'start_time': startDateTime, 'end_time': endDateTime, 'store_id': store_id,'property_id': property_id}, function(data, textStatus, jqXHR){
        if (textStatus=='success'){
            // console.log('data requested!');

            createRadarChart(data);
            // createDonutChart(data);
            createCircBarChart(data);
            createPiechart(data);
        }
        else alert('fail loading data');

    })
}

function createRadarChart(data){
    $('#radar-chart').empty();

    var enter_cnt=new Array();
    var exit_cnt=new Array();
    var watcher_cnt=new Array();
    // var passer_cnt=new Array();

    var store_id=data[0].store_id;

    data.forEach(d=> {
        enter_cnt.push(parseInt(d.enter_cnt))
        exit_cnt.push(parseInt(d.exit_cnt))
        watcher_cnt.push(parseInt(d.watcher_cnt))
        // passer_cnt.push(parseInt(d.passer_cnt))
    });

    var enter_tot=enter_cnt.reduce(function(a,b){return a+b},0);
    var exit_tot=exit_cnt.reduce(function(a,b){return a+b},0);
    var watcher_tot=watcher_cnt.reduce(function(a,b){return a+b},0);
    var total=enter_tot+exit_tot+watcher_tot

    var options = {
        series: [{
        name: 'Percent',
        data: [(enter_tot/total*100).toFixed(1), (exit_tot/total*100).toFixed(1), (watcher_tot/total*100).toFixed(1)],
    }],
        chart: {
        height: 300,
        type: 'radar',
        
    },
    dataLabels: {
        enabled: false
    },
    plotOptions: {
        radar: {
        size:110,
        polygons: {
            strokeColors: 'white',
            strokeWidth: 0.5,
            fill: {
            colors: ['#aa406a', '#8474bb', '#3caea3']
            }
        }
        }
    },
    title: {
        text: 'Store Name： '+ store_id,
        style: {
            color:'white'
        },
    },
    colors: ['white'],
    markers: {
        size: 2,
        colors: ['white'],
        strokeColor: 'white',
        strokeWidth: 4,
    },
    tooltip: {
        y: {
        formatter: function(val) {
            return val
        }
        }
    },
    tooltip: {
        y: {
        formatter: function(val) {
            return val
        }
        }
    },
    xaxis: {
        categories: ['Enter Rate(%)', 'Exit Rate(%)', 'Watcher Rate(%)'],
        labels:{
            style:{
                colors: 'white'
            }
        }  
    },
    yaxis: {
        min: 0,
        max: 100,
        tickAmount: 8,
        labels: {
        formatter: function(val, i) {
            if (i % 2 === 0) {
            return val
            } else {
            return ''
            }
        },
        style:{
            colors:'white'
        }
        }
    }
    };

    var chart = new ApexCharts(document.querySelector("#radar-chart"), options);
    chart.render();
};

// donut Chart gender
// function createDonutChart(data){
//     $('#donut-chart').empty();

//     var enter_cnt=new Array();
//     var exit_cnt=new Array();
//     var watcher_cnt=new Array();
//     // var passer_cnt=new Array();

//     data.forEach(d=> {
//         enter_cnt.push(parseInt(d.enter_cnt))
//         exit_cnt.push(parseInt(d.exit_cnt))
//         watcher_cnt.push(parseInt(d.watcher_cnt))
//         // passer_cnt.push(parseInt(d.passer_cnt))
//     });

//     var enter_tot=enter_cnt.reduce(function(a,b){return a+b},0);
//     var exit_tot=exit_cnt.reduce(function(a,b){return a+b},0);
//     // var passer_tot=passer_cnt.reduce(function(a,b){return a+b},0);
//     var watcher_tot=watcher_cnt.reduce(function(a,b){return a+b},0);
//     var total=enter_tot+exit_tot+watcher_tot

//     var options = {
//         series: [enter_tot,exit_tot,watcher_tot],
//         chart: {
//         type: 'donut',
//         height: '100%'
//       },
//       dataLabels: {
//         enabled: false
//       },
//       tooltip: {
//         y: {
//         formatter: function(val) {
//             return (val*100/total).toFixed(1)
//         }
//         }
//     },
//       colors: ['#FF7D91', '#FF0091','#630063'],
//       labels:['Enter Rate(%)', 'Exit Rate(%)', 'Watcher Rate(%)'],
//       legend: {
//         position: 'top',
//         fontSize:'8px',
//         markers: {
//             width:8,
//             height: 8,
//         },
//         labels: {
//             colors: 'white',
//             useSeriesColors: false
//         },
//       }
//       };

//       var chart = new ApexCharts(document.querySelector("#donut-chart"), options);
//       chart.render();
// }

// circlular bar Chart body figure
function createCircBarChart(data){
    $('#circbar-chart').empty();

    var enter_cnt=new Array();
    var exit_cnt=new Array();
    var watcher_cnt=new Array();
    // var passer_cnt=new Array();

    data.forEach(d=> {
        enter_cnt.push(parseInt(d.enter_cnt))
        exit_cnt.push(parseInt(d.exit_cnt))
        watcher_cnt.push(parseInt(d.watcher_cnt))
        // passer_cnt.push(parseInt(d.passer_cnt))
    });

    var enter_tot=enter_cnt.reduce(function(a,b){return a+b},0);
    var exit_tot=exit_cnt.reduce(function(a,b){return a+b},0);
    // var passer_tot=passer_cnt.reduce(function(a,b){return a+b},0);
    var watcher_tot=watcher_cnt.reduce(function(a,b){return a+b},0);
    var total=enter_tot+exit_tot+watcher_tot

    var options = {
        series: [enter_tot/total*270, exit_tot/total*270, watcher_tot/total*270],
        chart: {
        height: '100%',
        type: 'radialBar',
      },
      
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            }
          }
        }
      },
      colors: ['#aa406a', '#8474bb', '#3caea3'],
      labels: ['Enter Number', 'Exit Number', 'Watcher Number'],
      legend: {
        show: true,
        floating: true,
        fontSize: '10px',
        position: 'left',
        // width: 100,
        height: 100,
        offsetX: -10,
        offsetY: -10,
        labels: {
          colors:'white',
          useSeriesColors: false,
        },
        markers: {
            width:6,
            height: 6,
          },
        formatter: function(seriesName, opts) {
          return seriesName + ":  " + Math.round(opts.w.globals.series[opts.seriesIndex]/285*total)
        },
        itemMargin: {
          vertical: -2
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
              show: false
          }
        }
      }]
      };

      var chart = new ApexCharts(document.querySelector("#circbar-chart"), options);
      chart.render();
}

function dataWrangle(data){
    var enter_cnt=new Array();
    var exit_cnt=new Array();
    var female_cnt=new Array();
    var male_cnt=new Array();
    var age16minus_cnt=new Array();
    var age17to30_cnt=new Array();
    var age31to45_cnt=new Array();
    var age46to60_cnt=new Array();
    var age60plus_cnt=new Array();
    var bodyfat_cnt=new Array();
    var bodynormal_cnt=new Array();
    var bodythin_cnt=new Array();
    var baldhead_cnt=new Array();
    var longhair_cnt=new Array();
    var otherhair_cnt=new Array();
    var blackhair_cnt=new Array();
    var othercolorhair_cnt=new Array();
    var withglasses_cnt=new Array();
    var noglasses_cnt=new Array();
    var hashat_cnt=new Array();
    var nohat_cnt=new Array();

    data.forEach(d=> {
        enter_cnt.push(parseInt(d.enter_cnt))
        exit_cnt.push(parseInt(d.exit_cnt))
        female_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.female))
        male_cnt.push(parseInt(d.enter_cnt+d.exit_cnt)-Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.female))
        age16minus_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.ageless16))
        age17to30_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.age17to30))
        age31to45_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.age31to45))
        age46to60_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.age46to60))
        age60plus_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*(1-d.age17to30-d.ageless16-d.age31to45-d.age46to60)))
        bodyfat_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.bodyfat))
        bodynormal_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.bodynormal))
        bodythin_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.bodythin))
        baldhead_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.hs_baldhead))
        longhair_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.hs_longhair))
        otherhair_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*(1-d.hs_baldhead-d.hs_longhair)))
        blackhair_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.hs_blackhair))
        othercolorhair_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*(1-d.hs_blackhair)))
        withglasses_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.hs_glasses))
        noglasses_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*(1-d.hs_glasses)))
        hashat_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*d.hs_hat))
        nohat_cnt.push(Math.round(parseInt(d.enter_cnt+d.exit_cnt)*(1-d.hs_hat)))
    });

    // var enter_tot=enter_cnt.reduce(function(a,b){return a+b},0);
    // var exit_tot=exit_cnt.reduce(function(a,b){return a+b},0);
    var female_tot=female_cnt.reduce(function(a,b){return a+b},0);
    var male_tot=male_cnt.reduce(function(a,b){return a+b},0);
    var age16minus_tot=age16minus_cnt.reduce(function(a,b){return a+b},0);
    var age17to30_tot=age17to30_cnt.reduce(function(a,b){return a+b},0);
    var age31to45_tot=age31to45_cnt.reduce(function(a,b){return a+b},0);
    var age46to60_tot=age46to60_cnt.reduce(function(a,b){return a+b},0);
    var age60plus_tot=age60plus_cnt.reduce(function(a,b){return a+b},0);
    var bodyfat_tot=bodyfat_cnt.reduce(function(a,b){return a+b},0);
    var bodynormal_tot=bodynormal_cnt.reduce(function(a,b){return a+b},0);
    var bodythin_tot=bodythin_cnt.reduce(function(a,b){return a+b},0);
    var baldhead_tot=baldhead_cnt.reduce(function(a,b){return a+b},0);
    var longhair_tot=longhair_cnt.reduce(function(a,b){return a+b},0);
    var otherhair_tot=otherhair_cnt.reduce(function(a,b){return a+b},0);
    var blackhair_tot=blackhair_cnt.reduce(function(a,b){return a+b},0);
    var othercolorhair_tot=othercolorhair_cnt.reduce(function(a,b){return a+b},0);
    var withglasses_tot=withglasses_cnt.reduce(function(a,b){return a+b},0);
    var noglasses_tot=noglasses_cnt.reduce(function(a,b){return a+b},0);
    var hashat_tot=hashat_cnt.reduce(function(a,b){return a+b},0);
    var nohat_tot=nohat_cnt.reduce(function(a,b){return a+b},0);

    return [[female_tot,male_tot],
            [age16minus_tot,age17to30_tot,age31to45_tot,age46to60_tot,age60plus_tot],
            [bodyfat_tot,bodynormal_tot,bodythin_tot],
            [baldhead_tot,longhair_tot,otherhair_tot],
            [blackhair_tot,othercolorhair_tot],
            [withglasses_tot,noglasses_tot],
            [hashat_tot,nohat_tot]]
}


function createPiechart(data){
    var options={
        val1: 'Gender',
        val2: 'Age',
        val4: 'Hair-style',
        val5: 'Hair-color',
        val6: 'Glasses',
        val7: 'Hats'
    }
    $('#dropdown').empty()
    var mySelect = $('#dropdown').append("<select id='mySelect'>");
    $.each(options, function(val, text) {
        $('#mySelect').append(
            $('<option></option>').val(val).html(text)
        );
    });

    labels=[
        ['Female','Male'],
        ['Baby','Teenager','Youth','Middle-age','Senior'],
        ['Bold','Long-hair','Other-hair-length'],
        ['Black-hair','Other-hair-color'],
        ['Glasses','Without-glasses'],
        ['Hats','Without-hats']
    ]


    mySelect.on('change',function(){
        // $('#pie-chart').empty();
        var my_select=document.getElementById('mySelect')
        var selected_id= my_select.selectedIndex
        var displayData=dataWrangle(data)[selected_id]
        var displayLabel=labels[selected_id]
        var displayColor=color_platter.slice(0,displayLabel.length)
        console.log(displayData,displayLabel,displayColor)
        DonutChartBasic(displayData,displayLabel,displayColor)
    })
    
    DonutChartBasic(dataWrangle(data)[0],labels[0],color_platter.slice(0,labels[0].length));


    
}
function DonutChartBasic(data,labels,colors){
    $('#pie-chart').empty();
    var total=data.reduce(function(a,b){return a+b},0)
    var options = {
        series: data,
        chart: {
        type: 'donut',
        height: '90%',
        offsetY: 50  
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        y: {
        formatter: function(val) {
            return (val*100/total).toFixed(1)+"%"
        }
        }
    },
      colors: colors,
      labels:labels,
      legend: {
        position: 'bottom',
        fontSize:'10px',
        labels: {
            colors: 'white',
            useSeriesColors: false
        },
      },
      title: {
        text: 'Customer Feature Rate:',
        align: 'left',
        margin: 12,
        offsetX: 0,
        offsetY: 0,
        floating: true,
        style: {
          fontSize:  '14px',
          fontWeight:  'bold',
          fontFamily:  undefined,
          color:  'white'
        },
        }
    };

      var chart = new ApexCharts(document.querySelector("#pie-chart"), options);
      chart.render();
}






    