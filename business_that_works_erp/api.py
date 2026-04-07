import frappe
from frappe import _


@frappe.whitelist()
def get_summary_stats():
	"""Top-level summary cards for the portfolio view."""
	proposals = frappe.get_all(
		"Proposal",
		fields=["name", "project_name", "customer", "total_value"],
	)

	active_count = 0
	amc_count = 0
	cloud_count = 0
	total_outstanding = 0.0
	total_monthly_cloud = 0.0

	for p in proposals:
		if p.project_name:
			status = frappe.db.get_value("Project", p.project_name, "status")
			if status not in ("Completed", "Cancelled"):
				active_count += 1

			rows = frappe.db.sql(
				"""SELECT COALESCE(SUM(outstanding_amount), 0)
				   FROM `tabSales Invoice`
				   WHERE project=%s AND docstatus=1""",
				p.project_name,
			)
			if rows:
				total_outstanding += float(rows[0][0] or 0)

		# AMC: count proposals with at least one Live AMC row
		amc_rows = frappe.get_all(
			"AMC Charges",
			filters={"parent": p.name, "amc_status": "Live"},
			fields=["name"],
			limit=1,
		)
		if amc_rows:
			amc_count += 1

		# Cloud: count proposals with cloud rows and sum monthly
		cloud_rows = frappe.get_all(
			"Cloud Charges",
			filters={"parent": p.name},
			fields=["cloud_charges__month"],
		)
		if cloud_rows:
			cloud_count += 1
			for c in cloud_rows:
				total_monthly_cloud += float(c.cloud_charges__month or 0)

	return {
		"active_projects": active_count,
		"total_projects": len(proposals),
		"amc_clients": amc_count,
		"cloud_projects": cloud_count,
		"total_monthly_cloud": total_monthly_cloud,
		"total_outstanding": total_outstanding,
	}


@frappe.whitelist()
def get_portfolio_overview():
	"""Return each Proposal with collected/outstanding + AMC/cloud summary."""
	proposals = frappe.get_all(
		"Proposal",
		fields=["name", "project_name", "customer", "total_value"],
		order_by="creation desc",
	)

	result = []
	for p in proposals:
		project_status = None
		if p.project_name:
			project_status = frappe.db.get_value("Project", p.project_name, "status")

		collected = 0.0
		outstanding = 0.0

		if p.project_name:
			invoices = frappe.get_all(
				"Sales Invoice",
				filters={"project": p.project_name, "docstatus": 1},
				fields=["grand_total", "outstanding_amount"],
			)
			for inv in invoices:
				collected += float(inv.grand_total or 0) - float(inv.outstanding_amount or 0)
				outstanding += float(inv.outstanding_amount or 0)

		# Fallback: try by customer
		if collected == 0 and outstanding == 0 and p.customer:
			invoices = frappe.get_all(
				"Sales Invoice",
				filters={"customer": p.customer, "docstatus": 1},
				fields=["grand_total", "outstanding_amount"],
			)
			for inv in invoices:
				collected += float(inv.grand_total or 0) - float(inv.outstanding_amount or 0)
				outstanding += float(inv.outstanding_amount or 0)

		# AMC: latest Live row
		amc_rows = frappe.get_all(
			"AMC Charges",
			filters={"parent": p.name},
			fields=["amc_status", "amc_amount", "amc_duration_in_hr", "remaining_amc_in_hr", "start_date"],
			order_by="start_date desc",
			limit=1,
		)
		amc = amc_rows[0] if amc_rows else {}

		# Cloud: sum monthly charges
		cloud_rows = frappe.get_all(
			"Cloud Charges",
			filters={"parent": p.name},
			fields=["cloud_charges__month", "payment_status"],
		)
		monthly_cloud = sum(float(c.cloud_charges__month or 0) for c in cloud_rows)

		result.append({
			"name": p.name,
			"project_name": p.project_name or "",
			"customer": p.customer or p.project_name or p.name,
			"total_value": float(p.total_value or 0),
			"collected": collected,
			"outstanding": outstanding,
			"monthly_cloud": monthly_cloud,
			"amc_status": amc.get("amc_status", ""),
			"amc_amount": float(amc.get("amc_amount") or 0),
			"amc_duration_hr": float(amc.get("amc_duration_in_hr") or 0),
			"remaining_amc_hr": float(amc.get("remaining_amc_in_hr") or 0),
			"status": project_status or "Unknown",
		})

	return result


