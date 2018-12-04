
var mapMaxZoom = 10;
var theMap;

var mapDim;
var mapGroup;
var mapChart;
var countryDim;
var countryGroup;
var countryChart;
var rankingDim;
var rankingGroup;
var rankingChart;
var yearDim;
var yearGroup;
var yearChart;
var dataTableDim;
var dataTableNew;
var dataCount;
var teachingDim;
var teachingGroup;
var teachingChart;
var researchDim;
var researchGroup;
var researchChart;
var totalDim;
var totalGroup;
var totalChart;
var citationDim;
var citationGroup;
var citationChart;

var data_f;

var color1 = "#224668";
var color2 = "#26869a";
var color3 = "#5f8ebb";
var color4 = "#29dbdb";
var color5 = "#29c9d8";
var color6 = "#25a9b5";
var color7 = "#202c54";
var color8 = "#0bab9e";
var color9 = "#3cd5c9";
var color10 = "#61c79f";
var color11 = "#c8b21e";
var color12 = "#db6c28";
var color13 = "#dc9c2f";
var color14 = "#224668";
var color15 = "#dc9c2f";
var color16 = "#a88f65";
var color17 = "#91afa3";
var color18 = "#4be2a6";

var totalColors = d3.scale.ordinal().domain(["color1", "color2", "color3", "color4", "color5", "color6"])
    .range([color1, color2, color3, color4, color5, color6]);


var color = d3.scale.ordinal()
    .domain(["color1", "color2", "color3", "color4", "color5", "color6", "color7", "color8", "color9", "color10", "color11", "color12", "color13", "color14", "color15", "color16", "color17", "color18"])
    .range([color1, color2, color3, color4, color5, color6, color7, color8, color9, color10, color11, color12, color13, color14, color15, color16, color17, color18]);


