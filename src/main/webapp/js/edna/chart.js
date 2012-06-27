var Edna = Edna || {};

    var chart,
            categories = ['ABU', 'ARO', 'BHJ', 'DAA', 'ESU', 'HSK', 'KLA', 'LJL', 'MER', 'MLA', 'JSI',
                'JVS', 'ODA', 'RFO', 'RMY', 'SIW', 'SRS', 'TAN', 'TLO', 'TOM', 'TSI'];
    $(document).ready(function() {
        return;
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
                                             categories: categories,
                                             reversed: false
                                         }, { // mirror axis on right side
                                             opposite: true,
                                             reversed: false,
                                             categories: categories,
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
                                             },
                                             min: -2000,
                                             max: 2000
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
                                             data: [-1769, -14, -1501, -1609, -363, 0, 0, -1603, 0, -1305, 0,
                                                 -4, 0, -1563, -45, 0, 0, -312, -559, 0, -2]
                                         }, {
                                             name: 'Unbillable',
                                             data: [215, 1872, 371, 349, 1825, 1183, 1899, 320, 1921, 670, 1904,
                                                 1883, 0, 388, 1833, 0, 1974, 1641, 1374, 1851, 1937]
                                         }]
                                     });
    });

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
