'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table } from '@/types';
import { useTranslation } from 'react-i18next';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface BulkQRCodeGeneratorProps {
    open: boolean;
    tables: Table[];
    onClose: () => void;
}

export function BulkQRCodeGenerator({ open, tables, onClose }: BulkQRCodeGeneratorProps) {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleGenerateAndDownload = async () => {
        if (tables.length === 0) {
            toast.error(t('tables.noTablesSelected', 'Please select at least one table'));
            return;
        }

        try {
            setIsGenerating(true);
            setProgress(0);

            // Generate QR codes for all tables
            const qrCodes: { tableNumber: string; dataUrl: string }[] = [];

            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const qrData = table.qrCode || `TABLE-${table.tableNumber}`;

                const canvas = document.createElement('canvas');
                await new Promise<void>((resolve, reject) => {
                    QRCode.toCanvas(
                        canvas,
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
                            if (error) {
                                reject(error);
                            } else {
                                qrCodes.push({
                                    tableNumber: table.tableNumber,
                                    dataUrl: canvas.toDataURL('image/png'),
                                });
                                setProgress(((i + 1) / tables.length) * 100);
                                resolve();
                            }
                        }
                    );
                });
            }

            // Create a ZIP file or download as PDF
            // For simplicity, we'll create multiple downloads
            // In production, use JSZip or a backend API

            // Create an HTML page with all QR codes
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Table QR Codes</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            background: white;
                        }
                        .page {
                            page-break-after: always;
                            margin-bottom: 40px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            break-inside: avoid;
                        }
                        .qr-container {
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        img {
                            max-width: 400px;
                            border: 1px solid #ddd;
                            padding: 10px;
                        }
                        h2 {
                            margin-top: 10px;
                            font-size: 24px;
                            color: #333;
                        }
                        .info {
                            font-size: 14px;
                            color: #666;
                            margin-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    ${qrCodes
                        .map(
                            (qr) => `
                        <div class="page">
                            <div class="qr-container">
                                <img src="${qr.dataUrl}" alt="QR Code for Table ${qr.tableNumber}" />
                                <h2>Table ${qr.tableNumber}</h2>
                                <div class="info">Scan to view menu and place order</div>
                            </div>
                        </div>
                    `
                        )
                        .join('')}
                </body>
                </html>
            `;

            // Create blob and download
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `table-qr-codes-${new Date().toISOString().split('T')[0]}.html`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success(
                t('tables.bulkQRCodeGenerated', 'Generated {{count}} QR codes', {
                    count: tables.length,
                })
            );
            onClose();
        } catch (error) {
            console.error('Error generating QR codes:', error);
            toast.error(t('tables.bulkQRCodeError', 'Failed to generate QR codes'));
        } finally {
            setIsGenerating(false);
            setProgress(0);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('tables.bulkQRCode', 'Bulk QR Code Generator')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.bulkQRCodeDescription', 'Generate and download QR codes for {{count}} tables', {
                            count: tables.length,
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        {t('tables.bulkQRCodeInfo', 'Generate QR codes for selected tables. An HTML file will be created that you can print.')}
                    </div>

                    {isGenerating && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">
                                {t('common.generating', 'Generating...')} {Math.round(progress)}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        onClick={handleGenerateAndDownload}
                        disabled={isGenerating}
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('common.generating', 'Generating...')}
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                {t('tables.generateAndDownload', 'Generate & Download')}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
