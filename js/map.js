COVID19_DATA = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
WORLD_MAP = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

let world = Object();
let countries = Object();
let coronaData = Object();
let populationData = Object();
let mergedData = Object();
let date;

d3.json(WORLD_MAP).then(d => {
    world = d
    countries = topojson.feature(d, d.objects.countries);
});

d3.csv(COVID19_DATA).then(function (c) {
    for (let key in c) {
        if (c[key]["Country/Region"] == "US") {
            c[key]["Country/Region"] = "United States of America";
        } else if (c[key]["Country/Region"] == "Korea, South") {
            c[key]["Country/Region"] = "South Korea";
        } else if (c[key]["Country/Region"] == "Burma") {
            c[key]["Country/Region"] = "Myanmar";
        } else if (c[key]["Country/Region"] == "Congo (Brazzaville)") {
            c[key]["Country/Region"] = "Congo";
        } else if (c[key]["Country/Region"] == "Congo (Kinshasa)") {
            c[key]["Country/Region"] = "Dem. Rep. Congo";
        }
    }
    coronaData = c;
});

d3.json("https://restcountries.eu/rest/v2/all").then(function (data) {
    data.forEach(d => {
        if (d.name === "Iran (Islamic Republic of)") {
            d.name = "Iran";
        } else if (d.name === "Syrian Arab Republic") {
            d.name = "Syria";
        } else if (d.name === "Palestine, State of") {
            d.name = "Palestine";
        } else if (d.name === "Bolivia (Plurinational State of)") {
            d.name = "Bolivia";
        } else if (d.name === "Venezuela (Bolivarian Republic of)") {
            d.name = "Venezuela";
        } else if (d.name === "Russian Federation") {
            d.name = "Russia";
        } else if (d.name === "Viet Nam") {
            d.name = "Vietnam";
        } else if (d.name === "Korea (Republic of)") {
            d.name = "South Korea";
        } else if (d.name === "Congo (Democratic Republic of the)") {
            d.name = "Dem. Rep. Congo";
        }
    });
    populationData = data;
});





function merge() {
    countries.features[140].properties["name"] = "China"
    let merged = [];
    //loop through countries topojson and add population/corona cases
    for (var i = 0; i < countries.features.length; i++) {
      let country = countries.features[i];
      // countries topojson data as main object
      let obj = Object.assign({}, countries.features[i]);
      //add population
      for (var c = 0; c < populationData.length; c++) {
        if (populationData[c].name == country.properties.name) {
          obj.properties.population = populationData[c].population;
        }
      }
      //add corona data by country name
      for (var g = 0; g < coronaData.length; g++) {
        if (obj.properties.name == coronaData[g]["Country/Region"]) {
          if (!obj.properties.corona) {
            obj.properties.corona = coronaData[g];
          } else {
            // sum each province for countries with multiple provinces
            for (var key in coronaData[g]) {
              if (!isNaN(key[0])) {
                obj.properties.corona[key] =
                  parseInt(obj.properties.corona[key]) +
                  parseInt(coronaData[g][key]);
              }
            }
            // set lat/lon as the object without province to avoid setting centroid in overseas territories
            if (coronaData[g]["Province/State"] == "") {
              obj.properties.corona.Long = coronaData[g].Long;
              obj.properties.corona.Lat = coronaData[g].Lat;
            }
          }
        }
      }
      if (!obj.properties.corona) {
        obj.properties.corona = null;
      }
      merged.push(obj);
    }
    mergedData = merged;
}

graticule = d3.geoGraticule10()

deathsExtent = [0, 250000];

circleScale = d3
    .scaleSqrt()
    .domain(deathsExtent)
    .range([2, 45]);


deathsExtent1 = d3.extent(mergedData, d => {
    if (d.properties.corona) {
        // round to nearest 1000
        return parseInt(d.properties.corona[date]);
    }
});


circleScale = d3
    .scaleSqrt()
    .domain(deathsExtent)
    .range([2, 45]);

toRadius = function (d) {
    if (d.properties.corona) {
        return circleScale(d.properties.corona[date]);
    }
};

dpi = window.devicePixelRatio

colorFunction = function (f) {
    if (f.properties.corona) {
        if (f.properties.corona[date] > 0) {
            return "#F9AFAF";
        } else {
            return "white";
        }
    } else return "white";
}

colorScheme = d3.interpolateOrRd

domain = d3.extent(mergedData, d => {
    if (d.properties.corona && d.properties.population)
        return d.properties.corona[date] / d.properties.population;
})
colorScale = d3.scalePow().domain(domain)


const projection = d3.geoNaturalEarth1();
//const projection = d3.geoTransverseMercator();
const path = d3.geoPath().projection(projection);

