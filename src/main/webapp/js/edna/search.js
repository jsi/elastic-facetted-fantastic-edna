var Edna = Edna || {};
Edna.ES_HOST = 'leela';
Edna.ES_PORT = 9200;

getTitleForHoursChart = function(periodType, fromDate, toDate) {
    var title, titleFrom, titleTo;
    title = 'Resource hours in Enonic ';
    if( periodType === "day" ) {
        title += "daily";
        titleFrom = moment( fromDate ).format( 'YYYY-MM-DD' );
        titleTo = moment( toDate ).format( 'YYYY-MM-DD' );
    } else if( periodType === "year" )
    {
        title += "by year";
        titleFrom = moment( fromDate ).format( 'YYYY' );
        titleTo = moment( toDate ).format( 'YYYY' );
    }
    else if( periodType === "month" )
    {
        title += "monthly";
        titleFrom = moment( fromDate ).format( 'MMMM YYYY' );
        titleTo = moment( toDate ).format( 'MMMM YYYY' );
    }
    else if (periodType === "week") {
        title += "weekly";
        titleFrom = moment(fromDate).format('wo [week] YYYY');
        titleTo = moment(toDate).format('wo [week] YYYY')
    }

    if (titleFrom === titleTo) {
        return title + ' (' + titleFrom + ')';
    } else {
        return title + ' (' + titleFrom + ' - ' + titleTo + ')';
    }
}

Edna.search = function ( callbackResult, from, to, periodType, resources )
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

    var resourceFilter = {
        "terms":{
            "resource": resources
        }
    };

    var combinedFilter = {};
    if (resources && resources.length > 0) {
        combinedFilter = {
            "and": [dateFilter, resourceFilter]
        };
    } else {
        combinedFilter = dateFilter;
    }

    var handleBillableSearch = function ( data, xhr )
    {
        jsonBillable = data.facets.prday.entries;

        var queryUnbillable = {"filtered":{"query":{}, "filter":{}}};
        queryUnbillable.filtered.query = { "field":{"billable":false} };
        queryUnbillable.filtered.filter = combinedFilter;
        var queryUnbillableStr = JSON.stringify( queryUnbillable );

        var unbillableSearch = new Edna.SearchBuilder();
        unbillableSearch.setQuery( queryUnbillableStr );
        unbillableSearch.addFacet( 'prday',
                                   '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "'+periodType+'" } }' );
        var es = new ElasticSearch( {callback:handleUnbillableSearch, host: Edna.ES_HOST, port: Edna.ES_PORT } );
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
    queryBillable.filtered.filter = combinedFilter;
    var queryBillableStr = JSON.stringify( queryBillable );

    var billableSearch = new Edna.SearchBuilder();
    billableSearch.setQuery( queryBillableStr );
    billableSearch.addFacet( 'prday', '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "'+periodType+'" } }' );

    var es = new ElasticSearch( {callback:handleBillableSearch, host: Edna.ES_HOST, port: Edna.ES_PORT } );
    es.request( "POST", "edna4000/_search", billableSearch.toESJson() );
};

Edna.handleSearchResult = function ( jsonData, from, to )
{
    var date;

    var tableData = [];
    var indexOfPeriods = {};
    var periodType = jsonData.periodType;
    var periodFormat = "YYYY-MM-DD";
    if( periodType === "year" )
    {
        periodFormat = "YYYY";
    }
    else if( periodType === "month" )
    {
        periodFormat = "YYYY-MM";
    }
    else if( periodType === "week" )
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

        if ( tableRow === undefined )
        {
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
                        if ( diff === 0 )
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
        labelsForChart.push( moment( entry.dateInMillis ).format( periodFormat ) );
        billableArrayForChart.push( entry.hoursBillable );
        unbillableArrayForChart.push( (-entry.hoursUnbillable) );
    } );

    Edna.showChart( labelsForChart, billableArrayForChart, unbillableArrayForChart, getTitleForHoursChart(periodType, from, to) );
};

Edna.getResourceList = function(resultsCallback, from, to)
{
    var resCallback = function(data) {
        var resources = data.facets.resourcefacet.terms;
        resultsCallback(resources);
    };

    var dateFilter = from && to && {
        "numeric_range":{
            "logDate":{
                "lt":to,
                "gte":from
            }
        }
    };

    var query = {
        "match_all": {}
    };
    if (dateFilter) {
        query = {"filtered":{"query":{}, "filter":{}}};
        query.filtered.query = { "match_all": {} };
        query.filtered.filter = dateFilter;
    }
    var facets = {
        "terms_stats": {
            "field": "resource",
            "key_field": "resource",
            "value_field" : "hours",
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
    var es = new ElasticSearch( {callback: resCallback, host: Edna.ES_HOST, port: Edna.ES_PORT } );
    es.request( "POST", "edna4000/_search", resourceSearch.toESJson() );
};

Edna.getProjectList = function(resultsCallback, from, to, resources)
{
    var resCallback = function(data) {
        var resources = data.facets.projectfacet.terms;
        resultsCallback(resources);
    };

    var dateFilter = {
        "numeric_range":{
            "logDate":{
                "lt":to,
                "gte":from
            }
        }
    };

    var resourceFilter = {
        "terms":{
            "resource": resources
        }
    };

    var combinedFilter = {};
    if (resources && resources.length > 0) {
        combinedFilter = {
            "and": [dateFilter, resourceFilter]
        };
    } else {
        combinedFilter = dateFilter;
    }

    var query = {"filtered":{"query":{}, "filter":{}}};
    query.filtered.query = { "match_all": {} };
    query.filtered.filter = combinedFilter;

    var facets = {
        "terms_stats": {
            "key_field": "project",
            "size": 100,
            "value_field" : "hours"
        }
    };
    var queryStr = JSON.stringify(query);
    var facetsStr = JSON.stringify(facets);

    var resourceSearch = new Edna.SearchBuilder();
    resourceSearch.setQuery( queryStr );
    resourceSearch.addFacet( 'projectfacet', facetsStr );
    var es = new ElasticSearch( {callback: resCallback, host: Edna.ES_HOST, port: Edna.ES_PORT } );
    es.request( "POST", "edna4000/_search", resourceSearch.toESJson() );
};

Edna.Utils = Edna.Utils || {};