@frappe.whitelist()
def get_project_financials(proposal_name):
	"""Detailed financials for a single proposal."""
	proposal = frappe.get_doc("Proposal", proposal_name)

	invoices = []
	if proposal.project_name:
		invoices = frappe.get_all(
			"Sales Invoice",
			filters={"project": proposal.project_name, "docstatus": ["!=", 2]},
			fields=["name", "posting_date", "grand_total", "outstanding_amount", "status"],
			order_by="posting_date asc",
		)

	pricing = frappe.get_all(
		"Pricing",
		filters={"parent": proposal_name},
		fields=["phase", "payment_terms", "value", "payment_status"],
		order_by="idx asc",
	)

	# Cloud Charges child rows
	cloud_rows = frappe.get_all(
		"Cloud Charges",
		filters={"parent": proposal_name},
		fields=["cloud_charges", "cloud_charges__month", "start_date", "end_date", "payment_status"],
		order_by="start_date asc",
	)

	# AMC Charges child rows
	amc_rows = frappe.get_all(
		"AMC Charges",
		filters={"parent": proposal_name},
		fields=["start_date", "end_date", "amc_status", "amc_amount", "amc_duration_in_hr", "remaining_amc_in_hr"],
		order_by="start_date asc",
	)

	paid_invoices = [i for i in invoices if i.status not in ("Cancelled",)]
	collected = sum(float(i.grand_total or 0) - float(i.outstanding_amount or 0) for i in paid_invoices)
	outstanding = sum(float(i.outstanding_amount or 0) for i in paid_invoices)
	monthly_cloud = sum(float(c.cloud_charges__month or 0) for c in cloud_rows)

	# Latest active AMC
	live_amc = next((a for a in reversed(amc_rows) if a.amc_status == "Live"), None) or (amc_rows[-1] if amc_rows else {})

	return {
		"project_name": proposal.project_name or "",
		"customer": proposal.customer or proposal.project_name or proposal_name,
		"total_value": float(proposal.total_value or 0),
		"collected": collected,
		"outstanding": outstanding,
		"monthly_cloud": monthly_cloud,
		"amc_duration_hr": float(live_amc.get("amc_duration_in_hr") or 0),
		"remaining_amc_hr": float(live_amc.get("remaining_amc_in_hr") or 0),
		"amc_amount": float(live_amc.get("amc_amount") or 0),
		"amc_status": live_amc.get("amc_status", ""),
		"invoices": [
			{
				"name": i.name,
				"posting_date": str(i.posting_date) if i.posting_date else "",
				"grand_total": float(i.grand_total or 0),
				"outstanding_amount": float(i.outstanding_amount or 0),
				"status": i.status,
			}
			for i in invoices
		],
		"pricing": [
			{
				"phase": p.phase or "",
				"payment_terms": float(p.payment_terms or 0),
				"value": float(p.value or 0),
				"payment_status": p.payment_status or "",
			}
			for p in pricing
		],
		"cloud_rows": [
			{
				"cloud_charges": float(c.cloud_charges or 0),
				"cloud_charges__month": float(c.cloud_charges__month or 0),
				"start_date": str(c.start_date) if c.start_date else "",
				"end_date": str(c.end_date) if c.end_date else "",
				"payment_status": c.payment_status or "",
			}
			for c in cloud_rows
		],
		"amc_rows": [
			{
				"start_date": str(a.start_date) if a.start_date else "",
				"end_date": str(a.end_date) if a.end_date else "",
				"amc_status": a.amc_status or "",
				"amc_amount": float(a.amc_amount or 0),
				"amc_duration_in_hr": float(a.amc_duration_in_hr or 0),
				"remaining_amc_in_hr": float(a.remaining_amc_in_hr or 0),
			}
			for a in amc_rows
		],
	}
