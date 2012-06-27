var Edna = Edna || {};

Edna.showChart = function(labels, billableData, unbillableData) {
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'ednaChart',
            type: 'bar'
        },

        title: {
            text: 'Hours in Enonic by resource, 2011'
        },

        subtitle: {
            text: 'Source: Edna'
        },

        xAxis: [{
            categories: labels,
            reversed: false
        }, { // mirror axis on right side
            opposite: true,
            reversed: false,
            categories: labels,
            linkedTo: 0
        }],
        yAxis: {
            title: {
                text: null
            },
            labels: {
                formatter: function(){
                    return (Math.abs(this.value));
                }
            }
        },

        plotOptions: {
            series: {
                cursor: 'pointer',
                events: {
                    click: function(event) {
                        alert(this.name + ' for ' + event.point.category + ' clicked\n'+
                              'Alt: '+ event.altKey +'\n'+
                              'Control: '+ event.ctrlKey +'\n'+
                              'Shift: '+ event.shiftKey +'\n'+
                              'URL to open: http://elasticsearch.server/facet?billable='+this.name+'&user='+event.point.category );
                    }
                },
                stacking: 'normal'
            }
        },

        tooltip: {
            formatter: function() {
                return '<b>'+ this.series.name +', '+ this.point.category +'</b><br/>'+
                       'Hours: '+ Highcharts.numberFormat(Math.abs(this.point.y), 0);
            }
        },

        series: [{
            name: 'Billable',
            data: billableData
        }, {
            name: 'Unbillable',
            data: unbillableData
        }]
    });
}
