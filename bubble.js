// import * as d3 from "d3";

document.addEventListener("DOMContentLoaded", function(){
    // const root = document.getElementById('root');
    // root.textContent = 'This is new text';
    // d3.select("div").style("color", "blue");

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1200 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#root")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    // var xScale = d3.scaleLinear()
    var xScale = d3.scaleLog([300, 2e5], [0, width])
        // .ticks(12, d3.format(",d"))  //doesn't work
        // .domain([0, 100000])
        // .range([ 0, width ]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(width / 80, ","));

    ///////// xScale for total GDP
    // var xScale2 = d3.scaleLog([2e6, 3e14], [0, width])
    var xScale2 = d3.scaleLog([1.5e6, 3e14], [0, width])
    /////////////////////////

    // Add Y axis
    // var yAxis = d3.scaleLinear()
    var yAxis = d3.scaleSqrt()
    // var yAxis = d3.scaleLog([0, 3000], [height, 0])
        .domain([-25, 3000])
        .range([ height, 0]);
        // .domain([200, 1000])
        // .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yAxis));
        // ticks(height / 80, ",")

    // Add x-axis label
    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 5)
        .attr("fill", "#1e56a0")
        .text("GDP per capita, PPP & inflation-adjusted (USD)");

    // Add y-axis label
    svg
        .append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("y", 20)
        .attr("x", 0)
    //   .attr("dy", ".75em, 1.5em, 2.5em, 3.5em")
        .attr("transform", "rotate(-90)")
        .attr("fill", "#1e56a0")
        .text("Total Summer Olympic Medal Count");

    // Add year label
    var yearLabel = svg
        .append("text")
        .attr("class", "year-label")
    //   .attr("text-anchor", "end")
        .attr("y", height - 50)
        .attr("x", width - 335)
        .text(1896);

    function getValue(values, year) {
        // console.log("values", values)
        // console.log("year", year)
        let idx = bisectYear(values, year, 0, values.length - 1);

        ////////
        // if (!idx || !values[idx]) {
        //     console.log("no value at idx")
        //     return 0;
        // }
        ////////

        let arr = values[idx];

        // data smoothing with weighting if year is not found
        // if (idx > 0) {
        //     const backArray = values[idx - 1];
        //     const t = (year - arr[0]) / (backArray[0] - arr[0]);
        //     return arr[1] * (1 - t) + backArray[1] * t;
        // }

        // total GDP data is incomplete, so grab last known value
        if (arr[1] === null) {
            while (idx > 0 && arr[1] === null) {
                arr = values[idx]
                idx -= 1
            }
        }
        return arr[1];
    }

    //return bisector of array with year and value
    bisectYear = d3.bisector(([year]) => year).left

    Promise.all([
        d3.json("./combined.json")
        // d3.csv("./total_gdp.csv")
    ]).then(function (data) {
        // console.log(data[0][0])  // first row of combined
        const combined = data[0];

        var tooltip = d3.select('#root')
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            // .style("background-color", "white")
            // .style("border", "solid")
            // .style("border-width", "1px")
            // .style("border-radius", "5px")
            // .style("padding", "10px")

        // tooltip mouseover event handler
        var tipMouseover = function (d) {
            var html = d.name + "<br/>" + "pop: " + d3.format(",.2r")(d.population) + "<br/>" +
                "income: " + d3.format(",.2r")(d.income) + "<br/>" + "medals: " + d3.format(",.2r")(d.medals)

            tooltip.html(html)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .transition()
                .duration(200)
                .style("opacity", .9)
        };

        var tipMousemove = function (d) {
            var html = d.name + "<br/>" + "pop: " + d3.format(",.2r")(d.population) + "<br/>" +
                "income: " + d3.format(",.2r")(d.income) + "<br/>" + "medals: " + d3.format(",.2r")(d.medals)

            tooltip.html(html)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
        }

        // tooltip mouseout event handler
        var tipMouseout = function (d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        };


        function getData(year) {
            return data[0].map(country => {
                return(
                    ({
                        name: country.name,
                        region: country.region,
                        income: getValue(country.income, year),
                        population: getValue(country.population, year),
                        medals: getValue(country.medals, year),
                        totalGDP: getValue(country.totalGDP, year)
                    })
                )
            })
        }

        // x = d3.scaleLog([200, 1e5], [margin.left, width - margin.right])
        // y = d3.scaleLinear([14, 86], [height - margin.bottom, margin.top])
        // radius = d3.scaleSqrt([0, 5e8], [0, width / 24])
        radius = d3.scaleSqrt([0, 1.45e9], [3.5, width / 12])
        // color = d3.scaleOrdinal(data.map(d => d.region), d3.schemeCategory10)
        color = d3.scaleOrdinal(d3.schemeCategory10);
        // window.setTimeout(() => {
        //     console.log("Europe & Central Asia", color("Europe & Central Asia"));
        //     console.log("Sub-Saharan Africa", color("Sub-Saharan Africa"));
        //     console.log("America", color("America"));
        //     console.log("East Asia & Pacific", color("East Asia & Pacific"));
        //     console.log("South Asia", color("South Asia"));
        //     console.log("Middle East & North Africa", color("Middle East & North Africa"));
        // }, 5000)
        const circle = svg.append("g")
            // .attr("stroke", "white")
            .attr("stroke-width", "2px")
            .attr("opacity", "0.7")
            .selectAll("circle")
            .data(getData(1896), d => d.name)
            .join("circle")
            .sort((a, b) => d3.descending(a.population, b.population))
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yAxis(d.medals))
            .attr("r", d => radius(d.population))
            .attr("fill", d => color(d.region))
            .attr("class", "circles")
            .call(circle => circle.append("title"))
            // .text(d => [d.name, d.region].join("\n")))
            .on("mouseover", tipMouseover)
            .on("mouseout", tipMouseout)
            .on("mousemove", tipMousemove);

        var xVar = 'income';

        //update year function
        const update = (year) => {
            circle
                .data(getData(year), d => d.name)
                .sort((a, b) => d3.descending(a.population, b.population))
                .transition()
                .duration(500)
                // .attr("cx", d => xScale(d[xVar]))
                .attr("cx", d => {
                    // console.log(xScale(d[xVar]))
                    if (xVar === 'income') {
                        return (xScale(d[xVar]))
                    }
                    if (xVar === 'totalGDP') {
                        // if (!xScale2(d[xVar])) {
                        //     console.log("in circle function")
                        //     console.log(d[xVar])
                        //     return 1000000
                        // }
                        return (xScale2(d[xVar]))
                    }
                })
                .attr("cy", d => yAxis(d.medals))
                .attr("r", d => radius(d.population));
            yearLabel.text(year);
            // d3.select("text").text("dataset" + dataIndex);
        }

        const slider = d3.select("#year-slider")

        slider.on("mousemove", function () {
            update(this.value);
        })

        const updateSlider = () => {
            let currentYear = slider.property("value")
            slider.property("value", parseInt(currentYear)+1);
            update(slider.property("value"));
        }
        //autoplay on load
        let moveSlider = setInterval(updateSlider, 400);
        const clearPlay = () => {clearInterval(moveSlider)};
        //clear interval after 70 seconds
        setTimeout(clearPlay, 70000)
        const button = d3.select("button");

        slider.on("mousedown", () => {
            clearPlay();
            button.property("innerHTML","Play")
            // update(slider.property("value"));
        });

        slider.on("click", () => {
            update(slider.property("value"));
        });

        button.on("click", () => {
            if (button.property("innerHTML") === "Play") {
                moveSlider = setInterval(updateSlider, 500);
                button.property("innerHTML", "Pause");
            } else {
                clearPlay();
                button.property("innerHTML", "Play");
            }
        });

        const totalGDPRadio = d3.selectAll("input[name='x-axis']");
        totalGDPRadio.on("change", function () {
            // console.log(this.value)
            if (this.value === 'total-GDP') {
                xVar = 'totalGDP';
                xAxis.transition().duration(500).call(d3.axisBottom(xScale2).ticks(width / 80, ","));
                d3.select('.x-label').transition().text("Total GDP, PPP & inflation-adjusted (USD)");
            } else {
                xVar = 'income'
                xAxis.transition().duration(500).call(d3.axisBottom(xScale).ticks(width / 80, ","));
                d3.select('.x-label').transition().text("GDP per capita, PPP & inflation-adjusted (USD)");
            }
            // var xAxis = svg.append("g")
            //     .attr("transform", "translate(0," + height + ")")
            //     .call(d3.axisBottom(xScale).ticks(width / 80, ","));
            
            update(slider.property("value"));
        })

        // var dot = svg.append("g")
        //     .attr("class", "dots")
        //     .selectAll(".dot")
        //     .data(getData(1800))
        //     .enter().append("circle")
        //     // Add additional class with region name of currently added circle. 
        //     .attr("class", function (d) { return "dot " + regionScale(d.Region); })
        //     .style("fill", function (d) { return colorScale(d.Region); })
            // .call(position)
        //     .sort(order)
        //     .on("mouseover", fadeChart);	

    });
})

