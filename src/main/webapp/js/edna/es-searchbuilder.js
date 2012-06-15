var Edna = Edna || {};

Edna.SearchBuilder = function()
{
    var query = null;
    var filter = null;
    var facets = new Array();

    this.setQuery = function( in_query )
    {
        query = in_query;
    };

    this.setFilter = function( in_filter )
    {
        filter = in_filter;
    };

    this.addFacet = function( in_name, in_facet )
    {
        facets.push( '"' + in_name + '" : ' + in_facet );
    };

    this.toESJson = function ()
    {
        var json = '{';
        json += '"query" : ' + query;
        if( filter != null )
        {
            json += ', ';
            json += '"filter" : ' + filter;
        }
        if( facets.length > 0 )
        {
            json += ', "facets" : {';
            for( var i = 0; i < facets.length; i++ )
            {
                json += facets[i];
                if( i < facets.length -1 )
                {
                    json += ', ';
                }

            }
            json += ' }';
        }
        json += ' }';

        return json;
    }

};