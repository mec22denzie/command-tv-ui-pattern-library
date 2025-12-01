/* 
Pedro to do:

- Chart5: The top 5 YouTube channels’ Quarterly income. (check box)
•	Use stacked bar chart

please use check box ui element to select toggle each channels, the check box ui class name can be found at ./styles/elements.css

use the d3.select("#Pedro_chart_5") to select the dom placeholder 

*/

(function () {
	const CSV_PATH = "./data/top_100_youtubers.csv";

	// Brand colors (match color-theme.css)
	const PRIMARY = "#3B118D";
	const SECONDARY = "#8D1179";
	const ACCENT = "#B35FA8";
	const Q_COLORS = [PRIMARY, SECONDARY, ACCENT, "#7B66C4"];

	// Layout
	const width = 1080;
	const height = 480;
	const margin = { top: 28, right: 36, bottom: 62, left: 300 };
	const controlsH = 52;
	const innerW = width - margin.left - margin.right;
	const innerH = height - margin.top - margin.bottom - controlsH - 12;

	const container = d3.select("#Pedro_chart_5");
	container.selectAll("*").remove();

	const svg = container
		.append("svg")
		.attr("class", "pedroSvgContainer shadow rounded")
		.attr("width", width)
		.attr("height", height);

	// Drop shadow
	const defs = svg.append("defs");
	defs
		.append("filter")
		.attr("id", "dropShadowPedro")
		.attr("x", "-20%")
		.attr("y", "-20%")
		.attr("width", "140%")
		.attr("height", "140%")
		.append("feDropShadow")
		.attr("dx", 6)
		.attr("dy", 6)
		.attr("stdDeviation", 4)
		.attr("flood-color", "rgba(0,0,0,0.3)");

	// Title
	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", margin.top + 14)
		.attr("text-anchor", "middle")
		.style("fill", "#3b118d")
		.style("font-family", "'Montserrat', sans-serif")
		.style("font-size", "24px")
		.style("font-weight", "700")

		.text("Chart5: Top 5 Channels — Quarterly Income");
	/* .attr("text-anchor", "middle")
		.style("font-size", "22px")
		.style("font-weight", 700)
		.style("fill", PRIMARY)
		.style("font-family", "'Montserrat', sans-serif")
		 */

	// Controls (inline checkboxes)
	const fo = svg
		.append("foreignObject")
		.attr("x", 16)
		.attr("y", margin.top + 36)
		.attr("width", width - 32)
		.attr("height", controlsH);

	const controls = fo
		.append("xhtml:div")
		.style("display", "flex")
		.style("gap", "12px")
		.style("align-items", "center")
		.style("flex-wrap", "wrap")
		.style("font-family", "'Montserrat', sans-serif")
		.style("font-size", "14px")
		.style("color", PRIMARY);

	controls.append("div").style("font-weight", "700").text("Show:");

	const cbRow = controls
		.append("div")
		.attr("id", "pedro-checkboxes")
		.style("display", "flex")
		.style("gap", "16px")
		.style("align-items", "center")
		.style("flex-wrap", "wrap")
		.style("max-height", controlsH + "px");

	// Main graph group (below title + controls)
	const g = svg
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top + controlsH + 20})`)
		.attr("filter", "url(#dropShadowPedro)");

	// Scales / axes / stack
	const x = d3.scaleLinear().range([0, innerW]).domain([0, 3_500_000]); // 0–3.5M fixed
	const y = d3.scaleBand().range([0, innerH]).padding(0.24);
	const stack = d3.stack().keys(["Q1", "Q2", "Q3", "Q4"]);
	const color = d3.scaleOrdinal().domain(["Q1", "Q2", "Q3", "Q4"]).range(Q_COLORS);

	const xAxisG = g.append("g").attr("transform", `translate(0, ${innerH})`);
	const yAxisG = g.append("g");

	// X axis label (inside card)
	g.append("text")
		.attr("x", innerW / 2)
		.attr("y", innerH + 46)
		.attr("text-anchor", "middle")
		.style("font-family", "'Montserrat', sans-serif")
		.style("font-weight", 400)
		.style("fill", PRIMARY)
		.style("font-size", "13px")
		.text("Income (USD)");

	// Tooltip (accent background)
	const tooltip = d3
		.select("body")
		.append("div")
		.attr("class", "pedro-tooltip")
		.style("position", "absolute")
		.style("display", "none")
		.style("pointer-events", "none")
		.style("padding", "8px 10px")
		.style("border-radius", "8px")
		.style("background", ACCENT)
		.style("color", "#fff")
		.style("font-family", "'Poppins', sans-serif")
		.style("font-size", "12px")
		.style("box-shadow", "2px 2px 6px rgba(0,0,0,0.2)");

	const fmt = v => (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : d3.format(".2s")(v));

	function shortLabel(s) {
		const max = 34;
		return s.length > max ? s.slice(0, max - 1) + "…" : s;
	}

	// Load & parse
	d3.csv(CSV_PATH)
		.then(raw => {
			raw.forEach(d => {
				d.Q1 = +String(d["Income q1"] ?? 0)
					.toString()
					.replace(/,/g, "");
				d.Q2 = +String(d["Income q2"] ?? 0)
					.toString()
					.replace(/,/g, "");
				d.Q3 = +String(d["Income q3"] ?? 0)
					.toString()
					.replace(/,/g, "");
				d.Q4 = +String(d["Income q4"] ?? 0)
					.toString()
					.replace(/,/g, "");
				d.ChannelName = d.ChannelName || d.username || "Unknown";
				d.total = d.Q1 + d.Q2 + d.Q3 + d.Q4;
			});

			const top5 = raw.sort((a, b) => b.total - a.total).slice(0, 5);

			// Build inline checkboxes (.h_checkbox)
			const visibility = {};
			top5.forEach(d => (visibility[d.ChannelName] = true));

			top5.forEach(d => {
				const label = cbRow
					.append("label")
					.style("display", "flex")
					.style("align-items", "center")
					.style("gap", "8px")
					.style("cursor", "pointer")
					.style("color", PRIMARY);

				label
					.append("input")
					.attr("type", "checkbox")
					.attr("class", "h_checkbox form-check-input")
					.style("margin-top", "0")
					.style("vertical-align", "middle")
					.property("checked", true)
					.on("change", function () {
						visibility[d.ChannelName] = this.checked;
						draw();
					});

				label.append("span").style("font-family", "'Montserrat', sans-serif").text(d.ChannelName);
			});

			draw();

			function draw() {
				const data = top5.filter(d => visibility[d.ChannelName]);

				y.domain(data.map(d => d.ChannelName));

				xAxisG
					.call(d3.axisBottom(x).ticks(8).tickFormat(fmt))
					.selectAll("text")
					.style("fill", PRIMARY)
					.style("font-family", "'Montserrat', sans-serif");

				yAxisG
					.call(d3.axisLeft(y))
					.selectAll("text")
					.style("fill", PRIMARY)
					.style("font-family", "'Montserrat', sans-serif");

				const series = stack(data);

				// Layers
				const groups = g.selectAll(".layer").data(series, s => s.key);
				groups.exit().remove();
				const groupsEnter = groups
					.enter()
					.append("g")
					.attr("class", "layer")
					.attr("fill", s => color(s.key));
				const groupsMerge = groupsEnter.merge(groups);

				// Rects
				groupsMerge.each(function (s) {
					const rects = d3
						.select(this)
						.selectAll("rect")
						.data(s, d => d.data.ChannelName);
					rects.exit().remove();
					rects
						.enter()
						.append("rect")
						.attr("x", d => x(d[0]))
						.attr("y", d => y(d.data.ChannelName))
						.attr("height", y.bandwidth())
						.attr("width", 0)
						.merge(rects)
						.transition()
						.duration(350)
						.attr("x", d => x(d[0]))
						.attr("y", d => y(d.data.ChannelName))
						.attr("height", y.bandwidth())
						.attr("width", d => Math.max(1, x(d[1]) - x(d[0])));
				});

				// Tooltip overlays
				g.selectAll(".overlay").remove();
				g.selectAll(".overlay")
					.data(data)
					.enter()
					.append("rect")
					.attr("class", "overlay")
					.attr("x", 0)
					.attr("y", d => y(d.ChannelName))
					.attr("width", innerW)
					.attr("height", y.bandwidth())
					.style("fill", "transparent")
					.style("pointer-events", "all")
					.on("mouseover", (event, d) => {
						tooltip.style("display", "block").html(
							`<div style="font-family:'Montserrat',sans-serif;font-weight:700;margin-bottom:6px">${
								d.ChannelName
							}</div>
               Q1: ${fmt(d.Q1)}&nbsp;&nbsp;Q2: ${fmt(d.Q2)}&nbsp;&nbsp;Q3: ${fmt(
								d.Q3
							)}&nbsp;&nbsp;Q4: ${fmt(d.Q4)}<br/>
               <div style="margin-top:6px;font-weight:700">Total: ${fmt(d.total)}</div>`
						);
					})
					.on("mousemove", event => {
						tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY + 10 + "px");
					})
					.on("mouseout", () => tooltip.style("display", "none"));
			}
		})
		.catch(err => {
			container
				.append("div")
				.style("color", "red")
				.style("font-family", "'Montserrat', sans-serif")
				.text("Failed to load CSV: " + CSV_PATH);
			console.error(err);
		});
})();
