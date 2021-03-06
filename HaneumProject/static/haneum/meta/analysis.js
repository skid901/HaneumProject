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
	'Inventory': 'BlueViolet',
	'AccountsReceivable': 'CornflowerBlue',
	'InventoryTotalAssets': 'Gold',
	'TotalBorrowings': 'LightGreen',
	'TotalLiabilities': 'LightPink',
	'TotalCapital': 'LightSalmon',

	'Sales': 'HotPink',
	'CostofGoodsSold': 'LightSkyBlue',
	'OperatingProfit': 'LightSlateGray',
	'FinancialCosts': 'Sienna',
	'NetIncome': 'Peru',

	'OperatingActivitiesCashFlow': 'PaleVioletRed',
    'InvestmentActivitiesCashFlow': 'MediumTurquoise',
    'FinancialActivitiesCashFlow': 'Maroon',
};

let companyName;
let news;
let totalData;
let predictData;
let predictAverage;
let checked_col_btn_list = [];
let parseDate = d3.timeParse("%Y");

$('#upload').ajaxForm({
	url: "./upload",
	enctype: "multipart/form-data",
	dataType: "json",
	success: function (result, status, xhr) {
		if (result.status == 1) {
			predictAverage = 0;
			news = result.news;
			totalData = result.data;
			predictData = result.predict;
			console.log('news', news);
			console.log('totalData', totalData);
			console.log('predictData', predictData)
			companyName = totalData[0].CompanyName;

			$('#news_title').html(`<b>${companyName}</b>&nbsp;검색&nbsp;결과:`);
			$('#analysis_title').html(`<b>${companyName}</b>&nbsp;분석&nbsp;결과:`);
			$('#prediction_title').html(`<b>${companyName}</b>&nbsp;예측&nbsp;결과:`);

			// 뉴스 데이터
			$('#article_list').empty();
			news.map(function(el, idx){
				if(idx >= 6) {
					return;
				}
				$('#article_list').append(
`<a href='${el.originallink}' class="list-group-item" target="_blank">
	<h4 class="list-group-item-heading">
		<b>${el.title}</b>
	</h4>
	<p class=\"list-group-item-text\">
		${el.description}
	</p>
</a>`
				);
			});

			// 분석 데이터 그래프
			totalData = totalData.map(function(d) {
				d.Year = parseDate(d.Year);
				return d;
			});
			$('#graph').empty();
			getGraph(totalData, checked_col_btn_list);

			// 예측 데이터 그래프
			predictData = predictData.map(function(d, idx) {
				d.Year = parseDate(d.Year);
				predictAverage = (predictAverage * idx + d.Bankruptcy) / (idx + 1);
				return d;
			});
			console.log('predictAverage', predictAverage);
			$('#prediction_graph').empty();
			getPredictionGraph(predictData);
			$('#bankruptcyGaugeContainer').empty();
			initialize();
			$('#prediction_content').empty();
			$('#prediction_content').html(
`<strong><span style="font-size: 30px;">${companyName}</span></strong>의<br>
평균 예측 부도율은<br>
<strong><span style="font-size: 40px;">${Math.floor(predictAverage*10000)/100}%</span></strong><br>
입니다.`
			);

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

$('.col_btn')
	.css('border-width', '3px')
	.css('margin', '1px')
	.attr('width', '130px');

$('.col_btn').on('click', function(event) {
	let col_btn = event.target
	let input = $(col_btn).children()[0];
	let isChecked = $(input).prop('checked');
	if (!isChecked) {
		let col_name = $(input).val();
		checked_col_btn_list.push(col_name);
		$(input).prop('checked', true);
		$(col_btn).css('border-color', column_color[col_name]);
	} else {
		let col_name = $(input).val();
		checked_col_btn_list = checked_col_btn_list.filter(function(el){
			return el !== col_name
		});
		$(input).prop('checked', false);
		$(col_btn).css('border-color', 'LightGray');
	}
	$('#graph').empty();
	getGraph(totalData, checked_col_btn_list);
});

function getGraph(row_data, col_list) {  //, CompanyName, [col1, col2, col3]) {

	let data = row_data;
	
	let svg = d3.select('#graph');
		//.attr('width', window.innerWidth * 760 / 1280);

	let top = 20;
	let right = 20;
	let bottom = 20;
	let left = 130;  // left: 40

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
		.ticks(d3.timeYear)
		.tickSize(-height);

	let yAxis = d3
		.axisLeft(y)
		.tickSize(-width);

	let zero_line = d3.line()
		.x(d => x(d.Year))
		.y(d => y(0));

	chart
		.append('path')
		.datum(data)  // [data]
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.attr('stroke-width', 2)
		.attr('d', zero_line);
		// .attr('stroke-dasharray', '5,5')
	
	let earliest_year = d3.min(data, d => d.Year);

	let year_line = d3.line()
		.x(d => x(earliest_year))
		.y(d => y(yMin));

	chart
		.append('path')
		.datum(data)  // [data]
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.attr('stroke-width', 1.5)
		.attr('d', year_line);
		// .attr('stroke-dasharray', '5,5')

	chart
		.append('g')
		.attr('transform', 'translate(0, ' + height + ')')
		.attr('opacity', 0.7)
		.call(xAxis);
		
	
	chart
		.append('g')
		.attr('opacity', 0.7)
		.call(yAxis);

	let detail = {
		'col': d3.select('#detail_col'),
		'year': d3.select('#detail_year'),
		'currency': d3.select('#detail_currency')
	};

	let formatTime = d3.timeFormat('%Y');

	col_list.map(function(col_name) {

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
			.attr('r', 4)
			.attr('cx', d => x(d.Year))
			.attr('cy', d => y(d[col_name]))
			.attr('class', `${col_name}Dots`)
			.style('fill', column_color[col_name]);
		
		chart
			.selectAll(`.${col_name}Dots`)
			.on('mouseover', d => {
				let circle = d3
					.select(d3.event.target);
				circle
					.attr('r', 6)
					.style('fill', 'white')
					.style('stroke', `${column_color[col_name]}`)
					.style('stroke-width', '4');

				detail['col']
					.html(`<strong>${column_translation[col_name]}</strong>`);
				detail['year']
					.html(`<strong>${formatTime(d.Year)}</strong>`);
				detail['currency']
					.html(`<strong>${Number(d[col_name]).toLocaleString('en')}&nbsp;원</strong>`);			
			})
			.on('mouseout', d => {
				let circle = d3
					.select(d3.event.target);
				circle
					.attr('r', 4)
					.style('fill', column_color[col_name])
					.style('stroke', 'none')
					.style('stroke-width', 'none');
				detail['col']
					.html(`${column_translation[col_name]}`);
				detail['year']
					.html(`${formatTime(d.Year)}`);
				detail['currency']
					.html(`${Number(d[col_name]).toLocaleString('en')}&nbsp;원`);	
			});
		
	});

}

function getPredictionGraph(predictData) {

	let data = predictData;

	let svg = d3.select('#prediction_graph');
		//.attr('width', window.innerWidth * 760 / 1280);

	let top = 20;
	let right = 20;
	let bottom = 20;
	let left = 30;  // left: 40

	let margin = { 'top': top, 'right': right, 'bottom': bottom, 'left': left };
	let width = + svg.attr('width') - left - right;
	let height = + svg.attr('height') - top - bottom;

	let chart = svg
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	let cover = svg
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	let x = d3
		.scaleBand()
		.domain(data.map(d => d.Year))
		.range([margin.left, width - margin.right])
		.padding(0.4);
	
	let y = d3
		.scaleLinear()
		.domain([0, 1])
		.nice()
		.range([height - margin.bottom, margin.top]);
		
	let xAxis = d3
		.axisBottom(x)
		.tickFormat(d3.timeFormat('%Y'));
	
	let yAxis = d3
		.axisLeft(y)
		.tickFormat(d3.format(".0%"))
		.tickSize(-width);

	let tooltip = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)
		.style('display', 'none');

	let linearGradient = d3
		.select('#prediction_graph')
		.append('defs')
			.append('linearGradient')
				.attr('id', 'gradient')
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '0%')
				.attr('y2', '100%');

	linearGradient
		.append('stop')
			.attr('offset', '0%')
			.style('stop-color', 'black')
			.style('stop-opacity', '1');

	linearGradient
		.append('stop')
			.attr('offset', '10%')
			.style('stop-color', 'red')
			.style('stop-opacity', '1');

	linearGradient
		.append('stop')
			.attr('offset', '40%')
			.style('stop-color', 'yellow')
			.style('stop-opacity', '1');
	
	linearGradient
		.append('stop')
			.attr('offset', '70%')
			.style('stop-color', 'green')
			.style('stop-opacity', '1');
	
	chart
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
			.attr('x', d => x(d.Year))
			.attr('y', d => y(1))
			.attr('height', d => y(0) - y(1))
			.attr('width', x.bandwidth())
			.style('fill', 'url(#gradient)');
	
	cover
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
			.attr('x', d => x(d.Year))
			.attr('y', d => y(1))
			.attr('height', d => y(0) - y(d.NonBankruptcy))
			.attr('width', x.bandwidth())
			.style('fill', 'white')
			.attr('stroke', 'white')
			.attr('stroke-width', 3);

	cover
		.append("g")
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);

	cover
		.append("g")
		.attr('opacity', 0.5)
		.call(yAxis);

	chart
		.selectAll('rect')
		.on('mouseover', d => {
			tooltip
				.style('opacity', 1)
				.style('display', 'block')
				.style('left', `${d3.event.pageX + 5}px`)
				.style('top', `${d3.event.pageY - 45}px`)
				.html(`<strong>Year:&nbsp;${d3.timeFormat('%Y')(d.Year)}
Bankruptcy:&nbsp;<span style='color:red'>${Math.floor(d.Bankruptcy * 10000) / 100}%</span></strong>`);
		})
		.on('mouseout', d => {
			tooltip
				.style('opacity', 0);
		});
	
}

// 게이저 생성
var gauges = [];

function createGauge(name, label, min, max) {
	var config =
	{
		size: 200,//120,
		label: label,
		min: undefined != min ? min : 0,
		max: undefined != max ? max : 100,
		minorTicks: 5
	}

	var range = config.max - config.min;
	config.greenZones = [{ from: config.min, to: config.min + range * 0.3 }];
	config.yellowZones = [{ from: config.min + range * 0.3, to: config.min + range * 0.6 }];
	config.redZones = [{ from: config.min + range * 0.6, to: config.min + range * 0.9 }];
	config.blackZones = [{ from: config.min + range * 0.9, to: config.max }];

	gauges[name] = new Gauge(name + "GaugeContainer", config);
	gauges[name].render();
}

function createGauges() {
	createGauge("bankruptcy", "Bankruptcy");
	//createGauge("cpu", "CPU");
	//createGauge("network", "Network");
	//createGauge("test", "Test", -50, 50 );
}

function updateGauges() {
	for (var key in gauges) {
		var value = getRandomValue(gauges[key])
		gauges[key].redraw(value);
	}
}

function getRandomValue(gauge) {
	var overflow = 0; //10;
	return gauge.config.min - overflow + (gauge.config.max - gauge.config.min + overflow * 2) * predictAverage; // Math.random();
}

function initialize() {
	createGauges();
	// setInterval(updateGauges, 5000);
	updateGauges();
}
