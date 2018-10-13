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
			totalData = result.data;
			var parseDate = d3.timeParse("%Y");

			totalData = totalData.map(function(d) {
				d.Year = parseDate(d.Year);
				return d;
			});

			$('#graph').empty();
			getGraph(totalData, [
				'TotalLiabilities', 'TotalCapital'
			]);
			
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

$('#test_btn1').on('click', function() {
	$('#graph').empty();
	getGraph(totalData, [
		'TotalLiabilities', 
		'TotalCapital'
	]);
});

$('#test_btn2').on('click', function() {
	$('#graph').empty();
	getGraph(totalData, [
		'OperatingActivitiesCashFlow',
    	'InvestmentActivitiesCashFlow',
		'FinancialActivitiesCashFlow'
	]);
});

$('#test_btn3').on('click', function() {
	$('#graph').empty();
	getGraph(totalData, [
		'Sales',
    	'OperatingProfit',
    	'NetIncome'
	]);
});

function getGraph(row_data, col_list) {  //, CompanyName, [col1, col2, col3]) {

	let data = row_data;

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

	let yMax = 0;
	let yMin = 0;

	col_list.map(function(col_name) {
		let colMax = d3.max(data, d => d[col_name]);
		if (yMax < colMax) {
			yMax = colMax;
		}
		let colMin = d3.min(data, d => d[col_name]);
		if (yMin > colMin) {
			yMin = colMin;
		}
	});

	let y = d3
		.scaleLinear()
		.domain([yMin, yMax])
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

	let div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)
		.style('display', 'none')
		.style('width', '170px')
		.style('height', '35px');

	let formatTime = d3.timeFormat('%Y');

	col_list.map(function(col_name, idx) {
		let col_line = d3.line()
			.x(d => x(d.Year))
			.y(d => y(d[col_name]));

		let color = ['darkred', 'steelblue', 'DarkGreen', 'OrangeRed',
			'DarkOrchid', 'DeepPink', 'GoldenRod', 'Indigo',
		];

		chart
			.append('path')
			.datum(data)  // [data]
			.attr('fill', 'none')
			.attr('stroke', color[idx])
			.attr('stroke-width', 2)
			.attr('d', col_line);

		chart
			.selectAll('dot')
			.data(data)
			.enter()
			.append('circle')
			.attr('r', 3)
			.attr('cx', d => x(d.Year))
			.attr('cy', d => y(d[col_name]))
			.attr('class', col_name + 'Dots')
			.style('fill', color[idx]);
		
		chart
			.selectAll(`.${col_name}Dots`)
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
									<td style="text-align: right;">${column_translation[col_name]}&nbsp;:</td>
									<td>&nbsp;￦&nbsp;${Number(d[col_name]).toLocaleString('en')}</td>
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
		
	});

}