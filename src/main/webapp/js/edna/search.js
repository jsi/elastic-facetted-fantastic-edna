var Edna = Edna || {};

Edna.search = function ( callbackResult, from, to, periodType )
{
    var jsonBillable;
    var jsonUnbillable;
    var dateFilter = {
        "numeric_range":{
            "logDate":{
                "lt":to,
                "gte":from
            }
        }
    };

    var handleBillableSearch = function ( data, xhr )
    {
        jsonBillable = data.facets.prday.entries;

        var queryUnbillable = {"filtered":{"query":{}, "filter":{}}};
        queryUnbillable.filtered.query = { "field":{"billable":false} };
        queryUnbillable.filtered.filter = dateFilter;
        var queryUnbillableStr = JSON.stringify( queryUnbillable );

        var unbillableSearch = new Edna.SearchBuilder();
        unbillableSearch.setQuery( queryUnbillableStr );
        unbillableSearch.addFacet( 'prday',
                                   '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "'+periodType+'" } }' );
        var es = new ElasticSearch( {callback:handleUnbillableSearch, host:"leela", port:9200 } );
        es.request( "POST", "edna4000/_search", unbillableSearch.toESJson() );
    };

    var handleUnbillableSearch = function ( data, xhr )
    {
        jsonUnbillable = data.facets.prday.entries;
        var result = {
            "periodType": periodType,
            "billable":jsonBillable,
            "unbillable":jsonUnbillable
        };
        callbackResult( result );
    };

    var queryBillable = {"filtered":{"query":{}, "filter":{}}};
    queryBillable.filtered.query = { "field":{"billable":true} };
    queryBillable.filtered.filter = dateFilter;
    var queryBillableStr = JSON.stringify( queryBillable );

    var billableSearch = new Edna.SearchBuilder();
    billableSearch.setQuery( queryBillableStr );
    billableSearch.addFacet( 'prday', '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "'+periodType+'" } }' );

    var es = new ElasticSearch( {callback:handleBillableSearch, host:"leela", port:9200 } );
    es.request( "POST", "edna4000/_search", billableSearch.toESJson() );
};

Edna.handleSearchResult = function ( jsonData )
{
    var date;

    var tableData = [];
    var indexOfPeriods = {};
    var periodType = jsonData.periodType;
    var periodFormat = "YYYY-MM-DD";
    if( periodType == "year" )
    {
        periodFormat = "YYYY";
    }
    else if( periodType == "month" )
    {
        periodFormat = "YYYY-MM";
    }
    else if( periodType == "week" )
    {
        periodFormat = "YYYY-w";
    }

    $.each( jsonData.billable, function ( i, entry )
    {
        date = new Date( entry.time );
        var resultObject = { "date":date.toDateString(), "dateInMillis":date.getTime(), "hoursBillable":entry.total, "hoursUnbillable":0  };
        indexOfPeriods[ moment( date ).format( periodFormat ) ] = i;
        tableData[i] = resultObject;
    } );

    $.each( jsonData.unbillable, function ( i, entry )
    {
        date = new Date( entry.time );
        var tableRow = indexOfPeriods[moment( date ).format( periodFormat )];

        if ( tableRow == undefined )
        {
            //console.log( moment( date ).format( "YYYY-MM-DD" ) );
            // creating new row at end
            tableRow = tableData.length;
            tableData[tableRow] = { "date":new Date( entry.time ).toDateString(), "dateInMillis":date.getTime(), "hoursBillable":0 };
        }

        tableData[tableRow].hoursUnbillable = entry.total;
    } );

    tableData.sort( function ( a, b )
                    {
                        var aAsMoment = moment( a.dateInMillis );
                        var bAsMoment = moment( b.dateInMillis );

                        var diff = aAsMoment.diff( bAsMoment );
                        if ( diff == 0 )
                        {
                            return 0;
                        }
                        else if( diff > 0 )
                        {
                            return 1;
                        }
                        else
                        {
                            return -1;
                        }
                    } );

    // translate to arrays for chart
    var labelsForChart = [], billableArrayForChart = [], unbillableArrayForChart = [];
    $.each( tableData, function ( i, entry )
    {
        //console.log( "tabledata: " + moment( entry.dateInMillis ).format( "YYYY-MM-DD" ) + ": " + entry.hoursBillable + " : " + entry.hoursUnbillable );
        labelsForChart.push( moment( entry.dateInMillis ).format( periodFormat ) );
        billableArrayForChart.push( entry.hoursBillable );
        unbillableArrayForChart.push( (-entry.hoursUnbillable) );
    } );

    Edna.showChart( labelsForChart, billableArrayForChart, unbillableArrayForChart );
};

Edna.getResourceList = function(resultsCallback) {
    var resCallback = function(data) {
        var resources = data.facets.resourcefacet.terms;
        resultsCallback(resources);
    }

    var query = {
        "match_all": {}
    };
    var facets = {
        "terms": {
            "field": "resource._tokenized",
            "size": 100,
            "exclude": [
                "unknown",
                "UNKNOWN"
            ]
        }
    };
    var queryStr = JSON.stringify(query);
    var facetsStr = JSON.stringify(facets);

    var resourceSearch = new Edna.SearchBuilder();
    resourceSearch.setQuery( queryStr );
    resourceSearch.addFacet( 'resourcefacet', facetsStr );
    var es = new ElasticSearch( {callback: resCallback, host:"leela", port:9200 } );
    es.request( "POST", "edna4000/_search", resourceSearch.toESJson() );
}

Edna.Utils = Edna.Utils || {};

