jQuery(document).ready(function($) {

  $('#tokenfield-1').tokenfield({
    autocomplete: {
      source: <%= tags >,
      delay: 100
    },
    showAutocompleteOnFocus: true,
    delimiter: [',','-', '_'],
    limit: 4
  });

  $('#tokenfield-1').on('tokenfield:createtoken', function (event) {
	    var existingTokens = $(this).tokenfield('getTokens');
	    $.each(existingTokens, function(index, token) {
	        if (token.value === event.attrs.value)
	            event.preventDefault();
	    });
	});

});