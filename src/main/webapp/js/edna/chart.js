    var chart,
            categories = ['ARO', 'MER', 'TSI', 'DAA', 'SRS', 'JSI', 'BHJ', 'TLO', 'LJL', 'ODA',
                'SIW', 'RMY', 'JVS', 'TAN', 'ABU', 'KLA', 'ESU', 'TOM', 'HSK', 'RFO'];
    $(document).ready(function() {
        chart = new Highcharts.Chart({
                                         chart: {
                                             renderTo: 'ednaChart',
                                             type: 'bar'
                                         },
                                         title: {
                                             text: 'Hours in Edna by resource, 2011'
                                         },
                                         subtitle: {
                                             text: 'Source: www.census.gov'
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
                                                     return (Math.abs(this.value) / 1000000) + 'M';
                                                 }
                                             },
                                             min: -4000000,
                                             max: 4000000
                                         },

                                         plotOptions: {
                                             series: {
                                                 stacking: 'normal'
                                             }
                                         },

                                         tooltip: {
                                             formatter: function(){
                                                 return '<b>'+ this.series.name +', age '+ this.point.category +'</b><br/>'+
                                                         'Population: '+ Highcharts.numberFormat(Math.abs(this.point.y), 0);
                                             }
                                         },

                                         series: [{
                                             name: 'Billable',
                                             data: [-1746181, -1884428, -2089758, -2222362, -2537431, -2507081, -2443179,
                                                 -2664537, -3556505, -3680231, -3143062, -2721122, -2229181, -2227768,
                                                 -2176300, -1329968, -836804, -354784, -90569, -27012]
                                         }, {
                                             name: 'Unbillable',
                                             data: [1656154, 1787564, 1981671, 2108575, 2403438, 2366003, 2301402, 2519874,
                                                 3360596, 3493473, 3050775, 2759560, 2304444, 2426504, 2568938, 1785638,
                                                 1447162, 1005011, 330870, 34482]
                                         }]
                                     });
    });
