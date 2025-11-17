import nodemailer from 'nodemailer';
import { Reservation } from '@prisma/client';
import { format } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';

interface EmailConfig {
    provider: 'smtp' | 'sendgrid';
    smtp?: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    sendgrid?: {
        apiKey: string;
    };
    from: {
        name: string;
        email: string;
    };
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private config: EmailConfig;

    constructor() {
        this.config = {
            provider: (process.env['EMAIL_SERVICE_PROVIDER'] as 'smtp' | 'sendgrid') || 'smtp',
            smtp: {
                host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
                port: parseInt(process.env['SMTP_PORT'] || '587'),
                secure: process.env['SMTP_SECURE'] === 'true',
                auth: {
                    user: process.env['SMTP_USER'] || '',
                    pass: process.env['SMTP_PASS'] || '',
                },
            },
            sendgrid: {
                apiKey: process.env['SENDGRID_API_KEY'] || '',
            },
            from: {
                name: process.env['EMAIL_FROM_NAME'] || 'Restaurant Management',
                email: process.env['EMAIL_FROM_ADDRESS'] || 'noreply@restaurant.com',
            },
        };

        this.initializeTransporter();
    }

    private initializeTransporter() {
        if (this.config.provider === 'smtp' && this.config.smtp) {
            try {
                this.transporter = nodemailer.createTransport(this.config.smtp);
                console.log('✅ SMTP Email service initialized');
            } catch (error) {
                console.error('❌ Failed to initialize SMTP transporter:', error);
            }
        } else if (this.config.provider === 'sendgrid' && this.config.sendgrid?.apiKey) {
            try {
                // For SendGrid, use nodemailer with SendGrid transport
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    auth: {
                        user: 'apikey',
                        pass: this.config.sendgrid.apiKey,
                    },
                });
                console.log('✅ SendGrid Email service initialized');
            } catch (error) {
                console.error('❌ Failed to initialize SendGrid transporter:', error);
            }
        } else {
            console.warn('⚠️  Email service not configured. Emails will not be sent.');
        }
    }

    async sendReservationConfirmation(
        reservation: Reservation & { table?: { tableNumber: string } }
    ): Promise<boolean> {
        if (!this.transporter) {
            console.warn('Email service not configured. Skipping email send.');
            return false;
        }

        if (!reservation.email) {
            console.log('No email address provided for reservation. Skipping email send.');
            return false;
        }

        try {
            const htmlContent = this.generateConfirmationEmail(reservation);

            await this.transporter.sendMail({
                from: `"${this.config.from.name}" <${this.config.from.email}>`,
                to: reservation.email,
                subject: `Reservation Confirmation - ${reservation.reservationCode}`,
                html: htmlContent,
            });

            console.log(`✅ Confirmation email sent to ${reservation.email}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send confirmation email:', error);
            return false;
        }
    }

    private generateConfirmationEmail(
        reservation: Reservation & { table?: { tableNumber: string } }
    ): string {
        const reservationDate = format(new Date(reservation.reservationDate), 'PPPP');
        const reservationTime = (() => {
            const rt = reservation.reservationTime as unknown;
            if (typeof rt === 'string') {
                return (rt as string).substring(0, 5);
            }
            if (rt instanceof Date || typeof rt === 'number') {
                return format(new Date(rt as any), 'HH:mm');
            }
            return '';
        })();
        const tableNumber = reservation.table?.tableNumber || `Table ${reservation.tableId}`;
        const partySize = `${reservation.headCount} ${reservation.headCount === 1 ? 'person' : 'people'}`;
        const specialRequestSection = reservation.specialRequest
            ? `
            <div class="detail-row">
                <span class="label">Special Requests:</span>
                <span class="value">${reservation.specialRequest}</span>
            </div>
            `
            : '';

        const templatePath = path.join(__dirname, '..', 'templates', 'emails', 'reservation-confirmation.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Replace placeholders
        htmlTemplate = htmlTemplate.replace(/\$\{customerName\}/g, reservation.customerName);
        htmlTemplate = htmlTemplate.replace(/\$\{reservationCode\}/g, reservation.reservationCode);
        htmlTemplate = htmlTemplate.replace(/\$\{reservationDate\}/g, reservationDate);
        htmlTemplate = htmlTemplate.replace(/\$\{reservationTime\}/g, reservationTime);
        htmlTemplate = htmlTemplate.replace(/\$\{partySize\}/g, partySize);
        htmlTemplate = htmlTemplate.replace(/\$\{tableNumber\}/g, tableNumber);
        htmlTemplate = htmlTemplate.replace(/\$\{phoneNumber\}/g, reservation.phoneNumber);
        htmlTemplate = htmlTemplate.replace(/\$\{currentYear\}/g, new Date().getFullYear().toString());
        htmlTemplate = htmlTemplate.replace(/\$\{specialRequestSection\}/g, specialRequestSection);

        return htmlTemplate;
    }

    async testConnection(): Promise<boolean> {
        if (!this.transporter) {
            console.error('Email transporter not initialized');
            return false;
        }

        try {
            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return true;
        } catch (error) {
            console.error('❌ Email service connection failed:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
