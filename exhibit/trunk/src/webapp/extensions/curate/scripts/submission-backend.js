Exhibit.SubmissionBackend = {};

Exhibit.SubmissionBackend.formatChanges = function(itemChanges, submissionProperties, nameCollisionHandler) {
    return itemChanges.map(function(change) {
        var item = { id: change.id, label: change.label || change.id };
        
        SimileAjax.jQuery.each(change.vals || {}, function(prop, val) {
            item[prop] = val.newVal;
        });
        
        SimileAjax.jQuery.each(submissionProperties, function(prop, val) {
            if (prop in item) {
                if (nameCollisionHandler) {
                    nameCollisionHandler(item, prop, val);
                } else {
                    throw "Collision between change property and submission property "
                        + prop + ": " + item[prop] + ", " + val;
                }
            } else {
                item[prop] = val;
            }
        });

        return item;
    });
};

Exhibit.SubmissionBackend.SubmissionDefaults = {
    'gdoc': {
        'url': 'http://valinor.mit.edu/sostler/gdocbackend.cgi',
    }
};

Exhibit.SubmissionBackend.getOutputOptions = function() {
    var links = $('head link[rel="exhibit/output"]');
    if (links.length == 0) {
        throw "No output link provided";
    } else if (links.length > 1) {
        SimileAjax.Debug.warn('Multiple output links provided; ignoring all but the first');
    }
    
    var type = links.attr('type').toString().toLowerCase();
    var opts = { url: null, data: {}};
    
    if (type == 'gdoc') {
        opts.url = links.attr('ex:url') || Exhibit.SubmissionBackend.SubmissionDefaults.gdoc.url;
        opts.data.spreadsheetkey = links.attr('ex:spreadsheetKey');
        opts.data.worksheetindex = links.attr('ex:worksheetIndex');
    } else {
        throw "Unknown output link of type " + type;
    }
    
    return opts;
};

Exhibit.SubmissionBackend.submitChanges = function(changes, fSuccess, fError) {
    var options = Exhibit.SubmissionBackend.getOutputOptions();
    options.data.message = SimileAjax.JSON.toJSONString(changes);
    
    $.ajax({
        url: options.url,
        data: options.data,
        dataType: 'jsonp',
        jsonp: 'callback',
        success: fSuccess,
        error: fError
    });
}