const height = 500
const width = 954


function renderMap(date){


    const container = d3.select("#map_container")

    const svg = container
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const tooltip = container
        .append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("right", "10px")
        .style("background-color", "#f6f6f6")
        .style("padding", "10px")
        .style('color','black')
        .style("border", "1px solid")
        .style("visibility", "hidden");

    const path = d3.geoPath(projection);

    let graticules = svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('d', path(graticule));
    svg
        .append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");
    svg
        .append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");

    // countries topojson
    let countr = svg
        .append('g')
        .selectAll('path')
        .data(mergedData)
        .join('path')
        .attr('fill', f =>{
            return colorFunction(f);
        } )
        .attr('stroke', '#000')
        .attr('stroke-width', 0.2)
        .attr('d', path)
        .style('cursor', 'pointer')
        .on("mouseover", function (d) {
            tooltip.style("visibility", "visible");
            let htmlString = "";
            cName = d.properties.name;
            // if(cName==='Taiwan'){
            //     cName = "China";
            // }
            htmlString = htmlString + "Country: " + cName + "<br>";
            if (d.properties.population) {
                htmlString =
                    htmlString +
                    "Population: " +
                    d.properties.population.toLocaleString("en").replace(/,/gi, " ") +
                    "<br>";
            }
            if (d.properties.corona) {
                htmlString =
                    htmlString +
                    "Confirmed Deaths as of " +
                    date +
                    ": " +
                    parseFloat(d.properties.corona[date])
                        .toLocaleString("en")
                        .replace(/,/gi, " ") +
                    "<br>";
            }

            tooltip.html(htmlString);
        })
        .on('mousemove', function (d) {
            // if (d.properties.name=='China')
            console.log(this)
            d3.select(this)
                // .attr('fill', 'red')
                .attr('stroke', 'white')
                .attr('stroke-width', 3);
        })
        .on('mouseleave', function () {
            d3.select(this)
                .attr('fill', f => colorFunction(f))
                .attr('stroke', '#000')
                .attr('stroke-width', 0.2);
            tooltip.style("visibility", "hidden");
        });

    // proportional circles
    let propCircles = svg
        .selectAll('circle')
        .data(mergedData)
        .enter()
        .append("circle")
        .style("stroke", "gray")
        .style("fill", "red")
        .style("opacity", "0.8")
        .style("pointer-events", "none")
        .attr("r", d => {
            return toRadius(d);
        })
        // now use the projection to project your coords
        .attr("cx", d => {
            if (d.properties.corona) {
                if (d.properties.corona[date] > 0) {
                    let coordinates = [d.properties.corona.Long, d.properties.corona.Lat];
                    return projection(coordinates)[0];
                }
            }
        })
        .attr("cy", d => {
            if (d.properties.corona) {
                if (d.properties.corona[date] > 0) {
                    let coordinates = [d.properties.corona.Long, d.properties.corona.Lat];
                    return projection(coordinates)[1];
                }
            }
        });

    //  legend title
    const legendTitle = svg
        .append("g")
        .attr("fill", "#444")
        .attr("transform", "translate(15," + (height - 150) + ")")
        .attr("text-anchor", "right")
        .style("font", "14px sans-serif");
    legendTitle
        .append("text")
        .attr("font-weight", "bold")
        .attr("y", 5)
        .attr("x", 0)
        .attr("dy", "1.3em")
        .text("Confirmed Deaths");

    // legend
    const legend = svg
        .append("g")
        .attr("fill", "#444")
        .attr("transform", "translate(60," + (height - 30) + ")")
        .attr("text-anchor", "right")
        .style("font", "12px sans-serif")
        .selectAll("g")
        .data([deathsExtent[1], deathsExtent[1] / 2, deathsExtent[1] / 8])
        .join("g");
    legend
        .append("circle")
        .attr("fill", "none")
        .attr("stroke", "#444")
        .attr("cy", d => -circleScale(d))
        .attr("r", circleScale);
    legend
        .append("text")
        .attr("y", d => -1 - 2 * circleScale(d))
        .attr("x", 55)
        .attr("dy", "1.3em")
        .text(d => {
            return parseInt(d)
                .toLocaleString("en")
                .replace(/,/gi, " ");
        });
}

function getDates(){
    let a = [];
    for (var key in coronaData[0]) {
        a.push(key)
    }
    console.log(a.length)
    return a.slice(4,297);
}


function startMap(){
    let i = 0;
    let dates = getDates();
    let id = setInterval(function(){
        if (i<dates.length){
            document.querySelector('#map_container').innerHTML='';
            
            date = dates[i++];
            renderMap(date);
            if(i==dates.length){
                console.log('aaa');
                clearInterval(id);
            }
        }

    },20);
}


