import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table } from '@/types';
import { useTranslation } from 'react-i18next';
import { Download, Printer } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeDialogProps {
    open: boolean;
    table: Table;
    onClose: () => void;
}

export function QRCodeDialog({ open, table, onClose }: QRCodeDialogProps) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (open && canvasRef.current) {
            const qrData = table.qrCode || `TABLE-${table.tableNumber}`;
            QRCode.toCanvas(
                canvasRef.current,
                qrData,
                {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                },
                (error: Error | null | undefined) => {
                    if (error) console.error('QR Code generation error:', error);
                }
            );
        }
    }, [open, table]);

    const handleDownload = () => {
        if (canvasRef.current) {
            const url = canvasRef.current.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `table-${table.tableNumber}-qr.png`;
            link.href = url;
            link.click();
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && canvasRef.current) {
            const url = canvasRef.current.toDataURL('image/png');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Table ${table.tableNumber} QR Code</title>
                        <style>
                            body {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                margin: 0;
                                font-family: Arial, sans-serif;
                            }
                            img {
                                max-width: 400px;
                            }
                            h1 {
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${url}" alt="QR Code" />
                        <h1>Table ${table.tableNumber}</h1>
                        ${table.tableName ? `<p>${table.tableName}</p>` : ''}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('tables.qrCode', 'QR Code')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.qrDescription', 'QR Code for table')} {table.tableNumber}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <canvas ref={canvasRef} className="border rounded-lg" />
                    <div className="text-center">
                        <h3 className="font-semibold text-lg">
                            {t('tables.table', 'Table')} {table.tableNumber}
                        </h3>
                        {table.tableName && (
                            <p className="text-sm text-muted-foreground">{table.tableName}</p>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        {t('common.print', 'Print')}
                    </Button>
                    <Button type="button" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        {t('common.download', 'Download')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