$(document).ready(function() {

    d3.csv("data/timesData_top100_sixYears_rankingByTotalScore_withIndex.csv", function (data) {
        var numberFormat = d3.format(",f");

        data.forEach(function (d) {
            d.teaching = +d.teaching;
            d.research = +d.research;
            d.citations = +d.citations;
            d.total_score = +d.total_score;
            d.Id = +d.index;
            d.world_rank = +d.world_rank;
            d.Latitude = +d.lat;
            d.Longitude = +d.lon;
        });

        data_f = crossfilter(data);

        mapDim = data_f.dimension(function(d) { return [d.Latitude, d.Longitude, d.Id]; });
        mapGroup = mapDim.group();

        countryDim = data_f.dimension(function(d) {return d.country;});
        countryGroup = countryDim.group().reduceCount();
        countryChart = dc.pieChart("#chart-country");

        rankingDim = data_f.dimension(function(d) {return d.world_rank;});
        rankingGroup = rankingDim.group().reduceCount();
        rankingChart = dc.barChart("#chart-ranking");

        yearDim = data_f.dimension(function(d) {return d.year;});
        yearGroup = yearDim.group().reduceCount();
        yearChart = dc.rowChart("#chart-year");

        teachingDim = data_f.dimension(function(d) {return d.year;});
        teachingGroup = teachingDim.group().reduceSum(function(d) {return d.teaching;});
        teachingChart = dc.barChart("#chart-teaching");

        researchDim = data_f.dimension(function(d) {return d.year;});
        researchGroup = researchDim.group().reduceSum(function(d) {return d.research;});
        researchChart = dc.barChart("#chart-research");

        citationDim = data_f.dimension(function(d) {return d.year;});
        citationGroup = citationDim.group().reduceSum(function(d) {return d.research;});
        citationChart = dc.barChart("#chart-citation");

        totalDim = data_f.dimension(function(d) {return d.year;});
        totalGroup = researchDim.group().reduceSum(function(d) {return d.research;});
        totalChart = dc.barChart("#chart-total");

        dataTableDim = data_f.dimension(function(d) { return +d.Id;});

        var customMarker = L.Marker.extend({
            options: {
                Id: 'Custom data!'
            }
        });
        var iconSize = [32,32];
        var iconAnchor = [16,32];
        var popupAnchor = [0,-32];
        mapChart  = dc.leafletMarkerChart("#chart-map");

        mapChart
            .width(500)
            .height(200)
            .dimension(mapDim)
            .group(mapGroup)
            .center([45, -19])    // slightly different than zoomHome to have a info updated when triggered
            .zoom(2)
            .tiles(function(map) {
                return L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
                    { attribution: 'LSCE &copy; 2016 | Baselayer &copy; ArcGis' }).addTo(map);
            })
            .mapOptions({maxZoom: mapMaxZoom, zoomControl: false})
            .fitOnRender(false)
            .filterByArea(true)
            .cluster(true)
            .clusterOptions({maxClusterRadius: 50, showCoverageOnHover: false, spiderfyOnMaxZoom: true})
            .title(function() {})
            .popup(function(d) {
                var id = d.key[2];
                var popup = L.popup({autoPan: false, closeButton: false, maxWidth: 500});
                popup.setContent("Id: " + "<b>" + data[id].Id + "</b></br>"
                    //+ "Position: " + "<b>" + data[id].Longitude.toFixed(2) + "°E</b>, <b>" + data[id].Latitude.toFixed(2) + "°N</b></br>"
                    + "University: " + "<b>" + data[id].university_name + "</b></br>"
                    + "Year: " + "<b>" + data[id].year + "</b></br>"
                    + "Teaching Score: " + "<b>" + data[id].teaching + "</b><br>"
                    + "Research Score: " + "<b>" + data[id].research + "</b><br>"
                    + "Citations Score: " + "<b>" + data[id].citations + "</b><br>"
                    + "Total Score: " + "<b>" + data[id].total_score + "</b><br>");
                return popup;
            })
            .popupOnHover(true)
            .marker(function(d) {
                var id = d.key[2];
                var icon = L.icon({iconSize: iconSize, iconAnchor: iconAnchor, popupAnchor: popupAnchor, iconUrl: 'img/marker_Tree.png'});
                marker = new customMarker([data[id].Latitude, data[id].Longitude], {Id: (id+1).toString(), icon: icon});
                marker.on('mouseover', function(e) {
                    var iconUrlNew = e.target.options.icon.options.iconUrl.replace(".png","_highlight.png");
                    var iconNew = L.icon({ iconSize: iconSize, iconAnchor: iconAnchor, popupAnchor: popupAnchor, iconUrl: iconUrlNew });
                    e.target.setIcon(iconNew);
                    d3.selectAll(".dc-table-column._0")
                        .text(function (d, i) {
                            if (parseInt(d.Id) == e.target.options.Id) {
                            this.parentNode.scrollIntoView();
                                    d3.select(this.parentNode).style("font-weight", "bold");
                                }
                            return d.Id;
                        });
                })
                    .on('mouseout', function(e) {
                    var iconUrlNew = e.target.options.icon.options.iconUrl.replace("_highlight.png", ".png");
                    var iconNew = L.icon({ iconSize: iconSize, iconAnchor: iconAnchor, popupAnchor: popupAnchor, iconUrl: iconUrlNew });
                    e.target.setIcon(iconNew);
                    d3.selectAll(".dc-table-column._0")
                        .text(function (d, i) {
                            if (parseInt(d.Id) == e.target.options.Id) {
                                d3.select(this.parentNode).style("font-weight", "normal");
                            }
                            return d.Id;
                        });
                    });
                return marker;
            });

        var rankingRange = [0., 100];
        var rankingBinWidth = 5;

        countryChart.width(350)
            .height(300)
            .transitionDuration(750)
            .radius(150)
            .innerRadius(20)
            .dimension(countryDim)
            .title(function() { return ""; })
            .group(countryGroup)
            .colors(color)
            .renderLabel(false);

        rankingChart.width(560)
            .height(300)
            .margins({top: 10, right: 10, bottom: 30, left: 40})
            .centerBar(false)
            .elasticY(true)
            .dimension(rankingDim)
            .group(rankingGroup)
            .x(d3.scale.linear().domain(rankingRange))
            // .xUnits(dc.units.fp.precision(rankingBinWidth))
            .round(function(d) {return rankingBinWidth*Math.floor(d/rankingBinWidth)})
            .gap(1)
            .renderHorizontalGridLines(true)
            .colors(totalColors);

        rankingChart.yAxis().tickFormat(d3.format("0d"));
        rankingChart.on("postRender", function (chart) {
            addYLabel(chart, "Number of Schools");
        });

        yearChart.width(200)
            .height(300)
            .margins({top: 5, left: 5, right: 10, bottom: 0})
            .transitionDuration(750)
            .dimension(yearDim)
            .group(yearGroup)
            .colors(totalColors)
            .renderLabel(true)
            .gap(9)
            .title(function() { return ""; })
            .elasticX(true);

        yearChart.xAxis().tickValues([0]);

        drawCategory(teachingChart, teachingDim, teachingGroup, color1);
        drawCategory(researchChart, researchDim, researchGroup, color10);
        drawCategory(citationChart, citationDim, citationGroup, color8);
        drawCategory(totalChart, totalDim, totalGroup, color17);

        dataCount = dc.dataCount('#chart-count-new');
        dataCount
            .dimension(data_f)
            .group(data_f.groupAll())
            .html({
                some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript: resetAll_exceptMap_New();\' style=\'color:white;\'>Reset All</a>',
                all: 'All records selected. Please click on the graph to apply filters.'
            });

        dataTableNew = dc.dataTable("#chart-table-new");
        dataTableNew
            .dimension(dataTableDim)
            .group(function(d) {})
            .showGroups(false)
            .size(94)
            //.size(xf.size()) //display all data
            .columns([
                function(d) { return d.Id; },//!!!
                function(d) { return d.world_rank; },
                function(d) { return d.university_name; },
                function(d) { return d.country; },
                function(d) { return d.year; },
                function(d) { return d.teaching},
                function(d) { return d.research},
                function(d) { return d.citations},
                function(d) { return d.total_score}
            ])
            .sortBy(function(d){ return +d.Id; })
            .order(d3.ascending);

        //-----------------------------------
        dc.renderAll();

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([10, -10])
            .html(function (d) {
                return "<span style='color: #888'>" +  d.key + "</span> : "  + numberFormat(d.value);
            });
        d3.selectAll("g.row").call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        var barTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([10, 0])
            .html(function (d) {
                return "<span style='color: #888'>" + d.data.key + "</span> : " + numberFormat(d.y);
            });
        d3.selectAll(".bar").call(barTip)
            .on('mouseover', barTip.show)
            .on('mouseout', barTip.hide);

        // tooltips for pie chart
        var pieTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([10, -10])
            .html(function (d) {
                return "<span style='color: #888'>" +  d.data.key + "</span> : "  + d.value;
            });
        d3.selectAll(".pie-slice").call(pieTip)
            .on('mouseover', pieTip.show)
            .on('mouseout', pieTip.hide);

        theMap = mapChart.map();
        new L.graticule({ interval: 10, style: { color: '#333', weight: 0.5, opacity: 1. } }).addTo(theMap);
        new L.Control.MousePosition({lngFirst: true}).addTo(theMap);
        new L.Control.zoomHome({homeZoom: 2, homeCoordinates: [45, -20]}).addTo(theMap);
        var mapmadeUrl = 'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
            mapmade = new L.TileLayer(mapmadeUrl, { maxZoom: mapMaxZoom+1});
        new L.Control.MiniMap(mapmade, { toggleDisplay: true, zoomLevelOffset: -4 }).addTo(theMap);

        $('.leaflet-control-zoomhome-home')[0].click();

        $('#chart-table-new')
            .on('mouseover', '.dc-table-column', function() {
                // displays popup only if text does not fit in col width
                if (this.offsetWidth < this.scrollWidth) {
                    d3.select(this).attr('title', d3.select(this).text());
                }
            })
            .on('click', '.dc-table-column', function() {
                var column = d3.select(this).attr("class");
                var id = d3.select(this.parentNode).select(".dc-table-column._0").text();
                dataTableNew.filter(id);
                dc.redrawAll();
                // make reset link visible
                d3.select("#resetNewTableLink").style("display", "inline");
            });

        markers = mapChart.markerGroup();
        markers
            .on('clustermouseover', function (a) {
                var childMarkers = a.layer.getAllChildMarkers();
                var childMarkersIds = childMarkers.map(function(obj) {return obj.key[2]}).sort();
                //console.log(childMarkersIds);
                childMarkersIds.forEach(function(Id, i) {
                    d3.selectAll(".dc-table-column._0")
                        .text(function (d) {
                            if (parseInt(d.Id) == Id) {
                                if (i==0) this.parentNode.scrollIntoView();  // scroll for first
                                d3.select(this.parentNode).style("font-weight", "bold");
                            }
                            return d.Id;
                        });
                });
            })
            .on('clustermouseout', function (a) {
                d3.selectAll(".dc-table-row").style("font-weight", "normal");
            });
    });

});

