import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const generatePDFFromData = (quotationData, selectedReferences, specialDiscount, hiddenColumns = {}) => {
  const doc = new jsPDF("p", "mm", "a4")

  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  let currentY = 15

  const wrapText = (text, maxWidth) => {
    return doc.splitTextToSize(text || "", maxWidth)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value || 0)
      .replace("₹", "")
      .trim()
  }

  const checkSpace = (requiredHeight) => {
    if (currentY + requiredHeight > pageHeight - margin - 20) {
      doc.addPage()
      currentY = margin + 10
      return true
    }
    return false
  }

  const addPageHeader = () => {
    currentY = margin

    // Header background with light blue color
    doc.setFillColor(240, 248, 255) // Light blue background
    doc.rect(margin, currentY, pageWidth - 2 * margin, 40, "F")
    
    // Header border
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(margin, currentY, pageWidth - 2 * margin, 40)

    // Company name section (LEFT SIDE) - Better styling and positioning
    doc.setTextColor(0, 50, 100) // Dark blue color for company name
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("SAGAR TMT", margin + 8, currentY + 15)
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.text("Private Limited", margin + 8, currentY + 25)
    
    // Add a subtle line under company name
    doc.setDrawColor(0, 50, 100)
    doc.setLineWidth(0.3)
    doc.line(margin + 8, currentY + 27, margin + 65, currentY + 27)

    // Quotation section (RIGHT SIDE) - Better positioning and styling
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(0, 50, 100) // Dark blue for quotation title
    doc.text("QUOTATION", pageWidth - margin - 8, currentY + 15, { align: "right" })
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`No: ${quotationData.quotationNo || "NBD-25-26-002"}`, pageWidth - margin - 8, currentY + 25, { align: "right" })
    
    const dateStr = quotationData.date ? new Date(quotationData.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')
    doc.text(`Date: ${dateStr}`, pageWidth - margin - 8, currentY + 33, { align: "right" })

    currentY += 50
  }

  // Add main document border (4 sides)
  const addMainBorder = () => {
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1)
    doc.rect(margin - 5, margin - 5, pageWidth - 2 * margin + 10, pageHeight - 2 * margin + 10)
  }

  // Only add header on first page
  addPageHeader()

  // FROM and TO sections side by side - In one combined box
  const sectionWidth = (pageWidth - 3 * margin) / 2
  const sectionHeight = 55
  
  // Combined box for both FROM and TO sections
  doc.setFillColor(250, 250, 250) // Very light gray background
  doc.rect(margin, currentY, pageWidth - 2 * margin, sectionHeight, "F")
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(margin, currentY, pageWidth - 2 * margin, sectionHeight)

  // Add vertical separator line between FROM and TO
  const separatorX = margin + sectionWidth + 7.5
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(separatorX, currentY, separatorX, currentY + sectionHeight)

  const toSectionX = margin + sectionWidth + 15

  const consignorDetails = [
    String(selectedReferences && selectedReferences[0] ? selectedReferences[0] : "NEERAJ SIR"),
    `Plot no 27, PATRAPADA Bhagabanpur Industrial Estate`,
    `PATRAPADA, PS - TAMANDO, Bhubaneswar, Odisha 751019`,
    `State: ${String(quotationData.consignorState || "Odisha")}`,
    `Mobile: ${String(quotationData.consignorMobile && typeof quotationData.consignorMobile === 'string' ? quotationData.consignorMobile.split(",")[0] : quotationData.consignorMobile || "7024425225")}`,
    `Phone: ${String(quotationData.consignorPhone || "N/A")}`,
    `GSTIN: ${String(quotationData.consignorGSTIN || "21AAGCD9326H1ZS")}`,
    `State Code: ${String(quotationData.consignorStateCode || "21")}`,
  ]

  const consigneeDetails = [
    String(quotationData.consigneeName || "A S CONSTRUCTION , Raipur"),
    `31/554, GALI NO.6, NEW SHANTI NAGAR,`,
    `RAIPUR, Raipur, Chhattisgarh, 492004`,
    `State: ${String(quotationData.consigneeState || "Chhattisgarh")}`,
    `Contact: ${String(quotationData.consigneeContactName || "N/A")}`,
    `Mobile: ${String(quotationData.consigneeContactNo || "N/A")}`,
    `GSTIN: ${String(quotationData.consigneeGSTIN || "22AAGFA4837R2ZT")}`,
    `State Code: ${String(quotationData.consigneeStateCode || "22")}`,
    `MSME: ${String(quotationData.consigneeMSME || "UDYAM-CG-14-0001307")}`,
  ]

  // FROM section header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(0, 50, 100) // Dark blue for headers
  doc.text("FROM:", margin + 5, currentY + 10)

  // FROM section content
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  let fromY = currentY + 17
  consignorDetails.forEach((line) => {
    if (fromY < currentY + sectionHeight - 3) {
      const wrappedLines = wrapText(line, sectionWidth - 15)
      wrappedLines.forEach((wrappedLine) => {
        if (fromY < currentY + sectionHeight - 3) {
          doc.text(wrappedLine, margin + 5, fromY)
          fromY += 4
        }
      })
    }
  })

  // TO section header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(0, 50, 100) // Dark blue for headers
  doc.text("TO:", toSectionX + 5, currentY + 10)

  // TO section content
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  let toY = currentY + 17
  consigneeDetails.forEach((line) => {
    if (toY < currentY + sectionHeight - 3) {
      const wrappedLines = wrapText(line, sectionWidth - 10)
      wrappedLines.forEach((wrappedLine) => {
        if (toY < currentY + sectionHeight - 3) {
          doc.text(wrappedLine, toSectionX + 5, toY)
          toY += 4
        }
      })
    }
  })

  currentY += sectionHeight + 15

  // Items section header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(0, 50, 100) // Dark blue for section headers
  doc.text("Items:", margin, currentY)

  currentY += 8

  // FIXED: Add Product Name column to table headers
  const tableHeaders = ["S.No", "Code", "Product Name", "Description", "GST%", "Qty", "Units", "Rate"]
  if (!hiddenColumns.hideDisc) tableHeaders.push("Disc%")
  if (!hiddenColumns.hideFlatDisc) tableHeaders.push("Flat Disc")
  tableHeaders.push("Amount")

  // FIXED: Add Product Name data to items
  const itemsData = quotationData.items ? quotationData.items.map((item, index) => {
    const row = [
      String(index + 1),                                    // S.No
      String(item.code || "AFG10017"),                     // Code
      String(item.name || "FISCHER-ANCHOR-FWA 16X180"),    // Product Name
      String(item.description || ""),                       // Description (separate from name)
      String(`${item.gst || 18}%`),                        // GST%
      String(item.qty || 1),                               // Qty
      String(item.units || "Nos"),                         // Units
      String(formatCurrency(item.rate || 1712121.00)),     // Rate
    ]
    if (!hiddenColumns.hideDisc) row.push(String(`${item.discount || 0}%`))           // Disc%
    if (!hiddenColumns.hideFlatDisc) row.push(String(formatCurrency(item.flatDiscount || 0))) // Flat Disc
    row.push(String(formatCurrency(item.amount || 1712121.00)))                       // Amount
    return row
  }) : [
    (() => {
      const defaultRow = [
        "1", 
        "AFG10017", 
        "FISCHER-ANCHOR-FWA 16X180",  // Product Name
        "",                           // Description (empty)
        "18%", 
        "1", 
        "Nos", 
        String(formatCurrency(1712121.00))
      ]
      if (!hiddenColumns.hideDisc) defaultRow.push("0%")
      if (!hiddenColumns.hideFlatDisc) defaultRow.push(String(formatCurrency(0)))
      defaultRow.push(String(formatCurrency(1712121.00)))
      return defaultRow
    })()
  ]

  // FIXED: Column styles with Product Name column - Reduced widths to fit page
  const getColumnStyles = () => {
    const availableWidth = pageWidth - 2 * margin - 2 // ~178mm available
    
    const styles = {
      0: { cellWidth: 7, halign: 'center' },   // S.No
      1: { cellWidth: 12, halign: 'center' },  // Code  
      2: { cellWidth: 28, halign: 'left' },    // Product Name (reduced)
      3: { cellWidth: 25, halign: 'left' },    // Description (reduced)
      4: { cellWidth: 9, halign: 'center' },  // GST%
      5: { cellWidth: 7, halign: 'center' },   // Qty
      6: { cellWidth: 9, halign: 'center' },  // Units
      7: { cellWidth: 15, halign: 'right' },   // Rate (reduced)
    }
    
    let columnIndex = 8
    let usedWidth = 7 + 12 + 28 + 25 + 9 + 7 + 9 + 15 // 112mm used
    
    if (!hiddenColumns.hideDisc) {
      styles[columnIndex] = { cellWidth: 9, halign: 'center' } // Disc% (reduced)
      usedWidth += 9
      columnIndex++
    }
    if (!hiddenColumns.hideFlatDisc) {
      styles[columnIndex] = { cellWidth: 12, halign: 'right' } // Flat Disc (reduced)
      usedWidth += 12
      columnIndex++
    }
    
    // Amount column gets remaining width
    const remainingWidth = availableWidth - usedWidth
    styles[columnIndex] = { 
      cellWidth: Math.max(15, Math.min(remainingWidth - 1, 20)), 
      halign: 'right', 
      fontStyle: 'bold' 
    }
    
    return styles
  }

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: itemsData,
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - 2 * margin,
    styles: {
      fontSize: 6.5, // Even smaller font for all columns to fit
      cellPadding: 1,
      overflow: 'linebreak',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
      font: 'helvetica',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [230, 240, 255],
      textColor: [0, 50, 100],
      fontSize: 6.5,
      fontStyle: 'bold',
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: getColumnStyles(),
    theme: 'grid',
    tableLineWidth: 0.2,
    tableLineColor: [0, 0, 0],
    willDrawCell: function(data) {
      if (data.cell.x + data.cell.width > pageWidth - margin) {
        data.cell.width = pageWidth - margin - data.cell.x - 1;
      }
    },
    didDrawPage: (data) => {
      currentY = data.cursor.y;
    },
  });

  currentY = doc.lastAutoTable.finalY + 10

  // FIXED: Financial summary with correct tax calculation
  // FIXED: Financial summary with proper page break handling
