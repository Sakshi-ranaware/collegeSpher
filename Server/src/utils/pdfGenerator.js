const PDFDocument = require('pdfkit');

module.exports = (application, stream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Pipe to the writable stream
  doc.pipe(stream);

  // --- Design Tokens ---
  const colors = {
    primary: '#1a237e', // Navy Blue
    secondary: '#c00000', // Crimson Red
    text: '#212121',
    lightText: '#757575',
    accent: '#f5f5f5',
    border: '#bdbdbd'
  };

  // --- Background / Border ---
  // Fancy Outer Border
  doc.rect(20, 20, 555, 800).lineWidth(2).stroke(colors.primary);
  doc.rect(25, 25, 545, 790).lineWidth(0.5).stroke(colors.border);

  // --- Header Section ---
  // Institution Branding
  doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.text)
    .text("Nutan Maharashtra Vidya Prasarak Mandal's (E.S.T.D. 1906)", 30, 45, { align: 'center' });

  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.secondary)
    .text('NUTAN MAHARASHTRA INSTITUTE OF ENGINEERING & TECHNOLOGY', 30, 60, { align: 'center' });

  doc.fillColor(colors.text).fontSize(9).font('Helvetica')
    .text('"Samarth Vidya Sankul", Vishnupuri, Talegaon Dabhade, Tal. Maval, Dist. Pune 410 507.', 30, 80, { align: 'center' });

  doc.fontSize(8)
    .text('(Approved by AICTE, New Delhi, Govt. of Maharashtra & Affiliated to Savitribai Phule Pune University)', 30, 93, { align: 'center' });

  // Header Line
  doc.moveTo(25, 110).lineTo(570, 110).lineWidth(1.5).stroke(colors.primary);

  // Ref No & Date Row
  doc.font('Helvetica').fontSize(10).fillColor(colors.text);
  doc.text(`Ref. No: NMIET / LC / ${new Date().getFullYear()} / ${application._id.toString().slice(-4).toUpperCase()}`, 40, 120);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 450, 120, { align: 'right' });

  // Title with decorative element
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.primary)
    .text('Original', { align: 'center', underline: true });


  doc.moveDown(1.5);

  // --- Form Content Section ---
  let currentY = 180;
  const leftColX = 45;
  const dividerX = 220;
  const rightColX = 235;
  const rowHeight = 28;
  const maxWidth = 310;

  const drawRow = (label, value, isBoldValue = true) => {
    const textValue = (value || 'N/A').toString().toUpperCase();
    const textHeight = doc.heightOfString(textValue, { width: maxWidth });
    const actualRowHeight = Math.max(rowHeight, textHeight + 12);

    // Background zebra striping (subtle)
    if (Math.floor(currentY / rowHeight) % 2 === 0) {
      doc.rect(40, currentY - 5, 515, actualRowHeight).fill(colors.accent);
    }

    doc.font('Helvetica').fontSize(10).fillColor(colors.text)
      .text(label, leftColX, currentY, { width: 170 });

    doc.text(':', dividerX, currentY);

    doc.font(isBoldValue ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
      .text(textValue, rightColX, currentY, { width: maxWidth, lineBreak: true });

    // Draw horizontal line
    doc.moveTo(40, currentY + actualRowHeight - 10)
       .lineTo(555, currentY + actualRowHeight - 10)
       .lineWidth(0.2)
       .stroke(colors.border);

    currentY += actualRowHeight;
  };

  // 1. Student Name
  const fullName = `${application.lastName} ${application.firstName} ${application.middleName || ''}`;
  drawRow('1. Full Name of Student', fullName);

  // 2. Mother's Name
  drawRow("2. Mother's Name", application.motherName);

  // 3. Nationality
  drawRow('3. Nationality', application.nationality);

  // 4. Religion & Caste
  const religionCaste = `${application.religion || ''}${application.caste ? ' - ' + application.caste : ''}`;
  drawRow('4. Religion and Caste', religionCaste);

  // 5. Birth Place
  drawRow('5. Place of Birth', application.birthPlace);

  // 6. Date of Birth
  const dob = application.dob ? new Date(application.dob) : null;
  if (dob) {
    const dobStr = dob.toLocaleDateString('en-GB');

    // Convert date to words
    const dayToWords = (d) => {
      const days = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth", "Twentieth", "Twenty First", "Twenty Second", "Twenty Third", "Twenty Fourth", "Twenty Fifth", "Twenty Sixth", "Twenty Seventh", "Twenty Eighth", "Twenty Ninth", "Thirtieth", "Thirty First"];
      return days[d - 1] || "";
    };
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const numToWords = (n) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? numToWords(n % 100) : '');
      return numToWords(Math.floor(n / 1000)) + ' Thousand ' + (n % 1000 !== 0 ? numToWords(n % 1000) : '');
    };

    const dobWords = `${dayToWords(dob.getDate())} ${months[dob.getMonth()]} ${numToWords(dob.getFullYear())}`;
    drawRow('6. Date of Birth', `${dobStr} \n(${dobWords.toUpperCase()})`);
  } else {
    drawRow('6. Date of Birth', 'N/A');
  }

  // 7. Last Institute
  drawRow('7. Last School / College Attended', application.lastSchool || 'N/A');

  // 8. PRN & Branch
  drawRow('8. PRN Number', application.prn);
  drawRow('9. Branch / Course', application.branch);

  // 10. Admission Details
  drawRow('10. Admission Year', application.admissionYear);

  // 11. Academic Performance
  drawRow('11. Result of Last Exam', `${application.result || 'PASS'} (${application.lastExamYear || 'N/A'})`);

  // 12. Conduct
  drawRow('12. Conduct and Progress', application.hodApproval?.conduct || 'GOOD');

  // 13. Reason for Leaving
  drawRow('13. Reason for Leaving', application.reason || 'COURSE COMPLETED');

  // 14. Principal\'s Remarks
  const pRemark = application.principalApproval?.remark || application.finalRemark || 'PASSED AND PROMOTED';
  drawRow('14. Final Remarks', pRemark);

  // --- Verification Statement ---
  doc.moveDown(2);
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(colors.lightText)
    .text('Certified that the above information is as per the records available with the Institute.', { align: 'center' });

  // --- Signatures Footer ---
  const footerY = 720;

  // Place & Date
  doc.font('Helvetica').fontSize(10).fillColor(colors.text);
  doc.text('Place: Talegaon Dabhade', 45, footerY);
  doc.text(`Date of Issue: ${new Date().toLocaleDateString('en-GB')}`, 45, footerY + 15);

  // Signature Blocks
  const sigLineY = footerY + 45;
  doc.font('Helvetica-Bold').fontSize(10);

  doc.text('PREPARED BY', 60, sigLineY, { align: 'left' });
  doc.text('CHECKED BY', 250, sigLineY, { align: 'left' });
  doc.text('PRINCIPAL', 450, sigLineY, { align: 'left' });

  // Seal Placeholder
  doc.circle(480, sigLineY - 30, 25).lineWidth(0.5).dash(2, { space: 2 }).stroke(colors.border);
  doc.fontSize(7).font('Helvetica').fillColor(colors.border)
    .text('INSTITUTE SEAL', 460, sigLineY - 33, { width: 40, align: 'center' });

  doc.end();
};
