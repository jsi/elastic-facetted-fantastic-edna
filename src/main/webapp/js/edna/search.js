var Edna = Edna || {};

Edna.search = function ( callbackResult, from, to )
{
    var jsonBillable;
    var jsonUnbillable;
    var dateFilter = {
        "numeric_range": {
            "logDate": {
                "lt": to,
                "gte": from
            }
        }
    };

    var handleBillableSearch = function( data, xhr )
    {
        jsonBillable = data.facets.prday.entries;

        var queryUnbillable = {"filtered": {"query": {}, "filter": {}}};
        queryUnbillable.filtered.query = { "field" : {"billable" : false} };
        queryUnbillable.filtered.filter = dateFilter;
        var queryUnbillableStr = JSON.stringify(queryUnbillable);

        var unbillableSearch = new Edna.SearchBuilder();
        unbillableSearch.setQuery( queryUnbillableStr );
        unbillableSearch.addFacet( 'prday', '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "month" } }' );
        var es = new ElasticSearch( {callback:handleUnbillableSearch, host:"leela", port:9200 } );
        console.log( "unbillableSearch.toESJson()", unbillableSearch.toESJson()  );
        es.request( "POST", "edna4000/_search", unbillableSearch.toESJson() );
    };

    var handleUnbillableSearch = function( data, xhr )
    {
        jsonUnbillable = data.facets.prday.entries;
        var result = { "billable" : jsonBillable, "unbillable" : jsonUnbillable };
        callbackResult( result );
    };

    var queryBillable = {"filtered": {"query": {}, "filter": {}}};
    queryBillable.filtered.query = { "field" : {"billable" : false} };
    queryBillable.filtered.filter = dateFilter;
    var queryBillableStr = JSON.stringify(queryBillable);


    var billableSearch = new Edna.SearchBuilder();
    billableSearch.setQuery( queryBillableStr );
    billableSearch.addFacet( 'prday', '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "month" } }' );

    var es = new ElasticSearch( {callback:handleBillableSearch, host:"leela", port:9200 } );
    console.log( "billableSearch.toESJson()", billableSearch.toESJson()  );
    es.request( "POST", "edna4000/_search", billableSearch.toESJson() );

};
