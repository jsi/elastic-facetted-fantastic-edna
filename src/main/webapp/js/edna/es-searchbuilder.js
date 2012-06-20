var Edna = Edna || {};

Edna.SearchBuilder = function()
{
    var query = null;
    var filter = null;
    var facets = new Array();
    var queryFacets = new Array();
    var fromDate = null;
    var toDate = null;

    this.setQuery = function( in_query )
    {
        query = in_query;
        queryFacets = new Array();
        fromDate = null;
        toDate = null;
    };

    this.setToDate = function ( in_toDate )
    {
        toDate = in_toDate;
        query = null;
    }

    this.setFromDate = function ( in_fromDate )
    {
        fromDate = in_fromDate;
        query = null;
    }

    this.addQueryFacet = function ( in_fieldName, in_value )
    {
        queryFacets.push ( '"term" : { "' + in_fieldName + '" : ' + in_value );
        query = null;
    }

    this.getQuery = function ( )
    {
        if (query != null) {
            return query;
        } else {
            var queryString = '{ "filtered" : {';
            queryString += '"query" : {';
            queryString += '"bool" : {';
            queryString += '"must" : [';
            for (var i = 0 ; i < queryFacets.length ; i++ )
            {
                queryString += '{';
                queryString += queryFacets[i];
                queryString += '}';
                if (i < (queryString.length - 1)) {
                    queryString += ",";
                }
            }
            queryString += ']}},';
            queryString += '"filter" : {';
            queryString += '"numeric_range" : {';
            queryString += '"logDate" : {';
            queryString += '"lt" : "' + toDate + '",';
            queryString += '"gte" : "' + fromDate + '"';
            queryString += '}}}}}';
            return queryString;
        }
    }

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