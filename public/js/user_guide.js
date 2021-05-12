bootstrapQ.bstro([
    ['#datetime-body','<h3 style="margin-top:10px;">First, select time and date</h3>'],
    ['#xeogl-canvas-9de79b6d-b09d-400d-80b0-1d2088d53de9','<h3 style="margin-top:10px;">Then,click the floor and select a store you are interested in.</h3>'],
    ['#panel-body',{content:'<h3 style="margin-top:10px;">The detailed infromation will be shown here</h3>',place:'right'}]

],{
    obtn : '我已了解，下次不再提示！',
    exit : function(){
        $.cookie('bootstro','ok',{expires:30, path:'/'});
    }
});