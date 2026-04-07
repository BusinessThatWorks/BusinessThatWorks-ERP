frappe.pages["project-summary-dashboard"].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Project Summary Dashboard",
		single_column: true,
	});

	// Inject CSS once
	if (!document.getElementById("btw-styles")) {
		var s = document.createElement("style");
		s.id = "btw-styles";
		s.textContent = `
/* ── layout ── */
.btw { padding: 28px 24px; font-family: inherit; background: #f5f7ff; min-height: 100vh; }
.btw-greeting { font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
.btw-date { font-size: 13px; color: #888; margin-bottom: 28px; }

/* ── summary cards — each a different colour ── */
.btw-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 28px; }
.btw-card {
  border-radius: 14px; padding: 20px 18px;
  position: relative; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.btw-card:nth-child(1) { background: linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; }
.btw-card:nth-child(2) { background: linear-gradient(135deg,#0891b2,#0e7490); color:#fff; }
.btw-card:nth-child(3) { background: linear-gradient(135deg,#059669,#047857); color:#fff; }
.btw-cards-totals { margin-top:12px; }
.btw-cards-totals .btw-card { background: linear-gradient(135deg,#1e1b4b,#312e81); color:#fff; }
.btw-card-label { font-size:12px; font-weight:600; opacity:.8; margin-bottom:8px; letter-spacing:.3px; }
.btw-card-value { font-size:32px; font-weight:800; line-height:1; }
.btw-card-sub { font-size:12px; opacity:.75; margin-top:8px; }
.btw-card-sub.warn { opacity:1; font-weight:600; color:#fde68a; }

/* ── section title ── */
.btw-section-title {
  font-size:11px; font-weight:700; letter-spacing:1px;
  text-transform:uppercase; color:#7c3aed; margin-bottom:12px;
  display:flex; align-items:center; gap:8px;
}
.btw-section-title::after { content:""; flex:1; height:1px; background:#e5e7eb; }

/* ── project rows ── */
.btw-project-row {
  display:flex; align-items:center; gap:16px;
  background:#fff; border:2px solid transparent;
  border-radius:12px; padding:16px 20px; margin-bottom:8px;
  cursor:pointer;
  transition: border-color .15s, box-shadow .15s, transform .1s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.btw-project-row:hover {
  border-color:#7c3aed;
  box-shadow: 0 4px 16px rgba(124,58,237,0.12);
  transform: translateY(-1px);
}
.btw-project-info { flex:1; min-width:0; }
.btw-project-name { font-size:15px; font-weight:700; color:#1a1a2e; }
.btw-project-sub { font-size:12px; color:#aaa; margin-top:2px; }
.btw-project-money { text-align:right; white-space:nowrap; }
.btw-project-collected { font-size:15px; font-weight:700; color:#059669; }
.btw-project-total { font-size:12px; color:#aaa; margin-top:2px; }

/* ── progress bar ── */
.btw-progress-wrap { width:120px; flex-shrink:0; }
.btw-progress-label { font-size:10px; color:#aaa; font-weight:600; letter-spacing:.3px; margin-bottom:2px; }
.btw-progress-bg { background:#f0f0f0; border-radius:6px; height:6px; }
.btw-progress-bar { height:6px; border-radius:6px; transition: width .5s ease; }
.btw-progress-bar.full { background: linear-gradient(90deg,#f59e0b,#ef4444); }
.btw-progress-bar.mid  { background: linear-gradient(90deg,#4f46e5,#7c3aed); }
.btw-progress-bar.low  { background: #d1d5db; }
.btw-progress-pct { font-size:10px; font-weight:600; color:#7c3aed; text-align:right; margin-top:2px; }

/* ── badges ── */
.btw-badge { font-size:11px; font-weight:700; padding:4px 12px; border-radius:100px; white-space:nowrap; flex-shrink:0; letter-spacing:.2px; }
.btw-badge-live      { background:#d1fae5; color:#065f46; }
.btw-badge-progress  { background:#fef3c7; color:#92400e; }
.btw-badge-done      { background:#ede9fe; color:#4c1d95; }
.btw-badge-closed    { background:#f3f4f6; color:#6b7280; }
.btw-badge-discovery { background:#dbeafe; color:#1e40af; }
.btw-badge-proposal  { background:#fce7f3; color:#9d174d; }
.btw-badge-default   { background:#f3f4f6; color:#6b7280; }
.btw-badge-live-inv  { background:#d1fae5; color:#065f46; }
.btw-tag { font-size:10px; font-weight:600; padding:2px 8px; border-radius:100px; display:inline-block; }
.btw-tag-amc   { background:#ede9fe; color:#6d28d9; }
.btw-tag-cloud { background:#dbeafe; color:#1d4ed8; }

/* ── detail view ── */
.btw-back-btn {
  display:inline-flex; align-items:center; gap:6px;
  font-size:13px; font-weight:600; color:#7c3aed;
  background:#ede9fe; border:none; border-radius:8px;
  padding:6px 14px; cursor:pointer; margin-bottom:20px;
  transition: background .15s;
}
.btw-back-btn:hover { background:#ddd6fe; }

.btw-detail-cards { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:24px; }
.btw-detail-card {
  background:#fff; border-radius:12px; padding:18px 16px;
  border-left:4px solid #7c3aed;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.btw-detail-card:nth-child(1) { border-color:#4f46e5; }
.btw-detail-card:nth-child(2) { border-color:#059669; }
.btw-detail-card:nth-child(3) { border-color:#ef4444; }
.btw-detail-card:nth-child(4) { border-color:#0891b2; }
.btw-detail-card:nth-child(5) { border-color:#d97706; }
.btw-detail-card-label { font-size:12px; color:#888; margin-bottom:8px; font-weight:600; letter-spacing:.3px; }
.btw-detail-card-value { font-size:26px; font-weight:800; color:#1a1a2e; line-height:1; }
.btw-detail-card-value.green { color:#059669; }
.btw-detail-card-value.red { color:#ef4444; }
.btw-detail-card-sub { font-size:12px; color:#aaa; margin-top:6px; }

/* ── tables ── */
.btw-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.btw-table-wrap {
  background:#fff; border-radius:12px; padding:20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.btw-table-title {
  font-size:11px; font-weight:700; letter-spacing:1px;
  text-transform:uppercase; color:#7c3aed; margin-bottom:14px;
}
.btw-table { width:100%; border-collapse:collapse; font-size:13px; table-layout:fixed; }
.btw-table-scroll { max-height:230px; overflow-y:auto; }
.btw-table-scroll::-webkit-scrollbar { width:4px; }
.btw-table-scroll::-webkit-scrollbar-track { background:#f1f1f1; border-radius:4px; }
.btw-table-scroll::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
.btw-table-scroll::-webkit-scrollbar-thumb:hover { background:#9ca3af; }
.btw-table th {
  text-align:left; font-size:11px; font-weight:700;
  color:#9ca3af; padding:8px 10px;
  border-bottom:2px solid #f3f4f6; letter-spacing:.3px;
}
.btw-table td { padding:11px 10px; color:#374151; border-bottom:1px solid #f9fafb; }
.btw-table tr:last-child td { border-bottom:none; }
.btw-table tbody tr:hover td { background:#fafafa; }
.btw-empty-cell { text-align:center; color:#d1d5db; padding:24px !important; font-size:13px; }

@media(max-width:960px){
  .btw-cards{grid-template-columns:1fr;} .btw-detail-cards{grid-template-columns:repeat(2,1fr);}
  .btw-two-col{grid-template-columns:1fr;}
}`;
		document.head.appendChild(s);
	}

	// ── helper functions ──────────────────────────────────────────
	function fmt(amount) {
		var n = parseFloat(amount) || 0;
		if (n === 0) return "—";
		var abs = Math.abs(n);
		var sign = n < 0 ? "-" : "";
		if (abs >= 10000000) return sign + "₹" + (abs / 10000000).toFixed(2) + " Cr";
		if (abs >= 100000) return sign + "₹" + (abs / 100000).toFixed(1) + "L";
		if (abs >= 1000) return sign + "₹" + (abs / 1000).toFixed(1).replace(/\.0$/, "") + "K";
		return sign + "₹" + Math.round(abs);
	}

	function badge(status) {
		var map = {
			"Open": ["Live", "live"],
			"In Progress": ["In progress", "progress"],
			"Completed": ["Done", "done"],
			"Cancelled": ["Closed", "closed"],
		};
		var b = map[status] || [status || "—", "default"];
		return '<span class="btw-badge btw-badge-' + b[1] + '">' + b[0] + '</span>';
	}

	function project_row(p) {
		var collected = p.collected || 0;
		var contract_value = p.contract_value || 0;
		var fin_pct = contract_value > 0 ? Math.min(100, Math.floor(collected / contract_value * 100)) : 0;
		var fin_cls = fin_pct >= 90 ? "full" : fin_pct >= 50 ? "mid" : "low";
		var comp_pct = Math.min(100, Math.floor(p.percent_complete || 0));
		var comp_cls = comp_pct >= 90 ? "full" : comp_pct >= 50 ? "mid" : "low";

		// Extra tags: AMC + Cloud
		var tags = "";
		if (p.amc_status === "Live") {
			tags += '<span class="btw-tag btw-tag-amc">AMC ' + fmt(p.amc_amount) + '</span>';
		}
		if (p.monthly_cloud > 0) {
			tags += '<span class="btw-tag btw-tag-cloud">Cloud ' + fmt(p.monthly_cloud) + '</span>';
		}

		return (
			'<div class="btw-project-row" data-name="' + p.name + '">' +
			'  <div class="btw-project-info">' +
			'    <div class="btw-project-name">' + (p.customer || p.name) + '</div>' +
			'    <div class="btw-project-sub">' + (p.project_name || "") +
			(tags ? ' &nbsp;' + tags : '') + '</div>' +
			'  </div>' +
			'  <div class="btw-project-money">' +
			'    <div class="btw-project-collected">' + fmt(collected) + ' collected</div>' +
			'    <div class="btw-project-total">of ' + fmt(contract_value) + ' total</div>' +
			'  </div>' +
			'  <div class="btw-progress-wrap">' +
			'    <div class="btw-progress-label">Financial</div>' +
			'    <div class="btw-progress-bg"><div class="btw-progress-bar ' + fin_cls + '" style="width:' + fin_pct + '%"></div></div>' +
			'    <div class="btw-progress-pct">' + fin_pct + '%</div>' +
			'    <div class="btw-progress-label" style="margin-top:4px">Completion</div>' +
			'    <div class="btw-progress-bg"><div class="btw-progress-bar ' + comp_cls + '" style="width:' + comp_pct + '%"></div></div>' +
			'    <div class="btw-progress-pct">' + comp_pct + '%</div>' +
			'  </div>' +
			badge(p.status) +
			'</div>'
		);
	}

	// ── render portfolio ──────────────────────────────────────────
	function render_portfolio() {
		var uname = (frappe.session.user_fullname || frappe.session.user || "").split(" ")[0] || "there";
		var date = frappe.datetime.str_to_user(frappe.datetime.nowdate());

		// Show skeleton while loading
		page.main.html(
			'<div class="btw">' +
			'  <div class="btw-greeting">Good morning, ' + uname + '</div>' +
			'  <div class="btw-date">' + date + ' · BTW Operations</div>' +
			'  <div style="color:#bbb;padding:40px 0;text-align:center;">Loading…</div>' +
			'</div>'
		);

		// Fetch both in parallel
		$.when(
			frappe.call({ method: "business_that_works_erp.api.get_summary_stats" }),
			frappe.call({ method: "business_that_works_erp.api.get_portfolio_overview" })
		).then(function (s_res, p_res) {
			var s = s_res[0].message || {};
			var proposals = p_res[0].message || [];

			var outstanding_sub = s.total_outstanding > 0
				? fmt(s.total_outstanding) + " still to collect"
				: "All collected";

			var total_contract = proposals.reduce(function (sum, p) { return sum + (p.contract_value || 0); }, 0);
			var total_collected = proposals.reduce(function (sum, p) { return sum + (p.collected || 0); }, 0);
			var total_outstanding = total_contract - total_collected;

			var rows = proposals.length
				? proposals.map(project_row).join("")
				: '<div style="color:#bbb;text-align:center;padding:32px">No proposals found.</div>';

			page.main.html(
				'<div class="btw">' +
				'  <div class="btw-greeting">Good morning, ' + uname + '</div>' +
				'  <div class="btw-date">' + date + ' · BTW Operations</div>' +

				'  <div class="btw-cards">' +
				'    <div class="btw-card">' +
				'      <div class="btw-card-label">Active projects</div>' +
				'      <div class="btw-card-value">' + (s.active_projects || 0) + '</div>' +
				'      <div class="btw-card-sub' + (s.total_outstanding > 0 ? " warn" : "") + '">' + outstanding_sub + '</div>' +
				'    </div>' +
				'    <div class="btw-card">' +
				'      <div class="btw-card-label">AMC Clients</div>' +
				'      <div class="btw-card-value">' + (s.amc_clients || 0) + '</div>' +
				'      <div class="btw-card-sub">Live AMC contracts</div>' +
				'    </div>' +
				'    <div class="btw-card">' +
				'      <div class="btw-card-label">Cloud Charges</div>' +
				'      <div class="btw-card-value" style="font-size:24px">' + fmt(s.total_cloud || 0) + '</div>' +
				'      <div class="btw-card-sub">Across ' + (s.cloud_projects || 0) + ' client(s)</div>' +
				'    </div>' +
				'  </div>' +

				'  <div class="btw-cards btw-cards-totals">' +
				'    <div class="btw-card btw-card-dark">' +
				'      <div class="btw-card-label">Total Contract Value</div>' +
				'      <div class="btw-card-value" style="font-size:24px">' + fmt(total_contract) + '</div>' +
				'      <div class="btw-card-sub">Across all projects</div>' +
				'    </div>' +
				'    <div class="btw-card btw-card-dark">' +
				'      <div class="btw-card-label">Total Collected</div>' +
				'      <div class="btw-card-value" style="font-size:24px;color:#6ee7b7">' + fmt(total_collected) + '</div>' +
				'      <div class="btw-card-sub">All paid invoices</div>' +
				'    </div>' +
				'    <div class="btw-card btw-card-dark">' +
				'      <div class="btw-card-label">Total Outstanding</div>' +
				'      <div class="btw-card-value" style="font-size:24px;color:' + (total_outstanding > 0 ? "#fca5a5" : "#6ee7b7") + '">' + fmt(total_outstanding) + '</div>' +
				'      <div class="btw-card-sub">Pending collection</div>' +
				'    </div>' +
				'  </div>' +

				'  <div class="btw-section-title">Projects — Money at a Glance</div>' +
				'  <div id="btw-projects">' + rows + '</div>' +
				'</div>'
			);

			page.main.find(".btw-project-row").on("click", function () {
				load_detail($(this).data("name"));
			});
		}).fail(function () {
			page.main.html('<div class="btw"><div style="color:#c0392b;padding:40px 0;text-align:center">Failed to load data. Check console for errors.</div></div>');
		});
	}

	// ── load + render detail ──────────────────────────────────────
	function load_detail(proposal_name) {
		page.main.html('<div class="btw"><div style="color:#bbb;padding:40px 0;text-align:center">Loading…</div></div>');
		frappe.call({
			method: "business_that_works_erp.api.get_project_financials",
			args: { proposal_name: proposal_name },
			callback: function (r) {
				if (r.message) {
					render_detail(proposal_name, r.message);
				} else {
					page.main.html('<div class="btw"><div style="color:#c0392b;padding:40px">No data returned.</div></div>');
				}
			},
			error: function () {
				page.main.html('<div class="btw"><div style="color:#c0392b;padding:40px">Failed to load project details.</div></div>');
			}
		});
	}

	function render_detail(proposal_name, d) {
		// Contract value = sum of pricing values + sum of amc amounts + sum of cloud totals
		var pricing_total = (d.pricing || []).reduce(function (s, p) { return s + (p.value || 0); }, 0);
		var amc_total = (d.amc_rows || []).reduce(function (s, a) { return s + (a.amc_amount || 0); }, 0);
		var cloud_total = (d.cloud_rows || []).reduce(function (s, c) { return s + (c.cloud_charges || 0); }, 0);
		var contract_value = pricing_total + amc_total + cloud_total;
		var outstanding = contract_value - (d.collected || 0);

		var inv_rows = (d.invoices || []).map(function (inv) {
			var paid_cls = inv.status === "Paid" ? "live" : "default";
			var date_str = inv.posting_date ? frappe.datetime.str_to_user(inv.posting_date) : "—";
			return (
				"<tr><td>" + inv.name + "</td><td>" + date_str + "</td><td>" + fmt(inv.grand_total) + "</td>" +
				'<td><span class="btw-badge btw-badge-' + paid_cls + '">' + inv.status + "</span></td></tr>"
			);
		}).join("") || '<tr><td colspan="4" class="btw-empty-cell">No invoices yet</td></tr>';

		var sched_rows = (d.pricing || []).map(function (p) {
			var ps_cls = p.payment_status === "Paid" ? "live" : p.payment_status === "Unpaid" ? "progress" : "default";
			var ps_badge = p.payment_status
				? '<span class="btw-badge btw-badge-' + ps_cls + '">' + p.payment_status + "</span>"
				: "—";
			return "<tr><td>" + (p.phase || "—") + "</td><td>" + (p.payment_terms || 0) + "%</td><td>" + fmt(p.value) + "</td><td>" + ps_badge + "</td></tr>";
		}).join("") || '<tr><td colspan="4" class="btw-empty-cell">No payment schedule</td></tr>';

		var cloud_rows = (d.cloud_rows || []).map(function (c) {
			var cls = c.payment_status === "Paid" ? "live" : "default";
			var ds = c.start_date ? frappe.datetime.str_to_user(c.start_date) : "—";
			var de = c.end_date ? frappe.datetime.str_to_user(c.end_date) : "—";
			return "<tr><td>" + ds + " → " + de + "</td><td>" + fmt(c.cloud_charges__month) + "/mo</td><td>" + fmt(c.cloud_charges) + "</td>" +
				'<td><span class="btw-badge btw-badge-' + cls + '">' + (c.payment_status || "—") + "</span></td></tr>";
		}).join("") || '<tr><td colspan="4" class="btw-empty-cell">No cloud charges</td></tr>';

		var amc_rows = (d.amc_rows || []).map(function (a) {
			var cls = a.amc_status === "Live" ? "live" : "closed";
			var ds = a.start_date ? frappe.datetime.str_to_user(a.start_date) : "—";
			var de = a.end_date ? frappe.datetime.str_to_user(a.end_date) : "—";
			var used = (a.amc_duration_in_hr - a.remaining_amc_in_hr).toFixed(1);
			return "<tr><td>" + ds + " → " + de + "</td><td>" + fmt(a.amc_amount) + "</td>" +
				"<td>" + used + " / " + a.amc_duration_in_hr.toFixed(1) + " hrs</td>" +
				'<td><span class="btw-badge btw-badge-' + cls + '">' + (a.amc_status || "—") + "</span></td></tr>";
		}).join("") || '<tr><td colspan="4" class="btw-empty-cell">No AMC records</td></tr>';

		page.main.html(
			'<div class="btw">' +
			'<button class="btw-back-btn" id="btw-back">← All projects</button>' +
			'<div class="btw-greeting">' + (d.customer || proposal_name) + '</div>' +
			'<div class="btw-date">' + (d.project_name || "") + '</div>' +

			'<div class="btw-detail-cards">' +
			'  <div class="btw-detail-card"><div class="btw-detail-card-label">Contract value</div><div class="btw-detail-card-value">' + fmt(contract_value) + '</div><div class="btw-detail-card-sub">One-time implementation</div></div>' +
			'  <div class="btw-detail-card"><div class="btw-detail-card-label">Collected</div><div class="btw-detail-card-value green">' + fmt(d.collected) + '</div><div class="btw-detail-card-sub">All paid invoices</div></div>' +
			'  <div class="btw-detail-card"><div class="btw-detail-card-label">Outstanding</div><div class="btw-detail-card-value ' + (outstanding > 0 ? "red" : "") + '">' + fmt(outstanding) + '</div><div class="btw-detail-card-sub">Pending collection</div></div>' +
			'  <div class="btw-detail-card"><div class="btw-detail-card-label">Cloud Charges</div><div class="btw-detail-card-value">' + fmt(cloud_total) + '</div><div class="btw-detail-card-sub">Total across all periods</div></div>' +
			'  <div class="btw-detail-card"><div class="btw-detail-card-label">AMC Charges</div><div class="btw-detail-card-value">' + fmt(amc_total) + '</div><div class="btw-detail-card-sub">' + (d.remaining_amc_hr || 0).toFixed(0) + ' hrs left</div></div>' +
			'</div>' +

			'<div class="btw-two-col">' +
			'  <div class="btw-table-wrap"><div class="btw-table-title">Invoice Tracker</div>' +
			'    <table class="btw-table"><colgroup><col style="width:35%"><col style="width:25%"><col style="width:20%"><col style="width:20%"></colgroup><thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead></table>' +
			'    <div class="btw-table-scroll"><table class="btw-table"><colgroup><col style="width:35%"><col style="width:25%"><col style="width:20%"><col style="width:20%"></colgroup><tbody>' + inv_rows + '</tbody></table></div></div>' +
			'  <div class="btw-table-wrap"><div class="btw-table-title">Payment Schedule</div>' +
			'    <table class="btw-table"><colgroup><col style="width:50%"><col style="width:10%"><col style="width:20%"><col style="width:20%"></colgroup><thead><tr><th>Milestone</th><th>%</th><th>Amount</th><th>Status</th></tr></thead></table>' +
			'    <div class="btw-table-scroll"><table class="btw-table"><colgroup><col style="width:50%"><col style="width:10%"><col style="width:20%"><col style="width:20%"></colgroup><tbody>' + sched_rows + '</tbody></table></div></div>' +
			'</div>' +

			'<div class="btw-two-col" style="margin-top:16px">' +
			'  <div class="btw-table-wrap"><div class="btw-table-title">Cloud Charges</div>' +
			'    <table class="btw-table"><colgroup><col style="width:40%"><col style="width:20%"><col style="width:20%"><col style="width:20%"></colgroup><thead><tr><th>Period</th><th>Monthly</th><th>Total</th><th>Status</th></tr></thead></table>' +
			'    <div class="btw-table-scroll"><table class="btw-table"><colgroup><col style="width:40%"><col style="width:20%"><col style="width:20%"><col style="width:20%"></colgroup><tbody>' + cloud_rows + '</tbody></table></div></div>' +
			'  <div class="btw-table-wrap"><div class="btw-table-title">AMC Tracker</div>' +
			'    <table class="btw-table"><colgroup><col style="width:35%"><col style="width:20%"><col style="width:25%"><col style="width:20%"></colgroup><thead><tr><th>Period</th><th>Amount</th><th>Hours used</th><th>Status</th></tr></thead></table>' +
			'    <div class="btw-table-scroll"><table class="btw-table"><colgroup><col style="width:35%"><col style="width:20%"><col style="width:25%"><col style="width:20%"></colgroup><tbody>' + amc_rows + '</tbody></table></div></div>' +
			'</div>' +
			'</div>'
		);

		page.main.find("#btw-back").on("click", render_portfolio);
	}

	// ── kick off ──────────────────────────────────────────────────
	render_portfolio();
};