// Russia = combined counts for Soviet Union, Russian Empire, Russia, Unified Team
// Germany = combined counts for West Germany, East Germany, United Team of Germany, Germany, Saar(didn't find)
// Serbia = combined counts for Yugoslavia, Independent Olympic Participants, Serbia and Montenegro
// China = Hong Kong
// Kuwait = Independent Olympic Athletes 
// UK = Bermuda
// Sri Lanka = Ceylon

// Countries missing in IOC data but in country data
// Kiribati
// Marshall Islands
// Montenegro
// South Sudan
// Tuvalu


///////// get region data from Nations.json
// combined.forEach(country => {
//     let found = false;
//     nations.forEach(nation => {
//         if (country.name === nation.name) {
//             found = true
//             country.region = nation.region
//         }
//     })
//     if (found === false) {
//         console.log(country.name)
//     }
// })


/////// take medal data from Apple Numbers and create a JSON object
// let result = {};
// olympic.forEach(medalObj => {
//     if (!result[medalObj.Nation]) {
//         result[medalObj.Nation] = []
//     }
//     result[medalObj.Nation].push([parseInt(medalObj.Year), parseInt(medalObj.Total)])
// })

////// merge in JSON object of medal data into combined
// combined.forEach(country => {
//     // result[country.name]
//     country.medals = [];
//     let totalMedals = 0;
//     for (let i = 1800; i < 2020; i++) {
//         if (!result[country.name]) {
//             country.medals.push([i, 0])
//         } else {
//             result[country.name].forEach(medalYear => {
//                 if (medalYear[0] === i) {
//                     totalMedals += medalYear[1];
//                 }
//             })
//             country.medals.push([i, totalMedals])
//         }
//     }
// })
/////////////////

