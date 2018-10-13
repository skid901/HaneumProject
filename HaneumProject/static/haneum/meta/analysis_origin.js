var column_translation = {
    'CompanyName': '회사명',
    'Year': '년도',
    'Sales': '매출액',
    'OperatingProfit': '영업이익',
    'NetIncome': '당기순이익',
    'OperatingActivitiesCashFlow': '영업활동으로인한현금흐름',
    'InvestmentActivitiesCashFlow': '투자활동으로인한현금흐름',
    'FinancialActivitiesCashFlow': '재무활동으로인한현금흐름',
    'AccountsReceivable': '매출채권',
    'AccountsReceivableTurnover': '매출채권회전율',
    'AccountsReceivableTurnoverDays': '매출채권회전일수',
    'CostofGoodsSold': '매출원가',
    'Inventory': '재고자산',
    'InventoryTurnover': '재고자산회전율',
    'InventoryTurnoverDays': '재고자산회전일수',
    'InventoryTotalAssets': '자산총계',
    'TotalBorrowings': '총차입금',
    'FinancialCosts': '금융비용(손익)',
    'TotalLiabilities': '부채총계',
    'TotalCapital': '자본총계',
    'DebtRatio': '부채비율',
    'Bankruptcy': '부도여부'
};

var totalData;

$('#upload').ajaxForm({
	url: "./upload",
	enctype: "multipart/form-data",
	dataType: "json",
	success: function (result, status, xhr) {
		if (result.status == 1) {
			$('#graph').empty();
			
			totalData = result.data;
			console.log('totalData:', totalData);
			console.log('typeof(totalData):', typeof(totalData));

			var parseDate = d3.timeParse("%Y");
			console.log('parseDate', parseDate)
		
			totalData = totalData.map(function(d) {
				console.log(d.Year)
				d.Year = parseDate(d.Year);
				console.log(d.Year)
				return d;
			});

			console.log('check');

			getGraph(totalData);
			
			$('#articles')
				.css('display', 'block');

			$('#analysis')
				.css('display', 'block');

			$('#prediction')
				.css('display', 'block');

			$('#search_close').trigger('click');

			$('#id_file').val("");
		} else {
			console.log("return status : %d", result.status);
			alert('파일을 업로드해주세요');
		}
	},
	error: function (xhr, status, error) {
		console.log('error', error);
	}
});

$('#test_btn').on('click', function() {
	console.log(totalData);
});

function getGraph(row_data) {  //, CompanyName, [col1, col2, col3]) {

	let data = row_data;

	//data = data.filter(d => d.CompanyName == '3S');

	let top = 20;
	let right = 20;
	let bottom = 20;
	let left = 90;  // left: 40

	let svg = d3.select('svg');
	let margin = { 'top': top, 'right': right, 'bottom': bottom, 'left': left };
	let width = + svg.attr('width') - left - right;
	let height = + svg.attr('height') - top - bottom;

	let chart = svg
		.append('g')
		.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	let x = d3
		.scaleTime()
		.domain(d3.extent(data, d => d.Year))
		.range([0, width]);

	let totalLiabilities = d3.max(data, d => d['TotalLiabilities']);
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
		.y(d => y(d['TotalLiabilities']));

	let totalCapitalLine = d3.line()
		.x(d => x(d.Year))
		.y(d => y(d.TotalCapital));
	// .curve(d3.curveMonotoneX);

	chart
		.append('path')
		.datum(data)  // [data]
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
		.attr('cy', d => y(d['TotalLiabilities']))
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
								<td style="text-align: right;">${column_translation['TotalLiabilities']}&nbsp;:</td>
								<td>&nbsp;￦&nbsp;${Number(d['TotalLiabilities']).toLocaleString('en')}</td>
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
