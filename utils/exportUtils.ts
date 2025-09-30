import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

export const downloadSpecSheet = async (
    elementId: string,
    format: 'jpeg' | 'png' | 'pdf'
) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found.`);
        return;
    }

    try {
        const canvas = await html2canvas(element, {
            useCORS: true, 
            scale: 2, 
            backgroundColor: '#0A0A0A',
        });

        if (format === 'jpeg' || format === 'png') {
            const image = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `y2k-tuner-spec-sheet.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // Create a PDF with the same aspect ratio as the canvas
            const pdf = new jspdf({
                orientation: imgWidth > imgHeight ? 'l' : 'p',
                unit: 'px',
                format: [imgWidth, imgHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('y2k-tuner-spec-sheet.pdf');
        }
    } catch (error) {
        console.error("Error exporting spec sheet:", error);
        alert("An error occurred while creating the export file.");
    }
};