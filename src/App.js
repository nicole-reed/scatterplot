import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import './App.css';

function App() {

  const [data, setData] = useState([])
  const [rendered, setRendered] = useState(false)

  useEffect(async () => {
    try {
      const chartData = await axios.get('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
      setData(chartData.data)


    } catch (error) {
      console.log('there was an error fetching data:\n', error)
    }
  }, [])

  useEffect(() => {
    if (data.length && !rendered) {
      console.log(data)
      const w = 1000;
      const h = 600;
      const padding = 50;

      data.forEach(biker => {
        const splitTime = biker.Time.split(':');
        biker.dateTime = new Date(Date.UTC(1970, 0, 1, 0, splitTime[0], splitTime[1]))
      });

      const minYear = d3.min(data, (d) => d.Year)
      const maxYear = d3.max(data, (d) => d.Year)
      const minTime = d3.min(data, (d) => d.dateTime)
      const maxTime = d3.max(data, (d) => d.dateTime)

      const xScale = d3.scaleLinear()
        .domain([minYear - 1, maxYear + 1])
        .range([padding, w - padding]);


      const yScale = d3.scaleTime()
        .domain([new Date(minTime.getTime() - 15000), new Date(maxTime.getTime() + 15000)])
        .range([h - padding, padding]);

      const svg = d3.select('#chart')
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      console.log(data)
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('class', 'dot')
        .attr("cx", (d) => xScale(d.Year))
        .attr("cy", (d) => yScale(d.dateTime))
        .attr("r", 4)
        .attr('data-xvalue', (d) => d.Year)
        .attr('data-yvalue', (d) => d.dateTime)
        .style('fill', (d) => d.Place > 5 ? 'green' : 'blueviolet')
        .append("title")
        .attr('id', 'tooltip')
        .attr('data-year', (d) => d.Year)
        .text((d) => `Name: ${d.Name}\nPlace: ${d.Place}\nTime: ${d.Time}\nYear: ${d.Year}\n\n${d.Doping}`);

      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
      const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%M:%S'))


      svg.append("g")
        .attr('id', 'x-axis')
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

      svg.append("g")
        .attr('id', 'y-axis')
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);


      const legend = svg.selectAll('.legend')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('id', 'legend');


      legend.append("circle")
        .attr("cx", 700)
        .attr("cy", 400)
        .attr("r", 5)
        .style("fill", "blueviolet");

      legend.append("circle")
        .attr("cx", 700)
        .attr("cy", 430)
        .attr("r", 5)
        .style("fill", "green");

      legend.append("text")
        .attr("x", 720)
        .attr("y", 400)
        .text("Riders Placed In Top 5")
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle");

      legend.append("text")
        .attr("x", 720)
        .attr("y", 430)
        .text("Riders Not Placed In Top 5")
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle");



      setRendered(true)
    }
  }, [data])


  return (
    <div className="App">
      <h1 id='title'>35 Fastest Times Up Alpe d'Huez</h1>
      <div id='chart'></div>
    </div>
  );
}

export default App;
