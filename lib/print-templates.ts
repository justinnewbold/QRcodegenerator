import jsPDF from 'jspdf';

export interface PrintTemplate {
  id: string;
  name: string;
  category: 'business-card' | 'name-badge' | 'ticket' | 'label';
  width: number; // in mm
  height: number; // in mm
  description: string;
  dpi: number;
}

export const PRINT_TEMPLATES: PrintTemplate[] = [
  // Business Cards
  {
    id: 'business-card-standard',
    name: 'Standard Business Card',
    category: 'business-card',
    width: 85,
    height: 55,
    description: 'Standard US business card (3.5" × 2")',
    dpi: 300,
  },
  {
    id: 'business-card-eu',
    name: 'European Business Card',
    category: 'business-card',
    width: 85,
    height: 55,
    description: 'Standard EU business card (85mm × 55mm)',
    dpi: 300,
  },
  {
    id: 'business-card-square',
    name: 'Square Business Card',
    category: 'business-card',
    width: 70,
    height: 70,
    description: 'Square format business card',
    dpi: 300,
  },

  // Name Badges
  {
    id: 'name-badge-standard',
    name: 'Standard Name Badge',
    category: 'name-badge',
    width: 102,
    height: 76,
    description: 'Standard 4" × 3" name badge',
    dpi: 300,
  },
  {
    id: 'name-badge-lanyard',
    name: 'Lanyard Badge',
    category: 'name-badge',
    width: 90,
    height: 120,
    description: 'Vertical lanyard badge',
    dpi: 300,
  },
  {
    id: 'name-badge-mini',
    name: 'Mini Badge',
    category: 'name-badge',
    width: 76,
    height: 51,
    description: 'Compact 3" × 2" badge',
    dpi: 300,
  },

  // Event Tickets
  {
    id: 'ticket-standard',
    name: 'Standard Event Ticket',
    category: 'ticket',
    width: 140,
    height: 50,
    description: 'Standard event ticket',
    dpi: 300,
  },
  {
    id: 'ticket-stub',
    name: 'Ticket with Stub',
    category: 'ticket',
    width: 180,
    height: 60,
    description: 'Ticket with tear-off stub',
    dpi: 300,
  },
  {
    id: 'ticket-wristband',
    name: 'Wristband Ticket',
    category: 'ticket',
    width: 240,
    height: 25,
    description: 'Wristband format',
    dpi: 300,
  },

  // Labels
  {
    id: 'label-shipping',
    name: 'Shipping Label',
    category: 'label',
    width: 100,
    height: 150,
    description: '4" × 6" shipping label',
    dpi: 300,
  },
  {
    id: 'label-product',
    name: 'Product Label',
    category: 'label',
    width: 50,
    height: 50,
    description: 'Square product label',
    dpi: 300,
  },
  {
    id: 'label-round',
    name: 'Round Sticker',
    category: 'label',
    width: 51,
    height: 51,
    description: '2" round sticker',
    dpi: 300,
  },
];

export interface PrintDesign {
  template: PrintTemplate;
  qrCode: {
    dataUrl: string;
    size: number; // percentage of template width
    x: number; // percentage
    y: number; // percentage
  };
  text: {
    title?: string;
    subtitle?: string;
    body?: string;
    footer?: string;
  };
  styles: {
    titleSize: number;
    subtitleSize: number;
    bodySize: number;
    footerSize: number;
    titleColor: string;
    textColor: string;
    backgroundColor: string;
    borderColor?: string;
    borderWidth?: number;
  };
  logo?: {
    dataUrl: string;
    size: number; // percentage
    x: number;
    y: number;
  };
}

