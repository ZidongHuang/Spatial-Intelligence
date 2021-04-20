
const apisUrl='http://161.189.24.17:3005'
var store_id_sel;
var stores_sel;
var startDateTime='';
var endDateTime='';
var booth2store={};
var store_names={}
var all_data_in_floor={}
var cnt=0

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
    id: 'input'
}));



$.post(apisUrl + '/get_available_date', function(data, textStatus, jqXHR){
    $('#datetime-body').daterangepicker({minDate:moment(data[0].start_date),
                                         maxDate:moment(data[0].end_date),
                                         timePicker: true, 
                                         timePicker24Hour: true,
                                         alwaysShowCalendars: false})
    // console.log(textStatus);
    // console.log(data);
});

$.post(apisUrl + '/get_store_info', function(data, textStatus, jqXHR){
    console.log(textStatus);
    for (let i=0;i<data.length;i++){
        store_names[data[i].store_berth]=data[i].store_name
        // store_names.push(data[i].store_name)
    }
    console.log('store_names', store_names);
});

storeGroup.on('loaded',function(){
    stores.forEach(store_id=>{
        if (Object.keys(store_names).includes(store_id)){
            booth2store[store_id]=store_names[store_id];
        }
        else{booth2store[store_id]=null}
    })
    console.log('booth2store', booth2store)
})
    

  
$('#datetime-body').on('apply.daterangepicker',function(){
    startDateTime = $('#datetime-body').data('daterangepicker').startDate.format('YYYY-MM-DD HH:mm:ss');
    endDateTime = $('#datetime-body').data('daterangepicker').endDate.format('YYYY-MM-DD HH:mm:ss');
    $('#input').attr('placeholder', startDateTime+' - '+endDateTime);
    if (store_id_sel){
        loadRangeData(startDateTime,endDateTime,store_names[store_id_sel]);
        createBarchart(all_data_in_floor)
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
    
    currentFloorStores.forEach(store=>{
        // console.log(store)
        if (Object.keys(store_names).includes(store)){
            $.post(apisUrl + '/get_store_kpis2',{'start_time': startDateTime, 'end_time': endDateTime, 'store_id': booth2store[store]}, function(data, textStatus, jqXHR){
                if (textStatus=='success'){
                    all_data_in_floor[store]=data
                }
                else {alert('fail loading data')};
            })
        }
        else{all_data_in_floor[store]=null}
        // console.log(booth2store[store])
        // console.log(all_data_in_floor)
        cnt=cnt+1
    })
    console.log(all_data_in_floor)    
    })

    $('#show-rank').on('click', function(){
        // console.log('called!')
        // console.log(all_data_in_floor)
        if (cnt){
            createBarchart(all_data_in_floor)
        }
        else{alert('pick a floor')}
    });
    
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
            // createBarchart(all_data_in_floor)
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
        size: 110,
        polygons: {
            strokeColors: '#e9e9e9',
            fill: {
            colors: ['#f8f8f8', '#fff']
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
    colors: ['#FF0091'],
    markers: {
        size: 2,
        colors: ['#fff'],
        strokeColor: '#FF0091',
        strokeWidth: 2,
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
        categories: ['进客率(%)', '出客率(%)', '观望率(%)']
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
        height: 200
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
        position: 'bottom',
        fontSize:'10px',
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
        height: 200,
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

// create barchart
function  createBarchart(data){
    $('#bar-chart').empty();
    
    var enter_cnt=new Array();
    var exit_cnt=new Array();
    var watcher_cnt=new Array();
    var all_stores=new Array();
    // var passer_cnt=new Array();

    for (const[key, value] of Object.entries(data)){
        if (value){
            enter_temp=[]
            exit_temp=[]
            watcher_temp=[]
            value.forEach(d=>{
                enter_temp.push(parseInt(d.enter_cnt))
                exit_temp.push(parseInt(d.exit_cnt))
                watcher_temp.push(parseInt(d.watcher_cnt))
                
            })
            var enter_sum=enter_temp.reduce(function(a,b){return a+b},0)
            var exit_sum=exit_temp.reduce(function(a,b){return a+b},0)
            var watcher_sum=watcher_temp.reduce(function(a,b){return a+b},0)
            var total=enter_sum+exit_sum+watcher_sum
            enter_cnt.push(Math.round(enter_sum*100/total))
            exit_cnt.push(Math.round(exit_sum/total))
            watcher_cnt.push(Math.round(watcher_sum/total))
            all_stores.push(store_names[key])
        }
        else{
            enter_cnt.push(0)
            exit_cnt.push(0)
            watcher_cnt.push(0)
            all_stores.push('placeholder')
        }
    };
    enter_cnt.sort((a,b)=>b-a)
    all_stores.sort((a,b)=>enter_cnt[all_stores.indexOf(a)] - enter_cnt[all_stores.indexOf(b)])
    console.log(enter_cnt.slice(0,10))
    // console.log(enter_cnt)
    console.log(all_stores.slice(0,10))

    var options = {
        series: [{
        data: enter_cnt.slice(0,10)
      }],
        chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      colors:['#FF0091'],
      grid:{
          show: false
      },
      dataLabels: {
        enabled: false
      },
      yaxis: {
        axisBorder: {
            show:false
        },
        labels:{
            style: {
                colors: "white"
            },
        },
        axisTicks:{
            show:false
        },
        lines:{
            show: false
        },
      },
      xaxis: {
        min:0,
        max:50,
        lines:{
            show: false
        },
        labels:{
            style: {
                colors: "white"
            },
        },
        axisTicks:{
            show:false
        },
        categories: all_stores.slice(0,10),
      },
      tooltip: {
        y: {
            title:{
                formatter: function(){
                    return null
                }
                }
            }
        
        }
      };
      var chart = new ApexCharts(document.querySelector("#bar-chart"), options);
      chart.render();    
}









    