/*jslint evil: true */
$(function() {
    
    function getSeriesBy(method, h) {
        var result = [];
        var coords = [0, 0.1]; // initial solution
        if (method.init instanceof Function) {
            result = method.init(h, coords);
            coords = result[result.length - 1];
        } else {
            result.push(coords);
        }

        do {
            coords = method.step(h, coords);
            result.push(coords);
        } while (coords[0] < 1);

        // cut the last segment
        var last = result[result.length - 1];
        if (last[0] > 1) {
            var nextToLast = result[result.length - 2];
            var lastSegmentTangent = (last[1] - nextToLast[1]) / h;
            var newY = nextToLast[1] + lastSegmentTangent * (1 - nextToLast[0]);
            result[result.length - 1] = [1, newY];
        }

        return result;
    }

    var options = {
        grid:   { borderWidth: 1 },
        legend: { position: "nw" },
        xaxis:  { max: 1.0 }
    };

    var exactSolutionSeries = {
        data:       getSeriesBy(ExactSolution, 0.005),
        color:      "rgb(150,150,150)",
        shadowSize: 0,
        label:      ExactSolution.label
    };

    $('#graphs').bind('replot', function(event, methods, h) {
        console.log(h);
        var listOfSeries = [exactSolutionSeries];
        if (methods) {
            $.each(methods, function(idx, method) {
                listOfSeries.push({
                    data:   getSeriesBy(method, h),
                    label:  method.label,
                    points: { show: true, 
                              radius: 3 },
                    lines:  { show: true }
                });
            });
        }
        $.plot($('#graphs'), listOfSeries, options);
    });



    var selectedMethods = {};
    var h = 0.1;

    $('#step').val(h);

    $('#methods > *').click(function(event) {
        var $this = $(this);
        var methodName = $this.attr('method');
        if (selectedMethods.hasOwnProperty(methodName)) {
            delete selectedMethods[methodName];
            $this.css('backgroundColor', 'white');
        } else {
            selectedMethods[methodName] = eval(methodName);
            $this.css('backgroundColor', '#e0e0e0');
        }
        $('#graphs').trigger('replot', [selectedMethods, h]);
    });
    
    $('#step').change(function(event) {
        var _h = parseFloat($(this).val());
        if (!isNaN(_h) && _h >= 0.0001 && _h <= 0.25) { 
            h = _h;
        }
        $('#step').val(h);
        $('#graphs').trigger('replot', [selectedMethods, h]);
    });

});
