
const apisUrl='http://161.189.24.17:3005'
var store_id_sel;
var stores_sel;
var startDateTime='';
var endDateTime='';
var booth2store={};
var store_names={}
var all_data_in_floor={}
var cnt=0
const color_platter= ['#630063','#FF0091','#FF7D91','#FFAB91','#bdbdbd'];

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
    placeholder:'选择日期时间: ',
    class:'form-control',
    id: 'input',
}));



$.post(apisUrl + '/get_available_date', function(data, textStatus, jqXHR){
    $('#datetime-body').daterangepicker({minDate:moment(data[0].start_date),
                                         maxDate:moment(data[0].end_date),
                                         timePicker: true, 
                                         timePicker24Hour: true,
                                         alwaysShowCalendars: false})
});

$.post(apisUrl + '/get_store_info', function(data, textStatus, jqXHR){
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
    })
});

function loadRangeData(startDateTime,endDateTime,store_id){

    console.log('store: ', store_id)
    console.log("search btwn: ",startDateTime,endDateTime)
    

    $.post(apisUrl + '/get_store_kpis2', {'start_time': startDateTime, 'end_time': endDateTime, 'store_id': store_id}, function(data, textStatus, jqXHR){
        if (textStatus=='success'){
            // console.log('data requested!');

            createRadarChart(data);
            createDonutChart(data);
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
        name: '百分比',
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
        size:120,
        polygons: {
            strokeColors: 'white',
            strokeWidth: 0.5,
            fill: {
            colors: ['rgba(255, 0, 145,0.3)','rgba(189,189,189,0.3)']
            }
        }
        }
    },
    title: {
        text: '店铺： '+ store_id,
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
        categories: ['进客率(%)', '出客率(%)', '观望率(%)'],
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
function createDonutChart(data){
    $('#donut-chart').empty();

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
        series: [enter_tot,exit_tot,watcher_tot],
        chart: {
        type: 'donut',
        height: '100%'
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        y: {
        formatter: function(val) {
            return (val*100/total).toFixed(1)
        }
        }
    },
      colors: ['#FF7D91', '#FF0091','#630063'],
      labels:['进客率(%)', '出客率(%)', '观望率(%)'],
      legend: {
        position: 'top',
        fontSize:'8px',
        markers: {
            width:8,
            height: 8,
        },
        labels: {
            colors: 'white',
            useSeriesColors: false
        },
      }
      };

      var chart = new ApexCharts(document.querySelector("#donut-chart"), options);
      chart.render();
}

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
          endAngle: 270,
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
      colors: ['#FF7D91', '#FF0091','#630063'],
      labels: ['进客人数', '出客人数', '观望人数'],
      legend: {
        show: true,
        floating: true,
        fontSize: '8px',
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
        val1: '性别',
        val2: '年龄',
        val3: '身材',
        val4: '发型',
        val5: '发色',
        val6: '眼镜',
        val7: '帽子'
    }
    $('#dropdown').empty()
    var mySelect = $('#dropdown').append("<select id='mySelect'>");
    $.each(options, function(val, text) {
        $('#mySelect').append(
            $('<option></option>').val(val).html(text)
        );
    });

    labels=[
        ['女性','男性'],
        ['16岁以下','17-30岁','31-45岁','46-60岁','60岁以上'],
        ['偏胖','正常','偏瘦'],
        ['光头','长发','其他发型'],
        ['黑发','其他发色'],
        ['戴眼镜','不戴眼镜'],
        ['戴帽子','不戴帽子']
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
        text: '顾客特征比率',
        align: 'left',
        margin: 10,
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






    