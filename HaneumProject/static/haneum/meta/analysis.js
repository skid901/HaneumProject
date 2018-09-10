$("#upload").on('submit', function (event) {

	event.preventDefault();

	// $(".show")
	// 	.style("display", "block");

	$.ajax({
		url: "./upload",
		type: "post",
		dataType: "json",
		success: function (data, status, xhr) {
			console.log(data.status);
			getGraph(data.jsonList);
		},
		error: function (xhr, status, error) {
			console.log(error);
		},
	});

});

function getGraph(row_data) {

	let data = row_data;

	data = data.filter(d => d.CompanyName == '3S');

	let parseDate = d3.timeParse("%Y");

	function parsing(d) {
		d.Year = parseDate(d.Year);
		return d;
	}

	data = data.map(parsing);

	let svg = d3.select("svg");
	let margin = { top: 20, right: 20, bottom: 20, left: 90 };  // left: 40
	let width = +svg.attr("width") - margin.left - margin.right;
	let height = +svg.attr("height") - margin.top - margin.bottom;

	let chart = svg
		.append('g')
		.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	let x = d3
		.scaleTime()
		.domain(d3.extent(data, d => d.Year))
		.range([0, width]);

	let totalLiabilities = d3.max(data, d => d.TotalLiabilities);
	let totalCapital = d3.max(data, d => d.TotalCapital);
	let yMax = totalLiabilities;
	if (yMax < totalCapital) {
		yMax = totalCapital
	};

	let y = d3
		.scaleLinear()
		.domain([0, yMax])
		.range([height, 0]);

	let xAxis = d3.axisBottom(x);
	let yAxis = d3.axisLeft(y);

	chart
		.append('g')
		.attr('transform', 'translate(0, ' + height + ')')
		.call(xAxis);

	chart
		.append('g')
		.call(yAxis);

	let totalLiabilitiesLine = d3.line()
		.x(d => x(d.Year))
		.y(d => y(d.TotalLiabilities));

	let totalCapitalLine = d3.line()
		.x(d => x(d.Year))
		.y(d => y(d.TotalCapital))
	// .curve(d3.curveMonotoneX);

	chart
		.append('path')
		.data([data])
		.attr('fill', 'none')
		.attr('stroke', 'darkred')
		.attr('stroke-width', 2)
		.attr('d', totalLiabilitiesLine);

	chart
		.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', 'steelblue')
		.attr('stroke-width', 2)
		.attr('d', totalCapitalLine);

	chart
		.selectAll('dot')
		.data(data)
		.enter()
		.append('circle')
		.attr('r', 3)
		.attr('cx', d => x(d.Year))
		.attr('cy', d => y(d.TotalLiabilities))
		.attr('class', 'totalLiabilitiesdots')
		.style('fill', 'darkred');

	chart
		.selectAll('dot')
		.data(data)
		.enter()
		.append('circle')
		.attr('r', 3)
		.attr('cx', d => x(d.Year))
		.attr('cy', d => y(d.TotalCapital))
		.attr('class', 'totalCapitaldots')
		.style('fill', 'steelblue');

	let div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)
		.style('display', 'none');

	let formatTime = d3.timeFormat('%Y');

	chart
		.selectAll('.totalLiabilitiesdots')
		.on('mouseover', d => {
			div
				.transition()
				.duration(200)
				.style('opacity', 0.9)
				.style('display', 'block');
			div
				.html('년도 : ' + formatTime(d.Year) + '<br/>' +
					'부채총계 : ' + '￦' + Number(d.TotalLiabilities).toLocaleString('en'))
				.style('left', (d3.event.pageX + 5) + 'px')
				.style('top', (d3.event.pageY - 35) + 'px');
		})
		.on('mouseout', d => {
			div
				.transition()
				.duration(500)
				.style("opacity", 0);
		});

	chart
		.selectAll('.totalCapitaldots')
		.on('mouseover', d => {
			div
				.transition()
				.duration(200)
				.style('opacity', 0.9)
				.style('display', 'block');
			div
				.html('년도 : ' + formatTime(d.Year) + '<br/>' +
					'자본총계 : ' + '￦' + Number(d.TotalCapital).toLocaleString('en'))
				.style('left', (d3.event.pageX + 5) + 'px')
				.style('top', (d3.event.pageY - 35) + 'px');
		})
		.on('mouseout', d => {
			div
				.transition()
				.duration(500)
				.style("opacity", 0);
		});

}