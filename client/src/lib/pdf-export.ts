import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportEmployeesPDF(employees: any[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Smart HR Management System", 14, 18);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Employee Directory Report", 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}`, 14, 33);

  doc.setTextColor(0);

  autoTable(doc, {
    startY: 40,
    head: [["#", "Name", "Email", "Department", "Role", "Skills", "Date of Birth"]],
    body: employees.map((emp, i) => [
      i + 1,
      emp.name,
      emp.email,
      emp.departmentName || "N/A",
      emp.roleTitle || "N/A",
      emp.skills?.join(", ") || "None",
      emp.dob || "N/A",
    ]),
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    styles: { cellPadding: 4, lineColor: [220, 220, 220], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }

  doc.save("employees-report.pdf");
}

export function exportAnalyticsPDF(analytics: any[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Smart HR Management System", 14, 18);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Analytics & Performance Report", 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}`, 14, 33);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 40,
    head: [["Department", "Avg. Performance Score", "Total Present Count"]],
    body: analytics.map((row) => [
      row.departmentName,
      `${parseFloat(row.averagePerformanceScore || "0").toFixed(2)} / 10`,
      row.totalPresentCount,
    ]),
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 11,
    },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 252, 248] },
    styles: { cellPadding: 5, lineColor: [220, 220, 220], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
  });

  doc.save("analytics-report.pdf");
}