export function generatePrintPDF(design: PrintDesign): jsPDF {
  const { template, qrCode, text, styles, logo } = design;

  // Create PDF with exact template dimensions
  const pdf = new jsPDF({
    orientation: template.width > template.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [template.width, template.height],
  });

  // Background
  if (styles.backgroundColor && styles.backgroundColor !== '#ffffff') {
    pdf.setFillColor(styles.backgroundColor);
    pdf.rect(0, 0, template.width, template.height, 'F');
  }

  // Border
  if (styles.borderColor && styles.borderWidth) {
    pdf.setDrawColor(styles.borderColor);
    pdf.setLineWidth(styles.borderWidth);
    pdf.rect(styles.borderWidth / 2, styles.borderWidth / 2,
             template.width - styles.borderWidth, template.height - styles.borderWidth);
  }

  // QR Code
  const qrSize = (template.width * qrCode.size) / 100;
  const qrX = (template.width * qrCode.x) / 100;
  const qrY = (template.height * qrCode.y) / 100;
  pdf.addImage(qrCode.dataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Logo
  if (logo) {
    const logoSize = (template.width * logo.size) / 100;
    const logoX = (template.width * logo.x) / 100;
    const logoY = (template.height * logo.y) / 100;
    pdf.addImage(logo.dataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
  }

  // Text
  const textX = 5; // 5mm margin
  let textY = 10;

  if (text.title) {
    pdf.setFontSize(styles.titleSize);
    pdf.setTextColor(styles.titleColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(text.title, textX, textY);
    textY += styles.titleSize * 0.5;
  }

  if (text.subtitle) {
    pdf.setFontSize(styles.subtitleSize);
    pdf.setTextColor(styles.textColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text(text.subtitle, textX, textY);
    textY += styles.subtitleSize * 0.5;
  }

  if (text.body) {
    pdf.setFontSize(styles.bodySize);
    pdf.setTextColor(styles.textColor);
    const lines = pdf.splitTextToSize(text.body, template.width - 10);
    pdf.text(lines, textX, textY);
    textY += (lines.length * styles.bodySize * 0.5);
  }

  if (text.footer) {
    pdf.setFontSize(styles.footerSize);
    pdf.setTextColor(styles.textColor);
    pdf.setFont('helvetica', 'italic');
    pdf.text(text.footer, textX, template.height - 5);
  }

  return pdf;
}

export function generateBusinessCard(
  qrDataUrl: string,
  name: string,
  title: string,
  company: string,
  contact: string
): jsPDF {
  const template = PRINT_TEMPLATES.find(t => t.id === 'business-card-standard')!;

  const design: PrintDesign = {
    template,
    qrCode: {
      dataUrl: qrDataUrl,
      size: 35, // 35% of width
      x: 60, // Right side
      y: 15,
    },
    text: {
      title: name,
      subtitle: title,
      body: company,
      footer: contact,
    },
    styles: {
      titleSize: 14,
      subtitleSize: 10,
      bodySize: 9,
      footerSize: 7,
      titleColor: '#000000',
      textColor: '#333333',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 0.5,
    },
  };

  return generatePrintPDF(design);
}

export function generateNameBadge(
  qrDataUrl: string,
  name: string,
  company: string,
  role: string
): jsPDF {
  const template = PRINT_TEMPLATES.find(t => t.id === 'name-badge-standard')!;

  const design: PrintDesign = {
    template,
    qrCode: {
      dataUrl: qrDataUrl,
      size: 25,
      x: 5,
      y: 50,
    },
    text: {
      title: name,
      subtitle: role,
      body: company,
    },
    styles: {
      titleSize: 18,
      subtitleSize: 12,
      bodySize: 10,
      footerSize: 8,
      titleColor: '#000000',
      textColor: '#555555',
      backgroundColor: '#f8f8f8',
      borderColor: '#2563eb',
      borderWidth: 2,
    },
  };

  return generatePrintPDF(design);
}

export function generateEventTicket(
  qrDataUrl: string,
  eventName: string,
  date: string,
  location: string,
  ticketNumber: string
): jsPDF {
  const template = PRINT_TEMPLATES.find(t => t.id === 'ticket-standard')!;

  const design: PrintDesign = {
    template,
    qrCode: {
      dataUrl: qrDataUrl,
      size: 28,
      x: 68,
      y: 10,
    },
    text: {
      title: eventName,
      subtitle: date,
      body: location,
      footer: `Ticket #${ticketNumber}`,
    },
    styles: {
      titleSize: 12,
      subtitleSize: 9,
      bodySize: 8,
      footerSize: 6,
      titleColor: '#1e40af',
      textColor: '#374151',
      backgroundColor: '#ffffff',
      borderColor: '#1e40af',
      borderWidth: 1,
    },
  };

  return generatePrintPDF(design);
}