const summaryWidth = 60
const summaryX = pageWidth - margin - summaryWidth

// Use actual data from quotationData for correct tax calculation
const subtotal = quotationData.subtotal || 0
const totalFlatDiscount = quotationData.totalFlatDiscount || 0
const taxableAmount = Math.max(0, subtotal - totalFlatDiscount)

// Check if IGST or CGST+SGST should be used
const isIGST = quotationData.isIGST
const igstRate = quotationData.igstRate || 18
const cgstRate = quotationData.cgstRate || 9
const sgstRate = quotationData.sgstRate || 9

let taxAmount = 0
let finalTotal = 0

// Build summary items based on tax type
const summaryItems = [
  { label: "Subtotal:", value: String(formatCurrency(subtotal)) }
]

// Add Total Flat Discount if exists and not hidden
if (!hiddenColumns.hideTotalFlatDisc && totalFlatDiscount > 0) {
  summaryItems.push({ 
    label: "Total Flat Discount:", 
    value: `-${String(formatCurrency(totalFlatDiscount))}` 
  })
}

// Add Taxable Amount
summaryItems.push({ 
  label: "Taxable Amount:", 
  value: String(formatCurrency(taxableAmount)) 
})

// Add correct tax based on IGST or CGST+SGST
if (isIGST) {
  // Use IGST
  const igstAmount = quotationData.igstAmount || (taxableAmount * (igstRate / 100))
  taxAmount = igstAmount
  summaryItems.push({ 
    label: `IGST (${igstRate}%):`, 
    value: String(formatCurrency(igstAmount)) 
  })
} else {
  // Use CGST + SGST
  const cgstAmount = quotationData.cgstAmount || (taxableAmount * (cgstRate / 100))
  const sgstAmount = quotationData.sgstAmount || (taxableAmount * (sgstRate / 100))
  taxAmount = cgstAmount + sgstAmount
  
  summaryItems.push({ 
    label: `CGST (${cgstRate}%):`, 
    value: String(formatCurrency(cgstAmount)) 
  })
  summaryItems.push({ 
    label: `SGST (${sgstRate}%):`, 
    value: String(formatCurrency(sgstAmount)) 
  })
}

