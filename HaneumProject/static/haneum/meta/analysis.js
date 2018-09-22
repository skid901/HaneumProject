$('#upload').ajaxForm({
	url: "./upload",
	enctype: "multipart/form-data",
	dataType: "json",
	success: function (data, status, xhr) {
		if (data.status == 1) {
			$('#graph').empty();
			
			getGraph(data.data);
			
			$('#articles')
				.css('display', 'block');

			$('#analysis')
				.css('display', 'block');

			$('#prediction')
				.css('display', 'block');

			$('#search_close').trigger('click');

			$('#id_file').val("");
		} else {
			console.log("return status : %d", data.status);
		}
	},
	error: function (xhr, status, error) {
		console.log('error', error);
	}
});

function getGraph(row_data) {  //, CompanyName, [col1, col2, col3]) {

	let data = row_data;

	data = data.filter(d => d.CompanyName == '3S');

	let parseDate = d3.timeParse("%Y");

	function parsing(d) {
		d.Year = parseDate(d.Year);
		return d;
	}

	data = data.map(parsing);

	let top = 20;
	let right = 20;
	let bottom = 20;
	let left = 90;

	let svg = d3.select('svg');
	let margin = { 'top': top, 'right': right, 'bottom': bottom, 'left': left };  // left: 40
	let width = +svg.attr('width') - left - right;
	let height = +svg.attr('height') - top - bottom;

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
		.style('display', 'none')
		.style('width', '170px')
		.style('height', '35px');


	let formatTime = d3.timeFormat('%Y');

	chart
		.selectAll('.totalLiabilitiesdots')
		.on('mouseover', d => {
			div
				.transition()
				.duration(200)
				.style('opacity', 0.9)
				.style('display', 'block');
			// div
			// 	.html('년도 : ' + formatTime(d.Year) + '<br/>' +
			// 		'부채총계 : ' + '￦' + Number(d.TotalLiabilities).toLocaleString('en'))
			// 	.style('left', (d3.event.pageX + 5) + 'px')
			// 	.style('top', (d3.event.pageY - 35) + 'px');

			div
				.html(`<table>
							<tr>
								<td style="text-align: right;">연&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp도&nbsp;:</td>
								<td style="text-align: left;">&nbsp;${formatTime(d.Year)}</td>
							</tr>
							<tr>
								<td style="text-align: right;">부채총계&nbsp;:</td>
								<td>&nbsp;￦&nbsp;${Number(d.TotalLiabilities).toLocaleString('en')}</td>
							</tr>
						</table>`)
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
				.html(`<table>
				<tr>
					<td style="text-align: right;">연&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp도&nbsp;:</td>
					<td style="text-align: left;">&nbsp;${formatTime(d.Year)}</td>
					</tr>
					<tr>
						<td style="text-align: right;">자본총계&nbsp;:</td>
						<td>&nbsp;￦&nbsp;${Number(d.TotalCapital).toLocaleString('en')}</td>
						</tr>
					</table>`)
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
