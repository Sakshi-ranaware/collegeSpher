const PDFDocument = require('pdfkit');

module.exports = (application, stream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Pipe to the writable stream (response or file)
  doc.pipe(stream);

  // --- Border & Layout ---
  // Outer Border
  doc.rect(20, 20, 555, 800).stroke();
  // Inner Border (Double line effect)
  doc.rect(25, 25, 545, 790).stroke();

  // --- Header ---
  // Institution Name
  doc.font('Helvetica-Bold').fontSize(10)
    .text("Nutan Maharashtra Vidya Prasarak Mandal's (E.S.T.D. 1906)", 30, 40, { align: 'center' });
  
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#c00000') // Red color for college name
    .text('NUTAN MAHARASHTRA INSTITUTE OF ENGINEERING & TECHNOLOGY', 30, 55, { align: 'center' });
  
  doc.fillColor('black').fontSize(9)
    .text('"Samarth Vidya Sankul", Vishnupuri, Talegaon Dabhade, Tal. Maval, Dist. Pune 410 507.', 30, 75, { align: 'center' });
  
  doc.text('(Approved by AICTE, New Delhi, Govt. of Maharashtra & Affiliated to Savitribai Phule Pune University)', 30, 88, { align: 'center' });

  // Divider Line
  doc.moveTo(25, 105).lineTo(570, 105).stroke();

  // Ref No & Date
  doc.fontSize(10).text(`Ref. No. ${application._id.toString().slice(-6)}`, 40, 115); // Pseudo Ref No
  // doc.text('Date: ' + new Date().toLocaleDateString(), 450, 115); // Date usually at bottom

  // General Register No (LC No)
  doc.fontSize(12).font('Helvetica-Bold').text('LC. No. ' + (application.prn || '____'), 400, 115, { align: 'right' });


  // Title
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(14).text('ORIGINAL', { align: 'center' });
  
  // Blue Pill Background for Title
  doc.roundedRect(150, 155, 300, 20, 10).fill('#1a237e'); // Dark Blue
  doc.fillColor('white').fontSize(12).text('TRANSFER / LEAVING CERTIFICATE', 150, 160, { width: 300, align: 'center' });
  doc.fillColor('black');

  // --- Content ---
  let y = 200;
  const lineSpacing = 30;
  const leftX = 40;
  const middleX = 220; // Start of data value
  const lineEndX = 550;

  const drawField = (number, label, value) => {
    doc.font('Helvetica').fontSize(11).text(`${number}  ${label}`, leftX, y);
    doc.text(':', middleX - 10, y);
    doc.font('Helvetica-Bold').text((value || '').toUpperCase(), middleX, y);
    
    // Underline for value
    doc.moveTo(middleX, y + 12).lineTo(lineEndX, y + 12).stroke();
    y += lineSpacing;
  };

  // 1. Name
  drawField('1', 'Name of the student in Full', `${application.lastName} ${application.firstName} ${application.middleName}`);

  // 2. Mother's Name
  drawField('2', "Mother's Name", application.motherName || 'SARIKA'); // Defaulting for demo if missing

  // 3. Religion/Caste
  drawField('3', 'Religion and Caste / Sub-Cast', `${application.religion || 'HINDU'} - ${application.caste || 'MARATHA'}`);

  // 4. Nationality
  drawField('4', 'Nationality', application.nationality || 'INDIAN');

  // 5. Place of Birth
  drawField('5', 'Place of Birth', application.birthPlace || 'PUNE');

  // 6. Date of Birth (Words & Figures) (Complex due to 2 lines)
  const dob = application.dob ? new Date(application.dob) : new Date();
  const dobStr = dob.toLocaleDateString('en-GB'); // DD/MM/YYYY
  // Simple number to text converter (placeholder)
  const dobWords = 'Nineteenth September Two Thousand Three'.toUpperCase(); // Implement proper converter if needed
  
  doc.font('Helvetica').fontSize(11).text('6  Date of Birth (in figures & words)', leftX, y);
  doc.text(':', middleX - 10, y);
  doc.font('Helvetica-Bold').text(dobStr, middleX, y);
  doc.moveTo(middleX, y + 12).lineTo(lineEndX, y + 12).stroke();
  y += 25;
  doc.text(dobWords, middleX, y); // Words on next line visually
  doc.moveTo(middleX, y + 12).lineTo(lineEndX, y + 12).stroke();
  y += lineSpacing;

  // 7. Last School
  drawField('7', 'Last School / College Attended', 'PIMPRI CHINCHWAD POLYTECHNIC'); // Hardcoded as requested to use placeholder

  // 8. Date of Admission
  drawField('8', 'Date of Admission', application.admissionYear ? `01/06/${application.admissionYear}` : '03/12/2022');

  // 9. Conduct
  drawField('9', 'Conduct & Progress', 'GOOD');

  // 10. Date of Leaving
  drawField('10', 'Date of Leaving', new Date().toLocaleDateString('en-GB'));

  // 11. Studying Since
  drawField('11', 'Year in which studying and since when', `DIRECT SECOND YEAR ${application.branch || 'ENGINEERING'}`);

  // 12. Reason
  drawField('12', 'Reason for leaving this college', application.reason ? application.reason.toUpperCase() : 'COMPLETED DEGREE');

  // 13. Remarks
  drawField('13', 'Remarks', application.finalRemark || 'PASSED WITH FIRST CLASS WITH DISTINCTION');


  // --- Footer ---
  y += 40;
  
  doc.font('Helvetica').fontSize(10);
  doc.text('I Certified that the above information is in accordance with the institute Register.', { align: 'center' });
  
  y += 30;
  doc.text('Place : Talegaon Station', leftX, y);
  doc.text(`Date : ${new Date().toLocaleDateString('en-GB').toUpperCase()}`, leftX, y + 20);

  // Signatures
  y += 50; 
  // Stamp (Circle)
  doc.circle(280, y + 10, 40).stroke();
  doc.fontSize(8).text('Nutan Maharashtra', 245, y - 5, { width: 70, align: 'center' });
  doc.text('Inst of Engg.', 245, y + 5, { width: 70, align: 'center' });
  doc.text('PUNE', 245, y + 15, { width: 70, align: 'center' });


  const sigY = y + 40;
  
  doc.fontSize(11).font('Helvetica-Bold');
  
  // Prepared By
  doc.text('Prepared by', 80, sigY);
  // Checked By
  doc.text('Checked by', 250, sigY);
  // Principal
  doc.text('Principal', 450, sigY);


  doc.end();
};