// reset dataTable
function resetNewTable() {
    dataTableNew.filterAll();
    dc.redrawAll();
    // make reset link invisible
    d3.select("#resetNewTableLink").style("display", "none");
}

// reset all except mapChart
function resetAll_exceptMap_New() {
    // totalChart.filterAll();
    countryChart.filterAll();
    rankingChart.filterAll();
    yearChart.filterAll();
    teachingChart.filterAll();
    researchChart.filterAll();
    resetNewTable();
    dc.redrawAll();
}


function drawCategory(chart, chartDim, chartGroup, color_val) {
    chart
        .width(300)
        .height(300)
        .margins({top: 10, right: 20, bottom: 40, left: 50})
        .centerBar(false)
        // .elasticY(true)
        .dimension(chartDim)
        .group(chartGroup)
        .x(d3.scale.ordinal().domain([2011, 2012, 2013, 2014, 2015, 2016]))
        .y(d3.scale.linear().domain([0, 100]))
        .xUnits(dc.units.ordinal)
        .gap(20)
        .brushOn(false)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .colors(color_val)
        .xAxis().tickFormat();

    chart.on("postRender", function (chart) {
        addXLabel(chart, "Year");
        addYLabel(chart, "Score");
    });
}

var addXLabel = function(chartToUpdate, displayText) {
    var textSelection = chartToUpdate.svg()
        .append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", chartToUpdate.width() / 2)
        .attr("y", chartToUpdate.height() - 10)
        .text(displayText);
    var textDims = textSelection.node().getBBox();
    var chartMargins = chartToUpdate.margins();

    textSelection
        .attr("x", chartMargins.left + (chartToUpdate.width()
            - chartMargins.left - chartMargins.right) / 2)
        .attr("y", chartToUpdate.height() - Math.ceil(textDims.height) / 2);
};
var addYLabel = function(chartToUpdate, displayText) {
    var textSelection = chartToUpdate.svg()
        .append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartToUpdate.height() / 2)
        .attr("y", 10)
        .text(displayText);
    var textDims = textSelection.node().getBBox();
    var chartMargins = chartToUpdate.margins();

    textSelection
        .attr("x", -chartMargins.top - (chartToUpdate.height()
            - chartMargins.top - chartMargins.bottom) / 2)
        .attr("y", Math.max(Math.ceil(textDims.height), chartMargins.left
            - Math.ceil(textDims.height) - 15));
};
