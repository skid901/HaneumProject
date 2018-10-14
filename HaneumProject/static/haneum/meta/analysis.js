let column_translation = {
    'CompanyName': '회사명',
	'Year': '년도',
	'Bankruptcy': '부도여부',

	'Inventory': '재고자산',
	'AccountsReceivable': '매출채권',
	'InventoryTotalAssets': '자산총계',
	'TotalBorrowings': '총차입금',
	'TotalLiabilities': '부채총계',
	'TotalCapital': '자본총계',

	'Sales': '매출액',
	'CostofGoodsSold': '매출원가',
	'OperatingProfit': '영업이익',
	'FinancialCosts': '금융비용',
	'NetIncome': '당기순이익',

	'OperatingActivitiesCashFlow': '영업활동으로인한현금흐름',
    'InvestmentActivitiesCashFlow': '투자활동으로인한현금흐름',
    'FinancialActivitiesCashFlow': '재무활동으로인한현금흐름',
    
    'AccountsReceivableTurnover': '매출채권회전율',
    'AccountsReceivableTurnoverDays': '매출채권회전일수',
    'InventoryTurnover': '재고자산회전율',
    'InventoryTurnoverDays': '재고자산회전일수',
	'DebtRatio': '부채비율'    
};

let column_color = {
	'Inventory': 'Crimson',
	'AccountsReceivable': 'Coral',
	'InventoryTotalAssets': 'Coral',
	'TotalBorrowings': 'DarkGreen',
	'TotalLiabilities': 'DarkBlue',
	'TotalCapital': 'DarkViolet',

	'Sales': 'FireBrick',
	'CostofGoodsSold': 'GoldenRod',
	'OperatingProfit': 'MediumSeaGreen',
	'FinancialCosts': 'RoyalBlue',
	'NetIncome': 'Plum',

	'OperatingActivitiesCashFlow': 'LightPink',
    'InvestmentActivitiesCashFlow': 'LightGreen',
    'FinancialActivitiesCashFlow': 'LightSalmon',
};

let news;
let totalData;
let predictData;
let checked_col_btn_list = [];

$('#upload').ajaxForm({
	url: "./upload",
	enctype: "multipart/form-data",
	dataType: "json",
	success: function (result, status, xhr) {
		if (result.status == 1) {
			news = result.news;
			totalData = result.data;
			predictData = result.predict;
			console.log('news', news);
			console.log('totalData', totalData);
			console.log('predictData', predictData)

			// 뉴스 데이터
			$('#article_list').empty();
			$('#news_title').html(`<b>${totalData[0].CompanyName}</b> 검색결과:`);
			news.map(function(el, idx){
				$('#article_list').append(`<a href='${el.originallink}' class="list-group-item" target="_blank">
<h4 class="list-group-item-heading"><b>${el.title}</b></h4>
<p class=\"list-group-item-text\">${el.description}</p>
</a>`);
			});

			// 분석 데이터 그래프
			let parseDate = d3.timeParse("%Y");
			totalData = totalData.map(function(d) {
				d.Year = parseDate(d.Year);
				return d;
			});
			$('#graph').empty();
			getGraph(totalData, checked_col_btn_list);


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
			alert('파일을 업로드해주세요.');
		}
	},
	error: function (xhr, status, error) {
		console.log('error', error);
	}
});

$('.col_btn').on('click', function(event) {
	let col_btn = event.target
	let input = $(col_btn).children()[0];
	let isChecked = $(input).prop('checked');
	if (!isChecked) {
		let col_name = $(input).val();
		checked_col_btn_list.push(col_name);
		$(input).prop('checked', true);
		$(col_btn).css('background-color', column_color[col_name]);
	} else {
		let col_name = $(input).val();
		checked_col_btn_list = checked_col_btn_list.filter(function(el){
			return el !== col_name
		});
		$(input).prop('checked', false);
		$(col_btn).css('background-color', 'white');
	}
	$('#graph').empty();
	getGraph(totalData, checked_col_btn_list);
});

let svg = d3.select('svg');

function getGraph(row_data, col_list) {  //, CompanyName, [col1, col2, col3]) {

	let data = row_data;
	
	let svg = d3.select('svg');
		// .attr('width', window.innerWidth * 500 / 1280);

	let top = 20;
	let right = 20;
	let bottom = 20;
	let left = 170;  // left: 40

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

	let xAxis = d3
		.axisBottom(x)
		.tickFormat(d3.timeFormat('%Y'))
		.ticks(d3.timeYear);
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
		.style('width', '160px')
		.style('height', '65px');

	let formatTime = d3.timeFormat('%Y');

	if (yMin < 0) {
		let zero_line = d3.line()
			.x(d => x(d.Year))
			.y(d => y(0));

		chart
			.append('path')
			.datum(data)  // [data]
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '5,5')
			.attr('d', zero_line);
	}

	col_list.map(function(col_name, idx) {
		let col_line = d3.line()
			.x(d => x(d.Year))
			.y(d => y(d[col_name]))
			.curve(d3.curveMonotoneX);

		chart
			.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', column_color[col_name])
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
			.attr('class', `${col_name}Dots`)
			.style('fill', column_color[col_name]);
		
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
									<td style="text-align: center;">연&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp도&nbsp;:</td>
								</tr>
								<tr>
									<td style="text-align: center;">${formatTime(d.Year)}</td>
								</tr>
								<tr>
									<td style="text-align: center;">${column_translation[col_name]}&nbsp;:</td>
								</tr>
								<tr>
									<td style="text-align: center;">￦&nbsp;${Number(d[col_name]).toLocaleString('en')}</td>
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