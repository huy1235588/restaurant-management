'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SettingsFormValues } from '../utils/validation';
import { QrCode, Building2, CreditCard, User } from 'lucide-react';

interface BankConfigFormProps {
    form: UseFormReturn<SettingsFormValues>;
}

// Danh sách ngân hàng phổ biến tại Việt Nam (VietQR supported)
const BANKS = [
    { id: '970422', name: 'MB Bank' },
    { id: '970415', name: 'VietinBank' },
    { id: '970436', name: 'Vietcombank' },
    { id: '970418', name: 'BIDV' },
    { id: '970407', name: 'Techcombank' },
    { id: '970416', name: 'ACB' },
    { id: '970432', name: 'VPBank' },
    { id: '970423', name: 'TPBank' },
    { id: '970403', name: 'Sacombank' },
    { id: '970405', name: 'Agribank' },
    { id: '970448', name: 'OCB' },
    { id: '970426', name: 'MSB' },
    { id: '970441', name: 'VIB' },
    { id: '970443', name: 'SHB' },
    { id: '970437', name: 'HDBank' },
    { id: '970454', name: 'VietABank' },
    { id: '970429', name: 'SCB' },
    { id: '970431', name: 'Eximbank' },
    { id: '970400', name: 'SaigonBank' },
    { id: '970406', name: 'DongABank' },
    { id: '970438', name: 'BaoVietBank' },
    { id: '970449', name: 'LPBank' },
    { id: '970452', name: 'KienLongBank' },
    { id: '970414', name: 'OceanBank' },
    { id: '970439', name: 'PublicBank' },
    { id: '970428', name: 'NamABank' },
    { id: '970419', name: 'NCB' },
    { id: '970446', name: 'COOPBANK' },
    { id: '970427', name: 'VietBank' },
    { id: '970433', name: 'VietCapitalBank' },
    { id: '970409', name: 'BacABank' },
    { id: '970412', name: 'PVComBank' },
    { id: '970462', name: 'SeABank' },
    { id: '970440', name: 'ABBank' },
    { id: '970458', name: 'UnitedOverseas' },
    { id: '970410', name: 'StandardChartered' },
    { id: '970425', name: 'ANZVL' },
    { id: '970434', name: 'IndovinaBank' },
    { id: '970456', name: 'IBK' },
    { id: '970463', name: 'KOOKMIN' },
    { id: '970457', name: 'Woori' },
    { id: '970421', name: 'VRBVN' },
    { id: '970430', name: 'PGBANK' },
    { id: '970444', name: 'CBBank' },
    { id: '970455', name: 'GPBANK' },
];

// Template options cho VietQR
const QR_TEMPLATES = [
    { id: 'compact', name: 'Compact' },
    { id: 'compact2', name: 'Compact 2 (Recommended)' },
    { id: 'qr_only', name: 'QR Only' },
    { id: 'print', name: 'Print' },
];

export function BankConfigForm({ form }: BankConfigFormProps) {
    const { t } = useTranslation();

    const selectedBankId = form.watch('bankConfig.bankId');
    const selectedBank = BANKS.find(b => b.id === selectedBankId);

    // Preview QR URL
    const bankConfig = form.watch('bankConfig');
    const previewQRUrl = bankConfig?.bankId && bankConfig?.accountNo
        ? `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template || 'compact2'}.png?amount=100000&addInfo=Preview&accountName=${encodeURIComponent(bankConfig.accountName || '')}`
        : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <QrCode className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">{t('settings.bankConfig.title', 'Cấu hình thanh toán QR')}</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                {t('settings.bankConfig.description', 'Cấu hình thông tin ngân hàng để tạo mã QR thanh toán cho khách hàng khi chọn phương thức chuyển khoản.')}
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Bank Selection */}
                <FormField
                    control={form.control}
                    name="bankConfig.bankId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {t('settings.bankConfig.bank', 'Ngân hàng')}
                            </FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    const bank = BANKS.find(b => b.id === value);
                                    if (bank) {
                                        form.setValue('bankConfig.bankName', bank.name);
                                    }
                                }}
                                value={field.value || ''}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('settings.bankConfig.selectBank', 'Chọn ngân hàng')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[300px]">
                                    {BANKS.map((bank) => (
                                        <SelectItem key={bank.id} value={bank.id}>
                                            {bank.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                {selectedBank && `Mã ngân hàng: ${selectedBank.id}`}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Hidden field for bank name */}
                <FormField
                    control={form.control}
                    name="bankConfig.bankName"
                    render={({ field }) => (
                        <input type="hidden" {...field} />
                    )}
                />

                {/* QR Template */}
                <FormField
                    control={form.control}
                    name="bankConfig.template"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {t('settings.bankConfig.template', 'Kiểu mã QR')}
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value || 'compact2'}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn kiểu QR" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {QR_TEMPLATES.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Account Number */}
                <FormField
                    control={form.control}
                    name="bankConfig.accountNo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                {t('settings.bankConfig.accountNo', 'Số tài khoản')}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="0123456789"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Account Name */}
                <FormField
                    control={form.control}
                    name="bankConfig.accountName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {t('settings.bankConfig.accountName', 'Tên chủ tài khoản')}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="NGUYEN VAN A"
                                    className="uppercase"
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            </FormControl>
                            <FormDescription>
                                {t('settings.bankConfig.accountNameHint', 'Nhập tên không dấu, viết hoa')}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* QR Preview */}
            {previewQRUrl && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                    <h4 className="text-sm font-medium mb-3">
                        {t('settings.bankConfig.preview', 'Xem trước mã QR')}
                    </h4>
                    <div className="flex items-center gap-6">
                        <div className="bg-white rounded-lg p-2 border">
                            <img
                                src={previewQRUrl}
                                alt="QR Preview"
                                className="w-32 h-32 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>{t('settings.bankConfig.bank', 'Ngân hàng')}:</strong> {selectedBank?.name || '-'}</p>
                            <p><strong>{t('settings.bankConfig.accountNo', 'STK')}:</strong> {bankConfig?.accountNo || '-'}</p>
                            <p><strong>{t('settings.bankConfig.accountName', 'Chủ TK')}:</strong> {bankConfig?.accountName || '-'}</p>
                            <p className="text-xs italic mt-2">
                                {t('settings.bankConfig.previewNote', '* Đây là mã QR mẫu với số tiền 100.000đ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