// Add special discount if not hidden and exists
if (!hiddenColumns.hideSpecialDiscount && specialDiscount > 0) {
  summaryItems.push({ 
    label: "Special Discount:", 
    value: `-${String(formatCurrency(specialDiscount))}` 
  })
}

// Calculate final total - ALWAYS calculate instead of using quotationData.total
finalTotal = taxableAmount + taxAmount - (specialDiscount || 0)

// Add final total
summaryItems.push({ 
  label: "Grand Total:", 
  value: String(formatCurrency(finalTotal)) 
})

// FIXED: Calculate required height and check for page break
const summaryHeight = summaryItems.length * 8 + 8

// Check if summary section will fit on current page, if not add new page
if (checkSpace(summaryHeight + 10)) {
  // Page was added, adjust summaryX and summaryY for new page
  const summaryY = currentY
} else {
  const summaryY = currentY
}

// Now draw the summary at the correct position
const summaryY = currentY

// Draw summary box
doc.setDrawColor(0, 0, 0)
doc.setLineWidth(0.5)
doc.rect(summaryX, summaryY, summaryWidth, summaryHeight)

let summaryCurrentY = summaryY + 8

summaryItems.forEach((item, index) => {
  if (index === summaryItems.length - 1) { // Total row
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setFillColor(230, 240, 255) // Light blue background for total
    doc.rect(summaryX, summaryCurrentY - 3, summaryWidth, 7, "F")
  } else {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
  }

  doc.setTextColor(0, 0, 0)
  doc.text(item.label, summaryX + 3, summaryCurrentY)
  doc.text(item.value, summaryX + summaryWidth - 3, summaryCurrentY, { align: "right" })
  summaryCurrentY += 7
})

