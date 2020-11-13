var height = 500;
var width = 500;
d3.select("#test1")
    .append("text")
    .attr("x", width / 2 - 10)
    .attr("y", 500)
    .attr("text-anchor", "middle")
    .html("Nationality")
    .style("fill", '#FFFCE1')
    .style("font-size", " 40px");
d3.select("#test2")
    .append("text")
    .attr("x", width / 2)
    .attr("y", 500)
    .style("font-size", " 40px")
    .attr("text-anchor", "middle")
    .html("Infection Sources")
    .style("text-align", 'center')
    .style("fill", '#FFFCE1');

var testdata = [
    { key: "Bangladeshi", y: 2922 },
    { key: "Indian", y: 1608 },
    { key: "Singaporean", y: 1286 },
    { key: "Chinese", y: 233 },
    { key: "Myanmarian", y: 136 },
    { key: "Unidentified", y: 62 },
    { key: "Others", y: 246 }
];
var testdata2 = [
    { key: "United Kingdom", y: 178 },
    { key: "United States", y: 63 },
    { key: "Indonesia", y: 27 },
    { key: "China", y: 24 },
    { key: "Malaysia", y: 22 },
    { key: "Philippines", y: 17 },
    { key: "France", y: 11 },
    { key: "Others", y: 80 }
];



var chart1;
nv.addGraph(function () {
    var chart1 = nv.models.pieChart()
        .x(function (d) { return d.key })
        .y(function (d) { return d.y })
        .donut(true)
        .width(width)
        .height(height)
        .padAngle(.02)
        .cornerRadius(5)
        .id('donut1'); // allow custom CSS for this one svg

    chart1.pie.donutLabelsOutside(true).donut(true);

    d3.select("#test1")
        .datum(testdata)
        .transition().duration(1200)
        .call(chart1);
    return chart1;

});
var chart2;
nv.addGraph(function () {
    var chart2 = nv.models.pieChart()
        .x(function (d) { return d.key })
        .y(function (d) { return d.y })
        .donut(true)
        .width(width)
        .height(height)
        .padAngle(.02)
        .cornerRadius(5)
        .id('donut1'); // allow custom CSS for this one svg

    chart2.pie.donutLabelsOutside(true).donut(true);
    d3.select("#test2")
        .datum(testdata2)
        .transition().duration(1200)
        .call(chart2);
    return chart2;
});