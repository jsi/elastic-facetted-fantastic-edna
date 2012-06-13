var Edna = Edna || {};

Edna.findAll = function( callbackResult, from, size )
{
    from = from || 0;
    size = size || 10;
    function searchResultsToArray(data) {
        var entries = [];
        $.each(data.hits.hits, function(index, value) {
            var entry = value._source;
            entry.id = value._id;
            entries.push(entry);
        });
        return entries;
    }

    var responseReceived = function( data, xhr )
    {
        //console.log( data );
        var entries = searchResultsToArray(data);
        callbackResult(entries);
    };

    var es = new ElasticSearch( {callback: responseReceived, host: "localhost", port: 9200 } );
    var query = '{ "from" : '+from+', "size" : '+size+', "query" : { "match_all" : {}}}';
    var path = '_search';
    var method = 'POST';
    es.request( method, path, query );
}
