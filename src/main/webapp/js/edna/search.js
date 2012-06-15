var Edna = Edna || {};

Edna.search = function ( callbackResult, from, size )
{
    var jsonBillable;
    var jsonUnbillable;

    var handleBillableSearch = function( data, xhr )
    {
        jsonBillable = data.facets.prday.entries;

        var unbillableSearch = new Edna.SearchBuilder();
        unbillableSearch.setQuery( '{ "match_all" : {} }' );
        unbillableSearch.setFilter( '{ "term" : { "billable" : false } }' );
        unbillableSearch.addFacet( 'prday', '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "day" } }' );
        var es = new ElasticSearch( {callback:handleUnbillableSearch, host:"localhost", port:9200 } );
        console.log( "unbillableSearch.toESJson()", unbillableSearch.toESJson()  );
        es.request( "POST", "_search", unbillableSearch.toESJson() );
    };

    var handleUnbillableSearch = function( data, xhr )
    {
        jsonUnbillable = data.facets.prday.entries;
        var result = { "billable" : jsonBillable, "unbillable" : jsonUnbillable };
        callbackResult( result );
    };

    var billableSearch = new Edna.SearchBuilder();
    billableSearch.setQuery( '{ "match_all" : {} }' );
    billableSearch.setFilter( '{ "term" : { "billable" : true } }' );
    billableSearch.addFacet( 'prday', '{ "date_histogram" : { "key_field" : "logDate", "value_field" : "hours", "interval" : "day" } }' );

    var es = new ElasticSearch( {callback:handleBillableSearch, host:"localhost", port:9200 } );
    console.log( "billableSearch.toESJson()", billableSearch.toESJson()  );
    es.request( "POST", "_search", billableSearch.toESJson() );

};

Edna.findAll = function ( callbackResult, from, size )
{
    from = from || 0;
    size = size || 10;

    function searchResultsToArray( data )
    {
        var entries = [];
        //$.each( data.hits.hits, function ( index, value )
        $.each( data.facets.histo1.entries, function ( index, value )
        {
            console.log( "value", value );
            var entry = value._source;
            //entry.id = value._id;
            entries.push( entry );
        } );
        return entries;
    }

    var responseReceived = function ( data, xhr )
    {
        //console.log( data );
        //var entries = searchResultsToArray( data );
        var entries = data.facets.histo1.entries;
        callbackResult( entries );
    };

    var es = new ElasticSearch( {callback:responseReceived, host:"localhost", port:9200 } );
    var query = '{ "match_all" : {}}';
    //var facets = '{ "tag": { "terms": { "field" : "resource", "size" : 10 } } }';
    var facets = '{ "histo1": { "date_histogram": { "key_field" : "logDate", "value_field" : "hours", "interval" : "day" } } }';
    //var facets = '{ "histo1": { "terms": { "fields" : ["logDate", "customer", "resource"] } } }';
    var search = '{ "from" : ' + from + ', "size" : ' + size + ', "query" : ' + query + ', "facets" : '+facets+'}';
    console.log( "search: ", search );


    var path = '_search';
    var method = 'POST';

    es.request( method, path, search );
};