currentY = summaryCurrentY + 15

  // Check if we need a new page for terms and bank details
  checkSpace(80)

  // Terms & Conditions and Bank Details - FIXED LAYOUT
  const termsBoxHeight = 60 // Reduced height
  
  // Combined box for both Terms & Conditions and Bank Details sections
  doc.setFillColor(250, 250, 250) // Very light gray background
  doc.rect(margin, currentY, pageWidth - 2 * margin, termsBoxHeight, "F")
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(margin, currentY, pageWidth - 2 * margin, termsBoxHeight)

  // Add vertical separator line between Terms and Bank Details
  const termsSeparatorX = margin + sectionWidth + 7.5
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(termsSeparatorX, currentY, termsSeparatorX, currentY + termsBoxHeight)

  const leftColumnX = margin
  const rightColumnX = margin + sectionWidth + 15
  const columnWidth = sectionWidth - 10

  // Terms & Conditions header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(0, 50, 100) // Dark blue for section headers
  doc.text("Terms & Conditions:", leftColumnX + 5, currentY + 10)

  const terms = [
    { label: "Validity", value: quotationData.validity || "The above quoted prices are valid up to 5 days from date of offer." },
    { label: "Payment Terms", value: quotationData.paymentTerms || "100% advance payment in the mode of NEFT, RTGS & DD" },
    { label: "Delivery", value: quotationData.delivery || "Material is ready in our stock" },
    { label: "Freight", value: quotationData.freight || "Extra as per actual." },
    { label: "Insurance", value: quotationData.insurance || "Transit insurance for all shipment is at Buyer's risk." },
    { label: "Taxes", value: quotationData.taxes || "Extra as per actual." },
  ]

  let termsY = currentY + 15
  doc.setFontSize(7) // Smaller font for better fit

  terms.forEach((term) => {
    if (termsY < currentY + termsBoxHeight - 5) {
      // Label in bold
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text(`${term.label}:`, leftColumnX + 5, termsY)
      
      // Value in normal font with proper spacing
      doc.setFont("helvetica", "normal")
      const labelWidth = 25 // Reduced width for better fit
      const wrappedLines = wrapText(term.value, columnWidth - labelWidth - 5)
      
      wrappedLines.forEach((line, index) => {
        if (termsY + (index * 2.5) < currentY + termsBoxHeight - 3) {
          doc.text(line, leftColumnX + 5 + labelWidth, termsY + (index * 2.5))
        }
      })
      
      termsY += Math.max(4, wrappedLines.length * 2.5) + 1
    }
  })

  // Bank Details header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(0, 50, 100) // Dark blue for section headers
  doc.text("Bank Details:", rightColumnX + 5, currentY + 10)

  const bankDetails = [
    { label: "Account No", value: String(quotationData.accountNo || "438605000447") },
    { label: "Bank Name", value: String(quotationData.bankName || "ICICI BANK") },
    { label: "Bank Address", value: String(quotationData.bankAddress || "FAFADHI, RAIPUR") },
    { label: "IFSC Code", value: String(quotationData.ifscCode || "ICIC0004386") },
    { label: "Email", value: String(quotationData.email || "Support@thedivineempire.com") },
    { label: "Website", value: String(quotationData.website || "www.thedivineempire.com") },
    { label: "PAN", value: String(quotationData.pan || "AAGCD9326H") },
  ]

  let bankY = currentY + 15
  doc.setFontSize(7) // Smaller font for better fit

  bankDetails.forEach((detail) => {
    if (bankY < currentY + termsBoxHeight - 5) {
      // Label in bold
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text(`${detail.label}:`, rightColumnX + 5, bankY)
      
      // Value in normal font with proper spacing
      doc.setFont("helvetica", "normal")
      const labelWidth = 25 // Reduced width for better fit
      const wrappedLines = wrapText(String(detail.value || ""), columnWidth - labelWidth - 5)
      
      wrappedLines.forEach((line, index) => {
        if (bankY + (index * 2.5) < currentY + termsBoxHeight - 3) {
          doc.text(line, rightColumnX + 5 + labelWidth, bankY + (index * 2.5))
        }
      })
      
      bankY += Math.max(4, wrappedLines.length * 2.5) + 1
    }
  })

  currentY += termsBoxHeight + 15

  // Signature section
  const signatureY = currentY
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Prepared By: ${quotationData.preparedBy || "GEETA BHIWAGADE"}`, margin, signatureY)

  // Draw line for signature
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(pageWidth - margin - 80, signatureY + 10, pageWidth - margin - 10, signatureY + 10)
  
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("Authorized Signature", pageWidth - margin - 45, signatureY + 20, { align: "center" })

  // Special offers section (if exists and not hidden)
  if (quotationData.specialOffers && quotationData.specialOffers.filter((offer) => offer.trim()).length > 0) {
    currentY += 25
    checkSpace(25)
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(0, 50, 100)
    doc.text("SAGAR TMT'S 10TH ANNIVERSARY SPECIAL OFFER", margin, currentY)
    currentY += 6

    quotationData.specialOffers
      .filter((offer) => offer.trim())
      .forEach((offer) => {
        doc.setTextColor(200, 50, 50)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        const text = `★ ${offer}`
        const wrappedLines = wrapText(text, pageWidth - 2 * margin)
        wrappedLines.forEach((line) => {
          doc.text(line, margin, currentY)
          currentY += 4
        })
      })
  }

  // Additional notes section (if exists)
  if (quotationData.notes && quotationData.notes.length > 0) {
    currentY += 10
    checkSpace(20)
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(0, 50, 100)
    doc.text("ADDITIONAL NOTES", margin, currentY)
    currentY += 6

    quotationData.notes
      .filter((note) => note.trim())
      .forEach((note) => {
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        const text = `• ${note}`
        const wrappedLines = wrapText(text, pageWidth - 2 * margin)
        wrappedLines.forEach((line) => {
          doc.text(line, margin, currentY)
          currentY += 4
        })
      })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Add main document border on each page
    addMainBorder()

    doc.setFontSize(6)
    doc.setTextColor(120, 120, 120)
    doc.setFont("helvetica", "normal")

    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" })

    doc.text("Generated by SAGAR TMT Professional Quotation System", margin, pageHeight - 10)
    doc.text("This is a computer-generated document", margin, pageHeight - 6)

    const now = new Date()
    doc.text(`Generated on: ${now.toLocaleDateString('en-GB')}, ${now.toLocaleTimeString()}`, pageWidth - margin, pageHeight - 10, { align: "right" })
  }

  return doc.output("datauristring").split(",")[1]
}