//find missing countries from olympic source
        // olympic.forEach(country => {
        //     let found = false;
        //     combined.forEach(code => {
        //         if (country.Nation === code.name) {
        //             found = true;
        //         }
        //     })
        //     if (found === false) {
        //         console.log(country.Nation)
        //     }
        // })
//find missing countries
        // combined.forEach(country => {
        //     let found = false;
        //     countryCode.forEach(code => {
        //         if (country.name === code.Country) {
        //             found = true;
        //         }
        //     })
        //     if (found === false) {
        //         console.log(country.name)
        //     }
        // })

        ////// second merging of population data into merged dataset
        // const combined = data[2];
        // const populations = data[1];
        // populations.forEach(popObj => {
        //     let population = [];
        //     let country = '';
        //     Object.keys(popObj).forEach(key => {
        //         if (key !== "country") {
        //             population.push([parseInt(key), parseInt(popObj[key])])
        //         } else {
        //             country = popObj[key];
        //         }
        //     })
        //     // console.log(population)
        //     combined.forEach(countryObj => {
        //         if (countryObj.name === country) {
        //             countryObj.population = population;
        //         }
        //     })
        // });

        //////////////////////////////////
        //   first functions to create first version of combined with only income data
        // const incomes = data[0];
        // let merged = [];

        // incomes.forEach(incomeObj => {
        //     let obj = {};
        //     obj.income = [];
        //     Object.keys(incomeObj).forEach(key => {
        //         if (key === "country") {
        //             obj.name = incomeObj[key]
        //         } else {
        //             obj.income.push([parseInt(key), parseInt(incomeObj[key])])
        //         }
        //     })
        //     merged.push(obj);
        // })
        // console.log(merged)


        //////////////// merge in total GDP data into combined
        // totalGDP.forEach(gdpObj => {
        //     let totalGDP = [];
        //     let country = '';
        //     Object.keys(gdpObj).forEach(key => {
        //         if (key !== "country") {
        //             totalGDP.push([parseInt(key), parseInt(gdpObj[key])])
        //         } else {
        //             country = gdpObj[key];
        //         }
        //     })
        //     combined.forEach(countryObj => {
        //         if (countryObj.name === country) {
        //             countryObj.totalGDP = totalGDP;
        //         }
        //     })
        // });
        // console.log(combined[0])

        // combined.forEach(obj => {
        //     if (obj.totalGDP === undefined) {
        //         console.log(obj)
        //     }
        // })

        //////////////////////////////////////////
        //to download newly created JSON object
        // function download(content, fileName, contentType) {
        //     var a = document.createElement("a");
        //     var file = new Blob([content], { type: contentType });
        //     a.href = URL.createObjectURL(file);
        //     a.download = fileName;
        //     a.click();
        // }
        // download(JSON.stringify(combined), 'json.txt', 'text/plain');