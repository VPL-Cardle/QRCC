import QRCode, { create, QRCodeToBufferOptions, QRCodeToFileOptions } from 'qrcode';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'
import fs from "fs";

const icons = new Array(
    fs.readFileSync("./icons/rotate_clockwise.png"),
    fs.readFileSync("./icons/rotate_counterclockwise.png"),
    fs.readFileSync("./icons/sound.png"),
);

(async () => {
    const pageWidth = 2480;
    const pageHeight = 3508;

    const plateSize = 1000;
    const qrSize = 400;
    const iconSize = 200;
    const padding = 70;

    const qrPadding = (plateSize - qrSize) / 2

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([pageWidth, pageHeight])

    let horizontalCount = Math.floor(pageWidth / plateSize);
    if ((horizontalCount * plateSize) + ((horizontalCount - 1) * padding) > pageWidth) {
        horizontalCount--;
    }
    
    let verticalCount = Math.floor(pageHeight / plateSize);
    if ((verticalCount * plateSize) + ((verticalCount - 1) * padding) > pageHeight) {
        verticalCount--;
    }

    const horizontalMargin = (pageWidth - ((horizontalCount * plateSize) + ((horizontalCount - 1) * padding))) / 2;
    const verticalMargin = (pageHeight - ((verticalCount * plateSize) + ((verticalCount - 1) * padding))) / 2;

    let i = 0;

    for (let x = 0; x < horizontalCount; x++) {
        for (let y = 0; y < verticalCount; y++) {
            page.drawRectangle({
                x: horizontalMargin + x * (plateSize + padding),
                y: verticalMargin + y * (plateSize + padding),
                width: plateSize,
                height: plateSize,
                borderColor: rgb(0, 0, 0),
                borderWidth: 2,
            })

            const opts : QRCodeToBufferOptions = {
                errorCorrectionLevel: 'H',
                width: qrSize,
                margin: 0,
                color: {
                    dark:"#000",
                    light:"#FFF"
                }
            }

            const buffer = await QRCode.toBuffer(`AVPL: ${i}`, opts);
            const image = await pdfDoc.embedPng(buffer);
            page.drawImage(image, {
                x: horizontalMargin + x * (plateSize + padding) + qrPadding,
                y: verticalMargin + y * (plateSize + padding) + qrPadding,
            })

            const pngImage = await pdfDoc.embedPng(icons[i % 3]);

            page.drawImage(pngImage, {
                x: horizontalMargin + x * (plateSize + padding) + iconSize,
                y: verticalMargin + y * (plateSize + padding) + iconSize,
                width: iconSize,
                height: iconSize,
                rotate: degrees(180),
            })

            page.drawImage(pngImage, {
                x: horizontalMargin + x * (plateSize + padding) + plateSize - iconSize,
                y: verticalMargin + y * (plateSize + padding) + iconSize,
                width: iconSize,
                height: iconSize,
                rotate: degrees(270),
            })

            page.drawImage(pngImage, {
                x: horizontalMargin + x * (plateSize + padding) + iconSize,
                y: verticalMargin + y * (plateSize + padding) + plateSize - iconSize,
                width: iconSize,
                height: iconSize,
                rotate: degrees(90),
            })

            page.drawImage(pngImage, {
                x: horizontalMargin + x * (plateSize + padding) + plateSize - iconSize,
                y: verticalMargin + y * (plateSize + padding) + plateSize - iconSize,
                width: iconSize,
                height: iconSize,
                rotate: degrees(0),
            })

            i++;
        }
    }
    
    
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync('./output.pdf', pdfBytes); 
})();
